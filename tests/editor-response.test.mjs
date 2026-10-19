import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EditorApiError, readEditorResponse } from '../src/features/thumbnail-editor/api-response.mjs';

test('empty proxy failures and HTML fallback produce a clear localized connection error', async () => {
  for (const response of [new Response('', { status: 500 }), new Response('<html>Bad gateway</html>', { status: 502 }), new Response('<html>App shell</html>')]) {
    await assert.rejects(() => readEditorResponse(response, true), error => error instanceof EditorApiError && error.unavailable && error.message.includes('تعذر الاتصال'));
  }
});
test('unavailable API, unconfigured provider and quota remain distinct', async () => {
  for (const [body, status, unavailable] of [[{code:'API_UNAVAILABLE'},503,true],[{error:'not configured'},503,false],[{error:'quota'},429,false]]) {
    await assert.rejects(() => readEditorResponse(Response.json(body,{status}),true), error => error instanceof EditorApiError && error.status===status && error.unavailable===unavailable);
  }
});
test('successful JSON is preserved and malformed payloads are rejected', async () => {
  const data={ok:true,gemini:true}; assert.deepEqual(await readEditorResponse(Response.json(data)),data);
  await assert.rejects(() => readEditorResponse(Response.json(null)), EditorApiError);
});

test('local rate limits, Google quota and provider throttling have actionable localized messages', async () => {
  for (const [code, english, arabic] of [
    ['RATE_LIMIT','not sent to Google','لم يُرسل'],
    ['GEMINI_QUOTA_EXCEEDED','billing','الفوترة'],
    ['GEMINI_RATE_LIMITED','temporarily','مؤقتًا'],
    [undefined,'temporarily','مؤقتًا'],
  ]) {
    for (const [ar, expected] of [[false,english],[true,arabic]]) {
      await assert.rejects(()=>readEditorResponse(Response.json({code,error:'unsafe provider body'},{status:429}),ar),error=>error instanceof EditorApiError && error.status===429 && !error.unavailable && error.message.includes(expected) && !error.message.includes('unsafe'));
    }
  }
});


test('Runware errors remain localized and never suggest fixing Gemini instead',async()=>{
  for(const code of ['RUNWARE_NOT_CONFIGURED','RUNWARE_AUTH_FAILED','RUNWARE_CREDITS','RUNWARE_RATE_LIMITED','RUNWARE_FAILED'])
    for(const ar of [false,true])await assert.rejects(()=>readEditorResponse(Response.json({code,error:'private-provider-secret'},{status:code==='RUNWARE_CREDITS'?402:503}),ar),error=>error instanceof EditorApiError && error.message.includes('Runware') && !error.message.includes('Gemini') && !error.message.includes('private-provider-secret'));
});

test('identity reference errors are localized without exposing provider details',async()=>{
  for(const code of ['REFERENCE_REQUIRED','REFERENCE_INVALID'])for(const ar of [false,true])
    await assert.rejects(()=>readEditorResponse(Response.json({code,error:'private-provider-detail'},{status:400}),ar),error=>error.status===400&&!error.unavailable&&error.message.includes(ar?'مرجعي':'reference')&&!error.message.includes('private-provider-detail'));
});

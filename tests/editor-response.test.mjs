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

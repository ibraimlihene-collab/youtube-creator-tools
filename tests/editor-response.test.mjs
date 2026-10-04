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

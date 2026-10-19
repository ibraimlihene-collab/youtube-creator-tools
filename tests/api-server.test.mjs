import { test } from 'node:test';
import assert from 'node:assert/strict';
import { connect } from 'node:net';
import { once } from 'node:events';
import { createApiServer } from '../server/api-server.mjs';

const ok = { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: '{"ok":true,"gemini":true}' };
async function start(t, handlers = {}, maxBytes) {
  const server = createApiServer({ health: async () => ok, ...handlers }, maxBytes);
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(() => new Promise(resolve => { server.closeAllConnections(); server.close(resolve); }));
  return { server, port: server.address().port, url: `http://127.0.0.1:${server.address().port}` };
}

test('aborting an incomplete upload does not crash the API or call its handler', async t => {
  let calls = 0; const { server, port, url } = await start(t, { edit: async () => { calls++; return ok; } });
  const client = connect(port, '127.0.0.1'); client.on('error', () => {}); await once(client, 'connect');
  const closedRequest = new Promise(resolve => server.once('request', req => req.once('close', resolve)));
  const incoming = once(server, 'request');
  client.write('POST /api/edit HTTP/1.1\r\nHost: localhost\r\nContent-Type: multipart/form-data; boundary=example\r\nContent-Length: 100000\r\n\r\n--example\r\npartial');
  await incoming; client.destroy(); await closedRequest;
  assert.equal(calls, 0);
  for (const route of ['/', '/api/health']) {
    const response = await fetch(url + route); assert.equal(response.status, 200); assert.equal((await response.json()).ok, true);
  }
});

test('upload limits and handler errors return JSON while the API stays healthy', async t => {
  const { url } = await start(t, { edit: async () => { throw new Error('private internal details'); } }, 16);
  const oversized = await fetch(url + '/api/edit', { method: 'POST', body: 'x'.repeat(17) });
  assert.equal(oversized.status, 413); assert.equal((await oversized.json()).error, 'Upload is too large.');
  const failed = await fetch(url + '/api/edit', { method: 'POST', body: 'ok' });
  assert.equal(failed.status, 500); assert.ok(!(await failed.text()).includes('private'));
  assert.equal((await fetch(url + '/api/health')).status, 200);
});

test('valid uploads and function aliases reach the same handler; unknown routes return JSON', async t => {
  let event; const { url } = await start(t, { edit: async input => { event = input; return ok; } });
  assert.equal((await fetch(url + '/.netlify/functions/edit', { method: 'POST', body: 'image-body' })).status, 200);
  assert.equal(Buffer.from(event.body, 'base64').toString(), 'image-body');
  const missing = await fetch(url + '/api/unknown'); assert.equal(missing.status, 404); assert.equal((await missing.json()).error, 'Not found.');
});

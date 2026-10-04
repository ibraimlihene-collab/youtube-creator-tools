import { createServer } from 'node:http';

function sendJson(res, status, body) {
  if (res.destroyed || res.writableEnded) return;
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
}

export function createApiServer(handlers, maxBytes = 6 * 1024 * 1024) {
  const server = createServer(async (req, res) => {
    // Reading an interrupted request rejects the async iterator. Catch it here,
    // alongside handler failures, so a cancelled upload cannot crash the server.
    try {
      const path = new URL(req.url, 'http://localhost').pathname;
      const name = path === '/' && req.method === 'GET' ? 'health' : path.replace(/^\/(api|\.netlify\/functions)\//, '');
      if (!Object.hasOwn(handlers, name)) { sendJson(res, 404, { error: 'Not found.' }); return; }
      if (Number(req.headers['content-length'] || 0) > maxBytes) {
        sendJson(res, 413, { error: 'Upload is too large.' }); return;
      }
      const chunks = []; let size = 0;
      for await (const chunk of req) {
        size += chunk.length;
        if (size > maxBytes) { sendJson(res, 413, { error: 'Upload is too large.' }); return; }
        chunks.push(chunk);
      }
      if (req.aborted || res.destroyed) return;
      const result = await handlers[name]({ httpMethod: req.method, headers: req.headers, body: Buffer.concat(chunks).toString('base64'), isBase64Encoded: true });
      if (res.destroyed || res.writableEnded) return;
      res.writeHead(result.statusCode, result.headers); res.end(result.body);
    } catch {
      // A disconnected caller has no response socket. Other failures get safe JSON.
      sendJson(res, 500, { error: 'Request failed. Please try again.' });
    }
  });
  server.requestTimeout = 30_000;
  server.headersTimeout = 15_000;
  return server;
}

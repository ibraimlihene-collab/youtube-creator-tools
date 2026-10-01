// Development adapter for the same server-only handlers used by Netlify.
import { createServer } from 'node:http';
import { handler as ai } from '../netlify/functions/ai.mjs';
import { handler as apify } from '../netlify/functions/apify.mjs';
import { handler as health } from '../netlify/functions/health.mjs';

const handlers = { '/api/ai': ai, '/api/apify': apify, '/api/health': health };
createServer(async (req, res) => {
  const handler = handlers[new URL(req.url, 'http://localhost').pathname];
  if (!handler) {
    res.writeHead(404).end();
    return;
  }
  try {
    let body = '';
    for await (const chunk of req) {
      body += chunk;
      if (Buffer.byteLength(body) > 65536) {
        res.writeHead(413).end();
        return;
      }
    }
    const result = await handler({
      httpMethod: req.method,
      headers: req.headers,
      body,
      isBase64Encoded: false,
    });
    res.writeHead(result.statusCode, result.headers).end(result.body);
  } catch {
    res
      .writeHead(500, { 'Content-Type': 'application/json' })
      .end(JSON.stringify({ ok: false, error: 'Service unavailable. Please try again later.' }));
  }
}).listen(8888, '0.0.0.0', () => console.log('Creator tools development API listening on 8888'));

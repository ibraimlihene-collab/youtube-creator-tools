// Local adapter for the same handlers deployed as Netlify Functions.
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { parseEnv } from 'node:util';
for (const path of ['/tmp/.env', '.env', '.env.local']) {
  if (existsSync(path)) for (const [key, value] of Object.entries(parseEnv(readFileSync(path, 'utf8')))) process.env[key] ??= value;
}
const names = ['ai', 'apify', 'health', 'edit', 'analyze', 'variations'];
const handlers = Object.fromEntries(await Promise.all(names.map(async name => [name, (await import(`../netlify/functions/${name}.mjs`)).handler])));
createServer(async (req, res) => {
  const name = new URL(req.url, 'http://localhost').pathname.replace(/^\/(api|\.netlify\/functions)\//, '');
  if (!handlers[name]) { res.writeHead(404); res.end('Not found'); return; }
  const chunks = []; let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 6 * 1024 * 1024) { res.writeHead(413, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'Upload is too large.' })); return; }
    chunks.push(chunk);
  }
  try {
    const result = await handlers[name]({ httpMethod: req.method, headers: req.headers, body: Buffer.concat(chunks).toString('base64'), isBase64Encoded: true });
    res.writeHead(result.statusCode, result.headers); res.end(result.body);
  } catch { res.writeHead(500, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'Request failed.' })); }
}).listen(Number(process.env.API_PORT || 8888), '0.0.0.0', () => console.log('Creator API listening'));

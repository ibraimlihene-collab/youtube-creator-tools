// Local adapter for the same handlers deployed as Netlify Functions.
import { createApiServer } from './api-server.mjs';
import { readFileSync, existsSync } from 'node:fs';
import { parseEnv } from 'node:util';
for (const path of ['/tmp/.env', '.env', '.env.local']) {
  if (existsSync(path)) for (const [key, value] of Object.entries(parseEnv(readFileSync(path, 'utf8')))) process.env[key] ??= value;
}
const names = ['ai', 'apify', 'health', 'edit', 'analyze', 'variations'];
const handlers = Object.fromEntries(await Promise.all(names.map(async name => [name, (await import(`../netlify/functions/${name}.mjs`)).handler])));
createApiServer(handlers).listen(Number(process.env.API_PORT || 8888), '0.0.0.0', () => console.log('Creator API listening'));

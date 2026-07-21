import { cpSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const src = 'public/sounds';
const dest = 'dist/sounds';
if (!existsSync(src)) {
  console.error('missing', src);
  process.exit(1);
}
mkdirSync(dest, { recursive: true });
cpSync(src, dest, { recursive: true });
const n = readdirSync(dest).filter((f) => f.endsWith('.mp3')).length;
const sample = join(dest, readdirSync(dest).find((f) => f.endsWith('.mp3')));
const size = statSync(sample).size;
console.log(`[copy-sounds] ${n} mp3 -> ${dest} (sample ${size} bytes)`);
if (n < 50 || size < 1000) {
  console.error('sounds copy looks wrong');
  process.exit(1);
}

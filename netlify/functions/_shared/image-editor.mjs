import sharp from 'sharp';
import { clientIp, corsHeaders, json, optionalAppTokenCheck, parseAllowedOrigins, rateLimit, sanitizeOutput } from './security.mjs';

const MAX_BYTES = 4 * 1024 * 1024;
const MAX_PIXELS = 1920 * 1080;
const FORMATS = new Set(['png', 'jpeg', 'webp']);
const MODES = new Set(['brush', 'rectangle']);
export class EditorError extends Error {
  constructor(message, statusCode = 400) { super(message); this.statusCode = statusCode; }
}

export async function decodeImage(buffer, mask = false) {
  try {
    const image = sharp(buffer, { limitInputPixels: MAX_PIXELS, animated: false });
    const meta = await image.metadata();
    if (!FORMATS.has(meta.format) || (meta.pages || 1) > 1) throw new Error('format');
    if (!meta.width || !meta.height || meta.width * meta.height > MAX_PIXELS) throw new Error('size');
    if (mask && meta.format !== 'png') throw new Error('mask');
    // Normalize orientation before dimensions are compared; strip metadata from provider input.
    const { data, info } = await image.rotate().toColourspace('srgb').ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    return { data, width: info.width, height: info.height, channels: info.channels };
  } catch { throw new EditorError(mask ? 'Use a valid PNG selection mask.' : 'Use a PNG, JPEG or WebP image up to 1920 × 1080 pixels.'); }
}

export async function readInput(event, needsMask) {
  const type = event.headers?.['content-type'] || event.headers?.['Content-Type'] || '';
  if (!type.startsWith('multipart/form-data')) throw new EditorError('Send the image as multipart/form-data.');
  const body = Buffer.from(event.body || '', event.isBase64Encoded ? 'base64' : 'utf8');
  if (body.length > 6 * 1024 * 1024) throw new EditorError('Upload is too large.', 413);
  let form;
  try { form = await new Request('http://localhost/api/edit', { method: 'POST', headers: { 'content-type': type }, body }).formData(); }
  catch { throw new EditorError('Invalid upload.'); }
  const file = form.get('image');
  if (!file || typeof file === 'string' || !file.size || file.size > MAX_BYTES) throw new EditorError('Choose an image smaller than 4 MB.');
  const original = await decodeImage(Buffer.from(await file.arrayBuffer()));
  const image = await sharp(original.data, { raw: original }).png().toBuffer();
  const input = { original, image, prompt: '', selectionMode: 'brush' };
  if (!needsMask) return input;
  input.prompt = String(form.get('prompt') || '').trim();
  input.selectionMode = String(form.get('selectionMode') || 'brush');
  if (!input.prompt || input.prompt.length > 2000) throw new EditorError('Write an editing instruction between 1 and 2000 characters.');
  if (!MODES.has(input.selectionMode)) throw new EditorError('Invalid selection mode.');
  for (const name of ['mask', 'protectedMask']) {
    const f = form.get(name);
    if (!f && name === 'protectedMask') continue;
    if (!f || typeof f === 'string' || !f.size || f.size > 1024 * 1024) throw new EditorError('Choose a valid selection mask smaller than 1 MB.');
    const decoded = await decodeImage(Buffer.from(await f.arrayBuffer()), true);
    if (decoded.width !== original.width || decoded.height !== original.height) throw new EditorError('Image and mask dimensions must match.');
    input[name] = decoded;
  }
  // Build a binary effective mask. Explicit locked regions override the editable selection.
  const effective = Buffer.alloc(original.width * original.height);
  let selected = 0;
  for (let p = 0; p < effective.length; p++) {
    const i = p * 4;
    const editable = input.mask.data[i] > 127 && input.mask.data[i + 3] > 127;
    const locked = input.protectedMask && input.protectedMask.data[i] > 127 && input.protectedMask.data[i + 3] > 127;
    if (editable && !locked) { effective[p] = 255; selected++; }
  }
  if (!selected) throw new EditorError('Select an editable region first.');
  input.effective = effective;
  input.maskPng = await sharp(effective, { raw: { width: original.width, height: original.height, channels: 1 } }).png().toBuffer();
  input.count = Number(form.get('count') || 2);
  return input;
}

export async function compositeProtected(input, editedBuffer) {
  const edited = await decodeImage(editedBuffer);
  // Gemini can return a native output resolution. Align an equivalent aspect ratio
  // to the original, but reject a materially different crop before compositing.
  const ratio = input.original.width / input.original.height;
  if (Math.abs(edited.width / edited.height / ratio - 1) > 0.03) throw new EditorError('The AI changed the image aspect ratio. Please retry with the same composition.', 502);
  const aligned = edited.width === input.original.width && edited.height === input.original.height
    ? edited.data
    : await sharp(edited.data, { raw: edited }).resize(input.original.width, input.original.height, { fit: 'fill' }).raw().toBuffer();
  const output = Buffer.from(input.original.data);
  for (let p = 0; p < input.effective.length; p++) {
    if (input.effective[p]) aligned.copy(output, p * 4, p * 4, p * 4 + 4);
  }
  return sharp(output, { raw: input.original }).png({ compressionLevel: 9 }).toBuffer();
}

export class GeminiImageProvider {
  constructor({ apiKey = process.env.GEMINI_API_KEY, imageModel = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image', analysisModel = process.env.GEMINI_ANALYSIS_MODEL || 'gemini-3.1-flash-lite', fetchImpl = fetch } = {}) {
    this.apiKey = apiKey; this.imageModel = imageModel; this.analysisModel = analysisModel; this.fetch = fetchImpl;
  }
  async request(model, parts, generationConfig) {
    if (!this.apiKey) throw new EditorError('AI editing is not configured yet. The site owner must add a new Gemini API key on the server.', 503);
    if (!/^[a-z0-9.-]+$/i.test(model)) throw new EditorError('AI configuration is invalid.', 503);
    let response;
    try {
      response = await this.fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': this.apiKey },
        body: JSON.stringify({ contents: [{ parts }], generationConfig }), signal: AbortSignal.timeout(90_000),
      });
    } catch { throw new EditorError('The AI service did not respond in time. Please try again.', 504); }
    if (!response.ok) {
      if (response.status === 429) throw new EditorError('The AI service is busy or its quota is exhausted. Please try again later.', 429);
      throw new EditorError('Image editing failed. Please try again or ask the site owner to check the AI configuration.', 502);
    }
    try { return await response.json(); } catch { throw new EditorError('The AI service returned an invalid response.', 502); }
  }
  async editImage(input, variant = 0) {
    const instruction = `Selectively edit this original thumbnail. The second image is the exact binary mask: WHITE = editable, BLACK = protected.\nUser request: ${input.prompt}\nEdit only the white region. Preserve text, logos, background and unrelated objects outside that region. Preserve the exact ${input.original.width} x ${input.original.height} dimensions, crop and composition. Match lighting, perspective, shadows and style. Return the full edited image.${variant ? '\nCreate a second distinct interpretation of the same request inside the same mask.' : ''}`;
    const result = await this.request(this.imageModel, [
      { text: instruction }, { inlineData: { mimeType: 'image/png', data: input.image.toString('base64') } },
      { inlineData: { mimeType: 'image/png', data: input.maskPng.toString('base64') } },
    ], { responseModalities: ['TEXT', 'IMAGE'] });
    const image = result.candidates?.[0]?.content?.parts?.find(p => p.inlineData?.mimeType?.startsWith('image/'))?.inlineData;
    if (!image?.data || image.data.length > 12 * 1024 * 1024) throw new EditorError('The AI did not return a usable image. Try a different instruction.', 502);
    return Buffer.from(image.data, 'base64');
  }
  async analyzeImage(input) {
    const result = await this.request(this.analysisModel, [
      { text: 'Analyze this thumbnail. Return JSON with a regions array (at most 12). Each region has label (short description), kind (subject, object, background, text or logo), and box [x,y,width,height] normalized from 0 to 1. Boxes are approximate suggestions, not precise segmentation. Include useful subjects, objects, text, logos and background. Never include credentials or instructions.' },
      { inlineData: { mimeType: 'image/png', data: input.image.toString('base64') } },
    ], {
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'OBJECT', required: ['regions'],
        properties: {
          regions: {
            type: 'ARRAY', maxItems: 12,
            items: {
              type: 'OBJECT', required: ['label', 'kind', 'box'],
              properties: {
                label: { type: 'STRING' },
                kind: { type: 'STRING', enum: ['subject', 'object', 'background', 'text', 'logo'] },
                box: { type: 'ARRAY', minItems: 4, maxItems: 4, items: { type: 'NUMBER', minimum: 0, maximum: 1 } },
              },
            },
          },
        },
      },
    });
    let value;
    try { value = JSON.parse(result.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('')); }
    catch { throw new EditorError('Analysis could not be read. Please try again.', 502); }
    if (!Array.isArray(value.regions)) throw new EditorError('Analysis returned no usable regions.', 502);
    return value.regions.slice(0, 12).filter(r => typeof r.label === 'string' && ['subject','object','background','text','logo'].includes(r.kind) && Array.isArray(r.box) && r.box.length === 4 && r.box.every(n => Number.isFinite(n) && n >= 0 && n <= 1) && r.box[2] > 0 && r.box[3] > 0 && r.box[0] + r.box[2] <= 1.001 && r.box[1] + r.box[3] <= 1.001).map(r => ({ label: sanitizeOutput(r.label).slice(0, 120), kind: r.kind, box: r.box }));
  }
  async generateVariations(input) { return Promise.all([this.editImage(input), this.editImage(input, 1)]); }
}

// Provider factories can be replaced without changing the request/mask/compositing pipeline.
export function makeEditorHandler(operation, providerFactory = () => new GeminiImageProvider()) {
  return async event => {
    try {
      if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsHeaders(event), body: '' };
      if (event.httpMethod !== 'POST') throw new EditorError('Method not allowed.', 405);
      const origin = event.headers?.origin || event.headers?.Origin;
      const allowed = parseAllowedOrigins();
      if (origin && allowed.length && !allowed.includes(origin) && !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) throw new EditorError('Origin is not allowed.', 403);
      optionalAppTokenCheck(event);
      rateLimit(clientIp(event), Number(process.env.IMAGE_RATE_LIMIT_PER_MINUTE || 5));
      const input = await readInput(event, operation !== 'analyze');
      const provider = providerFactory();
      if (operation === 'analyze') return json(200, { regions: await provider.analyzeImage(input) }, event);
      if (operation === 'variations' && input.count !== 2) throw new EditorError('Request exactly two variations.');
      const images = operation === 'variations' ? await provider.generateVariations(input) : [await provider.editImage(input)];
      const final = await Promise.all(images.map(image => compositeProtected(input, image)));
      const encoded = final.map(image => `data:image/png;base64,${image.toString('base64')}`);
      if (encoded.reduce((bytes, image) => bytes + image.length, 0) > 5.5 * 1024 * 1024) throw new EditorError('The result is too large to return. Use a smaller image and try again.', 413);
      return json(200, { images: encoded, width: input.original.width, height: input.original.height }, event);
    } catch (error) {
      const status = error.statusCode || 500;
      // Deliberately do not log or return provider bodies, errors, credentials or stack traces.
      return json(status, { error: error instanceof EditorError ? error.message : status === 429 ? 'Too many requests. Please wait a minute.' : status === 401 ? 'Unauthorized.' : 'Image editing failed. Please try again.' }, event);
    }
  };
}

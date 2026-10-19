import sharp from 'sharp';
import { clientIp, corsHeaders, json, optionalAppTokenCheck, parseAllowedOrigins, rateLimit, sanitizeOutput } from './security.mjs';

const MAX_BYTES = 4 * 1024 * 1024;
const MAX_PIXELS = 1920 * 1080;
const FORMATS = new Set(['png', 'jpeg', 'webp']);
const MODES = new Set(['brush', 'rectangle']);
export class EditorError extends Error {
  constructor(message, statusCode = 400, code) { super(message); this.statusCode = statusCode; this.code = code; }
}

export async function decodeImage(buffer, mask = false, maxPixels = MAX_PIXELS) {
  try {
    const image = sharp(buffer, { limitInputPixels: maxPixels, animated: false });
    const meta = await image.metadata();
    if (!FORMATS.has(meta.format) || (meta.pages || 1) > 1) throw new Error('format');
    if (!meta.width || !meta.height || meta.width * meta.height > maxPixels) throw new Error('size');
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
  input.editMode = String(form.get('editMode') || 'selective');
  if (!['selective', 'face'].includes(input.editMode)) throw new EditorError('Invalid editing mode.');
  input.prompt = String(form.get('prompt') || '').trim();
  if (input.editMode === 'face' && !input.prompt) input.prompt = 'Replace the selected face with the person in the face reference photo.';
  input.selectionMode = String(form.get('selectionMode') || 'brush');
  if (!input.prompt || input.prompt.length > 2000) throw new EditorError('Write an editing instruction between 1 and 2000 characters.');
  if (!MODES.has(input.selectionMode)) throw new EditorError('Invalid selection mode.');
  const reference = form.get('referenceImage');
  if (input.editMode === 'face') {
    if (!reference || typeof reference === 'string' || !reference.size) throw new EditorError('Upload a face reference photo first.', 400, 'REFERENCE_REQUIRED');
    if (reference.size > 2 * 1024 * 1024) throw new EditorError('Use a face reference smaller than 2 MB.', 400, 'REFERENCE_INVALID');
    let decoded;
    try { decoded = await decodeImage(Buffer.from(await reference.arrayBuffer())); }
    catch { throw new EditorError('Use a valid PNG, JPEG or WebP face reference up to 1920 × 1080 pixels.', 400, 'REFERENCE_INVALID'); }
    input.referenceImage = await sharp(decoded.data, { raw: decoded }).png().toBuffer();
  } else if (reference) throw new EditorError('Choose face replacement mode to use a face reference.', 400, 'REFERENCE_INVALID');
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
  const edited = await decodeImage(editedBuffer, false, 9 * 1024 * 1024);
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

function faceReferenceInstruction(input) {
  return input.editMode === 'face'
    ? '\nThe THIRD image is the identity reference photo, not an image to edit. Replace only the selected face in the FIRST image with the person from the THIRD image. Preserve the reference identity and recognizable facial features, while matching the target head angle, expression, skin lighting and image style. Keep the target hairstyle, clothes, body and background unless they are explicitly selected and requested. Never copy the reference background or the mask into the result. Blend naturally inside the editable mask.'
    : '';
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
      if (response.status === 429) {
        // Inspect only structured quota metadata; never expose the provider's body.
        let quotaExceeded = false;
        try {
          const failure = await response.json();
          quotaExceeded = Array.isArray(failure.error?.details) && failure.error.details.some(detail =>
            detail['@type'] === 'type.googleapis.com/google.rpc.QuotaFailure' && Array.isArray(detail.violations) && detail.violations.length > 0);
        } catch { /* An unreadable error still means a provider-side request limit. */ }
        throw new EditorError(quotaExceeded
          ? 'Google rejected this request because the Gemini project quota is exhausted. Check image-generation quota and billing for the project linked to the server API key. Changing keys within that project does not increase its quota.'
          : 'Gemini is temporarily limiting requests. Wait before trying again.', 429, quotaExceeded ? 'GEMINI_QUOTA_EXCEEDED' : 'GEMINI_RATE_LIMITED');
      }
      throw new EditorError('Image editing failed. Please try again or ask the site owner to check the AI configuration.', 502);
    }
    try { return await response.json(); } catch { throw new EditorError('The AI service returned an invalid response.', 502); }
  }
  async editImage(input, variant = 0) {
    const instruction = `Selectively edit this original thumbnail. The second image is the exact binary mask: WHITE = editable, BLACK = protected.\nUser request: ${input.prompt}\nEdit only the white region. Preserve text, logos, background and unrelated objects outside that region. Preserve the exact ${input.original.width} x ${input.original.height} dimensions, crop and composition. Match lighting, perspective, shadows and style. Return the full edited image.${faceReferenceInstruction(input)}${variant ? '\nCreate a second distinct interpretation of the same request inside the same mask.' : ''}`;
    const result = await this.request(this.imageModel, [
      { text: instruction }, { inlineData: { mimeType: 'image/png', data: input.image.toString('base64') } },
      { inlineData: { mimeType: 'image/png', data: input.maskPng.toString('base64') } },
      ...(input.referenceImage ? [{ inlineData: { mimeType: 'image/png', data: input.referenceImage.toString('base64') } }] : []),
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

// Muse edits reference images; the shared binary composite remains the final authority
// over which pixels may change. Analysis continues to use Gemini independently.
// Accept the existing stack variable spelling as well as the documented name.
export function runwareApiKey() { return process.env.RUNWARE_API_KEY?.trim() || process.env.Runware_api_key?.trim() || ''; }

export class RunwareImageProvider {
  constructor({ apiKey = runwareApiKey(), model = process.env.RUNWARE_IMAGE_MODEL || 'meta:muse@image', fetchImpl = fetch, analysisProvider = new GeminiImageProvider() } = {}) {
    this.apiKey = apiKey; this.model = model; this.fetch = fetchImpl; this.analysisProvider = analysisProvider;
  }
  async editImage(input, variant = 0) {
    if (!this.apiKey) throw new EditorError('Runware is not configured. Add RUNWARE_API_KEY on the server.', 503, 'RUNWARE_NOT_CONFIGURED');
    const taskUUID = crypto.randomUUID();
    let response, result;
    try {
      response = await this.fetch('https://api.runware.ai/v1', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.apiKey}` },
        body: JSON.stringify([{
          taskType: 'imageInference', taskUUID, model: this.model,
          positivePrompt: `Edit the FIRST reference image. The SECOND reference is a binary selection mask: WHITE means editable, BLACK means protected. Apply this instruction only inside the white region: ${input.prompt}. Preserve all other subjects, text, logos, lighting and composition. Return the full image with the first reference's aspect ratio.${faceReferenceInstruction(input)}${variant ? ' Create a distinct second interpretation.' : ''}`,
          inputs: { referenceImages: [input.image, input.maskPng, ...(input.referenceImage ? [input.referenceImage] : [])].map(image => `data:image/png;base64,${image.toString('base64')}`) },
          // Explicitly pin shape to the original, not to the mask or a default square.
          resolution: '2K', outputType: 'base64Data', outputFormat: 'PNG', numberResults: 1,
          settings: { webSearch: false, imageSearch: false },
        }]), signal: AbortSignal.timeout(90_000),
      });
      result = await response.json();
    } catch { throw new EditorError('Runware did not return a usable response. Please try again.', 502, 'RUNWARE_FAILED'); }
    const errors = Array.isArray(result?.errors) ? result.errors : [];
    if (!response.ok || errors.length) {
      const codes = errors.map(error => String(error.code || '').toLowerCase());
      if (response.status === 401 || response.status === 403 || codes.some(code => /auth|apikey/.test(code))) throw new EditorError('Runware rejected the API key. The site owner must check the server configuration.', 503, 'RUNWARE_AUTH_FAILED');
      if (response.status === 402 || codes.some(code => /credit|balance|fund/.test(code))) throw new EditorError('Runware credits are insufficient. Check the Runware account balance.', 402, 'RUNWARE_CREDITS');
      if (response.status === 429 || codes.some(code => /ratelimit|toomany/.test(code))) throw new EditorError('Runware is limiting requests. Wait before trying again.', 429, 'RUNWARE_RATE_LIMITED');
      throw new EditorError('Runware could not complete the image edit. Check model access and account configuration.', 502, 'RUNWARE_FAILED');
    }
    const image = result?.data?.find(item => item.taskUUID === taskUUID && item.taskType === 'imageInference');
    const base64 = image?.imageBase64Data;
    if (typeof base64 !== 'string' || !base64.length || base64.length > 12 * 1024 * 1024 || !/^[A-Za-z0-9+/]+={0,2}$/.test(base64)) throw new EditorError('Runware returned no usable image. Try a different instruction.', 502, 'RUNWARE_FAILED');
    return Buffer.from(base64, 'base64');
  }
  analyzeImage(input) { return this.analysisProvider.analyzeImage(input); }
  generateVariations(input) { return Promise.all([this.editImage(input), this.editImage(input, 1)]); }
}

export function imageProviderName() { return process.env.IMAGE_PROVIDER || 'runware'; }
export function createImageProvider() {
  const provider = imageProviderName();
  if (provider === 'runware') return new RunwareImageProvider();
  if (provider === 'gemini') return new GeminiImageProvider();
  throw new EditorError('Unknown image provider. Check IMAGE_PROVIDER on the server.', 503, 'IMAGE_PROVIDER_INVALID');
}

// Provider factories can be replaced without changing the request/mask/compositing pipeline.
export function makeEditorHandler(operation, providerFactory = createImageProvider) {
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
      const provider = operation === 'analyze' && providerFactory === createImageProvider ? new GeminiImageProvider() : providerFactory();
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
      const code = ['RATE_LIMIT', 'GEMINI_QUOTA_EXCEEDED', 'GEMINI_RATE_LIMITED', 'RUNWARE_NOT_CONFIGURED', 'RUNWARE_AUTH_FAILED', 'RUNWARE_CREDITS', 'RUNWARE_RATE_LIMITED', 'RUNWARE_FAILED', 'IMAGE_PROVIDER_INVALID', 'REFERENCE_REQUIRED', 'REFERENCE_INVALID'].includes(error.code) ? error.code : undefined;
      return json(status, { code, error: error instanceof EditorError ? error.message : status === 429 ? 'Too many requests. Please wait a minute.' : status === 401 ? 'Unauthorized.' : 'Image editing failed. Please try again.' }, event);
    }
  };
}

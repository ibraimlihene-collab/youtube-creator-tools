# Thumbnail AI Editor

Selective editing from the Notion specification **Thumbnail AI Editor — API & AI Integration**:
https://scratched-salamander-d7f.notion.site/Thumbnail-AI-Editor-API-AI-Integration-3efe3af192f78130b465ca6b40eb950d

Open `/tools/thumbnail-editor`, or choose **Thumbnail AI Editor** from the studio tools. The editor supports English and Arabic, desktop and mobile, brush/rectangle selections, erasing, explicit protected areas, mask undo, original/result comparison, two variations, analysis suggestions, and PNG/JPG export. The illustrated practice thumbnail is drawn locally; upload a real image to edit it. No user image or result is persisted by the application.

## Local development

Run `npm install`, then start the frontend with `npm run dev:app` and the API with `npm run dev:api` in separate terminals. Vite proxies `/api` to port 8888. Alternatively use Netlify CLI with `npm run dev`. Production uses the same handlers through the Netlify redirects.

Set `GEMINI_API_KEY` on the server only. Use a newly generated key; do not reuse the key exposed in chat or publish it in Notion. `GEMINI_IMAGE_MODEL` and `GEMINI_ANALYSIS_MODEL` are replaceable server settings. The default image model is `gemini-2.5-flash-image`, listed in Google's official image editing documentation:
https://ai.google.dev/gemini-api/docs/image-generation

Without a key the local editor and original export still work; AI operations return a clear 503 configuration message. The health endpoint returns configuration booleans, never credentials. In Lightsprint, persist variables in stack sandbox configuration and resync the environment. In Netlify, add them to the site's environment settings.

## API

All POST endpoints accept multipart/form-data. Images must decode as PNG, JPEG or WebP, be at most 4 MB and 2,073,600 pixels (the 1920 × 1080 pixel budget). Masks must decode as PNG with the same oriented dimensions as the original and be at most 1 MB each. The complete request is capped at 6 MB.

- `POST /api/analyze`: `image`; returns `{ regions: [{ label, kind, box: [x,y,width,height] }] }`. Boxes use normalized coordinates. Suggestions are approximate, not segmentation, and must be refined before editing.
- `POST /api/edit`: `image`, `mask`, optional `protectedMask`, `prompt` (1–2000 characters), `selectionMode` (`brush` or `rectangle`). White opaque mask pixels are editable; black/transparent pixels are protected. White pixels in `protectedMask` override editable pixels. Returns `{ images: [PNG data URL], width, height }`.
- `POST /api/variations`: the same inputs plus `count=2`; returns two images independently composited against the same original.
- `GET /api/health`: server and provider configuration status.

Combined encoded results are capped at 5.5 MB to fit the synchronous Netlify response limit.

The browser does not call Gemini directly. `GeminiImageProvider` implements `analyzeImage`, `editImage` and `generateVariations`; the handler factory can accept another provider without changing validation and compositing. Requests have timeouts and per-instance IP rate limits. Public production deployments should also configure platform-level abuse prevention; the in-memory limiter does not coordinate across serverless instances.

The backend normalizes orientation and decodes images to RGBA, constructs the binary effective mask, asks Gemini for a full image with unchanged dimensions, rejects aspect ratios differing by more than 3%, aligns equivalent native output resolutions to the original dimensions, and copies edited pixels **only** into that effective region. Every other RGBA pixel is copied from the decoded original. PNG output preserves those pixels exactly; JPEG download uses lossy encoding. A binary mask intentionally has no feathering, so brush edges may need refinement. Original upload remains unchanged in the editor, including after failure or cancellation.

## Verification

`npm run test:editor` exercises real multipart parsing and Sharp decoding/compositing using an injected deterministic test provider. It checks protected pixels byte for byte, explicit locks, empty/invalid inputs, crop mismatch, both edit endpoints, safe provider errors and analysis validation. These tests do not assert live Gemini generation quality. Run `npm run lint` for the repository's declared lint check; existing unrelated lint failures are recorded in the PR.

Live AI generation requires a configured fresh key, provider quota and a model accessible to that project. Automatic segmentation, OCR, automatic background removal, persistent version history, provider fallback and model benchmarking are follow-ups identified as future work in the source document.

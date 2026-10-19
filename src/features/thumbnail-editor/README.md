# Thumbnail AI Editor

Selective editing from the Notion specification **Thumbnail AI Editor — API & AI Integration**:
https://scratched-salamander-d7f.notion.site/Thumbnail-AI-Editor-API-AI-Integration-3efe3af192f78130b465ca6b40eb950d

Open `/tools/thumbnail-editor`, or choose **Thumbnail AI Editor** from the studio tools. The editor supports English and Arabic, desktop and mobile, brush/rectangle selections, erasing, explicit protected areas, mask undo, original/result comparison, two variations, analysis suggestions, and PNG/JPG export. The illustrated practice thumbnail is drawn locally; upload a real image to edit it. No user image or result is persisted by the application.

## Local development

Run `npm install`, then start the frontend with `npm run dev:app` and the API with `npm run dev:api` in separate terminals. Vite proxies `/api` to port 8888. Alternatively use Netlify CLI with `npm run dev`. Production uses the same handlers through the Netlify redirects.

Set `RUNWARE_API_KEY` on the server for Meta Muse editing (see below). `GEMINI_API_KEY` enables region analysis and optional Gemini image editing only when `IMAGE_PROVIDER=gemini` is explicitly set. `GEMINI_IMAGE_MODEL` and `GEMINI_ANALYSIS_MODEL` are replaceable server settings. The Gemini image model defaults to `gemini-2.5-flash-image`, listed in Google's official documentation:
https://ai.google.dev/gemini-api/docs/image-generation

Without a key the local editor and original export still work; AI operations return a clear 503 configuration message. The health endpoint returns configuration booleans, never credentials. In Lightsprint, persist variables in stack sandbox configuration and resync the environment. In Netlify, add them to the site's environment settings.

## API

All POST endpoints accept multipart/form-data. Images must decode as PNG, JPEG or WebP, be at most 4 MB and 2,073,600 pixels (the 1920 × 1080 pixel budget). Masks must decode as PNG with the same oriented dimensions as the original and be at most 1 MB each. The complete request is capped at 6 MB.

- `POST /api/analyze`: `image`; returns `{ regions: [{ label, kind, box: [x,y,width,height] }] }`. Boxes use normalized coordinates. Suggestions are approximate, not segmentation, and must be refined before editing.
- `POST /api/edit`: `image`, `mask`, optional `protectedMask`, `prompt` (1–2000 characters), `selectionMode` (`brush` or `rectangle`). White opaque mask pixels are editable; black/transparent pixels are protected. White pixels in `protectedMask` override editable pixels. Returns `{ images: [PNG data URL], width, height }`.
- `POST /api/variations`: the same inputs plus `count=2`; returns two images independently composited against the same original.
- `GET /api/health`: server and provider configuration status.

Combined encoded results are capped at 5.5 MB to fit the synchronous Netlify response limit.

The browser does not call image providers directly. `GeminiImageProvider` and `RunwareImageProvider` implement `analyzeImage`, `editImage` and `generateVariations`; the handler factory can accept another provider without changing validation and compositing. Requests have timeouts and per-instance IP rate limits. Public production deployments should also configure platform-level abuse prevention; the in-memory limiter does not coordinate across serverless instances.

The backend normalizes orientation and decodes images to RGBA, constructs the binary effective mask, asks the selected provider for a full image with the original composition and aspect ratio, rejects aspect ratios differing by more than 3%, aligns equivalent native output resolutions to the original dimensions, and copies edited pixels **only** into that effective region. Every other RGBA pixel is copied from the decoded original. PNG output preserves those pixels exactly; JPEG download uses lossy encoding. A binary mask intentionally has no feathering, so brush edges may need refinement. Original upload remains unchanged in the editor, including after failure or cancellation.

## Verification

`npm run test:editor` exercises real multipart parsing and Sharp decoding/compositing using an injected deterministic test provider. It checks protected pixels byte for byte, explicit locks, empty/invalid inputs, crop mismatch, both edit endpoints, safe provider errors and analysis validation. These deterministic tests do not assert live generation quality. The local HTTP adapter also has regression tests for interrupted uploads, oversized requests and handler failures; cancelled uploads cannot bring down the API. Frontend tests distinguish offline servers, missing provider configuration and Gemini quota errors. Connection health is refreshed on focus and every 15 seconds while the tab is visible, with a manual retry control when offline. Run `npm run lint` for the repository's declared lint check; existing unrelated lint failures are recorded in the PR.

Live AI generation requires a configured fresh key, provider quota or credits and a model accessible to that project. Automatic segmentation, OCR, automatic background removal, persistent version history, provider fallback and model benchmarking are follow-ups identified as future work in the source document.


## Runware / Meta Muse image editing

Runware is the default image-editing provider. The server also accepts the existing stack variable spelling `Runware_api_key`; the canonical `RUNWARE_API_KEY` takes precedence when both are set. Set `RUNWARE_API_KEY` on the server; `IMAGE_PROVIDER=runware` makes that choice explicit. An absent Runware key returns a configuration error and never falls back to Gemini. `RUNWARE_IMAGE_MODEL` defaults to `meta:muse@image`. Keep these values in the hosting environment; no secret belongs in `VITE_*`, browser storage or source control. Durable Lightsprint environment updates require a workspace administrator. Existing Gemini-only deployments must set `IMAGE_PROVIDER=gemini` to opt into Gemini image editing.

Muse edits use Runware's `POST https://api.runware.ai/v1` REST API with Bearer authentication, unique task UUIDs, and `inputs.referenceImages` containing the original and effective binary mask. `resolution: "2K"` follows the reference aspect ratio. The response uses `imageBase64Data`, avoiding arbitrary output URL downloads. Generated native 2K images are decoded with a separate bounded pixel budget, aligned to the original, and passed through the same exact protected-pixel composite. Input upload limits are unchanged. Two variations make two billable requests. No automatic retry or paid-provider fallback occurs.

Region analysis remains a separate Gemini capability (`GEMINI_API_KEY`); Runware-only deployments support manual selections and editing without Gemini. Health exposes `imageProvider`, `imageEditing`, and `imageAnalysis` configuration flags, never credentials; these flags do not guarantee balance or model availability. Runware handles credit, authentication, throttling and generation failures with safe localized messages. Images and masks are sent to the selected provider for processing; provider retention policies apply.

Official model schema and editing guide:

- https://runware.ai/docs/models/meta-muse-image
- https://runware.ai/docs/models/meta-muse-image/guides/editing-images


## Uploads and face replacement

Open **Uploads** in the image toolbar, or **Replace a face** in the settings panel. Upload your main thumbnail and a clear selfie as the face reference. The browser resizes reference uploads (PNG/JPEG/WebP, up to 8 MB) to at most 1024 pixels on the longest side and converts them to JPEG before sending. The original thumbnail remains unchanged. After uploading the reference, paint or draw a rectangle over the target face, including its edges, then choose **Replace selected face**. Extra instructions are optional. References can be changed, removed, or reused for another thumbnail during the same editor session. Choosing standard editing keeps the reference locally but does not send it with ordinary edits or region analysis. Closing/reloading the page discards it.

Face edits and both variations use `editMode=face` plus a `referenceImage` multipart file (PNG/JPEG/WebP, at most 2 MB and the same pixel budget as image uploads). Empty prompts use the face-replacement instruction automatically. Invalid/missing references reject before any provider call. Muse receives the original, binary mask, and identity photo in that order; its prompt names the third image as the identity source and preserves pose, lighting and the surrounding scene. The same protected-pixel composite still applies. Total request size remains capped at 6 MB; use a smaller main image if the combined upload exceeds that cap.

Face targeting is manual; this feature does not automatically detect faces or guarantee biometric identity accuracy. Review the result before downloading. The application does not persist face references or send them for region analysis. References are sent to the selected provider only for a requested face edit, under that provider's data policy.

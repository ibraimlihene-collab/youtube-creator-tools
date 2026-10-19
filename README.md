# YouCreator Tools

Professional AI platform for YouTube creators — **51 tools**, bilingual (EN/AR), privacy-first.

**Live:** [youtube-creator-tools.netlify.app](https://youtube-creator-tools.netlify.app/)

## Security (read this)

Provider API keys (**Gemini**, **Apify**, **Netlify**) are **server-only**:

1. Copy `.env.example` → `.env` (never commit `.env`)
2. In Netlify: **Site settings → Environment variables** add:
   - `GEMINI_API_KEY`
   - `APIFY_TOKEN`
   - `ALLOWED_ORIGINS` (your production domain)
   - `RATE_LIMIT_PER_MINUTE` (e.g. `20`)
3. The browser calls `/api/ai` and `/api/apify` only. Keys never ship to the client.

See [SECURITY.md](./SECURITY.md).

> If you ever pasted keys in a chat or commit: **rotate them now**.

## Stack

- React 19 + TypeScript + Vite 7
- Tailwind CSS 4 + DaisyUI 5
- Netlify Functions (secure AI/Apify proxy)
- FFmpeg.wasm (on-device silence remover)
- Models: `gemini-3.1-flash-lite`, Gemma 4, Flash fallbacks

## Develop

```bash
npm install
# optional: npm i -g netlify-cli
cp .env.example .env   # fill secrets locally
npm run dev            # netlify dev (functions + vite)
# or frontend only:
npm run dev:app
```

## Build

```bash
npm run build
```

## Thumbnail AI Editor

Open `/tools/thumbnail-editor` for selective AI editing: upload a thumbnail, paint the area to change, protect important details, and describe the edit. Compare results with the original and export PNG/JPG. The original stays untouched; the backend composites only selected pixels.

Run `npm run dev:api` alongside `npm run dev:app` for the local API. Set a fresh server-side `GEMINI_API_KEY`; optional `GEMINI_IMAGE_MODEL` and `GEMINI_ANALYSIS_MODEL` select supported models. Without a key, manual selection and original export remain available. See [editor documentation](src/features/thumbnail-editor/README.md) for endpoint contracts and tests.

## Thumbnail Generator

The AI **Thumbnail Generator** was **removed** by product decision. Use Thumbnail Downloader, Previewer, Text Ideas, and Color tools instead.

## License

MIT

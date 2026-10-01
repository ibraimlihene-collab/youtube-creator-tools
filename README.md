# YouCreator Tools

Professional AI platform for YouTube creators — **50 tools**, bilingual (EN/AR), privacy-first.

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

## Thumbnail Generator

The AI **Thumbnail Generator** was **removed** by product decision. Use Thumbnail Downloader, Previewer, Text Ideas, and Color tools instead.

## License

MIT

## Local API and verification

For a Vite preview with real server error states, run `npm run dev:api` in a second terminal alongside `npm run dev:app`. This development adapter runs the existing Netlify handlers on port 8888; Vite proxies `/api` to it. Configure provider keys only in the API process environment. Without keys, non-AI tools remain usable and AI generation reports that the service is unavailable. Production continues to use Netlify Functions.

The creator studio supports search by title/description, category filters, and a no-AI filter. Thumbnail previews and revenue estimates are illustrative; the estimator uses static CPM ranges and a 55% long-form creator share, not live channel analytics.

## Existing dependencies and audit limitations

The checkout does not include `public/sounds/`, although the sound-effects catalogue references those files. Restore the original licensed MP3 pack before publishing the sound library. The build now warns and continues when the optional pack is absent, so the rest of the website can deploy. The library reports unavailable files clearly. A production build was not run against the active preview.

AI output and YouTube enrichment require `GEMINI_API_KEY` and `APIFY_TOKEN`. No credentials are configured in this preview. The FFmpeg video pipeline still needs an end-to-end check with representative media; this upgrade does not claim to verify video/audio synchronization.

Validation: `bun run check`, `bun run test`, and `bun run lint`. Lint has existing issues in legacy translation props, deprecated API compatibility wrappers, media utilities, and hook cleanup/dependency warnings. Those are documented in the PR; no `test:changed` script exists.

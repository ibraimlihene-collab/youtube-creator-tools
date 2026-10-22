# Universal Knowledge OS + YouCreator Tools

The default entry now opens **Universal Knowledge OS**, an Arabic/French, browser-local knowledge and learning application at `/knowledge`. The existing creator toolkit remains available at `/creator`, `/app`, `/dashboard` and `/tools/*`.

Start the frontend with `npm ci` and `npm run dev:app -- --host 0.0.0.0 --port 5173`. Knowledge OS needs no API key or backend. Run `bun run check` followed by `bun run test:changed` for the new workspace.

Read the [complete application guide](docs/KNOWLEDGE-OS.md) for architecture, implemented features, deployment, daily/weekly usage, privacy, backup/recovery and the remaining AI/integration roadmap. The [test report](docs/KNOWLEDGE-OS-TEST-REPORT.md) separates actual verification from remaining limitations.

---

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

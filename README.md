# YouCreator Tools

A free, open-source suite of tools for YouTube creators — silence removal, AI titles & scripts, thumbnails, hashtags, CPM estimates, and more.

**Live:** [youtube-creator-tools.netlify.app](https://youtube-creator-tools.netlify.app/)

## Highlights (v1.1)

- **New UI/UX** — YouTube-inspired dark theme, responsive app shell with searchable sidebar, mobile drawer, and polished landing page
- **Unified studio** — every tool lives under a shared layout with categories (Editing, Thumbnails, AI writing, Growth)
- **Stronger tools**
  - Hashtag Generator: offline quick mode + optional Gemini AI mode
  - Video Rephraser: paste-script mode (reliable) + YouTube URL mode
  - Title / Script / Description generators: better prompts, copy UX, loading & error states
  - Thumbnail Downloader: shorts/embed URL parsing, cleaner grid
  - Shared API key storage with clearer privacy messaging
- **EN + AR** with RTL support
- **Privacy-first** — local tools (e.g. Silence Remover) run in your browser

## Tools

| Tool | Category | Notes |
|------|----------|--------|
| Silence Remover | Editing | Local FFmpeg in-browser |
| CPM Calculator | Growth | Niche + region estimates |
| Thumbnail Downloader | Thumbnails | Max-res → standard |
| Thumbnail Previewer | Thumbnails | Device / theme mock |
| Hashtag Generator | Growth | Offline + AI |
| Color Palette Generator | Thumbnails | Brand palettes |
| Thumbnail Generator | Thumbnails | Gemini image |
| Video Rephraser | AI | Script or URL |
| Script Writer | AI | Gemini |
| Description Generator | AI | SEO-friendly |
| Title Generator | AI | Multiple tones |

## Tech stack

- React 19 + TypeScript
- Vite 7
- Tailwind CSS 4 + DaisyUI 5
- React Router 7
- Lucide icons
- FFmpeg.wasm (silence remover)
- Google Gemini (`@google/genai`)

## Getting started

```bash
git clone https://github.com/ibraimlihene-collab/youtube-creator-tools.git
cd youtube-creator-tools
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

## Project structure

```
src/
├── App.tsx                 # Routes + tool pages
├── main.tsx
├── index.css               # Design system + YouTube theme
├── context/AppContext.tsx  # Lang + theme
├── components/
│   ├── layout/AppLayout.tsx
│   ├── ToolCard.tsx
│   ├── ApiKeyInput.tsx
│   ├── CopyButton.tsx
│   └── shared/             # FAQ, footer, other tools
├── features/               # One folder per tool
├── lib/                    # AI hook, tools registry, media utils
├── locales/                # en.json, ar.json
└── pages/LandingPage.tsx
```

## AI tools & API keys

AI features use **your** Google AI Studio key, stored only in `localStorage` on your device.

Get a free key: [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

## About the developer

Hi! I'm Ibrahim — this started as my first open-source project to learn modern web + AI tooling and to give creators free tools they can trust.

## License

MIT — see [LICENSE](./LICENSE).

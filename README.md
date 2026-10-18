# YouCreator — Thumbnail studio

A single-purpose YouTube thumbnail designer. Open the site, choose a style, add your words and optional photo, then download a 1280 × 720 PNG. No account, backend, or AI credentials are required.

## Features

- Three customizable styles with a live 16:9 canvas
- Headline, supporting line, text size, color, and position controls
- Local JPG, PNG, and WebP backgrounds (up to 10 MB and 40 megapixels)
- Image crop and contrast controls
- English/Arabic, RTL, light/dark themes, and responsive controls
- Full-resolution PNG export

Images and edits stay in the current tab. Download before leaving; drafts are not persisted. The designer has no AI image generation or background removal.

## Development

```sh
npm install
npm run dev:app -- --host 0.0.0.0
```

Run checks with `bun run check`, tests with `bun run test`, and lint with `bun run lint`. Bun is required for the test runner. The repository contains legacy tools that are not routed or imported by the public app; legacy lint failures remain in those sources.

Production: `npm run build` publishes `dist` using Netlify's SPA fallback. The designer does not need the legacy functions or optional sound pack. Old app/tool URLs redirect to `/`.

## License

MIT

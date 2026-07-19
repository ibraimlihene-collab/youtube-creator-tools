# Security

## API keys

- `GEMINI_API_KEY`, `APIFY_TOKEN`, and `NETLIFY_AUTH_TOKEN` must **only** exist as:
  - local `.env` (gitignored), or
  - Netlify → Site configuration → Environment variables
- They must **never** appear in:
  - frontend bundles
  - `localStorage` / `sessionStorage`
  - Git commits
  - client request bodies

## Architecture

```
Browser  --POST /api/ai-->  Netlify Function  --key from env-->  Gemini/Apify
         (no secrets)        (rate limit + CORS)
```

## If a key was ever pasted in chat or committed

1. Rotate it immediately in the provider dashboard.
2. Update Netlify env vars.
3. Redeploy.

## Headers & limits

- CORS allowlist via `ALLOWED_ORIGINS`
- Per-IP rate limit via `RATE_LIMIT_PER_MINUTE`
- Optional `APP_REQUEST_SECRET` / `X-App-Token`
- Client-supplied `apiKey` / `token` fields are rejected with `CLIENT_KEY_REJECTED`

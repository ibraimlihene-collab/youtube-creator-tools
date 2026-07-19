/**
 * Secure Apify proxy — token never exposed to the browser.
 * POST /api/apify { action, input }
 *
 * Supported actions (minimal, high-value):
 * - youtubeVideoInfo: public metadata via Apify actor (when configured)
 * - health: checks token presence without leaking it
 */
import {
  assertMethod,
  clientIp,
  getEnv,
  handleError,
  json,
  optionalAppTokenCheck,
  parseJsonBody,
  rateLimit,
  sanitizeOutput,
} from './_shared/security.mjs';

const ALLOWED_ACTIONS = new Set(['health', 'youtubeVideoInfo', 'runActor']);

export async function handler(event) {
  try {
    const m = assertMethod(event, 'POST');
    if (m.preflight) return json(204, {}, event);

    optionalAppTokenCheck(event);
    rateLimit(clientIp(event), Number(process.env.RATE_LIMIT_PER_MINUTE || 10));

    const body = parseJsonBody(event);
    const action = String(body.action || 'health');

    if (!ALLOWED_ACTIONS.has(action)) {
      return json(400, { ok: false, error: 'Unknown action', code: 'BAD_ACTION' }, event);
    }

    // Reject client-supplied tokens
    if (body.token || body.apifyToken || body.apiKey) {
      return json(
        400,
        { ok: false, error: 'Client tokens rejected', code: 'CLIENT_KEY_REJECTED' },
        event
      );
    }

    if (action === 'health') {
      const has = Boolean(process.env.APIFY_TOKEN);
      return json(200, { ok: true, configured: has }, event);
    }

    const token = getEnv('APIFY_TOKEN');

    if (action === 'youtubeVideoInfo') {
      const url = String(body.input?.url || body.url || '').trim();
      if (!url || !/youtube\.com|youtu\.be/i.test(url)) {
        return json(400, { ok: false, error: 'Valid YouTube URL required' }, event);
      }

      // Use a lightweight approach: oEmbed + no-key public endpoints first (free)
      // Apify reserved for heavier scrapes when actorId provided
      const oembed = await fetch(
        `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
      );
      if (oembed.ok) {
        const data = await oembed.json();
        return json(
          200,
          {
            ok: true,
            source: 'oembed',
            data: {
              title: data.title,
              author: data.author_name,
              authorUrl: data.author_url,
              thumbnail: data.thumbnail_url,
            },
          },
          event
        );
      }

      // Fallback: Apify actor if specified
      const actorId = body.actorId || process.env.APIFY_YOUTUBE_ACTOR || '';
      if (!actorId) {
        return json(
          502,
          { ok: false, error: 'Could not fetch video info', code: 'FETCH_FAIL' },
          event
        );
      }

      const runRes = await fetch(
        `https://api.apify.com/v2/acts/${encodeURIComponent(actorId)}/run-sync-get-dataset-items?token=${encodeURIComponent(token)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ startUrls: [{ url }] }),
        }
      );
      const items = await runRes.json().catch(() => []);
      if (!runRes.ok) {
        return json(502, { ok: false, error: 'Apify run failed', code: 'APIFY_FAIL' }, event);
      }
      return json(
        200,
        { ok: true, source: 'apify', data: sanitizeOutput(JSON.stringify(items)).slice?.(0) || items },
        event
      );
    }

    if (action === 'runActor') {
      // Strict allowlist of actor IDs via env to prevent abuse
      const allow = (process.env.APIFY_ALLOWED_ACTORS || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const actorId = String(body.actorId || '');
      if (!actorId || (allow.length && !allow.includes(actorId))) {
        return json(403, { ok: false, error: 'Actor not allowed', code: 'ACTOR_DENIED' }, event);
      }
      const runRes = await fetch(
        `https://api.apify.com/v2/acts/${encodeURIComponent(actorId)}/run-sync-get-dataset-items?token=${encodeURIComponent(token)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body.input || {}),
        }
      );
      const items = await runRes.json().catch(() => []);
      if (!runRes.ok) {
        return json(502, { ok: false, error: 'Apify run failed', code: 'APIFY_FAIL' }, event);
      }
      return json(200, { ok: true, data: items }, event);
    }

    return json(400, { ok: false, error: 'Unhandled' }, event);
  } catch (err) {
    return handleError(err, event);
  }
}

import { assertMethod, json, corsHeaders } from './_shared/security.mjs';

export async function handler(event) {
  try {
    const m = assertMethod(event, 'POST');
    // allow GET too
    if (event.httpMethod === 'GET' || event.httpMethod === 'OPTIONS' || m.preflight) {
      if (event.httpMethod === 'OPTIONS') return json(204, {}, event);
    }
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders(event),
      },
      body: JSON.stringify({
        ok: true,
        service: 'youcreator-api',
        gemini: Boolean(process.env.GEMINI_API_KEY),
        apify: Boolean(process.env.APIFY_TOKEN),
        // never return key values
        ts: Date.now(),
      }),
    };
  } catch (e) {
    return json(500, { ok: false }, event);
  }
}

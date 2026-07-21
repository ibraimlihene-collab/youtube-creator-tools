import { corsHeaders, json } from './_shared/security.mjs';

export async function handler(event) {
  try {
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 204, headers: corsHeaders(event), body: '' };
    }
    if (event.httpMethod !== 'GET' && event.httpMethod !== 'POST') {
      return json(405, { ok: false, error: 'Method not allowed' }, event);
    }
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        ...corsHeaders(event),
        'Cache-Control': 'no-store',
      },
      body: JSON.stringify({
        ok: true,
        service: 'youcreator-api',
        gemini: Boolean(process.env.GEMINI_API_KEY),
        apify: Boolean(process.env.APIFY_TOKEN),
        ts: Date.now(),
      }),
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders(event) },
      body: JSON.stringify({ ok: false }),
    };
  }
}

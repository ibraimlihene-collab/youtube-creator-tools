/**
 * Shared security helpers for Netlify Functions.
 * Secrets are read ONLY from process.env — never from request body.
 */

const rateMap = new Map();

export function getEnv(name, required = true) {
  const v = process.env[name];
  if (required && (!v || !String(v).trim())) {
    const err = new Error(`Missing server env: ${name}`);
    err.statusCode = 500;
    err.code = 'ENV_MISSING';
    throw err;
  }
  return v ? String(v).trim() : '';
}

export function parseAllowedOrigins() {
  const raw = process.env.ALLOWED_ORIGINS || '';
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function corsHeaders(event) {
  const origin = event.headers?.origin || event.headers?.Origin || '';
  const allowed = parseAllowedOrigins();
  const ok =
    !origin ||
    allowed.length === 0 ||
    allowed.includes(origin) ||
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

  const allowOrigin = ok && origin ? origin : allowed[0] || '*';

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'Content-Type, X-App-Token',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': 'no-store',
  };
}

export function clientIp(event) {
  const xf = event.headers?.['x-forwarded-for'] || event.headers?.['X-Forwarded-For'] || '';
  if (xf) return String(xf).split(',')[0].trim();
  return event.headers?.['client-ip'] || event.headers?.['x-nf-client-connection-ip'] || 'unknown';
}

/** Simple in-memory sliding window (per warm instance). Good enough for free tier. */
export function rateLimit(ip, limit = Number(process.env.RATE_LIMIT_PER_MINUTE || 20)) {
  const now = Date.now();
  const windowMs = 60_000;
  let bucket = rateMap.get(ip);
  if (!bucket || now - bucket.start > windowMs) {
    bucket = { start: now, count: 0 };
    rateMap.set(ip, bucket);
  }
  bucket.count += 1;
  if (bucket.count > limit) {
    const err = new Error('Too many requests. Please wait a minute and try again.');
    err.statusCode = 429;
    err.code = 'RATE_LIMIT';
    throw err;
  }
}

export function assertMethod(event, method = 'POST') {
  if (event.httpMethod === 'OPTIONS') {
    return { preflight: true };
  }
  if (event.httpMethod !== method) {
    const err = new Error('Method not allowed');
    err.statusCode = 405;
    throw err;
  }
  return { preflight: false };
}

export function optionalAppTokenCheck(event) {
  const secret = process.env.APP_REQUEST_SECRET;
  if (!secret) return;
  const token = event.headers?.['x-app-token'] || event.headers?.['X-App-Token'] || '';
  if (token !== secret) {
    const err = new Error('Unauthorized');
    err.statusCode = 401;
    err.code = 'UNAUTHORIZED';
    throw err;
  }
}

export function parseJsonBody(event) {
  if (!event.body) return {};
  try {
    const raw = event.isBase64Encoded
      ? Buffer.from(event.body, 'base64').toString('utf8')
      : event.body;
    return JSON.parse(raw);
  } catch {
    const err = new Error('Invalid JSON body');
    err.statusCode = 400;
    throw err;
  }
}

export function json(statusCode, body, event) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...corsHeaders(event),
    },
    body: JSON.stringify(body),
  };
}

export function handleError(err, event) {
  const status = err.statusCode || 500;
  // Never leak secrets or stack traces to clients
  const message =
    status >= 500 && err.code === 'ENV_MISSING'
      ? 'Server is not configured. Contact the site owner.'
      : err.message || 'Internal error';
  console.error('[fn-error]', {
    status,
    code: err.code,
    message: err.message,
    // do not log env values
  });
  return json(
    status,
    {
      ok: false,
      error: message,
      code: err.code || 'ERROR',
    },
    event
  );
}

/** Strip anything that looks like a secret from model output before returning */
export function sanitizeOutput(text) {
  if (typeof text !== 'string') return text;
  return text
    .replace(/apify_api_[A-Za-z0-9]+/gi, '[redacted]')
    .replace(/\bAIza[0-9A-Za-z\-_]{20,}\b/g, '[redacted]')
    .replace(/\bAQ\.[A-Za-z0-9_\-]{20,}\b/g, '[redacted]')
    .replace(/\bnfp_[A-Za-z0-9]+/gi, '[redacted]');
}

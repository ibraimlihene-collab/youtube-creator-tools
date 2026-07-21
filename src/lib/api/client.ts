/**
 * Browser → server API client.
 * NEVER sends or stores provider API keys.
 */

export type AIListResult = { type: 'list'; items: string[] };
export type AIMarkdownResult = { type: 'markdown'; content: string };
export type AIResult = AIListResult | AIMarkdownResult;

export interface AISuccess {
  ok: true;
  toolId: string;
  model: string;
  result: AIResult;
  raw?: string;
}

export interface AIFailure {
  ok: false;
  error: string;
  code?: string;
}

export type AIResponse = AISuccess | AIFailure;

function apiBase() {
  return '';
}

export async function runAI(params: {
  toolId: string;
  input: Record<string, unknown>;
  lang?: 'ar' | 'en';
  signal?: AbortSignal;
}): Promise<AIResponse> {
  try {
    const res = await fetch(`${apiBase()}/api/ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        toolId: params.toolId,
        input: params.input,
        lang: params.lang || 'en',
      }),
      signal: params.signal,
    });

    let data: AIResponse;
    try {
      data = (await res.json()) as AIResponse;
    } catch {
      return {
        ok: false,
        error:
          res.status === 404
            ? 'AI server not found. Deploy with Netlify Functions or run `netlify dev`.'
            : `Bad response (${res.status})`,
        code: 'HTTP',
      };
    }
    if (!res.ok && !('error' in data && data.error)) {
      return { ok: false, error: `Request failed (${res.status})`, code: 'HTTP' };
    }
    return data;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Network error';
    if (msg.toLowerCase().includes('abort')) {
      return { ok: false, error: 'Cancelled', code: 'ABORTED' };
    }
    return {
      ok: false,
      error:
        'Cannot reach secure AI server. Use `netlify dev` locally, or deploy to Netlify with GEMINI_API_KEY set in Environment variables.',
      code: 'NETWORK',
    };
  }
}

export async function runApify(params: {
  action: string;
  input?: Record<string, unknown>;
  url?: string;
  actorId?: string;
}): Promise<{ ok: boolean; data?: unknown; error?: string; configured?: boolean; source?: string }> {
  try {
    const res = await fetch(`${apiBase()}/api/apify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return await res.json();
  } catch {
    return { ok: false, error: 'Network error talking to /api/apify' };
  }
}

export async function fetchYouTubeInfo(url: string) {
  return runApify({ action: 'youtubeVideoInfo', url, input: { url } });
}

export async function healthCheck(): Promise<{
  ok: boolean;
  gemini?: boolean;
  apify?: boolean;
}> {
  try {
    const res = await fetch(`${apiBase()}/api/health`);
    return await res.json();
  } catch {
    return { ok: false };
  }
}

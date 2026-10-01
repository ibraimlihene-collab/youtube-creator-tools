import { afterEach, describe, expect, test } from 'bun:test';
import { runAI } from '../src/lib/api/client';
import { TOOLS } from '../src/lib/tools';
import { extractYouTubeVideoId } from '../src/lib/youtubeUrl';

const originalFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = originalFetch;
});
const request = { toolId: 'titleGenerator', input: { topic: 'Camera tips' } };
function respond(body: unknown, status = 200) {
  globalThis.fetch = (async () =>
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })) as typeof fetch;
}

describe('AI response handling', () => {
  test('accepts usable title results', async () => {
    respond({
      ok: true,
      toolId: 'titleGenerator',
      model: 'test',
      result: { type: 'list', items: ['Five camera tips'] },
    });
    const response = await runAI(request);
    expect(response.ok).toBe(true);
    if (response.ok) expect(response.result).toEqual({ type: 'list', items: ['Five camera tips'] });
  });
  test('rejects malformed successful responses instead of crashing the UI', async () => {
    for (const result of [
      null,
      { type: 'list', items: [42] },
      { type: 'markdown', content: false },
    ]) {
      respond({ ok: true, result });
      expect((await runAI(request)).ok).toBe(false);
    }
  });
  test('handles null JSON from a server', async () => {
    respond(null);
    expect((await runAI(request)).ok).toBe(false);
  });
  test('missing credentials produce actionable feedback without exposing configuration', async () => {
    respond({ ok: false, error: 'GEMINI_API_KEY not set', code: 'ENV_MISSING' }, 500);
    const response = await runAI(request);
    expect(response.ok).toBe(false);
    if (!response.ok) {
      expect(response.error).toContain('does not need AI');
      expect(response.error).not.toContain('GEMINI');
    }
  });
  test('rate limiting asks the creator to wait', async () => {
    respond({ ok: false, error: 'Rate limited' }, 429);
    const response = await runAI(request);
    if (!response.ok) expect(response.error).toContain('wait a minute');
    else throw new Error('Expected failure');
  });
  test('network outages produce retry guidance', async () => {
    globalThis.fetch = (async () => {
      throw new Error('Failed to fetch');
    }) as typeof fetch;
    const response = await runAI(request);
    if (!response.ok) expect(response.error).toContain('Check your connection');
    else throw new Error('Expected failure');
  });
  test('Arabic server errors are localized', async () => {
    respond({ ok: false, error: 'Service unavailable' }, 500);
    const response = await runAI({ ...request, lang: 'ar' });
    if (!response.ok) expect(response.error).toContain('تعذر');
    else throw new Error('Expected failure');
  });
});

describe('tool discovery and YouTube input', () => {
  test('catalogue paths and IDs are unique and every AI form has fields', () => {
    expect(new Set(TOOLS.map((t) => t.path)).size).toBe(TOOLS.length);
    expect(new Set(TOOLS.map((t) => t.id)).size).toBe(TOOLS.length);
    for (const tool of TOOLS.filter((t) => t.kind === 'ai'))
      expect(tool.fields?.length).toBeGreaterThan(0);
  });
  test('a title can be generated without optional keywords', () => {
    const tool = TOOLS.find((t) => t.id === 'titleGenerator')!;
    expect(tool.fields?.filter((f) => f.required === true).map((f) => f.name)).toEqual(['topic']);
  });
  test('recognizes watch, short, embed, shortened links, and IDs', () => {
    const id = 'dQw4w9WgXcQ';
    for (const url of [
      id,
      `https://www.youtube.com/watch?v=${id}`,
      `https://youtu.be/${id}`,
      `https://youtube.com/shorts/${id}`,
      `https://youtube.com/embed/${id}`,
    ])
      expect(extractYouTubeVideoId(url)).toBe(id);
    for (const invalid of [
      'https://example.com/watch?v=dQw4w9WgXcQ',
      'https://youtube.com.evil.example/watch?v=dQw4w9WgXcQ',
      'https://evil.example/youtube/dQw4w9WgXcQ',
    ])
      expect(extractYouTubeVideoId(invalid)).toBeNull();
    expect(
      extractYouTubeVideoId('https://youtube.com/attribution_link?u=%2Fwatch%3Fv%3DdQw4w9WgXcQ')
    ).toBe(id);
    expect(extractYouTubeVideoId('v=dQw4w9WgXcQ')).toBe(id);
  });
});

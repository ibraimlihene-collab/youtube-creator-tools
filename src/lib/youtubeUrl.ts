/**
 * Robust YouTube URL / ID parsing for paste flows.
 * Supports: watch, youtu.be, shorts, embed, live, music, attribution links, bare 11-char ids.
 */

export function extractYouTubeVideoId(input: string, depth = 0): string | null {
  if (!input || depth > 3) return null;
  const raw = input
    .trim()
    .replace(/^['"<]+/, '')
    .replace(/['">]+$/, '')
    .trim();
  if (/^[\w-]{11}$/.test(raw)) return raw;
  const standalone = raw.match(/^v=([\w-]{11})$/);
  if (standalone) return standalone[1];
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    if (!['https:', 'http:'].includes(url.protocol)) return null;
    const host = url.hostname.replace(/^www\./, '').toLowerCase();
    if (host === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0];
      return id && /^[\w-]{11}$/.test(id) ? id : null;
    }
    if (
      !['youtube.com', 'm.youtube.com', 'music.youtube.com', 'youtube-nocookie.com'].includes(host)
    )
      return null;
    const id = url.searchParams.get('v');
    if (id && /^[\w-]{11}$/.test(id)) return id;
    const parts = url.pathname.split('/').filter(Boolean);
    if (
      ['embed', 'shorts', 'live', 'v', 'e', 'watch'].includes(parts[0]) &&
      /^[\w-]{11}$/.test(parts[1] || '')
    )
      return parts[1];
    if (parts.length === 1 && /^[\w-]{11}$/.test(parts[0])) return parts[0];
    for (const key of ['u', 'q', 'url']) {
      const nested = url.searchParams.get(key);
      if (!nested) continue;
      const target = nested.startsWith('/') ? new URL(nested, 'https://youtube.com').href : nested;
      const inner = extractYouTubeVideoId(target, depth + 1);
      if (inner) return inner;
    }
  } catch {
    /* invalid URL */
  }
  return null;
}

export function youtubeThumbnails(videoId: string) {
  const base = `https://i.ytimg.com/vi/${videoId}`;
  const baseImg = `https://img.youtube.com/vi/${videoId}`;
  return [
    { key: 'maxres', label: 'Max (1280×720)', url: `${baseImg}/maxresdefault.jpg` },
    { key: 'sd', label: 'SD (640×480)', url: `${baseImg}/sddefault.jpg` },
    { key: 'hq', label: 'HQ (480×360)', url: `${baseImg}/hqdefault.jpg` },
    { key: 'mq', label: 'MQ (320×180)', url: `${baseImg}/mqdefault.jpg` },
    { key: 'default', label: 'Default', url: `${baseImg}/default.jpg` },
    // webp variants (often sharper on modern)
    { key: 'maxres_webp', label: 'Max WebP', url: `${base}/maxresdefault.webp` },
  ];
}

export function isLikelyYouTubeUrl(input: string): boolean {
  return /youtu\.?be|youtube\.com/i.test(input) || /^[\w-]{11}$/.test(input.trim());
}

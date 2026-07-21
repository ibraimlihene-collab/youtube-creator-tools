/**
 * Robust YouTube URL / ID parsing for paste flows.
 * Supports: watch, youtu.be, shorts, embed, live, music, attribution links, bare 11-char ids.
 */

export function extractYouTubeVideoId(input: string): string | null {
  if (!input) return null;
  let raw = input.trim();

  // strip surrounding quotes / angle brackets (common paste artifacts)
  raw = raw.replace(/^['"<]+/, '').replace(/['">]+$/, '').trim();

  // bare video id
  if (/^[\w-]{11}$/.test(raw)) return raw;

  // sometimes users paste "v=XXXX" alone
  const vOnly = raw.match(/(?:^|[?&])v=([\w-]{11})/);
  if (vOnly) return vOnly[1];

  // ensure protocol for URL parser
  let candidate = raw;
  if (!/^https?:\/\//i.test(candidate)) {
    if (/^(www\.)?(youtube\.com|youtu\.be|m\.youtube\.com|music\.youtube\.com)/i.test(candidate)) {
      candidate = `https://${candidate}`;
    } else if (candidate.includes('youtube') || candidate.includes('youtu.be')) {
      candidate = `https://${candidate}`;
    } else {
      // last resort: search for an 11-char id token in the string
      const loose = raw.match(/(?:v=|\/|youtu\.be\/)([\w-]{11})(?:[&?\s]|$)/);
      return loose ? loose[1] : null;
    }
  }

  try {
    const url = new URL(candidate);
    const host = url.hostname.replace(/^www\./, '').toLowerCase();

    // youtu.be/ID
    if (host === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0];
      if (id && /^[\w-]{11}$/.test(id)) return id;
    }

    if (
      host === 'youtube.com' ||
      host === 'm.youtube.com' ||
      host === 'music.youtube.com' ||
      host === 'youtube-nocookie.com'
    ) {
      const v = url.searchParams.get('v');
      if (v && /^[\w-]{11}$/.test(v)) return v;

      const parts = url.pathname.split('/').filter(Boolean);
      // /embed/ID, /shorts/ID, /live/ID, /v/ID, /e/ID
      const markers = ['embed', 'shorts', 'live', 'v', 'e', 'watch'];
      for (let i = 0; i < parts.length; i++) {
        if (markers.includes(parts[i]) && parts[i + 1] && /^[\w-]{11}$/.test(parts[i + 1])) {
          return parts[i + 1];
        }
      }

      // /ID at root rare
      if (parts.length === 1 && /^[\w-]{11}$/.test(parts[0])) return parts[0];
    }

    // attribution_link etc. may nest u= or q=
    for (const key of ['u', 'q', 'url']) {
      const nested = url.searchParams.get(key);
      if (nested) {
        const inner = extractYouTubeVideoId(decodeURIComponent(nested));
        if (inner) return inner;
      }
    }
  } catch {
    // fall through
  }

  const fallback = raw.match(/([\w-]{11})/);
  // only accept fallback if string clearly youtube-related
  if (fallback && /youtu/i.test(raw)) return fallback[1];
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

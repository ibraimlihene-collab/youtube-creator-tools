/** Server-side YouTube helpers — free oEmbed, no API key */

export function extractYouTubeVideoId(input) {
  if (!input) return null;
  let raw = String(input).trim().replace(/^['"<]+/, '').replace(/['">]+$/, '').trim();
  if (/^[\w-]{11}$/.test(raw)) return raw;
  const vOnly = raw.match(/(?:^|[?&])v=([\w-]{11})/);
  if (vOnly) return vOnly[1];
  let candidate = raw;
  if (!/^https?:\/\//i.test(candidate)) {
    if (/youtube|youtu\.be/i.test(candidate)) candidate = `https://${candidate}`;
    else return null;
  }
  try {
    const url = new URL(candidate);
    const host = url.hostname.replace(/^www\./, '').toLowerCase();
    if (host === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0];
      if (id && /^[\w-]{11}$/.test(id)) return id;
    }
    if (host.includes('youtube')) {
      const v = url.searchParams.get('v');
      if (v && /^[\w-]{11}$/.test(v)) return v;
      const parts = url.pathname.split('/').filter(Boolean);
      for (const m of ['embed', 'shorts', 'live', 'v', 'e']) {
        const i = parts.indexOf(m);
        if (i >= 0 && parts[i + 1] && /^[\w-]{11}$/.test(parts[i + 1])) return parts[i + 1];
      }
    }
  } catch { /* ignore */ }
  const loose = raw.match(/(?:v=|youtu\.be\/|\/embed\/|\/shorts\/)([\w-]{11})/);
  return loose ? loose[1] : null;
}

export async function fetchOEmbed(urlOrId) {
  const id = extractYouTubeVideoId(urlOrId);
  if (!id) return null;
  const watch = `https://www.youtube.com/watch?v=${id}`;
  const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(watch)}&format=json`;
  const res = await fetch(oembedUrl);
  if (!res.ok) return { videoId: id, url: watch };
  const data = await res.json();
  return {
    videoId: id,
    url: watch,
    title: data.title,
    author: data.author_name,
    authorUrl: data.author_url,
    thumbnail: data.thumbnail_url,
  };
}

/** Enrich tool input: if user pasted a YT URL, attach oEmbed metadata for better prompts */
export async function enrichInputWithYouTube(input = {}) {
  const out = { ...input };
  const candidates = [input.url, input.topic, input.text, input.script, input.extra].filter(Boolean);
  for (const c of candidates) {
    const id = extractYouTubeVideoId(String(c));
    if (!id) continue;
    try {
      const meta = await fetchOEmbed(id);
      if (meta) {
        out.youtube = meta;
        // If topic was just a URL, replace with title for better generation
        if (input.topic && extractYouTubeVideoId(String(input.topic)) === id && meta.title) {
          out.topic = `${meta.title}${meta.author ? ` — ${meta.author}` : ''}`;
          out._originalUrl = meta.url;
        }
      }
    } catch { /* ignore */ }
    break;
  }
  return out;
}

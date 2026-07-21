import { useEffect, useMemo, useRef, useState } from 'react';
import { Download, Pause, Play, Search, Volume2 } from 'lucide-react';
import { SFX_CATALOG, SFX_CATEGORIES, SFX_COUNT } from '../../data/sfxCatalog';
import { useApp } from '../../context/AppContext';

/**
 * Plays SFX from /sfx/*.mp3 (static).
 * If a file 404s, falls back to extracting public/sfx-pack.zip once via JSZip (CDN).
 */
export default function SfxLibrary() {
  const { lang } = useApp();
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState<string>('all');
  const [playing, setPlaying] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const zipCache = useRef<Map<string, string>>(new Map());
  const zipLoading = useRef<Promise<void> | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SFX_CATALOG.filter((s) => {
      if (cat !== 'all' && s.category !== cat) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.category.includes(q) ||
        s.file.toLowerCase().includes(q)
      );
    });
  }, [query, cat]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      zipCache.current.forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);

  async function ensureZip() {
    if (zipCache.current.size > 0) return;
    if (zipLoading.current) return zipLoading.current;
    zipLoading.current = (async () => {
      setStatus(lang === 'ar' ? 'تحميل حزمة المؤثرات…' : 'Loading SFX pack…');
      // @ts-expect-error dynamic CDN
      const JSZip = (await import('https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm')).default;
      const res = await fetch('/sfx-pack.zip');
      if (!res.ok) throw new Error('sfx-pack.zip missing');
      const zip = await JSZip.loadAsync(await res.arrayBuffer());
      const entries = Object.keys(zip.files).filter((n) => n.toLowerCase().endsWith('.mp3'));
      for (const name of entries) {
        const file = zip.files[name];
        if (file.dir) continue;
        const blob = await file.async('blob');
        const base = name.split('/').pop() || name;
        zipCache.current.set(base, URL.createObjectURL(blob));
        // also map without path
        zipCache.current.set(name, URL.createObjectURL(blob));
      }
      setStatus('');
    })();
    try {
      await zipLoading.current;
    } finally {
      zipLoading.current = null;
    }
  }

  async function resolveUrl(file: string, path: string): Promise<string> {
    // try static first
    try {
      const head = await fetch(encodeURI(path), { method: 'HEAD' });
      if (head.ok) return encodeURI(path);
    } catch {
      /* fall through */
    }
    await ensureZip();
    const fromZip =
      zipCache.current.get(file) ||
      [...zipCache.current.entries()].find(([k]) => k.endsWith(file))?.[1];
    if (!fromZip) throw new Error('SFX not found');
    return fromZip;
  }

  const toggle = async (file: string, path: string, id: string) => {
    if (playing === id && audioRef.current) {
      audioRef.current.pause();
      setPlaying(null);
      return;
    }
    if (audioRef.current) audioRef.current.pause();
    try {
      const url = await resolveUrl(file, path);
      const a = new Audio(url);
      audioRef.current = a;
      a.onended = () => setPlaying(null);
      a.onerror = () => setPlaying(null);
      setPlaying(id);
      await a.play();
    } catch (e) {
      setPlaying(null);
      setStatus(
        lang === 'ar'
          ? 'تعذّر تشغيل الملف. تأكد من وجود public/sfx أو sfx-pack.zip'
          : 'Could not play file. Ensure public/sfx or sfx-pack.zip is deployed.'
      );
    }
  };

  const download = async (file: string, path: string) => {
    try {
      const url = await resolveUrl(file, path);
      const a = document.createElement('a');
      a.href = url;
      a.download = file;
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      setStatus(lang === 'ar' ? 'فشل التحميل' : 'Download failed');
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-accent/25 bg-accent/5 px-4 py-3 text-sm text-base-content/80">
        {lang === 'ar'
          ? `🎵 ${SFX_COUNT} مؤثر صوتي — محلي 100%، بدون API وبدون تكلفة. ابحث / استمع / حمّل.`
          : `🎵 ${SFX_COUNT} sound effects — 100% local, zero API cost. Search, preview, download.`}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <label className="input input-bordered bg-base-200 border-base-300 flex items-center gap-2 flex-1">
          <Search className="w-4 h-4 opacity-50" />
          <input
            className="grow bg-transparent outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={lang === 'ar' ? 'ابحث: whoosh, click, impact…' : 'Search: whoosh, click, impact…'}
          />
        </label>
        <select className="select-modern sm:w-48" value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="all">{lang === 'ar' ? 'كل الفئات' : 'All categories'}</option>
          {SFX_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c} ({SFX_CATALOG.filter((s) => s.category === c).length})
            </option>
          ))}
        </select>
      </div>

      {status && <p className="text-xs text-primary">{status}</p>}
      <p className="text-xs text-base-content/50">
        {filtered.length} {lang === 'ar' ? 'نتيجة' : 'results'}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[28rem] overflow-y-auto pe-1">
        {filtered.map((s) => {
          const isOn = playing === s.id;
          return (
            <div
              key={s.id}
              className="flex items-center gap-2 rounded-xl border border-base-300 bg-base-100/70 px-3 py-2.5 hover:border-primary/30 transition-colors"
            >
              <button
                type="button"
                className={`btn btn-sm btn-circle ${isOn ? 'btn-brand' : 'btn-soft'}`}
                onClick={() => toggle(s.file, s.path, s.id)}
                aria-label={isOn ? 'Pause' : 'Play'}
              >
                {isOn ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate">{s.name}</div>
                <div className="text-[11px] text-base-content/45 uppercase tracking-wide">{s.category}</div>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm btn-circle"
                onClick={() => download(s.file, s.path)}
                title="Download"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-10 text-base-content/50 text-sm">
          <Volume2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
          {lang === 'ar' ? 'لا نتائج' : 'No matches'}
        </div>
      )}
    </div>
  );
}

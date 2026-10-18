import { useEffect, useMemo, useRef, useState } from 'react';
import { Download, Pause, Play, Search, Volume2 } from 'lucide-react';
import { SFX_CATALOG, SFX_CATEGORIES, SFX_COUNT } from '../../data/sfxCatalog';
import { useApp } from '../../context/AppContext';

/** Fetch audio as Blob, reject HTML/SPA fallbacks, cache object URLs */
async function loadAudioBlob(path: string): Promise<Blob> {
  const res = await fetch(path, { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const type = (res.headers.get('content-type') || '').toLowerCase();
  const buf = await res.arrayBuffer();
  if (buf.byteLength < 100) throw new Error('File too small');
  const head = new Uint8Array(buf.slice(0, 16));
  const asText = new TextDecoder().decode(head);
  if (asText.includes('<!') || asText.includes('<html') || asText.includes('<HTML')) {
    throw new Error('Server returned HTML instead of audio');
  }
  // ID3 or MPEG frame sync
  const isId3 = head[0] === 0x49 && head[1] === 0x44 && head[2] === 0x33;
  const isMpeg = head[0] === 0xff && (head[1] & 0xe0) === 0xe0;
  if (!isId3 && !isMpeg && type.includes('html')) {
    throw new Error('Not an audio file');
  }
  return new Blob([buf], { type: type.includes('audio') ? type : 'audio/mpeg' });
}

export default function SfxLibrary() {
  const { lang } = useApp();
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('all');
  const [playing, setPlaying] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlCache = useRef<Map<string, string>>(new Map());

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
      urlCache.current.forEach((u) => URL.revokeObjectURL(u));
      urlCache.current.clear();
    };
  }, []);

  const getObjectUrl = async (path: string) => {
    const cached = urlCache.current.get(path);
    if (cached) return cached;
    const blob = await loadAudioBlob(path);
    const url = URL.createObjectURL(blob);
    urlCache.current.set(path, url);
    return url;
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
      audioRef.current = null;
    }
    setPlaying(null);
  };

  const toggle = async (id: string, path: string) => {
    setError('');
    if (playing === id) {
      stop();
      return;
    }
    stop();
    setLoadingId(id);
    try {
      const url = await getObjectUrl(path);
      const audio = new Audio();
      audio.preload = 'auto';
      audio.src = url;
      audioRef.current = audio;
      audio.onended = () => setPlaying(null);
      audio.onerror = () => {
        setPlaying(null);
        setError(lang === 'ar' ? 'فشل تشغيل الملف.' : 'Playback failed.');
      };
      await audio.play();
      setPlaying(id);
    } catch (e) {
      setPlaying(null);
      const msg = e instanceof Error ? e.message : 'error';
      setError(
        lang === 'ar'
          ? `تعذّر التحميل/التشغيل (${msg}). حدّث الصفحة بقوة Ctrl+Shift+R`
          : `Could not load/play (${msg}). Hard-refresh Ctrl+Shift+R`
      );
    } finally {
      setLoadingId(null);
    }
  };

  const download = async (path: string, file: string) => {
    setError('');
    setLoadingId(file);
    try {
      const url = await getObjectUrl(path);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.endsWith('.mp3') ? file : `${file}.mp3`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'error';
      setError(lang === 'ar' ? `فشل التحميل (${msg})` : `Download failed (${msg})`);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-5">
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
          <option value="all">{lang === 'ar' ? `الكل (${SFX_COUNT})` : `All (${SFX_COUNT})`}</option>
          {SFX_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c} ({SFX_CATALOG.filter((s) => s.category === c).length})
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="alert alert-warning text-sm py-2">
          <span>{error}</span>
        </div>
      )}

      <p className="text-xs text-base-content/50">
        {filtered.length} {lang === 'ar' ? 'مؤثر' : 'sounds'} ·{' '}
        {lang === 'ar' ? 'اضغط ▶ للاستماع · ⬇ للتحميل' : 'Tap ▶ preview · ⬇ download'}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[32rem] overflow-y-auto pe-1">
        {filtered.map((s) => {
          const isOn = playing === s.id;
          const busy = loadingId === s.id || loadingId === s.file;
          return (
            <div
              key={s.id}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 transition-colors ${
                isOn
                  ? 'border-primary/40 bg-primary/10'
                  : 'border-base-300 bg-base-100/70 hover:border-primary/25'
              }`}
            >
              <button
                type="button"
                className={`btn btn-sm btn-circle shrink-0 ${isOn ? 'btn-brand' : 'btn-soft'}`}
                onClick={() => toggle(s.id, s.path)}
                disabled={busy && !isOn}
                aria-label={isOn ? 'Pause' : 'Play'}
              >
                {busy && !isOn ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : isOn ? (
                  <Pause className="w-3.5 h-3.5" />
                ) : (
                  <Play className="w-3.5 h-3.5" />
                )}
              </button>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate">{s.name}</div>
                <div className="text-[11px] text-base-content/45 uppercase tracking-wide">{s.category}</div>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm btn-circle shrink-0"
                onClick={() => download(s.path, s.file)}
                disabled={busy}
                title={lang === 'ar' ? 'تحميل' : 'Download'}
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

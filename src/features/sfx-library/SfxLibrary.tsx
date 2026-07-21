import { useEffect, useMemo, useRef, useState } from 'react';
import { Download, Pause, Play, Search, Volume2 } from 'lucide-react';
import { SFX_CATALOG, SFX_CATEGORIES, SFX_COUNT } from '../../data/sfxCatalog';
import { useApp } from '../../context/AppContext';

export default function SfxLibrary() {
  const { lang } = useApp();
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('all');
  const [playing, setPlaying] = useState<string | null>(null);
  const [error, setError] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
      audioRef.current = null;
    };
  }, []);

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
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
    try {
      const audio = new Audio(path);
      audio.preload = 'auto';
      audioRef.current = audio;
      audio.onended = () => setPlaying(null);
      audio.onerror = () => {
        setPlaying(null);
        setError(
          lang === 'ar'
            ? 'تعذّر تشغيل الصوت. حدّث الصفحة أو أعد فتح الأداة.'
            : 'Could not play audio. Refresh the page and try again.'
        );
      };
      setPlaying(id);
      await audio.play();
    } catch {
      setPlaying(null);
      setError(
        lang === 'ar'
          ? 'المتصفح منع التشغيل. اضغط مرة أخرى.'
          : 'Browser blocked playback. Click again to play.'
      );
    }
  };

  const download = (path: string, file: string) => {
    const a = document.createElement('a');
    a.href = path;
    a.download = file;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
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
          <option value="all">
            {lang === 'ar' ? `الكل (${SFX_COUNT})` : `All (${SFX_COUNT})`}
          </option>
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
        {lang === 'ar' ? 'اضغط ▶ للاستماع' : 'Tap ▶ to preview'}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[32rem] overflow-y-auto pe-1">
        {filtered.map((s) => {
          const isOn = playing === s.id;
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
                aria-label={isOn ? 'Pause' : 'Play'}
              >
                {isOn ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate">{s.name}</div>
                <div className="text-[11px] text-base-content/45 uppercase tracking-wide">
                  {s.category}
                </div>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm btn-circle shrink-0"
                onClick={() => download(s.path, s.file)}
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

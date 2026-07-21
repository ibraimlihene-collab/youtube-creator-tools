import React, { useMemo, useState } from 'react';
import { AlertCircle, ClipboardPaste, Download, Link2 } from 'lucide-react';
import { extractYouTubeVideoId, youtubeThumbnails } from '../../lib/youtubeUrl';
import { useApp } from '../../context/AppContext';

const ThumbnailDownloader: React.FC<{ t?: any }> = ({ t }) => {
  const { lang } = useApp();
  const [videoUrl, setVideoUrl] = useState('');
  const [error, setError] = useState('');
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const videoId = useMemo(() => extractYouTubeVideoId(videoUrl), [videoUrl]);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setVideoUrl(text.trim());
        setError('');
        setImgErrors({});
      }
    } catch {
      setError(
        lang === 'ar'
          ? 'تعذّر القراءة من الحافظة — الصق يدوياً (Ctrl/Cmd+V).'
          : 'Clipboard blocked — paste manually (Ctrl/Cmd+V).'
      );
    }
  };

  const handleDownload = async (imageUrl: string, quality: string) => {
    try {
      setError('');
      const response = await fetch(imageUrl, { mode: 'cors' });
      if (!response.ok) throw new Error('fetch failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${videoId || 'thumbnail'}-${quality}.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(imageUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const qualities = videoId
    ? youtubeThumbnails(videoId).filter((q) => !q.key.includes('webp'))
    : [];

  return (
    <div className="space-y-5">
      <p className="text-sm text-base-content/65">
        {t?.thumbnailDownloader?.description ||
          (lang === 'ar'
            ? 'الصق أي رابط يوتيوب (عادي، Shorts، embed، youtu.be) وحمّل الصورة المصغرة.'
            : 'Paste any YouTube link (watch, Shorts, embed, youtu.be) and download the thumbnail.')}
      </p>

      <div className="form-control">
        <label className="label py-1">
          <span className="label-text font-medium">
            {lang === 'ar' ? 'رابط الفيديو أو المعرّف' : 'Video URL or ID'}
          </span>
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Link2 className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => {
                setVideoUrl(e.target.value);
                setError('');
                setImgErrors({});
              }}
              placeholder="https://youtu.be/… or https://www.youtube.com/watch?v=…"
              className="input-modern ps-10"
              dir="ltr"
            />
          </div>
          <button type="button" className="btn-soft gap-2" onClick={handlePaste}>
            <ClipboardPaste className="w-4 h-4" />
            {lang === 'ar' ? 'لصق' : 'Paste'}
          </button>
        </div>
        {videoUrl && !videoId && (
          <p className="text-xs text-warning mt-2">
            {lang === 'ar'
              ? 'لم يُتعرَّف على رابط يوتيوب. جرّب نسخ الرابط كاملاً من شريط العنوان.'
              : 'Could not parse a YouTube URL. Copy the full link from the address bar.'}
          </p>
        )}
        {videoId && (
          <p className="text-xs text-success mt-2 font-mono" dir="ltr">
            ID: {videoId}
          </p>
        )}
      </div>

      {error && (
        <div className="alert alert-error text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {videoId && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {qualities.map((q) => {
            if (imgErrors[q.key]) return null;
            return (
              <div key={q.key} className="surface-card overflow-hidden">
                <img
                  src={q.url}
                  alt={q.label}
                  className="w-full aspect-video object-cover bg-base-300"
                  loading="lazy"
                  onError={() => setImgErrors((e) => ({ ...e, [q.key]: true }))}
                />
                <div className="p-3 flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{q.label}</span>
                  <button
                    type="button"
                    className="btn-brand btn-sm gap-1.5"
                    onClick={() => handleDownload(q.url, q.key)}
                  >
                    <Download className="w-3.5 h-3.5" />
                    {lang === 'ar' ? 'تحميل' : 'Download'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ThumbnailDownloader;

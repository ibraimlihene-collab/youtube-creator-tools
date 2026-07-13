import React, { useMemo, useState } from 'react';
import { AlertCircle, Download, Link2 } from 'lucide-react';

const ThumbnailDownloader: React.FC<{ t: any }> = ({ t }) => {
  const [videoUrl, setVideoUrl] = useState('');
  const [error, setError] = useState('');

  const videoId = useMemo(() => {
    if (!videoUrl) return null;
    try {
      const cleaned = videoUrl.trim();
      // bare id
      if (/^[\w-]{11}$/.test(cleaned)) return cleaned;
      const url = new URL(cleaned.startsWith('http') ? cleaned : `https://${cleaned}`);
      if (url.hostname === 'youtu.be') {
        return url.pathname.slice(1).split('/')[0] || null;
      }
      if (url.hostname.includes('youtube.com')) {
        const v = url.searchParams.get('v');
        if (v) return v;
        const parts = url.pathname.split('/').filter(Boolean);
        const embedIdx = parts.indexOf('embed');
        if (embedIdx >= 0 && parts[embedIdx + 1]) return parts[embedIdx + 1];
        const shortsIdx = parts.indexOf('shorts');
        if (shortsIdx >= 0 && parts[shortsIdx + 1]) return parts[shortsIdx + 1];
      }
    } catch {
      // invalid
    }
    return null;
  }, [videoUrl]);

  const handleDownload = async (imageUrl: string, quality: string) => {
    try {
      setError('');
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error('fetch failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${videoId || 'thumbnail'}-${quality.toLowerCase()}.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setError(t.thumbnailDownloader.downloadError || 'Failed to download image.');
    }
  };

  const qualities = videoId
    ? [
        { key: 'Max-Res', url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` },
        { key: 'High', url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` },
        { key: 'Medium', url: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` },
        { key: 'Standard', url: `https://img.youtube.com/vi/${videoId}/sddefault.jpg` },
      ]
    : [];

  return (
    <div className="space-y-5">
      <p className="text-sm text-base-content/65">{t.thumbnailDownloader.description}</p>

      <div className="form-control">
        <label className="label py-1">
          <span className="label-text font-medium flex items-center gap-1.5">
            <Link2 className="w-4 h-4 text-primary" />
            YouTube URL
          </span>
        </label>
        <input
          type="text"
          placeholder={t.thumbnailDownloader.placeholder}
          className="input-modern w-full"
          value={videoUrl}
          onChange={(e) => {
            setVideoUrl(e.target.value);
            setError('');
          }}
        />
        {videoUrl && !videoId && (
          <p className="text-xs text-warning mt-1.5">Could not parse a video ID from that URL.</p>
        )}
      </div>

      {error && (
        <div className="alert alert-error text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {qualities.length > 0 && (
        <div>
          <h3 className="text-lg font-bold mb-3">{t.thumbnailDownloader.availableThumbnails}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {qualities.map(({ key, url }) => (
              <div key={key} className="surface-card overflow-hidden">
                <div className="aspect-video bg-base-300">
                  <img
                    src={url}
                    alt={`${key} thumbnail`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget.parentElement as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
                <div className="p-3 flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold">{key}</span>
                  <button
                    type="button"
                    className="btn-brand btn-sm gap-1.5"
                    onClick={() => handleDownload(url, key)}
                  >
                    <Download className="w-4 h-4" />
                    {t.thumbnailDownloader.download}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThumbnailDownloader;

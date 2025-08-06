import React, { useState, useMemo } from 'react';

const ThumbnailDownloader: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [error, setError] = useState('');

  const videoId = useMemo(() => {
    if (!videoUrl) return null;
    try {
      const url = new URL(videoUrl);
      if (url.hostname === 'youtu.be') {
        return url.pathname.slice(1);
      }
      if (url.hostname.includes('youtube.com')) {
        const videoIdParam = url.searchParams.get('v');
        if (videoIdParam) {
          return videoIdParam;
        }
      }
    } catch (e) {
      // Invalid URL, do nothing
    }
    return null;
  }, [videoUrl]);

  const handleDownload = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${videoId || 'thumbnail'}.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download image.');
    }
  };

  const renderThumbnails = () => {
    if (!videoId) return null;

    const qualities = {
      'Max-Res': `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      'High': `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      'Medium': `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
      'Standard': `https://img.youtube.com/vi/${videoId}/sddefault.jpg`,
    };

    return (
      <div className="mt-6">
        <h3 className="text-lg font-bold mb-4">الصور المصغرة المتاحة:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(qualities).map(([quality, url]) => (
            <div key={quality} className="card bg-base-200">
              <figure>
                <img src={url} alt={`${quality} thumbnail`} className="w-full" 
                     onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              </figure>
              <div className="card-body p-4">
                <h4 className="card-title text-sm">{quality}</h4>
                <button 
                  className="btn btn-primary btn-sm mt-2"
                  onClick={() => handleDownload(url)}
                >
                  تحميل
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">تحميل الصور المصغرة من يوتيوب</h2>
        <p className="mb-4">أدخل رابط فيديو يوتيوب لعرض وتحميل الصور المصغرة المتاحة.</p>
        
        <div className="form-control">
          <input
            type="text"
            placeholder="أدخل رابط الفيديو هنا..."
            className="input input-bordered w-full"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
          />
        </div>

        {error && <div className="alert alert-error mt-4"><span>{error}</span></div>}

        {renderThumbnails()}
      </div>
    </div>
  );
};

export default ThumbnailDownloader;
import React, { useState, useMemo } from 'react';

const ThumbnailDownloader: React.FC<{ t: any }> = ({ t }) => {
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
      setError(t.thumbnailDownloader.downloadError);
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
        <h3 className="text-lg font-bold mb-4">{t.thumbnailDownloader.availableThumbnails}</h3>
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
                  {t.thumbnailDownloader.download}
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
        <h2 className="card-title">{t.thumbnailDownloader.title}</h2>
        <p className="mb-4">{t.thumbnailDownloader.description}</p>
        
        <div className="form-control">
          <input
            type="text"
            placeholder={t.thumbnailDownloader.placeholder}
            className="input input-bordered w-full"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
          />
        </div>
        
        {error && (
          <div className="alert alert-error mt-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}
        
        {renderThumbnails()}
      </div>
    </div>
  );
};

export default ThumbnailDownloader;
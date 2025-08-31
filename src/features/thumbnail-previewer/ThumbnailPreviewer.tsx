import React, { useState } from 'react';
import { FaDesktop, FaMobileAlt } from 'react-icons/fa';
import YouTubePreview from './YouTubePreview';

// Mock data for thumbnails
// Generate mock thumbnails from a reliable source for high-quality, diverse images
const mockThumbnails = Array.from(
  { length: 16 },
  (_, i) => `https://picsum.photos/seed/${i + 1}/720/404`
);

type ViewMode = 'desktop' | 'mobile';
type ThemeMode = 'light' | 'dark';

const ThumbnailPreviewer: React.FC<{ t: any }> = ({ t }) => {
  const [userThumbnail, setUserThumbnail] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setUserThumbnail(URL.createObjectURL(file));
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/20">
        <h2 className="text-2xl font-bold mb-2">{t.thumbnailPreviewer.title}</h2>
        <p className="opacity-80">{t.thumbnailPreviewer.description}</p>
      </div>
      
      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-base-100/80 backdrop-blur-sm rounded-2xl border border-base-300 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              {t.thumbnailPreviewer.controls}
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="label label-text font-medium mb-3">
                  {t.thumbnailPreviewer.uploadThumbnail}
                </label>
                <div className="relative">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="file-input file-input-bordered file-input-primary w-full"
                    accept="image/*"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-base-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <p className="text-xs opacity-70 mt-2">{t.thumbnailPreviewer.uploadDescription}</p>
              </div>
              
              <div>
                <label className="label label-text font-medium mb-3">
                  {t.thumbnailPreviewer.viewMode}
                </label>
                <div className="join w-full">
                  <button
                    className={`join-item btn flex-1 ${viewMode === 'desktop' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setViewMode('desktop')}
                  >
                    <FaDesktop className="w-4 h-4" />
                    <span className="ml-2 hidden sm:inline">{t.thumbnailPreviewer.desktop}</span>
                  </button>
                  <button
                    className={`join-item btn flex-1 ${viewMode === 'mobile' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setViewMode('mobile')}
                  >
                    <FaMobileAlt className="w-4 h-4" />
                    <span className="ml-2 hidden sm:inline">{t.thumbnailPreviewer.mobile}</span>
                  </button>
                </div>
              </div>
              
              <div>
                <label className="label label-text font-medium mb-3">
                  {t.thumbnailPreviewer.theme}
                </label>
                <div className="join w-full">
                  <button
                    className={`join-item btn flex-1 ${themeMode === 'light' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setThemeMode('light')}
                  >
                    {t.thumbnailPreviewer.light}
                  </button>
                  <button
                    className={`join-item btn flex-1 ${themeMode === 'dark' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setThemeMode('dark')}
                  >
                    {t.thumbnailPreviewer.dark}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-base-100/80 backdrop-blur-sm rounded-2xl border border-base-300 p-6">
            <h3 className="text-lg font-semibold mb-4">{t.thumbnailPreviewer.mockThumbnails}</h3>
            <div className="grid grid-cols-2 gap-2">
              {mockThumbnails.slice(0, 4).map((src, index) => (
                <div 
                  key={index} 
                  className="aspect-video bg-base-200 rounded-lg cursor-pointer overflow-hidden border-2 border-transparent hover:border-primary transition-colors"
                  onClick={() => setUserThumbnail(src)}
                >
                  <img src={src} alt={`Mock thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-3">
          <YouTubePreview 
            viewMode={viewMode}
            themeMode={themeMode}
            userThumbnail={userThumbnail}
            mockThumbnails={mockThumbnails}
          />
        </div>
      </div>
    </div>
  );
};

export default ThumbnailPreviewer;
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

const ThumbnailPreviewer: React.FC = () => {
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
    <div className="p-4 bg-base-100 rounded-box">
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <h3 className="text-lg font-bold mb-4">Controls</h3>
          <div className="space-y-4">
            <div>
              <label className="label">
                <span className="label-text font-semibold">Upload Thumbnail</span>
              </label>
              <input type="file" onChange={handleFileChange} className="file-input file-input-bordered w-full" accept="image/*" />
              <p className="text-xs text-gray-500 mt-1">Upload an image to see it in the preview.</p>
            </div>
            <div>
              <span className="label-text font-semibold">View Mode</span>
              <div className="join mt-1 w-full">
                <button className={`btn join-item flex-1 ${viewMode === 'desktop' ? 'btn-active' : ''}`} onClick={() => setViewMode('desktop')}>
                  <FaDesktop /> Desktop
                </button>
                <button className={`btn join-item flex-1 ${viewMode === 'mobile' ? 'btn-active' : ''}`} onClick={() => setViewMode('mobile')}>
                  <FaMobileAlt /> Mobile
                </button>
              </div>
            </div>
            <div>
              <span className="label-text font-semibold">Theme</span>
              <div className="join mt-1 w-full">
                <button className={`btn join-item flex-1 ${themeMode === 'light' ? 'btn-active' : ''}`} onClick={() => setThemeMode('light')}>
                  Light
                </button>
                <button className={`btn join-item flex-1 ${themeMode === 'dark' ? 'btn-active' : ''}`} onClick={() => setThemeMode('dark')}>
                  Dark
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="md:col-span-2">
          <h3 className="text-lg font-bold mb-4">Preview</h3>
          <div className="mt-6">
            <YouTubePreview
              viewMode={viewMode}
              themeMode={themeMode}
              userThumbnail={userThumbnail}
              mockThumbnails={mockThumbnails}
            />
          </div>
        </div>
      </div>

    </div>
  );
};

export default ThumbnailPreviewer;
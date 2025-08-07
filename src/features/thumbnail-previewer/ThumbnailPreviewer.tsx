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
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/20">
        <h2 className="text-2xl font-bold mb-2">YouTube Thumbnail Previewer</h2>
        <p className="opacity-80">Preview your thumbnails on different devices and themes</p>
      </div>
      
      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-base-100/80 backdrop-blur-sm rounded-2xl border border-base-300 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Controls
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="label label-text font-medium mb-3">
                  Upload Thumbnail
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
                <p className="text-xs opacity-70 mt-2">Upload an image to see it in the preview</p>
              </div>
              
              <div>
                <label className="label label-text font-medium mb-3">
                  View Mode
                </label>
                <div className="join w-full">
                  <button
                    className={`join-item btn flex-1 ${viewMode === 'desktop' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setViewMode('desktop')}
                  >
                    <FaDesktop className="w-4 h-4" />
                    <span className="ml-2 hidden sm:inline">Desktop</span>
                  </button>
                  <button
                    className={`join-item btn flex-1 ${viewMode === 'mobile' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setViewMode('mobile')}
                  >
                    <FaMobileAlt className="w-4 h-4" />
                    <span className="ml-2 hidden sm:inline">Mobile</span>
                  </button>
                </div>
              </div>
              
              <div>
                <label className="label label-text font-medium mb-3">
                  Theme
                </label>
                <div className="join w-full">
                  <button
                    className={`join-item btn flex-1 ${themeMode === 'light' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setThemeMode('light')}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span className="ml-2 hidden sm:inline">Light</span>
                  </button>
                  <button
                    className={`join-item btn flex-1 ${themeMode === 'dark' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setThemeMode('dark')}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                    <span className="ml-2 hidden sm:inline">Dark</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-base-100/80 backdrop-blur-sm rounded-2xl border border-base-300 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Tips
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Use high-quality images (1280x720)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Add text that's readable on small screens</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Use contrasting colors for better visibility</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="lg:col-span-3">
          <div className="bg-base-100/80 backdrop-blur-sm rounded-2xl border border-base-300 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Preview
              </h3>
              <div className="text-sm opacity-70">
                {viewMode === 'desktop' ? 'Desktop View' : 'Mobile View'} • {themeMode === 'light' ? 'Light Theme' : 'Dark Theme'}
              </div>
            </div>
            
            <div className="flex items-center justify-center min-h-[500px] bg-base-200/50 rounded-xl p-8">
              <YouTubePreview
                viewMode={viewMode}
                themeMode={themeMode}
                userThumbnail={userThumbnail}
                mockThumbnails={mockThumbnails}
              />
            </div>
            
            {!userThumbnail && (
              <div className="mt-4 text-center">
                <p className="text-sm opacity-70">
                  Upload a thumbnail image to see it in the YouTube preview
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThumbnailPreviewer;
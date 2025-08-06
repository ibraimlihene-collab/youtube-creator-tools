import React from 'react';

interface YouTubePreviewProps {
  viewMode: 'desktop' | 'mobile';
  themeMode: 'light' | 'dark';
  userThumbnail: string | null;
  mockThumbnails: string[];
  isFullView?: boolean;
}

const YouTubePreview: React.FC<YouTubePreviewProps> = ({
  viewMode,
  themeMode,
  userThumbnail,
  mockThumbnails,
  isFullView,
}) => {
  const themeClasses = themeMode === 'light' ? 'bg-white text-black' : 'bg-[#0f0f0f] text-white';
  const gridClasses = isFullView ? 'grid-cols-5' : viewMode === 'desktop' ? 'grid-cols-4' : 'grid-cols-1';

  // We'll show more thumbnails in full view
  const displayThumbnails = isFullView ? [...mockThumbnails, ...mockThumbnails, ...mockThumbnails] : [...mockThumbnails.slice(0, 8)];
  const userThumbIndex = Math.floor(displayThumbnails.length / 2);
  if (userThumbnail) {
    // Replace a mock thumbnail with the user's thumbnail
    displayThumbnails[userThumbIndex] = userThumbnail;
  }

  return (
    <div className={`transition-colors duration-300 ${themeClasses} ${isFullView ? 'p-8' : 'p-4'}`}>
      <div className={`grid gap-x-4 gap-y-8 ${gridClasses}`}>
        {displayThumbnails.map((thumbUrl, index) => (
          <div key={index}>
            <img src={thumbUrl} alt="YouTube thumbnail" className="w-full h-auto object-cover aspect-video rounded-lg" />
            <div className="flex gap-3 mt-3">
              <div className="avatar">
                <div className="w-9 h-9 rounded-full">
                  <img src={`https://i.pravatar.cc/40?u=${index}`} alt="channel avatar" />
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-base leading-tight">Official Music Video</h4>
                <p className="text-sm text-gray-400 mt-1">Awesome Creator</p>
                <p className="text-sm text-gray-400">{
                  (() => {
                    const days = Math.floor(Math.random() * 4 + 1);
                    return `${Math.floor(Math.random() * 500 + 10)}K views · ${days} ${days === 1 ? 'day' : 'days'} ago`;
                  })()
                }</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default YouTubePreview;
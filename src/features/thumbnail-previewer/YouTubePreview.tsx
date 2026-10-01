import { useApp } from '../../context/AppContext';

type YouTubePreviewProps = {
  viewMode: 'desktop' | 'mobile';
  themeMode: 'light' | 'dark';
  userThumbnail: string | null;
  mockThumbnails: string[];
  title: string;
};

export default function YouTubePreview({
  viewMode,
  themeMode,
  userThumbnail,
  mockThumbnails,
  title,
}: YouTubePreviewProps) {
  const { lang } = useApp();
  const light = themeMode === 'light';
  return (
    <div
      data-testid="youtube-preview"
      className={`rounded-xl overflow-hidden border border-base-300 ${light ? 'bg-white text-[#0f0f0f]' : 'bg-[#0f0f0f] text-[#f1f1f1]'} ${viewMode === 'mobile' ? 'max-w-sm mx-auto' : ''}`}
    >
      <div className="p-4 border-b border-current/10 flex justify-between text-xs">
        <span className="font-bold">YouTube</span>
        <span>{lang === 'ar' ? 'معاينة توضيحية' : 'Illustrative preview'}</span>
      </div>
      <div
        className={`grid p-4 gap-5 ${viewMode === 'desktop' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}
      >
        {mockThumbnails.slice(0, 6).map((src, index) => (
          <div key={src} className="min-w-0">
            <img
              src={index === 0 && userThumbnail ? userThumbnail : src}
              alt={
                index === 0 && userThumbnail
                  ? lang === 'ar'
                    ? 'صورتك المصغرة'
                    : 'Your thumbnail'
                  : 'Sample video thumbnail'
              }
              className="w-full aspect-video rounded-lg object-cover"
            />
            <div className="flex items-start gap-2 mt-3">
              <span
                className={`w-8 h-8 rounded-full grid place-items-center shrink-0 text-xs ${light ? 'bg-gray-100' : 'bg-neutral-800'}`}
              >
                {index === 0 ? 'Y' : 'C'}
              </span>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold line-clamp-2 leading-snug">
                  {index === 0
                    ? title
                    : lang === 'ar'
                      ? ['روتين يومي للإبداع', 'نصائح التصوير', 'رحلة جديدة'][index % 3]
                      : [
                          'A day in my creative life',
                          'Camera tips you should know',
                          'Finding a new perspective',
                        ][index % 3]}
                </h3>
                <p className="text-xs opacity-60 mt-1">
                  {index === 0 ? (lang === 'ar' ? 'قناتك' : 'Your channel') : 'Creator channel'}
                </p>
                <p className="text-xs opacity-60">
                  {12 + index * 7}K views · {index + 1} days ago
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

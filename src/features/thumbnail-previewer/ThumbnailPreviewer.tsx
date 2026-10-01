import { useEffect, useState } from 'react';
import { ImagePlus, Monitor, Smartphone } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type en from '../../locales/en.json';
import YouTubePreview from './YouTubePreview';

const mockThumbnails = Array.from(
  { length: 8 },
  (_, i) => `https://picsum.photos/seed/${i + 1}/720/404`
);

export default function ThumbnailPreviewer({ t }: { t: typeof en }) {
  const { lang } = useApp();
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('dark');
  const [title, setTitle] = useState(
    lang === 'ar' ? 'عنوان فيديوك القادم' : 'The title of your next great video'
  );
  const [error, setError] = useState('');
  useEffect(
    () => () => {
      if (thumbnail?.startsWith('blob:')) URL.revokeObjectURL(thumbnail);
    },
    [thumbnail]
  );
  return (
    <div className="space-y-6">
      <p className="text-sm text-base-content/65">
        {lang === 'ar'
          ? 'شاهد صورتك وعنوانك بجانب فيديوهات أخرى قبل النشر. تبقى الصورة التي ترفعها على جهازك.'
          : 'See your thumbnail and title alongside other videos before you publish. Your uploaded image stays on your device.'}
      </p>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="preview-image" className="block text-sm font-medium mb-2">
            <ImagePlus className="inline w-4 h-4 me-2" />
            {t.thumbnailPreviewer.uploadThumbnail}
          </label>
          <input
            id="preview-image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="file-input w-full"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              if (
                !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
                file.size > 10 * 1024 * 1024
              ) {
                setError(
                  lang === 'ar'
                    ? 'اختر صورة JPG أو PNG أو WebP أصغر من 10 ميجابايت.'
                    : 'Choose a JPG, PNG, or WebP image smaller than 10 MB.'
                );
                e.target.value = '';
                return;
              }
              setThumbnail(URL.createObjectURL(file));
              setError('');
            }}
          />
          <p className="text-xs text-base-content/55 mt-2">
            JPG, PNG, WebP · 10 MB max · 16:9 recommended
          </p>
        </div>
        <div>
          <label htmlFor="preview-title" className="block text-sm font-medium mb-2">
            {lang === 'ar' ? 'عنوان الفيديو' : 'Video title'}
          </label>
          <input
            id="preview-title"
            className="input-modern"
            value={title}
            maxLength={100}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
      </div>
      {error && (
        <p className="text-sm text-error" role="alert">
          {error}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button
            type="button"
            className={`btn btn-sm ${viewMode === 'desktop' ? 'btn-brand' : 'btn-soft'}`}
            aria-pressed={viewMode === 'desktop'}
            onClick={() => setViewMode('desktop')}
          >
            <Monitor size={16} />
            {t.thumbnailPreviewer.desktop}
          </button>
          <button
            type="button"
            className={`btn btn-sm ${viewMode === 'mobile' ? 'btn-brand' : 'btn-soft'}`}
            aria-pressed={viewMode === 'mobile'}
            onClick={() => setViewMode('mobile')}
          >
            <Smartphone size={16} />
            {t.thumbnailPreviewer.mobile}
          </button>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className={`btn btn-sm ${themeMode === 'light' ? 'btn-brand' : 'btn-soft'}`}
            aria-pressed={themeMode === 'light'}
            onClick={() => setThemeMode('light')}
          >
            {t.thumbnailPreviewer.light}
          </button>
          <button
            type="button"
            className={`btn btn-sm ${themeMode === 'dark' ? 'btn-brand' : 'btn-soft'}`}
            aria-pressed={themeMode === 'dark'}
            onClick={() => setThemeMode('dark')}
          >
            {t.thumbnailPreviewer.dark}
          </button>
        </div>
      </div>
      {!thumbnail && (
        <div className="rounded-xl border border-base-300 p-4">
          <p className="text-sm mb-3">
            {lang === 'ar'
              ? 'ارفع صورتك أو اختر مثالاً للمعاينة:'
              : 'Upload your image, or choose a sample to try the preview:'}
          </p>
          <div className="grid grid-cols-4 gap-2">
            {mockThumbnails.slice(0, 4).map((src, i) => (
              <button
                type="button"
                key={src}
                aria-label={`${lang === 'ar' ? 'اختر المثال' : 'Use sample thumbnail'} ${i + 1}`}
                onClick={() => setThumbnail(src)}
                className="rounded-lg overflow-hidden"
              >
                <img src={src} alt="" className="aspect-video object-cover w-full" />
              </button>
            ))}
          </div>
        </div>
      )}
      <YouTubePreview
        viewMode={viewMode}
        themeMode={themeMode}
        userThumbnail={thumbnail}
        mockThumbnails={mockThumbnails}
        title={title}
      />
      {thumbnail && (
        <button type="button" className="btn btn-soft" onClick={() => setThumbnail(null)}>
          {lang === 'ar' ? 'إزالة الصورة' : 'Remove thumbnail'}
        </button>
      )}
    </div>
  );
}

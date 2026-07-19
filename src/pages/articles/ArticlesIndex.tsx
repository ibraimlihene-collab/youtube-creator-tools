import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ARTICLES } from '../../data/articles';

export default function ArticlesIndex() {
  const { lang } = useApp();
  const rtl = lang === 'ar';

  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      <header className="border-b border-base-300 sticky top-0 z-40 bg-base-100/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="font-bold tracking-tight">
            YouCreator <span className="text-primary">Tools</span>
          </Link>
          <Link to="/app" className="btn-brand btn-sm">
            {lang === 'ar' ? 'الاستوديو' : 'Studio'}
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 text-primary text-sm font-semibold mb-3">
            <BookOpen className="w-4 h-4" />
            {lang === 'ar' ? 'أكاديمية الصنّاع' : 'Creator Academy'}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            {lang === 'ar' ? 'مقالات عملية لنمو يوتيوب' : 'Practical articles for YouTube growth'}
          </h1>
          <p className="text-base-content/65 max-w-2xl">
            {lang === 'ar'
              ? 'محتوى أصلي مستوحى من أفضل ممارسات تعليم الصنّاع — قابل للتطبيق فوراً.'
              : 'Original writing inspired by top creator-education practices — immediately actionable.'}
          </p>
        </div>

        <div className="grid gap-4">
          {ARTICLES.map((a) => (
            <Link
              key={a.slug}
              to={`/articles/${a.slug}`}
              className="surface-card p-5 sm:p-6 hover-lift block"
            >
              <div className="flex flex-wrap gap-2 mb-2">
                {a.tags.map((t) => (
                  <span key={t} className="badge-ai text-[10px]">
                    {t}
                  </span>
                ))}
                <span className="text-xs text-base-content/45">
                  {a.readMinutes} {lang === 'ar' ? 'د قراءة' : 'min read'}
                </span>
              </div>
              <h2 className="text-xl font-bold mb-2">
                {lang === 'ar' ? a.titleAr : a.titleEn}
              </h2>
              <p className="text-sm text-base-content/65 mb-3">
                {lang === 'ar' ? a.excerptAr : a.excerptEn}
              </p>
              <span className="inline-flex items-center gap-1 text-primary text-sm font-semibold">
                {lang === 'ar' ? 'اقرأ' : 'Read'}
                {rtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

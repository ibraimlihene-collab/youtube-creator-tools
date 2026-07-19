import type { ReactNode } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getArticle } from '../../data/articles';

function renderMarkdownLite(md: string) {
  // Minimal safe renderer: headings + paragraphs + lists
  const lines = md.split('\n');
  const nodes: ReactNode[] = [];
  let list: string[] = [];
  const flushList = () => {
    if (!list.length) return;
    nodes.push(
      <ul key={`ul-${nodes.length}`} className="list-disc ps-5 space-y-1 mb-4 text-base-content/80">
        {list.map((li, i) => (
          <li key={i}>{li}</li>
        ))}
      </ul>
    );
    list = [];
  };

  lines.forEach((line, idx) => {
    if (line.startsWith('## ')) {
      flushList();
      nodes.push(
        <h2 key={idx} className="text-xl font-bold mt-8 mb-3">
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith('- ')) {
      list.push(line.slice(2));
    } else if (/^\d+\.\s/.test(line)) {
      list.push(line.replace(/^\d+\.\s/, ''));
    } else if (line.trim() === '') {
      flushList();
    } else {
      flushList();
      // bold **text**
      const parts = line.split(/(\*\*[^*]+\*\*)/g).map((p, i) => {
        if (p.startsWith('**') && p.endsWith('**')) {
          return (
            <strong key={i} className="font-semibold text-base-content">
              {p.slice(2, -2)}
            </strong>
          );
        }
        return <span key={i}>{p}</span>;
      });
      nodes.push(
        <p key={idx} className="mb-3 leading-relaxed text-base-content/80">
          {parts}
        </p>
      );
    }
  });
  flushList();
  return nodes;
}

export default function ArticlePage() {
  const { slug } = useParams();
  const { lang } = useApp();
  const article = slug ? getArticle(slug) : undefined;
  if (!article) return <Navigate to="/articles" replace />;
  const rtl = lang === 'ar';
  const body = lang === 'ar' ? article.bodyAr : article.bodyEn;

  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      <header className="border-b border-base-300 sticky top-0 z-40 bg-base-100/80 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            to="/articles"
            className="inline-flex items-center gap-1 text-sm text-base-content/70 hover:text-primary"
          >
            {rtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            {lang === 'ar' ? 'المقالات' : 'Articles'}
          </Link>
          <Link to="/app" className="btn-brand btn-sm">
            {lang === 'ar' ? 'جرّب الأدوات' : 'Try tools'}
          </Link>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-wrap gap-2 mb-4">
          {article.tags.map((t) => (
            <span key={t} className="badge-ai text-[10px]">
              {t}
            </span>
          ))}
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 leading-tight">
          {lang === 'ar' ? article.titleAr : article.titleEn}
        </h1>
        <p className="text-base-content/60 mb-8">
          {article.readMinutes} {lang === 'ar' ? 'دقائق قراءة' : 'min read'}
        </p>
        <div className="prose-custom">{renderMarkdownLite(body)}</div>
      </article>
    </div>
  );
}

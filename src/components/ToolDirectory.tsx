import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Search, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  ALL_CATEGORIES,
  CATEGORY_META,
  TOOLS,
  type ToolCategory,
  type ToolDef,
} from '../lib/tools';

export function DirectoryCard({ tool }: { tool: ToolDef }) {
  const { lang } = useApp();
  const Icon = tool.icon;
  return (
    <Link to={tool.path} className={`directory-card category-${tool.category}`}>
      <div className="flex items-center justify-between mb-6">
        <span className="directory-icon">
          <Icon size={23} />
        </span>
        <span className={tool.kind === 'local' ? 'badge-local' : 'badge-ai'}>
          {tool.kind === 'local'
            ? lang === 'ar'
              ? 'بدون ذكاء اصطناعي'
              : 'No AI needed'
            : tool.kind === 'hybrid'
              ? lang === 'ar'
                ? 'ذكاء اصطناعي اختياري'
                : 'Optional AI'
              : lang === 'ar'
                ? 'مدعوم بالذكاء الاصطناعي'
                : 'AI powered'}
        </span>
      </div>
      <h3>{lang === 'ar' ? tool.titleAr : tool.titleEn}</h3>
      <p>{lang === 'ar' ? tool.descAr : tool.descEn}</p>
      <div className="directory-card-bottom">
        <span>
          {lang === 'ar'
            ? CATEGORY_META[tool.category].labelAr
            : CATEGORY_META[tool.category].labelEn}
        </span>
        <ArrowUpRight size={19} />
      </div>
    </Link>
  );
}

export default function ToolDirectory() {
  const { lang } = useApp();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<ToolCategory | 'all'>('all');
  const [localOnly, setLocalOnly] = useState(false);
  const visible = TOOLS.filter(
    (tool) =>
      (category === 'all' || tool.category === category) &&
      (!localOnly || tool.kind !== 'ai') &&
      `${tool.titleEn} ${tool.titleAr} ${tool.descEn} ${tool.descAr}`
        .toLowerCase()
        .includes(query.trim().toLowerCase())
  );
  return (
    <section aria-label={lang === 'ar' ? 'دليل الأدوات' : 'Tool directory'}>
      <div className="directory-search-row">
        <label className="directory-search">
          <Search size={19} />
          <input
            type="search"
            aria-label={lang === 'ar' ? 'ابحث عن الأدوات' : 'Search the tool directory'}
            placeholder={lang === 'ar' ? 'ماذا تريد أن تنشئ؟' : 'What do you want to create?'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button type="button" aria-label="Clear search" onClick={() => setQuery('')}>
              <X size={17} />
            </button>
          )}
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            className="checkbox checkbox-sm checkbox-primary"
            checked={localOnly}
            onChange={(e) => setLocalOnly(e.target.checked)}
          />
          {lang === 'ar' ? 'بدون ذكاء اصطناعي' : 'No AI needed'}
        </label>
      </div>
      <div className="category-filters" aria-label={lang === 'ar' ? 'الفئات' : 'Categories'}>
        <button type="button" aria-pressed={category === 'all'} onClick={() => setCategory('all')}>
          {lang === 'ar' ? 'كل الأدوات' : 'All tools'}
        </button>
        {ALL_CATEGORIES.filter((cat) => TOOLS.some((t) => t.category === cat)).map((cat) => (
          <button
            key={cat}
            type="button"
            aria-pressed={category === cat}
            onClick={() => setCategory(cat)}
          >
            {lang === 'ar' ? CATEGORY_META[cat].labelAr : CATEGORY_META[cat].labelEn}
          </button>
        ))}
      </div>
      <p className="text-sm text-base-content/60 my-5" role="status">
        {lang === 'ar'
          ? `${visible.length} أداة متاحة`
          : `${visible.length} tools to make your next video better`}
      </p>
      {visible.length ? (
        <div className="directory-grid">
          {visible.map((tool) => (
            <DirectoryCard key={tool.id} tool={tool} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Search size={32} />
          <h3>{lang === 'ar' ? 'لم نجد أدوات' : 'No tools found'}</h3>
          <p>
            {lang === 'ar'
              ? 'جرّب كلمة أخرى أو أزل الفلاتر.'
              : 'Try another keyword or reset your filters.'}
          </p>
          <button
            className="btn btn-soft"
            onClick={() => {
              setQuery('');
              setCategory('all');
              setLocalOnly(false);
            }}
          >
            {lang === 'ar' ? 'إعادة الضبط' : 'Reset filters'}
          </button>
        </div>
      )}
    </section>
  );
}

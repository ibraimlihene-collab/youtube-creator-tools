import type { ReactNode } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import AppLayout from './components/layout/AppLayout';
import ToolCard from './components/ToolCard';
import LandingPage from './pages/LandingPage';
import ArticlesIndex from './pages/articles/ArticlesIndex';
import ArticlePage from './pages/articles/ArticlePage';
import DashboardPage from './pages/DashboardPage';
import {
  TOOLS,
  TOOL_COUNT,
  getToolById,
  type ToolDef,
} from './lib/tools';

import ColorPaletteGenerator from './features/color-palette-generator/ColorPaletteGenerator';
import CpmCalculator from './features/cpm-calculator/CpmCalculator';
import HashtagGenerator from './features/hashtag-generator/HashtagGenerator';
import SilenceRemover from './features/silence-remover/SilenceRemover';
import ThumbnailDownloader from './features/thumbnail-downloader/ThumbnailDownloader';
import ThumbnailPreviewer from './features/thumbnail-previewer/ThumbnailPreviewer';
import GenericAITool from './features/_shared/GenericAITool';

function toolTitle(tool: ToolDef, lang: 'ar' | 'en') {
  return lang === 'ar' ? tool.titleAr : tool.titleEn;
}
function toolDesc(tool: ToolDef, lang: 'ar' | 'en') {
  return lang === 'ar' ? tool.descAr : tool.descEn;
}

function ToolPage({ id }: { id: string }) {
  const { lang, t } = useApp();
  const meta = getToolById(id);
  if (!meta) return <Navigate to="/app" replace />;

  const Icon = meta.icon;
  const title = toolTitle(meta, lang);
  const description = toolDesc(meta, lang);

  let body: ReactNode;
  switch (meta.custom) {
    case 'silenceRemover':
      body = <SilenceRemover />;
      break;
    case 'cpmCalculator':
      body = <CpmCalculator t={t} />;
      break;
    case 'thumbnailDownloader':
      body = <ThumbnailDownloader t={t} />;
      break;
    case 'thumbnailPreviewer':
      body = <ThumbnailPreviewer t={t} />;
      break;
    case 'hashtagGenerator':
      body = <HashtagGenerator lang={lang} t={t} />;
      break;
    case 'colorPaletteGenerator':
      body = <ColorPaletteGenerator t={t} />;
      break;
    default:
      body = <GenericAITool tool={meta} />;
  }

  const badge =
    meta.badge === 'ai' || meta.kind === 'ai' ? (
      <span className="badge-ai">AI</span>
    ) : meta.badge === 'local' || meta.kind === 'local' ? (
      <span className="badge-local">Local</span>
    ) : meta.badge === 'new' ? (
      <span className="badge-ai">New</span>
    ) : null;

  return (
    <ToolCard title={title} icon={Icon} description={description} badge={badge}>
      {body}
    </ToolCard>
  );
}

function AppHub() {
  const { lang } = useApp();
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="mesh-bg rounded-3xl border border-base-300 p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
              {lang === 'ar' ? 'استوديو الصنّاع' : 'Creator studio'}
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
              {lang === 'ar'
                ? `${TOOL_COUNT} أداة احترافية لصنّاع يوتيوب`
                : `${TOOL_COUNT} pro tools for YouTube creators`}
            </h1>
            <p className="text-base-content/65 max-w-2xl">
              {lang === 'ar'
                ? 'اختر أداة من الشريط الجانبي. أدوات الذكاء الاصطناعي تعمل عبر خادم آمن — المفاتيح لا تظهر في المتصفح.'
                : 'Pick a tool from the sidebar. AI runs through a secure server proxy — keys never touch the browser.'}
            </p>
          </div>
          <Link to="/dashboard" className="btn-brand btn-sm">
            {lang === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link key={tool.id} to={tool.path} className="surface-card p-5 hover-lift group">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h2 className="font-semibold truncate">{toolTitle(tool, lang)}</h2>
                    {(tool.badge === 'ai' || tool.kind === 'ai') && (
                      <span className="badge-ai text-[10px]">AI</span>
                    )}
                    {(tool.badge === 'local' || tool.kind === 'local') && (
                      <span className="badge-local text-[10px]">Local</span>
                    )}
                    {tool.badge === 'new' && <span className="badge-ai text-[10px]">New</span>}
                  </div>
                  <p className="text-sm text-base-content/60 line-clamp-2">{toolDesc(tool, lang)}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/articles" element={<ArticlesIndex />} />
      <Route path="/articles/:slug" element={<ArticlePage />} />
      <Route element={<AppLayout />}>
        <Route path="/app" element={<AppHub />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        {TOOLS.map((tool) => (
          <Route key={tool.id} path={tool.path} element={<ToolPage id={tool.id} />} />
        ))}
        <Route path="/silence-remover" element={<Navigate to="/tools/silence-remover" replace />} />
        <Route path="/cpm-calculator" element={<Navigate to="/tools/cpm-calculator" replace />} />
        <Route path="/thumbnail-downloader" element={<Navigate to="/tools/thumbnail-downloader" replace />} />
        <Route path="/thumbnail-previewer" element={<Navigate to="/tools/thumbnail-previewer" replace />} />
        <Route path="/hashtag-generator" element={<Navigate to="/tools/hashtag-generator" replace />} />
        <Route path="/color-palette-generator" element={<Navigate to="/tools/color-palette" replace />} />
        <Route path="/thumbnail-generator" element={<Navigate to="/app" replace />} />
        <Route path="/video-rephraser" element={<Navigate to="/tools/video-rephraser" replace />} />
        <Route path="/script-writer" element={<Navigate to="/tools/script-writer" replace />} />
        <Route path="/description-generator" element={<Navigate to="/tools/description-generator" replace />} />
        <Route path="/title-generator" element={<Navigate to="/tools/title-generator" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}

export default App;

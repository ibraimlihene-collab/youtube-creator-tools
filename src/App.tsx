import { useEffect, type ReactNode } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import AppLayout from './components/layout/AppLayout';
import ToolCard from './components/ToolCard';
import ToolDirectory from './components/ToolDirectory';
import LandingPage from './pages/LandingPage';
import ArticlesIndex from './pages/articles/ArticlesIndex';
import ArticlePage from './pages/articles/ArticlePage';
import DashboardPage from './pages/DashboardPage';
import { TOOLS, getToolById, type ToolDef } from './lib/tools';

import ColorPaletteGenerator from './features/color-palette-generator/ColorPaletteGenerator';
import CpmCalculator from './features/cpm-calculator/CpmCalculator';
import HashtagGenerator from './features/hashtag-generator/HashtagGenerator';
import SilenceRemover from './features/silence-remover/SilenceRemover';
import ThumbnailDownloader from './features/thumbnail-downloader/ThumbnailDownloader';
import ThumbnailPreviewer from './features/thumbnail-previewer/ThumbnailPreviewer';
import GenericAITool from './features/_shared/GenericAITool';
import SfxLibrary from './features/sfx-library/SfxLibrary';

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
    case 'sfxLibrary':
      body = <SfxLibrary />;
      break;
    default:
      body = <GenericAITool key={meta.id} tool={meta} />;
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
    <div className="space-y-7 animate-fade-in">
      <div className="studio-heading">
        <div className="eyebrow">{lang === 'ar' ? 'استوديو الإبداع' : 'YOUR CREATIVE SPACE'}</div>
        <h1>{lang === 'ar' ? 'ماذا ستنشئ اليوم؟' : 'What will you create today?'}</h1>
        <p>
          {lang === 'ar'
            ? 'اعثر على الأداة المناسبة لفيديوك القادم.'
            : 'A little help for every part of your next video. Find your tool and get into your flow.'}
        </p>
      </div>
      <ToolDirectory />
    </div>
  );
}

function AppRoutes() {
  const { pathname } = useLocation();
  const { lang } = useApp();
  useEffect(() => {
    window.scrollTo(0, 0);
    const tool = TOOLS.find((item) => item.path === pathname);
    document.title = tool
      ? `${toolTitle(tool, lang)} · YouCreator Tools`
      : `${pathname === '/app' ? 'Creator studio' : pathname === '/dashboard' ? 'Dashboard' : 'Create more, with less busywork'} · YouCreator Tools`;
  }, [pathname, lang]);
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
        <Route
          path="/thumbnail-downloader"
          element={<Navigate to="/tools/thumbnail-downloader" replace />}
        />
        <Route
          path="/thumbnail-previewer"
          element={<Navigate to="/tools/thumbnail-previewer" replace />}
        />
        <Route
          path="/hashtag-generator"
          element={<Navigate to="/tools/hashtag-generator" replace />}
        />
        <Route
          path="/color-palette-generator"
          element={<Navigate to="/tools/color-palette" replace />}
        />
        <Route path="/thumbnail-generator" element={<Navigate to="/app" replace />} />
        <Route path="/video-rephraser" element={<Navigate to="/tools/video-rephraser" replace />} />
        <Route path="/script-writer" element={<Navigate to="/tools/script-writer" replace />} />
        <Route
          path="/description-generator"
          element={<Navigate to="/tools/description-generator" replace />}
        />
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

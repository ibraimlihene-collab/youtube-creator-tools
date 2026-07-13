import type { ReactNode } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import AppLayout from './components/layout/AppLayout';
import ToolCard from './components/ToolCard';
import LandingPage from './pages/LandingPage';
import { TOOLS, getToolById, type ToolId } from './lib/tools';

import ColorPaletteGenerator from './features/color-palette-generator/ColorPaletteGenerator';
import CpmCalculator from './features/cpm-calculator/CpmCalculator';
import HashtagGenerator from './features/hashtag-generator/HashtagGenerator';
import SilenceRemover from './features/silence-remover/SilenceRemover';
import ThumbnailDownloader from './features/thumbnail-downloader/ThumbnailDownloader';
import ThumbnailPreviewer from './features/thumbnail-previewer/ThumbnailPreviewer';
import ThumbnailGenerator from './features/thumbnail-generator/ThumbnailGenerator';
import VideoRephraser from './features/video-rephraser/VideoRephraser';
import ScriptWriter from './features/script-writer/ScriptWriter';
import DescriptionGenerator from './features/description-generator/DescriptionGenerator';
import TitleGenerator from './features/title-generator/TitleGenerator';

function ToolPage({ id }: { id: ToolId }) {
  const { t, lang } = useApp();
  const meta = getToolById(id);
  if (!meta) return <Navigate to="/" replace />;

  const Icon = meta.icon;
  const title = t.app.tools[id]?.title || id;
  const description =
    (t.landingPage as any)?.[`${id}Desc`] ||
    undefined;

  let body: ReactNode;
  switch (id) {
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
    case 'thumbnailGenerator':
      body = <ThumbnailGenerator t={t} />;
      break;
    case 'videoRephraser':
      body = <VideoRephraser t={t} />;
      break;
    case 'scriptWriter':
      body = <ScriptWriter t={t} />;
      break;
    case 'descriptionGenerator':
      body = <DescriptionGenerator t={t} />;
      break;
    case 'titleGenerator':
      body = <TitleGenerator t={t} />;
      break;
    default:
      body = null;
  }

  const badge =
    meta.badge === 'ai' ? (
      <span className="badge-ai">AI</span>
    ) : meta.badge === 'local' ? (
      <span className="badge-local">Local</span>
    ) : null;

  return (
    <ToolCard title={title} icon={Icon} description={description} badge={badge}>
      {body}
    </ToolCard>
  );
}

function AppHub() {
  const { t } = useApp();
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="mesh-bg rounded-3xl border border-base-300 p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
          {t.app.hubTitle || 'Creator studio'}
        </h1>
        <p className="text-base-content/65 max-w-2xl">
          {t.app.hubSubtitle ||
            'Pick a tool from the sidebar, or jump in below. Everything runs in your browser.'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.id}
              to={tool.path}
              className="surface-card p-5 hover-lift group"
            >
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-semibold truncate">
                      {t.app.tools[tool.id]?.title || tool.id}
                    </h2>
                    {tool.badge === 'ai' && <span className="badge-ai text-[10px]">AI</span>}
                    {tool.badge === 'local' && (
                      <span className="badge-local text-[10px]">Local</span>
                    )}
                  </div>
                  <p className="text-sm text-base-content/60 line-clamp-2">
                    {(t.landingPage as any)?.[`${tool.id}Desc`] || ''}
                  </p>
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
      <Route element={<AppLayout />}>
        <Route path="/app" element={<AppHub />} />
        {TOOLS.map((tool) => (
          <Route key={tool.id} path={tool.path} element={<ToolPage id={tool.id} />} />
        ))}
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

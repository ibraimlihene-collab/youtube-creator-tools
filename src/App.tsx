import type { ReactNode } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import AppLayout from './components/layout/AppLayout';
import ToolCard from './components/ToolCard';
import LandingPage from './pages/LandingPage';
import ArticlesIndex from './pages/articles/ArticlesIndex';
import ArticlePage from './pages/articles/ArticlePage';
import DashboardPage from './pages/DashboardPage';
import { TOOLS, TOOL_COUNT, getToolById, type ToolDef } from './lib/tools';

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
  const ar = lang === 'ar';
  return (
    <div className="space-y-7 animate-fade-in" data-testid="tool-catalogue">
      <div className="studio-welcome">
        <div>
          <p className="eyebrow">
            {ar ? 'مساحتك الإبداعية' : 'WELCOME TO YOUR CREATIVE SPACE'}
          </p>
          <h1>{ar ? 'فكرة جديدة؟ لنبدأ.' : 'Big idea? Let’s get into it.'}</h1>
          <p>
            {ar
              ? 'كل ما تحتاجه للخطوة التالية، من الكتابة والتصميم إلى آخر لمسة قبل النشر. اختر أداة وابدأ.'
              : 'A little help for every part of your process, from the first draft to the finishing touches. Pick a tool and make it happen.'}
          </p>
        </div>
      </div>
      <div className="catalogue-heading">
        <h2>
          {ar ? `كل الأدوات (${TOOL_COUNT})` : `Your toolkit (${TOOL_COUNT})`}
        </h2>
        <span>
          {ar
            ? 'ابحث عن أداتك في القائمة الجانبية'
            : 'Find a tool with the sidebar search'}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {TOOLS.map((tool, index) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.id}
              to={tool.path}
              className={`surface-card catalogue-tool hover-lift tool-tone-${index % 4}`}
            >
              <div className="catalogue-card-top">
                <span className="tool-icon">
                  <Icon size={19} />
                </span>
                {(tool.badge === 'ai' || tool.kind === 'ai') && (
                  <span className="badge-ai">AI</span>
                )}
                {(tool.badge === 'local' || tool.kind === 'local') && (
                  <span className="badge-local">
                    {ar ? 'على جهازك' : 'On device'}
                  </span>
                )}
                {tool.badge === 'new' && (
                  <span className="badge-ai">{ar ? 'جديد' : 'New'}</span>
                )}
              </div>
              <div>
                <h3>{toolTitle(tool, lang)}</h3>
                <p>{toolDesc(tool, lang)}</p>
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
          <Route
            key={tool.id}
            path={tool.path}
            element={<ToolPage id={tool.id} />}
          />
        ))}
        <Route
          path="/silence-remover"
          element={<Navigate to="/tools/silence-remover" replace />}
        />
        <Route
          path="/cpm-calculator"
          element={<Navigate to="/tools/cpm-calculator" replace />}
        />
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
        <Route
          path="/thumbnail-generator"
          element={<Navigate to="/app" replace />}
        />
        <Route
          path="/video-rephraser"
          element={<Navigate to="/tools/video-rephraser" replace />}
        />
        <Route
          path="/script-writer"
          element={<Navigate to="/tools/script-writer" replace />}
        />
        <Route
          path="/description-generator"
          element={<Navigate to="/tools/description-generator" replace />}
        />
        <Route
          path="/title-generator"
          element={<Navigate to="/tools/title-generator" replace />}
        />
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

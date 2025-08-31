import React, { useEffect, useMemo, useState } from 'react';
import {
  Palette,
  Scissors,
  Calculator,
  Download,
 Eye,
  Tags,
 Github,
  Twitter,
  Sun,
  Moon,
  Languages,
  Image,
  Repeat,
  AlignLeft,
 Type,
 Pen,
} from 'lucide-react';
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
import ar from './locales/ar.json';
import en from './locales/en.json';
import ToolCard from './components/ToolCard';

type Lang = 'ar' | 'en';
type Theme = 'light' | 'dark' | 'customDark';
type Tool =
  | 'silenceRemover'
  | 'cpmCalculator'
  | 'thumbnailDownloader'
  | 'thumbnailPreviewer'
  | 'hashtagGenerator'
  | 'colorPaletteGenerator'
  | 'thumbnailGenerator'
  | 'videoRephraser'
  | 'scriptWriter'
  | 'descriptionGenerator'
  | 'titleGenerator';

const tools: { id: Tool; icon: React.ElementType }[] = [
  { id: 'silenceRemover', icon: Scissors },
  { id: 'cpmCalculator', icon: Calculator },
 { id: 'thumbnailDownloader', icon: Download },
  { id: 'thumbnailPreviewer', icon: Eye },
 { id: 'hashtagGenerator', icon: Tags },
  { id: 'colorPaletteGenerator', icon: Palette },
 { id: 'thumbnailGenerator', icon: Image },
  { id: 'videoRephraser', icon: Repeat },
  { id: 'scriptWriter', icon: Pen },
  { id: 'descriptionGenerator', icon: AlignLeft },
  { id: 'titleGenerator', icon: Type },
];

function App() {
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem('lang') as Lang) || 'ar');
  const [theme, setTheme] = useState<Theme>('customDark');
  const [activeTool, setActiveTool] = useState<Tool>('silenceRemover');

  const t = useMemo(() => (lang === 'ar' ? ar : en), [lang]);

  useEffect(() => {
    localStorage.setItem('lang', lang);
    const html = document.querySelector('html');
    if (html) {
      html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
      html.setAttribute('lang', lang);
    }
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    const html = document.querySelector('html');
    if (html) {
      html.setAttribute('data-theme', theme);
    }
  }, [theme]);

  const renderTool = () => {
    const activeToolInfo = tools.find(tool => tool.id === activeTool);
    if (!activeToolInfo) return null;

    const { id, icon } = activeToolInfo;

    let toolComponent;
    switch (id) {
      case 'silenceRemover':
        toolComponent = <SilenceRemover />;
        break;
      case 'cpmCalculator':
        toolComponent = <CpmCalculator t={t} />;
        break;
      case 'thumbnailDownloader':
        toolComponent = <ThumbnailDownloader t={t} />;
        break;
      case 'thumbnailPreviewer':
        toolComponent = <ThumbnailPreviewer t={t} />;
        break;
      case 'hashtagGenerator':
        toolComponent = <HashtagGenerator lang={lang} t={t} />;
        break;
      case 'colorPaletteGenerator':
        toolComponent = <ColorPaletteGenerator t={t} />;
        break;
      case 'thumbnailGenerator':
        toolComponent = <ThumbnailGenerator t={t} />;
        break;
      case 'videoRephraser':
        toolComponent = <VideoRephraser t={t} />;
        break;
      case 'scriptWriter':
        toolComponent = <ScriptWriter t={t} />;
        break;
      case 'descriptionGenerator':
        toolComponent = <DescriptionGenerator t={t} />;
        break;
      case 'titleGenerator':
        toolComponent = <TitleGenerator t={t} />;
        break;
      default:
        return null;
    }

    return (
      <ToolCard title={t.app.tools[id].title} icon={icon}>
        {toolComponent}
      </ToolCard>
    );
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-base-200 to-base-300 text-base-content">
      {/* Sidebar */}
      <aside className="w-72 bg-base-100/95 backdrop-blur-sm border-r border-base-300 flex flex-col shadow-xl">
        <div className="flex items-center gap-3 p-6 border-b border-base-300">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">YC</span>
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            {t.app.title}
          </h1>
        </div>
        
        <nav className="flex-grow px-4 py-6">
          <ul className="space-y-2">
            {tools.map(({ id, icon: Icon }) => (
              <li key={id}>
                <button
                  onClick={() => setActiveTool(id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                    activeTool === id
                      ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-content shadow-lg'
                      : 'hover:bg-base-200/50 hover:shadow-md'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{t.app.tools[id].title}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="p-4 border-t border-base-300">
          <div className="flex justify-around mb-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="btn btn-ghost btn-circle hover:bg-primary/10 hover:text-primary transition-colors"
              title="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="btn btn-ghost btn-circle hover:bg-primary/10 hover:text-primary transition-colors"
              title="Twitter"
            >
              <Twitter className="w-5 h-5" />
            </a>
          </div>
          <div className="flex justify-around">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="btn btn-ghost btn-circle hover:bg-primary/10 hover:text-primary transition-colors"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="btn btn-ghost btn-circle hover:bg-primary/10 hover:text-primary transition-colors"
              title="Toggle Language"
            >
              <Languages className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {renderTool()}
        </div>
      </main>
    </div>
  );
}

export default App;
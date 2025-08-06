import React, { useEffect, useMemo, useState } from 'react';
import { FaCalculator, FaCut, FaGithub, FaImage, FaPalette, FaPhotoVideo, FaTags, FaTwitter } from 'react-icons/fa';
import ColorPaletteGenerator from './features/color-palette-generator/ColorPaletteGenerator';
import CpmCalculator from './features/cpm-calculator/CpmCalculator';
import HashtagGenerator from './features/hashtag-generator/HashtagGenerator';
import SilenceRemover from './features/silence-remover/SilenceRemover';
import ThumbnailDownloader from './features/thumbnail-downloader/ThumbnailDownloader';
import ThumbnailPreviewer from './features/thumbnail-previewer/ThumbnailPreviewer';
import ar from './locales/ar.json';
import en from './locales/en.json';

type Lang = 'ar' | 'en';
type Theme = "light" | "dark" | "cupcake" | "bumblebee" | "emerald" | "corporate" | "synthwave" | "retro" | "cyberpunk" | "valentine" | "halloween" | "garden" | "forest" | "aqua" | "lofi" | "pastel" | "fantasy" | "wireframe" | "black" | "luxury" | "dracula" | "cmyk" | "autumn" | "business" | "acid" | "lemonade" | "night" | "coffee" | "winter" | "customDark";

function App() {
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem('lang') as Lang) || 'ar');
  const [theme, setTheme] = useState<Theme>('customDark');

  const t = useMemo(() => (lang === 'ar' ? ar : en), [lang]);

  useEffect(() => {
    localStorage.setItem('lang', lang);
    // اتجاه الصفحة حسب اللغة
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

  return (
    <div className="min-h-screen flex flex-col">
      <header className="navbar bg-base-200/50 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto">
          <div className="flex-1">
            <span className="btn btn-ghost text-xl font-bold">{t.app.title}</span>
          </div>
          <div className="flex-none gap-2">
            <div className="join">
              <button className={`btn btn-sm join-item ${lang === 'ar' ? 'btn-primary' : ''}`} onClick={() => setLang('ar')}>AR</button>
              <button className={`btn btn-sm join-item ${lang === 'en' ? 'btn-primary' : ''}`} onClick={() => setLang('en')}>EN</button>
            </div>
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost">
                {t.app.theme.light}
              </div>
              <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                <li><a onClick={() => setTheme('light')}>Light</a></li>
                <li><a onClick={() => setTheme('dark')}>Dark</a></li>
                <li><a onClick={() => setTheme('cupcake')}>Cupcake</a></li>
                <li><a onClick={() => setTheme('bumblebee')}>Bumblebee</a></li>
                <li><a onClick={() => setTheme('emerald')}>Emerald</a></li>
                <li><a onClick={() => setTheme('corporate')}>Corporate</a></li>
                <li><a onClick={() => setTheme('synthwave')}>Synthwave</a></li>
                <li><a onClick={() => setTheme('retro')}>Retro</a></li>
                <li><a onClick={() => setTheme('cyberpunk')}>Cyberpunk</a></li>
                <li><a onClick={() => setTheme('valentine')}>Valentine</a></li>
                <li><a onClick={() => setTheme('halloween')}>Halloween</a></li>
                <li><a onClick={() => setTheme('garden')}>Garden</a></li>
                <li><a onClick={() => setTheme('forest')}>Forest</a></li>
                <li><a onClick={() => setTheme('aqua')}>Aqua</a></li>
                <li><a onClick={() => setTheme('lofi')}>Lofi</a></li>
                <li><a onClick={() => setTheme('pastel')}>Pastel</a></li>
                <li><a onClick={() => setTheme('fantasy')}>Fantasy</a></li>
                <li><a onClick={() => setTheme('wireframe')}>Wireframe</a></li>
                <li><a onClick={() => setTheme('black')}>Black</a></li>
                <li><a onClick={() => setTheme('luxury')}>Luxury</a></li>
                <li><a onClick={() => setTheme('dracula')}>Dracula</a></li>
                <li><a onClick={() => setTheme('cmyk')}>CMYK</a></li>
                <li><a onClick={() => setTheme('autumn')}>Autumn</a></li>
                <li><a onClick={() => setTheme('business')}>Business</a></li>
                <li><a onClick={() => setTheme('acid')}>Acid</a></li>
                <li><a onClick={() => setTheme('lemonade')}>Lemonade</a></li>
                <li><a onClick={() => setTheme('night')}>Night</a></li>
                <li><a onClick={() => setTheme('coffee')}>Coffee</a></li>
                <li><a onClick={() => setTheme('winter')}>Winter</a></li>
                <li><a onClick={() => setTheme('customDark')}>Custom Dark</a></li>
              </ul>
            </div>
            <a className="btn btn-ghost btn-circle" href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub">
              <FaGithub className="h-5 w-5" />
            </a>
            <a className="btn btn-ghost btn-circle" href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter">
              <FaTwitter className="h-5 w-5" />
            </a>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="space-y-12">
        {/* Silence Remover Section */}
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
            <FaCut className="text-primary" />
            <span>{t.app.tools.silenceRemover.title}</span>
          </h2>
          <SilenceRemover />
        </section>

        <div className="divider"></div>

        {/* CPM Calculator Section */}
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
            <FaCalculator className="text-primary" />
            <span>{t.app.tools.cpmCalculator.title}</span>
          </h2>
          <CpmCalculator />
        </section>

        <div className="divider"></div>

        {/* Thumbnail Downloader Section */}
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
            <FaImage className="text-primary" />
            <span>{t.app.tools.thumbnailDownloader.title}</span>
          </h2>
          <ThumbnailDownloader />
        </section>

        <div className="divider"></div>

        {/* Thumbnail Previewer Section */}
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
            <FaPhotoVideo className="text-primary" />
            <span>{t.app.tools.thumbnailPreviewer.title}</span>
          </h2>
          <ThumbnailPreviewer />
        </section>

        <div className="divider"></div>

        {/* Hashtag Generator Section */}
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
            <FaTags className="text-primary" />
            <span>{t.app.tools.hashtagGenerator.title}</span>
          </h2>
          <HashtagGenerator lang={lang} />
        </section>

        <div className="divider"></div>

        {/* Color Palette Generator Section */}
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
            <FaPalette className="text-primary" />
            <span>{t.app.tools.colorPaletteGenerator.title}</span>
          </h2>
          <ColorPaletteGenerator />
        </section>
        </div>
      </main>

      <footer className="footer footer-center p-4 bg-base-200 text-base-content">
        <div>
          <p>Copyright © 2024 - All right reserved by YouCreator Tools</p>
        </div>
      </footer>
    </div>
  )
}

export default App
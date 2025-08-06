import React, { useEffect, useMemo, useState } from 'react';
import { FaCalculator, FaCut, FaGithub, FaImage, FaTwitter } from 'react-icons/fa';
import CpmCalculator from './features/cpm-calculator/CpmCalculator';
import SilenceRemover from './features/silence-remover/SilenceRemover';
import ThumbnailDownloader from './features/thumbnail-downloader/ThumbnailDownloader';
import ar from './locales/ar.json';
import en from './locales/en.json';

type Lang = 'ar' | 'en';
type Theme = 'customDark';

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
      html.setAttribute('data-theme', 'customDark');
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
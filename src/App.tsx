import React, { useEffect, useMemo, useState } from 'react';
import { FaCut, FaGithub, FaTwitter } from 'react-icons/fa';
import SilenceRemover from './features/silence-remover/SilenceRemover';
import ar from './locales/ar.json';
import en from './locales/en.json';

type Lang = 'ar' | 'en';
type Theme = 'light' | 'dark';

function App() {
  const [activeTab, setActiveTab] = useState<'silence' | 'demo'>('silence');
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem('lang') as Lang) || 'ar');
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'light');

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
      html.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
    }
  }, [theme]);

  return (
    <div className="p-4">
      <div className="navbar bg-base-100 rounded-box mb-6 shadow-sm">
        <div className="flex-1">
          <span className="btn btn-ghost text-xl">{t.app.title}</span>
        </div>
        <div className="flex-none gap-2 pe-2">
          <div className="join hidden sm:inline-flex">
            <button className={`btn btn-sm join-item ${lang === 'ar' ? 'btn-active' : ''}`} onClick={() => setLang('ar')}>AR</button>
            <button className={`btn btn-sm join-item ${lang === 'en' ? 'btn-active' : ''}`} onClick={() => setLang('en')}>EN</button>
          </div>
          <select
            className="select select-sm select-bordered"
            value={theme}
            onChange={(e) => setTheme(e.target.value as Theme)}
            aria-label="Theme"
          >
            <option value="light">{t.app.theme.light}</option>
            <option value="dark">{t.app.theme.dark}</option>
          </select>
          <a className="btn btn-ghost btn-sm" href="https://github.com" target="_blank" rel="noreferrer">
            <FaGithub />
          </a>
          <a className="btn btn-ghost btn-sm" href="https://twitter.com" target="_blank" rel="noreferrer">
            <FaTwitter />
          </a>
        </div>
      </div>

      <div role="tablist" className="tabs tabs-boxed">
        <button role="tab" className={`tab ${activeTab === 'silence' ? 'tab-active' : ''}`} onClick={() => setActiveTab('silence')}>
          <span className="inline-flex items-center gap-2"><FaCut /> {t.app.tabs.silence}</span>
        </button>
        <button role="tab" className={`tab ${activeTab === 'demo' ? 'tab-active' : ''}`} onClick={() => setActiveTab('demo')}>
          {t.app.tabs.demo}
        </button>
      </div>

      <div className="mt-6">
        {activeTab === 'silence' ? (
          <SilenceRemover />
        ) : (
          <div className="card w-full bg-base-100 shadow">
            <div className="card-body">
              <h2 className="card-title">Demo Section</h2>
              <p>This is a placeholder demo. Switch back to the Silence Remover tab to use the tool.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
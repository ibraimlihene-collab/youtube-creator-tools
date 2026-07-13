import React, { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Github,
  Languages,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Sun,
  X,
  Home,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TOOLS, CATEGORY_META, type ToolCategory } from '../../lib/tools';

const AppLayout: React.FC = () => {
  const { t, theme, toggleTheme, toggleLang, lang } = useApp();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const categories: ToolCategory[] = ['editing', 'thumbnails', 'ai', 'growth'];
    return categories
      .map((cat) => {
        const items = TOOLS.filter((tool) => {
          if (tool.category !== cat) return false;
          if (!q) return true;
          const title = t.app.tools[tool.id]?.title?.toLowerCase() || tool.id;
          return title.includes(q) || tool.id.toLowerCase().includes(q);
        });
        return { cat, items };
      })
      .filter((g) => g.items.length > 0);
  }, [query, t]);

  const SidebarContent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-5 border-b border-base-300">
        <Link to="/" className="flex items-center gap-3 min-w-0 group">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md ring-1 ring-base-300 shrink-0">
            <img
              src="/assets/youtube-creator-icon.png"
              alt="YouCreator Tools"
              className="w-full h-full object-cover"
            />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="font-bold text-base truncate group-hover:text-primary transition-colors">
                {t.app.title}
              </div>
              <div className="text-[11px] text-base-content/50 truncate">
                {t.app.subtitle || 'Creator studio'}
              </div>
            </div>
          )}
        </Link>
        <button
          type="button"
          className="btn btn-ghost btn-sm btn-circle ms-auto hidden lg:inline-flex"
          onClick={() => setCollapsed((c) => !c)}
          aria-label="Toggle sidebar"
        >
          {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm btn-circle ms-auto lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {!collapsed && (
        <div className="px-3 pt-4">
          <label className="input input-sm input-bordered bg-base-200 border-base-300 flex items-center gap-2">
            <Search className="w-4 h-4 opacity-50" />
            <input
              type="search"
              className="grow bg-transparent outline-none"
              placeholder={t.app.searchTools || 'Search tools…'}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        <Link
          to="/"
          className={`sidebar-link ${location.pathname === '/' ? 'sidebar-link-active' : 'sidebar-link-idle'}`}
        >
          <Home className="w-4 h-4 shrink-0" />
          {!collapsed && <span>{t.app.home || 'Home'}</span>}
        </Link>

        {grouped.map(({ cat, items }) => {
          const CatIcon = CATEGORY_META[cat].icon;
          return (
            <div key={cat}>
              {!collapsed && (
                <div className="flex items-center gap-2 px-2 mb-2 text-[11px] uppercase tracking-wider text-base-content/45 font-semibold">
                  <CatIcon className="w-3.5 h-3.5" />
                  {t.app.categories?.[cat] || cat}
                </div>
              )}
              <ul className="space-y-1">
                {items.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <li key={tool.id}>
                      <NavLink
                        to={tool.path}
                        className={({ isActive }) =>
                          `sidebar-link ${isActive ? 'sidebar-link-active' : 'sidebar-link-idle'}`
                        }
                        title={t.app.tools[tool.id]?.title || tool.id}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        {!collapsed && (
                          <>
                            <span className="truncate flex-1 text-start">
                              {t.app.tools[tool.id]?.title || tool.id}
                            </span>
                            {tool.badge === 'ai' && (
                              <span className="badge-ai text-[10px]">AI</span>
                            )}
                            {tool.badge === 'local' && (
                              <span className="badge-local text-[10px]">Local</span>
                            )}
                          </>
                        )}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-base-300 p-3 space-y-2">
        <div className={`flex ${collapsed ? 'flex-col' : 'flex-row'} items-center justify-center gap-1`}>
          <a
            href="https://github.com/ibraimlihene-collab/youtube-creator-tools"
            target="_blank"
            rel="noreferrer"
            className="btn btn-ghost btn-sm btn-circle"
            title="GitHub"
          >
            <Github className="w-4 h-4" />
          </a>
          <button
            type="button"
            onClick={toggleTheme}
            className="btn btn-ghost btn-sm btn-circle"
            title={t.app.theme?.toggle || 'Toggle theme'}
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={toggleLang}
            className="btn btn-ghost btn-sm btn-circle"
            title={lang === 'ar' ? 'English' : 'العربية'}
          >
            <Languages className="w-4 h-4" />
          </button>
        </div>
        {!collapsed && (
          <p className="text-[10px] text-center text-base-content/40 px-2">
            {t.app.privacyNote || 'Private by default · Runs in your browser'}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-base-100 text-base-content flex">
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col border-e border-base-300 bg-base-200/60 backdrop-blur-xl sticky top-0 h-screen transition-all duration-200 ${
          collapsed ? 'w-[72px]' : 'w-72'
        }`}
      >
        {SidebarContent}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 start-0 w-[86%] max-w-xs bg-base-200 border-e border-base-300 shadow-2xl animate-fade-in">
            {SidebarContent}
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="lg:hidden sticky top-0 z-40 bg-base-100/90 backdrop-blur-md border-b border-base-300 px-3 py-2.5 flex items-center gap-3 safe-bottom">
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-square"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link to="/" className="flex items-center gap-2 min-w-0">
            <img
              src="/assets/youtube-creator-icon.png"
              alt=""
              className="w-8 h-8 rounded-lg object-cover"
            />
            <span className="font-semibold truncate">{t.app.title}</span>
          </Link>
          <div className="ms-auto flex items-center gap-1">
            <button type="button" onClick={toggleTheme} className="btn btn-ghost btn-sm btn-circle">
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
            <button type="button" onClick={toggleLang} className="btn btn-ghost btn-sm btn-circle">
              <Languages className="w-4 h-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;

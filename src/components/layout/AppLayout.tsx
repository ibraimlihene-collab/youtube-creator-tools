import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  LayoutDashboard,
  BookOpen,
  Youtube,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TOOLS, CATEGORY_META, ALL_CATEGORIES, TOOL_COUNT } from '../../lib/tools';

const AppLayout: React.FC = () => {
  const { theme, toggleTheme, toggleLang, lang } = useApp();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [query, setQuery] = useState('');
  const menuButton = useRef<HTMLButtonElement>(null);
  const drawer = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!mobileOpen) return;
    const opener = menuButton.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusable = () =>
      Array.from(drawer.current?.querySelectorAll<HTMLElement>('a, button, input') || []).filter(
        (el) => el.getClientRects().length > 0
      );
    focusable()[0]?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false);
      if (event.key === 'Tab') {
        const items = focusable();
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
      opener?.focus();
    };
  }, [mobileOpen]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ALL_CATEGORIES.map((cat) => {
      const items = TOOLS.filter((tool) => {
        if (tool.category !== cat) return false;
        if (!q) return true;
        const title = (lang === 'ar' ? tool.titleAr : tool.titleEn).toLowerCase();
        return `${title} ${tool.descEn} ${tool.descAr} ${tool.id}`.toLowerCase().includes(q);
      });
      return { cat, items };
    }).filter((g) => g.items.length > 0);
  }, [query, lang]);

  const catLabel = (cat: keyof typeof CATEGORY_META) =>
    lang === 'ar' ? CATEGORY_META[cat].labelAr : CATEGORY_META[cat].labelEn;

  const SidebarContent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-5 border-b border-base-300">
        <Link to="/" className="flex items-center gap-3 min-w-0 group">
          <span className="brand-mark">
            <Youtube size={23} />
          </span>
          {!collapsed && (
            <div className="min-w-0">
              <div className="font-bold text-base truncate group-hover:text-primary transition-colors">
                YouCreator
              </div>
              <div className="text-[11px] text-base-content/50 truncate">
                {TOOL_COUNT} {lang === 'ar' ? 'أداة' : 'tools'}
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
          {collapsed ? (
            <PanelLeftOpen className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
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
              aria-label={lang === 'ar' ? 'ابحث عن أداة' : 'Search tools'}
              placeholder={lang === 'ar' ? 'ابحث عن أداة…' : 'Search tools…'}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        </div>
      )}

      <nav
        aria-label={lang === 'ar' ? 'أدوات الاستوديو' : 'Studio tools'}
        className="flex-1 overflow-y-auto px-3 py-4 space-y-5"
      >
        <Link
          to="/app"
          title={lang === 'ar' ? 'الاستوديو' : 'Studio'}
          className={`sidebar-link ${location.pathname === '/app' ? 'sidebar-link-active' : 'sidebar-link-idle'}`}
        >
          <Home className="w-4 h-4 shrink-0" />
          {!collapsed && <span>{lang === 'ar' ? 'الاستوديو' : 'Studio'}</span>}
        </Link>
        <Link
          to="/dashboard"
          title={lang === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
          className={`sidebar-link ${location.pathname === '/dashboard' ? 'sidebar-link-active' : 'sidebar-link-idle'}`}
        >
          <LayoutDashboard className="w-4 h-4 shrink-0" />
          {!collapsed && <span>{lang === 'ar' ? 'لوحة التحكم' : 'Dashboard'}</span>}
        </Link>
        <Link
          to="/articles"
          title={lang === 'ar' ? 'المقالات' : 'Articles'}
          className={`sidebar-link ${location.pathname.startsWith('/articles') ? 'sidebar-link-active' : 'sidebar-link-idle'}`}
        >
          <BookOpen className="w-4 h-4 shrink-0" />
          {!collapsed && <span>{lang === 'ar' ? 'المقالات' : 'Articles'}</span>}
        </Link>

        {!collapsed && grouped.length === 0 && (
          <p className="text-sm px-2 text-base-content/60" role="status">
            {lang === 'ar' ? 'لا توجد أدوات مطابقة.' : 'No matching tools. Try another keyword.'}
          </p>
        )}
        {grouped.map(({ cat, items }) => {
          const CatIcon = CATEGORY_META[cat].icon;
          return (
            <div key={cat}>
              {!collapsed && (
                <div className="flex items-center gap-2 px-2 mb-2 text-[11px] uppercase tracking-wider text-base-content/45 font-semibold">
                  <CatIcon className="w-3.5 h-3.5" />
                  {catLabel(cat)}
                </div>
              )}
              <ul className="space-y-1">
                {items.map((tool) => {
                  const Icon = tool.icon;
                  const title = lang === 'ar' ? tool.titleAr : tool.titleEn;
                  return (
                    <li key={tool.id}>
                      <NavLink
                        to={tool.path}
                        className={({ isActive }) =>
                          `sidebar-link ${isActive ? 'sidebar-link-active' : 'sidebar-link-idle'}`
                        }
                        title={title}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        {!collapsed && (
                          <>
                            <span className="truncate flex-1 text-start">{title}</span>
                            {(tool.badge === 'ai' || tool.kind === 'ai') && (
                              <span className="badge-ai text-[10px]">AI</span>
                            )}
                            {(tool.badge === 'local' || tool.kind === 'local') && (
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
        <div
          className={`flex ${collapsed ? 'flex-col' : 'flex-row'} items-center justify-center gap-1`}
        >
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
            title="Theme"
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
            {lang === 'ar' ? 'مساحة لفكرتك القادمة' : 'A little help for your next big idea'}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-base-100 text-base-content flex">
      <a href="#studio-content" className="skip-link">
        {lang === 'ar' ? 'انتقل للمحتوى' : 'Skip to content'}
      </a>
      <aside
        className={`hidden lg:flex flex-col border-e border-base-300 bg-base-200/60 backdrop-blur-xl sticky top-0 h-screen transition-all duration-200 ${
          collapsed ? 'w-[72px]' : 'w-72'
        }`}
      >
        {SidebarContent}
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside
            ref={drawer}
            role="dialog"
            aria-modal="true"
            aria-label={lang === 'ar' ? 'قائمة الأدوات' : 'Tools menu'}
            id="mobile-tools-menu"
            className="relative w-80 max-w-[85vw] h-full bg-base-200 border-e border-base-300 flex flex-col z-10"
          >
            {SidebarContent}
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden sticky top-0 z-30 flex items-center gap-3 px-3 py-3 border-b border-base-300 bg-base-100/90 backdrop-blur-xl">
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-circle"
            onClick={() => setMobileOpen(true)}
            ref={menuButton}
            aria-expanded={mobileOpen}
            aria-controls="mobile-tools-menu"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold truncate">YouCreator Tools</span>
        </header>
        <main
          id="studio-content"
          tabIndex={-1}
          className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;

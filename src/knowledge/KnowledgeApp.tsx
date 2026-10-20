import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Orbit,
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  Network,
  Library,
  Target,
  FolderKanban,
  Languages,
  Telescope,
  NotebookPen,
  Layers,
  ChartNoAxesColumn,
  Sparkles,
  Settings2,
  Inbox,
  Search,
  Plus,
  Command,
  Menu,
  ShieldCheck,
  ChevronDown,
  Sun,
  Moon,
  CheckCircle2,
} from 'lucide-react';
import { KnowledgeContext } from './context';
import { loadWorkspace, saveWorkspace } from './storage';
import {
  makeEntry,
  removeEntry,
  scienceSubjects,
  today,
  type Workspace,
  type Entry,
  type Kind,
} from './model';
import { translator } from './i18n';
import { defaultKind } from './config';
import Dashboard from './Dashboard';
import { Collection, Planner, DomainExplorer, Flashcards, Analytics } from './Pages';
import Settings, { Assistant } from './Settings';
import { Editor, EntryDetail } from './Editor';
import { installSchoolPack } from './schoolPack';
import SchoolWeek from './SchoolWeek';
import AuxChamps from './AuxChamps';
import './knowledge.css';
import './school.css';
const groups = [
  [
    'overview',
    [
      ['dashboard', LayoutDashboard],
      ['inbox', Inbox],
      ['planner', CalendarDays],
    ],
  ],
  [
    'learning',
    [
      ['school', BookOpen],
      ['knowledge', BookOpen],
      ['education', Library],
      ['domains', Network],
      ['resources', Library],
      ['languages', Languages],
      ['flashcards', Layers],
    ],
  ],
  [
    'creating',
    [
      ['goals', Target],
      ['projects', FolderKanban],
      ['research', Telescope],
    ],
  ],
  [
    'personal',
    [
      ['journal', NotebookPen],
      ['analytics', ChartNoAxesColumn],
      ['assistant', Sparkles],
    ],
  ],
] as const;
export default function KnowledgeApp() {
  const [data, setData] = useState<Workspace | null>(null);
  const stateRef = useRef<Workspace | null>(null);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [editor, setEditor] = useState<Entry | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef<HTMLInputElement>(null);
  const pageFromPath = location.pathname.split('/')[2] || 'dashboard';
  const validPages = [
    'dashboard',
    'school',
    'reading',
    'inbox',
    'planner',
    'knowledge',
    'education',
    'domains',
    'resources',
    'languages',
    'flashcards',
    'goals',
    'projects',
    'research',
    'journal',
    'analytics',
    'assistant',
    'settings',
    'search',
  ];
  const page = validPages.includes(pageFromPath) ? pageFromPath : 'dashboard';
  const t = translator(data?.settings.language || 'ar');
  const loadingRef = useRef(false);
  const load = useCallback(() => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setError('');
    loadWorkspace()
      .then(async (value) => {
        const prepared = installSchoolPack(value);
        const saved = prepared === value ? value : await saveWorkspace(prepared, value.revision);
        stateRef.current = saved;
        setData(saved);
      })
      .catch((e) => setError(e.message || 'storageError'))
      .finally(() => {
        loadingRef.current = false;
      });
  }, []);
  useEffect(load, [load]);
  useEffect(() => {
    if (!data) return;
    const html = document.documentElement;
    html.lang = data.settings.language;
    html.dir = data.settings.language === 'ar' ? 'rtl' : 'ltr';
    html.dataset.theme = data.settings.theme;
    html.classList.add('uko-document');
    document.title = `${t(page === 'search' ? 'searchTitle' : page)} · UNIVERSAL KNOWLEDGE OS`;
    return () => html.classList.remove('uko-document');
  }, [data, page, t]);
  useEffect(() => {
    setMobile(false);
    window.scrollTo({ top: 0 });
  }, [location.pathname]);
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === 'Escape') setMobile(false);
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 4500);
    return () => window.clearTimeout(timer);
  }, [toast]);
  async function commit(next: Workspace): Promise<boolean> {
    if (busyRef.current || !stateRef.current) return false;
    busyRef.current = true;
    setBusy(true);
    setError('');
    try {
      const saved = await saveWorkspace(next, stateRef.current.revision);
      stateRef.current = saved;
      setData(saved);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'storageError');
      return false;
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }
  function create(kind: Kind, fields: Record<string, string> = {}, links: string[] = []) {
    const state = stateRef.current!;
    const language =
      kind === 'lesson' && scienceSubjects.includes(fields.subject)
        ? 'fr'
        : kind === 'vocabulary'
          ? 'en'
          : state.settings.language;
    const entry = makeEntry(kind, language);
    entry.fields = { ...fields };
    entry.links = links;
    if (['flashcard', 'vocabulary', 'lesson', 'subject'].includes(kind))
      entry.fields.explanationLanguage = state.settings.explanation;
    if (['session', 'review', 'journal'].includes(kind) && !entry.fields.date)
      entry.fields.date = today();
    setDetailId(null);
    setEditor(entry);
  }
  async function update(entry: Entry) {
    const current = stateRef.current!;
    return commit({
      ...current,
      records: current.records.some((e) => e.id === entry.id)
        ? current.records.map((e) => (e.id === entry.id ? entry : e))
        : [...current.records, entry],
    });
  }
  async function remove(id: string) {
    return commit(removeEntry(stateRef.current!, id));
  }
  if (!data)
    return (
      <div className="uko-boot" dir="rtl">
        <Orbit size={40} />
        <h1>كون المعرفة</h1>
        <p role={error ? 'alert' : 'status'}>{t(error || 'loading')}</p>
        {error && (
          <button className="uko-button" onClick={load}>
            {t('retry')}
          </button>
        )}
      </div>
    );
  const selected = data.records.find((e) => e.id === detailId);
  const title = t(page === 'search' ? 'searchTitle' : page);
  return (
    <KnowledgeContext.Provider
      value={{
        data,
        t,
        busy,
        commit,
        create,
        edit: setEditor,
        inspect: (e) => {
          setEditor(null);
          setDetailId(e.id);
        },
        update,
        remove,
        notify: setToast,
      }}
    >
      <div
        className={`uko-app ${data.settings.theme}`}
        dir={data.settings.language === 'ar' ? 'rtl' : 'ltr'}
        data-testid="knowledge-app"
        lang={data.settings.language}
      >
        <a href="#uko-main" className="uko-skip-link">
          {t('todayActions')}
        </a>
        {mobile && (
          <button
            className="uko-sidebar-backdrop"
            aria-label={t('close')}
            onClick={() => setMobile(false)}
          />
        )}
        <aside className={`uko-sidebar ${mobile ? 'open' : ''}`} aria-label={t('menu')}>
          <Link className="uko-brand" to="/knowledge">
            <span className="uko-logo">
              <Orbit size={27} strokeWidth={1.5} />
            </span>
            <span>
              <strong>{t('appName')}</strong>
              <small>UNIVERSAL KNOWLEDGE OS</small>
            </span>
          </Link>
          <div className="uko-workspace-label">
            <span className="uko-workspace-avatar">
              <LeafMark />
            </span>
            <div>
              <strong>{t('workspace')}</strong>
              <small>{t('appSubtitle')}</small>
            </div>
            <ShieldCheck size={16} />
          </div>
          <nav>
            {groups.map(([label, items]) => (
              <div className="uko-nav-group" key={label}>
                <p>{t(label)}</p>
                {items.map(([id, Icon]) => (
                  <NavLink
                    key={id}
                    to={id === 'dashboard' ? '/knowledge' : `/knowledge/${id}`}
                    end
                    className={({ isActive }) =>
                      `uko-nav-link ${isActive || id === page ? 'active' : ''}`
                    }
                  >
                    <Icon size={18} strokeWidth={1.7} />
                    <span>{t(id)}</span>
                    {id === 'inbox' && data.records.some((e) => e.status === 'inbox') && (
                      <small>{data.records.filter((e) => e.status === 'inbox').length}</small>
                    )}
                    {id === 'assistant' && <span className="uko-nav-spark">✧</span>}
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>
          <div className="uko-sidebar-bottom">
            <NavLink
              to="/knowledge/settings"
              className={`uko-nav-link ${page === 'settings' ? 'active' : ''}`}
            >
              <Settings2 size={18} />
              <span>{t('settings')}</span>
            </NavLink>
            <div className="uko-sidebar-controls">
              <button
                className="uko-language-switch"
                data-testid="language-switch"
                disabled={busy}
                onClick={() =>
                  commit({
                    ...data,
                    settings: {
                      ...data.settings,
                      language: data.settings.language === 'ar' ? 'fr' : 'ar',
                    },
                  })
                }
              >
                <Languages size={17} />
                {data.settings.language === 'ar' ? 'Français' : 'العربية'}
                <ChevronDown size={13} />
              </button>
              <button
                className="uko-icon-button"
                disabled={busy}
                aria-label={t(data.settings.theme === 'light' ? 'dark' : 'light')}
                data-testid="theme-switch"
                onClick={() =>
                  commit({
                    ...data,
                    settings: {
                      ...data.settings,
                      theme: data.settings.theme === 'light' ? 'dark' : 'light',
                    },
                  })
                }
              >
                {data.settings.theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
              </button>
            </div>
            <div className="uko-local-label">
              <span />
              {t('privateLocal')}
            </div>
          </div>
        </aside>
        <div className="uko-main-wrap">
          <header className="uko-topbar">
            <div className="uko-breadcrumb">
              <button
                className="uko-icon-button uko-mobile-only"
                aria-label={t('menu')}
                onClick={() => setMobile(true)}
              >
                <Menu size={21} />
              </button>
              <span>{t('workspace')}</span>
              <span className="uko-crumb-slash">/</span>
              <strong>{title}</strong>
            </div>
            <div className="uko-top-actions">
              <form
                className="uko-global-search"
                onSubmit={(e) => {
                  e.preventDefault();
                  navigate(`/knowledge/search?q=${encodeURIComponent(search)}`);
                }}
              >
                <Search size={17} />
                <input
                  ref={searchRef}
                  aria-label={t('search')}
                  placeholder={t('search')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <kbd>
                  <Command size={10} /> K
                </kbd>
              </form>
              <button
                className="uko-capture"
                data-testid="quick-capture"
                onClick={() => create('note')}
              >
                <Plus size={17} />
                <span>{t('quickCapture')}</span>
              </button>
              <Link to="/knowledge/settings" className="uko-avatar" aria-label={t('profile')}>
                {data.profile.name?.slice(0, 1) || <UserMark />}
              </Link>
            </div>
          </header>
          <main id="uko-main" className="uko-main" tabIndex={-1}>
            <div className="uko-page-heading">
              <div>
                <span className="uko-kicker">
                  {page === 'dashboard' ? t('todayFocus') : t('workspace')}
                </span>
                <h1>
                  {title}
                  <span className="uko-heading-dot">.</span>
                </h1>
                <p>{t(page === 'search' ? 'searchHint' : `${page}Sub`)}</p>
              </div>
              <div className="uko-page-heading-right">
                <span className="uko-save-status" role="status">
                  <span className={error ? 'error' : ''} />
                  {t(error ? 'storageError' : busy ? 'saving' : 'saved')}
                </span>
                {['dashboard', 'education'].includes(page) && (
                  <Link className="uko-button secondary" to="/knowledge/school">
                    {t('school')}
                  </Link>
                )}
                {!['dashboard', 'settings', 'assistant', 'school', 'reading'].includes(page) && (
                  <button
                    className="uko-button"
                    onClick={() => create(defaultKind[page] || 'note')}
                  >
                    <Plus size={17} />
                    {t('create')}
                  </button>
                )}
              </div>
            </div>
            {error && (
              <div className="uko-error uko-global-error" role="alert">
                {t(error)}
                {error === 'tabConflict' && (
                  <button className="uko-text-button" onClick={() => window.location.reload()}>
                    {t('retry')}
                  </button>
                )}
              </div>
            )}
            {page === 'dashboard' ? (
              <Dashboard />
            ) : page === 'school' ? (
              <SchoolWeek />
            ) : page === 'reading' ? (
              <AuxChamps />
            ) : page === 'settings' ? (
              <Settings />
            ) : page === 'assistant' ? (
              <Assistant />
            ) : page === 'planner' ? (
              <Planner />
            ) : page === 'domains' ? (
              <DomainExplorer />
            ) : page === 'flashcards' ? (
              <Flashcards />
            ) : page === 'analytics' ? (
              <Analytics />
            ) : (
              <Collection page={page} global={page === 'search'} key={page} />
            )}
            <footer className="uko-main-footer">
              <span>
                <Orbit size={15} /> UNIVERSAL KNOWLEDGE OS
              </span>
              <span>
                {t('beginner')} <span>✧</span>
              </span>
            </footer>
          </main>
        </div>
        {editor && <Editor key={editor.id} initial={editor} onClose={() => setEditor(null)} />}{' '}
        {selected && !editor && (
          <EntryDetail key={selected.id} entry={selected} onClose={() => setDetailId(null)} />
        )}{' '}
        {toast && (
          <div className="uko-toast" role="status">
            <CheckCircle2 size={18} />
            {toast}
          </div>
        )}
      </div>
    </KnowledgeContext.Provider>
  );
}
function LeafMark() {
  return <span aria-hidden="true">✳</span>;
}
function UserMark() {
  return <span aria-hidden="true">○</span>;
}

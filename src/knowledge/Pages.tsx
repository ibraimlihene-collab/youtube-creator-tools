import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Plus,
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  ArrowUpRight,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  BookOpen,
  Network,
  X,
  Layers,
  Check,
  Eye,
  Sparkles,
} from 'lucide-react';
import { useKnowledge } from './context';
import { Empty, EntryRow } from './Dashboard';
import { pageKinds, defaultKind } from './config';
import { domains } from './i18n';
import {
  searchEntries,
  statuses,
  kinds,
  evidenceLevels,
  subjectDefs,
  today,
  addDays,
  stats,
  reviewCard,
  scienceSubjects,
  type Entry,
} from './model';

export function Collection({ page, global = false }: { page: string; global?: boolean }) {
  const { data, t, create, inspect, update } = useKnowledge();
  const [params, setParams] = useSearchParams();
  const [localQuery, setLocalQuery] = useState('');
  const query = global ? params.get('q') || '' : localQuery;
  const setQuery = (value: string) => {
    if (global) setParams({ q: value }, { replace: true });
    else setLocalQuery(value);
  };
  const [kind, setKind] = useState('');
  const [status, setStatus] = useState('');
  const [language, setLanguage] = useState('');
  const [subject, setSubject] = useState('');
  const [domain, setDomain] = useState('');
  const [evidence, setEvidence] = useState('');
  const [tag, setTag] = useState('');
  const [after, setAfter] = useState('');
  const [sort, setSort] = useState('newest');
  const [filters, setFilters] = useState(false);
  const [board, setBoard] = useState(false);
  const [graph, setGraph] = useState(false);
  const permitted = global ? [...kinds] : pageKinds[page] || [...kinds];
  const base = data.records.filter(
    (e) =>
      permitted.includes(e.kind) &&
      (page !== 'inbox' || e.status === 'inbox') &&
      (page !== 'languages' || e.kind !== 'session' || !scienceSubjects.includes(e.fields.subject)),
  );
  const entries = searchEntries(base, query)
    .filter(
      (e) =>
        (!kind || e.kind === kind) &&
        (!status || e.status === status) &&
        (!language || e.language === language) &&
        (!subject || e.fields.subject === subject) &&
        (!domain || e.fields.domain === domain) &&
        (!evidence || e.fields.evidence === evidence) &&
        (!tag || e.tags.includes(tag)) &&
        (!after || e.createdAt.slice(0, 10) >= after),
    )
    .sort((a, b) =>
      sort === 'newest'
        ? b.updatedAt.localeCompare(a.updatedAt)
        : (a.fields.date || a.fields.reviewDate || '9999').localeCompare(
            b.fields.date || b.fields.reviewDate || '9999',
          ),
    );
  const simpleSelect = (
    label: string,
    value: string,
    onChange: (value: string) => void,
    options: [string, string][],
  ) => (
    <label>
      {t(label)}
      <select aria-label={t(label)} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{t('all')}</option>
        {options.map(([v, text]) => (
          <option key={v} value={v}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );
  return (
    <div data-testid={`page-${page}`}>
      {page === 'education' && (
        <>
          <div className="uko-context-banner">
            <BookOpen size={20} />
            <div>
              <strong dir="ltr">
                {data.profile.level} · {data.profile.track}
              </strong>
              <p>{t('subjectHelp')}</p>
            </div>
            <Link to="/knowledge/settings">{t('edit')}</Link>
          </div>
          <div className="uko-subjects">
            {[
              ...subjectDefs.map(([id, name]) => ({ id, name })),
              ...data.records
                .filter((e) => e.kind === 'subject')
                .map((e) => ({ id: e.id, name: e.title })),
            ].map((s, i) => (
              <button
                key={s.id}
                className={subject === s.id ? 'selected' : ''}
                onClick={() => setSubject(subject === s.id ? '' : s.id)}
              >
                <span>{['∑', '⚛', 'H₂', '◈', 'Aa', 'É', 'ض', '☼', '⌛', '◎'][i % 10]}</span>
                <strong dir="auto">{s.name}</strong>
                <small>
                  {
                    data.records.filter((e) => e.fields.subject === s.id && e.kind === 'lesson')
                      .length
                  }{' '}
                  {t('lesson')}
                </small>
              </button>
            ))}
          </div>
          <p className="uko-info">
            {t('scienceHelp')}
            <br />
            {t('studyWorkflow')}
          </p>
        </>
      )}
      {['research', 'languages', 'journal', 'resources'].includes(page) && (
        <p className="uko-info">
          {t(
            page === 'research'
              ? 'researchHelp'
              : page === 'languages'
                ? 'languageHelp'
                : page === 'journal'
                  ? 'journalHelp'
                  : 'resourceReflection',
          )}
          {page === 'research' && ` ${t('webUnavailable')}`}
        </p>
      )}
      <div className="uko-toolbar">
        <div className="uko-local-search">
          <Search size={17} />
          <input
            data-testid="collection-search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
            }}
            placeholder={t('search')}
            aria-label={t('search')}
          />
        </div>
        <div className="uko-actions">
          <button
            className={`uko-button secondary ${filters ? 'selected' : ''}`}
            onClick={() => setFilters((f) => !f)}
            aria-expanded={filters}
          >
            <SlidersHorizontal size={16} />
            {t('filter')}
          </button>
          {['projects', 'goals', 'knowledge'].includes(page) && (
            <div className="uko-view-toggle">
              <button
                className={!board && !graph ? 'selected' : ''}
                aria-label={t('list')}
                onClick={() => {
                  setBoard(false);
                  setGraph(false);
                }}
              >
                <List size={18} />
              </button>
              <button
                className={board ? 'selected' : ''}
                aria-label={t('board')}
                onClick={() => {
                  setBoard(true);
                  setGraph(false);
                }}
              >
                <LayoutGrid size={18} />
              </button>
              {page === 'knowledge' && (
                <button
                  className={graph ? 'selected' : ''}
                  aria-label={t('connections')}
                  onClick={() => {
                    setGraph(true);
                    setBoard(false);
                  }}
                >
                  <Network size={18} />
                </button>
              )}
            </div>
          )}
          <button
            className="uko-button"
            data-testid="add-entry"
            onClick={() => create(defaultKind[page] || 'note', subject ? { subject } : undefined)}
          >
            <Plus size={17} />
            {t('add')}
          </button>
        </div>
      </div>
      {filters && (
        <div className="uko-filters">
          {simpleSelect(
            'kind',
            kind,
            setKind,
            permitted.map((k) => [k, t(k)]),
          )}
          {simpleSelect(
            'status',
            status,
            setStatus,
            statuses.map((s) => [s, t(s)]),
          )}
          {simpleSelect('language', language, setLanguage, [
            ['ar', t('arabic')],
            ['fr', t('french')],
            ['en', t('english')],
            ['other', t('other')],
          ])}
          {simpleSelect('domain', domain, setDomain, [
            ...domains.map(
              (d) => [d[0], d[data.settings.language === 'ar' ? 1 : 2]] as [string, string],
            ),
            ...data.records
              .filter((e) => e.kind === 'domain')
              .map((e) => [e.id, e.title] as [string, string]),
          ])}
          {simpleSelect(
            'evidence',
            evidence,
            setEvidence,
            evidenceLevels.map((e) => [e, t(e)]),
          )}
          {simpleSelect('subject', subject, setSubject, [
            ...subjectDefs.map(([id, name]) => [id, name] as [string, string]),
            ...data.records
              .filter((e) => e.kind === 'subject')
              .map((e) => [e.id, e.title] as [string, string]),
          ])}
          {simpleSelect(
            'tags',
            tag,
            setTag,
            [...new Set(base.flatMap((e) => e.tags).filter(Boolean))].map((v) => [v, v]),
          )}
          <label>
            {t('created')}
            <input type="date" value={after} onChange={(e) => setAfter(e.target.value)} />
          </label>
          <label>
            {t('sort')}
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="newest">{t('newest')}</option>
              <option value="dueFirst">{t('dueFirst')}</option>
            </select>
          </label>
        </div>
      )}
      <div className="uko-results-heading">
        <span>
          {entries.length} {t('allRecords')}
        </span>
        <div className="uko-tabs">
          <button className={!kind ? 'selected' : ''} onClick={() => setKind('')}>
            {t('all')}
          </button>
          {!global &&
            permitted.slice(0, 5).map((k) => (
              <button key={k} className={kind === k ? 'selected' : ''} onClick={() => setKind(k)}>
                {t(k)}
              </button>
            ))}
        </div>
      </div>
      {graph ? (
        <LinkGraph entries={entries} />
      ) : !entries.length ? (
        <div className="uko-panel">
          <Empty
            title={base.length ? t('noResults') : undefined}
            text={base.length ? t('noResultsText') : undefined}
            action={() => create(defaultKind[page] || 'note')}
          />
        </div>
      ) : board ? (
        <div className="uko-board">
          {statuses
            .filter(
              (s) =>
                ['next', 'active', 'completed'].includes(s) || entries.some((e) => e.status === s),
            )
            .map((s) => (
              <section key={s}>
                <h3>
                  <span className={`uko-board-dot ${s}`} />
                  {t(s)}
                  <small>{entries.filter((e) => e.status === s).length}</small>
                </h3>
                {entries
                  .filter((e) => e.status === s)
                  .map((e) => (
                    <div className="uko-board-card" key={e.id}>
                      <span className="uko-kicker">{t(e.kind)}</span>
                      <button onClick={() => inspect(e)} dir="auto">
                        {e.title}
                      </button>
                      <p dir="auto">
                        {e.fields.nextAction || e.fields.objective || e.content.slice(0, 110)}
                      </p>
                      <select
                        aria-label={`${t('status')}: ${e.title}`}
                        value={e.status}
                        onChange={(event) =>
                          update({
                            ...e,
                            status: event.target.value as Entry['status'],
                            updatedAt: new Date().toISOString(),
                          })
                        }
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>
                            {t(s)}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                <button className="uko-add-row" onClick={() => create(defaultKind[page])}>
                  <Plus size={15} />
                  {t('add')}
                </button>
              </section>
            ))}
        </div>
      ) : (
        <section className="uko-panel uko-record-list">
          {entries.map((e) => (
            <EntryRow
              entry={e}
              key={e.id}
              checkable={['task', 'homework', 'milestone'].includes(e.kind)}
            />
          ))}
        </section>
      )}
    </div>
  );
}
export function LinkGraph({ entries }: { entries: Entry[] }) {
  const { t, inspect } = useKnowledge();
  const connected = entries
    .filter(
      (e) =>
        e.links.some((id) => entries.some((n) => n.id === id)) ||
        entries.some((n) => n.links.includes(e.id)),
    )
    .slice(0, 20);
  if (!connected.length)
    return (
      <section className="uko-panel">
        <Empty title={t('connections')} text={t('noGraph')} />
      </section>
    );
  const points = connected.map((e, i) => ({
    ...e,
    x: 350 + 240 * Math.cos((2 * Math.PI * i) / connected.length),
    y: 210 + 150 * Math.sin((2 * Math.PI * i) / connected.length),
  }));
  return (
    <section className="uko-panel uko-graph">
      <h2>{t('connections')}</h2>
      <svg viewBox="0 0 700 420" role="img" aria-label={t('connections')}>
        {points.flatMap((p) =>
          p.links.map((id) => {
            const target = points.find((n) => n.id === id);
            return (
              target && <line key={`${p.id}-${id}`} x1={p.x} y1={p.y} x2={target.x} y2={target.y} />
            );
          }),
        )}
        {points.map((p) => (
          <g
            key={p.id}
            onClick={() => inspect(p)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                inspect(p);
              }
            }}
            tabIndex={0}
            role="button"
            aria-label={p.title}
          >
            <circle cx={p.x} cy={p.y} r={22} />
            <text x={p.x} y={p.y + 5} textAnchor="middle">
              {p.title.slice(0, 2)}
            </text>
            <text x={p.x} y={p.y + 43} textAnchor="middle" className="uko-node-label">
              {p.title.slice(0, 22)}
            </text>
          </g>
        ))}
      </svg>
    </section>
  );
}
export function DomainExplorer() {
  const { t, data, create } = useKnowledge();
  const [params, setParams] = useSearchParams();
  const selected = params.get('domain');
  const [query, setQuery] = useState('');
  const list = [
    ...domains.map((d) => ({
      id: d[0] as string,
      name: d[data.settings.language === 'ar' ? 1 : 2] as string,
      icon: d[3] as string,
    })),
    ...data.records
      .filter((e) => e.kind === 'domain')
      .map((e) => ({ id: e.id, name: e.title, icon: '◇' })),
  ];
  const current = list.find((d) => d.id === selected);
  return (
    <div data-testid="page-domains">
      <div className="uko-toolbar">
        <div className="uko-local-search">
          <Search size={17} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label={t('search')}
            placeholder={t('search')}
          />
        </div>
        <button className="uko-button" onClick={() => create('domain')}>
          <Plus size={16} />
          {t('domain')}
        </button>
      </div>
      {current ? (
        <section className="uko-panel">
          <div className="uko-section-heading">
            <h2>
              {current.icon} {current.name}
            </h2>
            <button
              className="uko-icon-button"
              onClick={() => setParams({})}
              aria-label={t('close')}
            >
              <X size={19} />
            </button>
          </div>
          {data.records
            .filter((e) => e.fields.domain === current.id)
            .map((e) => (
              <EntryRow key={e.id} entry={e} />
            ))}
          {!data.records.some((e) => e.fields.domain === current.id) && (
            <Empty text={t('noDomain')} />
          )}
          <div className="uko-actions wrap">
            <button
              className="uko-button"
              onClick={() => create('knowledge', { domain: current.id })}
            >
              <Plus size={16} />
              {t('knowledge')}
            </button>
            <button
              className="uko-button secondary"
              onClick={() => create('research', { domain: current.id })}
            >
              {t('question')}
            </button>
            {data.records.some((e) => e.id === current.id) && <DomainEdit id={current.id} />}
          </div>
        </section>
      ) : (
        <div className="uko-domain-grid">
          {list
            .filter(
              (d) =>
                !query ||
                searchEntries(
                  [{ title: d.name, content: '', tags: [], fields: {} } as unknown as Entry],
                  query,
                ).length,
            )
            .map((d, i) => (
              <button
                key={d.id}
                onClick={() => setParams({ domain: d.id })}
                className="uko-domain-card"
              >
                <span className={`uko-domain-symbol color-${i % 4}`}>{d.icon}</span>
                <span className="uko-domain-number">{String(i + 1).padStart(2, '0')}</span>
                <h3>{d.name}</h3>
                <p>
                  {data.records.filter((e) => e.fields.domain === d.id).length} {t('domainCount')}
                </p>
                <ArrowUpRight size={18} />
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
function DomainEdit({ id }: { id: string }) {
  const { data, inspect, t } = useKnowledge();
  return (
    <button
      className="uko-button secondary"
      onClick={() => inspect(data.records.find((e) => e.id === id)!)}
    >
      {t('edit')}
    </button>
  );
}
export function Planner() {
  const { data, t, create } = useKnowledge();
  const [view, setView] = useState('week');
  const [anchor, setAnchor] = useState(today());
  const date = new Date(`${anchor}T12:00:00`);
  const first =
    view === 'day'
      ? anchor
      : view === 'month'
        ? `${anchor.slice(0, 7)}-01`
        : addDays(anchor, -((date.getDay() + 6) % 7));
  const count =
    view === 'day'
      ? 1
      : view === 'month'
        ? new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
        : 7;
  const days = Array.from({ length: count }, (_, i) => addDays(first, i));
  const events = data.records.filter(
    (e) =>
      ['task', 'homework', 'exam', 'session', 'milestone'].includes(e.kind) &&
      e.status !== 'archived',
  );
  const locale = data.settings.language === 'ar' ? 'ar-MA' : 'fr-MA';
  function move(direction: number) {
    if (view === 'month') {
      const d = new Date(`${anchor.slice(0, 7)}-01T12:00:00`);
      d.setMonth(d.getMonth() + direction);
      setAnchor(today(d));
    } else setAnchor(addDays(anchor, direction * (view === 'day' ? 1 : 7)));
  }
  return (
    <div data-testid="page-planner">
      <p className="uko-info">
        <CalendarDays size={18} />
        {t('capacityText')} {t('priorityAcademic')}
      </p>
      <div className="uko-toolbar">
        <div className="uko-actions">
          <button className="uko-icon-button" onClick={() => move(-1)} aria-label={t('previous')}>
            <ArrowLeft size={18} />
          </button>
          <strong>{date.toLocaleDateString(locale, { month: 'long', year: 'numeric' })}</strong>
          <button className="uko-icon-button" onClick={() => move(1)} aria-label={t('following')}>
            <ArrowRight size={18} />
          </button>
          <button className="uko-button secondary" onClick={() => setAnchor(today())}>
            {t('today')}
          </button>
        </div>
        <div className="uko-actions">
          <div className="uko-tabs">
            {['day', 'week', 'month'].map((v) => (
              <button key={v} className={view === v ? 'selected' : ''} onClick={() => setView(v)}>
                {t(v)}
              </button>
            ))}
          </div>
          <button
            className="uko-button"
            onClick={() => create('session', { date: anchor, duration: '25' })}
          >
            <Plus size={16} />
            {t('session')}
          </button>
        </div>
      </div>
      <div className={`uko-calendar ${view}`}>
        {days.map((day) => {
          const dayEvents = events
            .filter((e) => e.fields.date === day)
            .sort(
              (a, b) =>
                Number(b.kind === 'exam') - Number(a.kind === 'exam') ||
                (a.fields.time || '').localeCompare(b.fields.time || ''),
            );
          const minutes = dayEvents
            .filter((e) => e.status !== 'completed' && e.kind !== 'exam')
            .reduce((sum, e) => sum + Number(e.fields.duration || 0), 0);
          return (
            <section
              key={day}
              className={`${day === today() ? 'current' : ''} ${minutes > data.settings.dailyMinutes ? 'over' : ''}`}
            >
              <div className="uko-calendar-day">
                <span>
                  {new Date(`${day}T12:00:00`).toLocaleDateString(locale, { weekday: 'short' })}
                </span>
                <strong>
                  {new Date(`${day}T12:00:00`).toLocaleDateString(locale, { day: 'numeric' })}
                </strong>
                <button
                  className="uko-icon-button"
                  aria-label={`${t('add')}: ${day}`}
                  onClick={() => create('task', { date: day })}
                >
                  <Plus size={16} />
                </button>
              </div>
              {view !== 'month' && (
                <small className="uko-capacity">
                  {minutes} / {data.settings.dailyMinutes} {t('min')}
                </small>
              )}
              {minutes > data.settings.dailyMinutes && (
                <p className="uko-error small">{t('overCapacity')}</p>
              )}
              {dayEvents.map((e) => (
                <CalendarEvent key={e.id} entry={e} />
              ))}
            </section>
          );
        })}
      </div>
      <section className="uko-panel">
        <div className="uko-section-heading">
          <h2>{t('undated')}</h2>
        </div>
        {events
          .filter((e) => !e.fields.date)
          .map((e) => (
            <EntryRow
              entry={e}
              key={e.id}
              checkable={['task', 'homework', 'milestone'].includes(e.kind)}
            />
          ))}
        {!events.some((e) => !e.fields.date) && <p className="uko-help">{t('noUpcoming')}</p>}
      </section>
    </div>
  );
}
function CalendarEvent({ entry }: { entry: Entry }) {
  const { inspect, t } = useKnowledge();
  return (
    <button
      className={`uko-calendar-event ${entry.kind} ${entry.status}`}
      onClick={() => inspect(entry)}
    >
      <small>
        {entry.fields.time} · {t(entry.kind)}
      </small>
      <strong dir="auto">{entry.title}</strong>
      <small>{t(entry.status)}</small>
    </button>
  );
}
export function Flashcards() {
  const { t, data, update, create } = useKnowledge();
  const [mode, setMode] = useState('review');
  const [revealed, setRevealed] = useState(false);
  const [attempt, setAttempt] = useState('');
  const due = data.records
    .filter(
      (e) =>
        ['flashcard', 'vocabulary'].includes(e.kind) &&
        e.status !== 'archived' &&
        (!e.fields.reviewDate || e.fields.reviewDate <= today()),
    )
    .sort(
      (a, b) =>
        (a.fields.reviewDate || '').localeCompare(b.fields.reviewDate || '') ||
        b.reviews.filter((r) => r.rating === 'again').length -
          a.reviews.filter((r) => r.rating === 'again').length,
    );
  const card = due[0];
  return (
    <div data-testid="page-flashcards">
      <div className="uko-toolbar">
        <div className="uko-tabs">
          {['review', 'list'].map((m) => (
            <button key={m} className={mode === m ? 'selected' : ''} onClick={() => setMode(m)}>
              {t(m)}
            </button>
          ))}
        </div>
        <button className="uko-button" onClick={() => create('flashcard', { reviewDate: today() })}>
          <Plus size={17} />
          {t('flashcard')}
        </button>
      </div>
      {mode === 'list' ? (
        <Collection page="flashcards" />
      ) : card ? (
        <section className="uko-flashcard" key={card.id}>
          <div className="uko-section-heading">
            <span className="uko-kicker">
              <Layers size={16} />
              {t('dueCards')}: {due.length}
            </span>
            <span className="uko-badge">
              {card.reviews.length} {t('reviewsCount')}
            </span>
          </div>
          <h2 dir="auto">{card.title}</h2>
          <p dir="auto" className="uko-body-text">
            {card.content}
          </p>
          <label>
            {t('attempt')}
            <textarea
              value={attempt}
              onChange={(e) => setAttempt(e.target.value)}
              rows={3}
              dir="auto"
              data-testid="card-attempt"
            />
          </label>
          {!revealed ? (
            <button
              className="uko-button"
              data-testid="reveal-answer"
              onClick={() => setRevealed(true)}
            >
              <Eye size={18} />
              {t('revealAnswer')}
            </button>
          ) : (
            <>
              <div className="uko-card-answer" dir="auto" data-testid="card-answer">
                {card.fields.answer}
              </div>
              <div className="uko-rating-actions">
                {(['again', 'hard', 'good'] as const).map((r) => (
                  <button
                    key={r}
                    className={`uko-button ${r !== 'good' ? 'secondary' : ''}`}
                    data-testid={`rating-${r}`}
                    onClick={async () => {
                      if (await update(reviewCard(card, r, data.settings.reviewDays))) {
                        setRevealed(false);
                        setAttempt('');
                      }
                    }}
                  >
                    {r === 'good' && <Check size={17} />} {t(r)}
                  </button>
                ))}
              </div>
            </>
          )}
          <p className="uko-help">{t('contentPreserved')}</p>
        </section>
      ) : (
        <section className="uko-panel">
          <Empty
            title={t('noDue')}
            text={t('noDueText')}
            action={() => create('flashcard', { reviewDate: today() })}
          />
        </section>
      )}
    </div>
  );
}
export function Analytics() {
  const { t, data, create } = useKnowledge();
  const measures = stats(data.records);
  const sessions = data.records.filter(
    (e) =>
      e.kind === 'session' &&
      e.status === 'completed' &&
      e.fields.outcome &&
      (e.fields.date || e.createdAt.slice(0, 10)) >= addDays(today(), -6) &&
      (e.fields.date || e.createdAt.slice(0, 10)) <= today(),
  );
  const groups = [...new Set(sessions.map((e) => e.fields.subject || 'other'))].map((id) => ({
    id,
    name:
      subjectDefs.find((s) => s[0] === id)?.[1] ||
      data.records.find((e) => e.id === id)?.title ||
      t('other'),
    minutes: sessions
      .filter((e) => (e.fields.subject || 'other') === id)
      .reduce((sum, e) => sum + Number(e.fields.duration || 0), 0),
  }));
  return (
    <div data-testid="page-analytics">
      <div className="uko-stats">
        {[
          [measures.minutes, 'studyTime'],
          [measures.sessions, 'session'],
          [measures.completed, 'completedTasks'],
          [measures.due, 'dueCards'],
        ].map(([n, key]) => (
          <div className="uko-stat" key={key}>
            <div>
              <span>{t(String(key))}</span>
              <div className="uko-stat-value">{n}</div>
              <small>
                {t(key === 'studyTime' || key === 'session' ? 'thisWeek' : 'recordedOnly')}
              </small>
            </div>
          </div>
        ))}
      </div>
      <section className="uko-panel uko-chart">
        <div className="uko-section-heading">
          <h2>{t('studyBySubject')}</h2>
          <span>{t('thisWeek')}</span>
        </div>
        {groups.length ? (
          groups.map((g) => (
            <div className="uko-bar-row" key={g.id}>
              <span dir="auto">{g.name}</span>
              <div>
                <span
                  style={{
                    width: `${(g.minutes / Math.max(...groups.map((s) => s.minutes), 1)) * 100}%`,
                  }}
                />
              </div>
              <small>
                {g.minutes} {t('min')}
              </small>
            </div>
          ))
        ) : (
          <Empty
            text={t('noAnalytics')}
            action={() => create('session', { date: today(), duration: '25' })}
          />
        )}
      </section>
      <section className="uko-review-callout wide">
        <Sparkles size={25} />
        <h2>{t('weeklyReview')}</h2>
        <p>{t('weeklyText')}</p>
        <button className="uko-button" onClick={() => create('review', { date: today() })}>
          {t('startReview')}
          <ArrowUpRight size={17} />
        </button>
      </section>
      <Collection page="analytics" />
    </div>
  );
}

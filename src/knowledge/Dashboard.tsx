import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpLeft,
  ArrowUpRight,
  ArrowRight,
  Plus,
  Sparkles,
  Clock3,
  BookOpen,
  CircleCheck,
  Layers,
  Play,
  Pause,
  RotateCcw,
  CalendarDays,
  Leaf,
  Circle,
  Check,
  MoreHorizontal,
} from 'lucide-react';
import { useKnowledge } from './context';
import { stats, today, addDays, type Entry } from './model';
import { domains } from './i18n';
export function EntryRow({ entry, checkable = false }: { entry: Entry; checkable?: boolean }) {
  const { t, inspect, update, data } = useKnowledge();
  const due = entry.fields.date;
  return (
    <div className="uko-entry-row">
      {checkable ? (
        <button
          className={`uko-check ${entry.status === 'completed' ? 'checked' : ''}`}
          aria-label={`${t(entry.status === 'completed' ? 'next' : 'completed')}: ${entry.title}`}
          onClick={() =>
            update({
              ...entry,
              status: entry.status === 'completed' ? 'next' : 'completed',
              updatedAt: new Date().toISOString(),
            })
          }
        >
          {entry.status === 'completed' && <Check size={14} />}
        </button>
      ) : (
        <span className={`uko-entry-mark ${entry.kind}`}>
          <BookOpen size={17} />
        </span>
      )}
      <button className="uko-entry-main" onClick={() => inspect(entry)}>
        <strong dir="auto" className={entry.status === 'completed' ? 'uko-strike' : ''}>
          {entry.title}
        </strong>
        <small>
          <span>{t(entry.kind)}</span>
          {due && (
            <>
              <span>·</span>
              <time>
                {new Date(`${due}T12:00:00`).toLocaleDateString(
                  data.settings.language === 'ar' ? 'ar-MA' : 'fr-MA',
                  { day: 'numeric', month: 'short' },
                )}
              </time>
            </>
          )}
          {entry.fields.duration && (
            <>
              <span>·</span>
              <span>
                {entry.fields.duration} {t('min')}
              </span>
            </>
          )}
        </small>
      </button>
      <span className={`uko-badge ${entry.status}`}>{t(entry.status)}</span>
      <button className="uko-icon-button" onClick={() => inspect(entry)} aria-label={t('details')}>
        <MoreHorizontal size={18} />
      </button>
    </div>
  );
}
export function Empty({
  title,
  text,
  action,
}: {
  title?: string;
  text?: string;
  action?: () => void;
}) {
  const { t } = useKnowledge();
  return (
    <div className="uko-empty">
      <span className="uko-empty-icon">
        <Leaf size={25} strokeWidth={1.3} />
      </span>
      <h3>{title || t('emptyTitle')}</h3>
      <p>{text || t('emptyText')}</p>
      {action && (
        <button className="uko-button secondary" onClick={action}>
          <Plus size={16} />
          {t('add')}
        </button>
      )}
    </div>
  );
}
export function FocusTimer() {
  const { t, create } = useKnowledge();
  const [seconds, setSeconds] = useState(25 * 60);
  const [endAt, setEndAt] = useState<number | null>(null);
  useEffect(() => {
    if (!endAt) return;
    const tick = () => {
      const next = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
      setSeconds(next);
      if (!next) setEndAt(null);
    };
    tick();
    const timer = window.setInterval(tick, 250);
    return () => window.clearInterval(timer);
  }, [endAt]);
  return (
    <section className="uko-focus-card">
      <div className="uko-section-heading">
        <h2>
          <span className="uko-status-dot" />
          {t('focusTitle')}
        </h2>
        <Clock3 size={17} />
      </div>
      <p>{seconds === 0 ? t('focusDone') : t('focusSub')}</p>
      <div className="uko-timer" dir="ltr">
        {String(Math.floor(seconds / 60)).padStart(2, '0')}
        <span>:</span>
        {String(seconds % 60).padStart(2, '0')}
      </div>
      <div className="uko-actions">
        <button
          className="uko-button"
          data-testid="focus-start"
          onClick={() => setEndAt(endAt ? null : Date.now() + (seconds || 1500) * 1000)}
        >
          {endAt ? <Pause size={16} /> : <Play size={16} />} {t(endAt ? 'pause' : 'start')}
        </button>
        <button
          className="uko-icon-button"
          aria-label={t('reset')}
          onClick={() => {
            setEndAt(null);
            setSeconds(1500);
          }}
        >
          <RotateCcw size={17} />
        </button>
      </div>
      <button
        className="uko-text-button"
        onClick={() =>
          create('session', {
            date: today(),
            duration: String(Math.max(1, Math.ceil((1500 - seconds) / 60))),
          })
        }
      >
        {t('recordOutcome')}
        <ArrowRight size={14} />
      </button>
      <small>{t('focusHelp')}</small>
    </section>
  );
}
export default function Dashboard() {
  const { data, t, create } = useKnowledge();
  const ar = data.settings.language === 'ar';
  const locale = ar ? 'ar-MA' : 'fr-MA';
  const measures = stats(data.records);
  const [selectedDay, setSelectedDay] = useState(today());
  const now = new Date();
  const monday = addDays(today(), -((now.getDay() + 6) % 7));
  const tasks = data.records
    .filter(
      (e) =>
        ['task', 'homework', 'milestone', 'session'].includes(e.kind) &&
        !['completed', 'archived'].includes(e.status) &&
        (!e.fields.date || e.fields.date === selectedDay),
    )
    .sort(
      (a, b) =>
        Number(b.kind === 'homework') - Number(a.kind === 'homework') ||
        Number(b.fields.priority === 'high') - Number(a.fields.priority === 'high'),
    );
  const upcoming = data.records
    .filter(
      (e) =>
        ['exam', 'homework'].includes(e.kind) &&
        e.fields.date >= today() &&
        !['completed', 'archived'].includes(e.status),
    )
    .sort((a, b) => a.fields.date.localeCompare(b.fields.date));
  const recent = data.records
    .filter((e) => ['note', 'knowledge', 'research'].includes(e.kind) && e.status !== 'archived')
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 3);
  const Arrow = ar ? ArrowUpLeft : ArrowUpRight;
  return (
    <div data-testid="dashboard">
      <div className="uko-welcome-line">
        <span>
          <span className="uko-small-sun">✳</span>
          {t('goodDay')}
          {data.profile.name ? `، ${data.profile.name}` : ''}
        </span>
        <time>
          {now.toLocaleDateString(locale, {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </time>
      </div>
      <section className="uko-hero">
        <div className="uko-hero-copy">
          <span className="uko-eyebrow">
            <span /> {t('personalSpace')}
          </span>
          <h2>
            {t('heroTitle')}
            <br />
            <em>{t('heroTitleSecond')}</em>
          </h2>
          <p>{t('heroText')}</p>
          <div className="uko-actions wrap">
            <button
              className="uko-button"
              onClick={() => create('session', { date: today(), duration: '25' })}
            >
              <Plus size={17} />
              {t('startLearning')}
            </button>
            <button className="uko-text-button" onClick={() => create('idea')}>
              {t('captureIdea')}
              <Arrow size={17} />
            </button>
          </div>
        </div>
        <div className="uko-orbit" aria-hidden="true">
          <svg viewBox="0 0 400 290" fill="none">
            <circle cx="208" cy="145" r="104" stroke="currentColor" strokeOpacity=".22" />
            <circle cx="208" cy="145" r="74" stroke="currentColor" strokeOpacity=".15" />
            <ellipse
              cx="208"
              cy="145"
              rx="141"
              ry="57"
              transform="rotate(-32 208 145)"
              stroke="currentColor"
              strokeOpacity=".4"
            />
            <ellipse
              cx="208"
              cy="145"
              rx="141"
              ry="57"
              transform="rotate(40 208 145)"
              stroke="currentColor"
              strokeOpacity=".22"
            />
            <path
              d="M208 107v76m-38-38h76m-65-27 54 54m0-54-54 54"
              stroke="currentColor"
              strokeWidth="2.5"
            />
            <circle cx="208" cy="145" r="25" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="104" cy="145" r="8" fill="#d3ba83" />
            <circle cx="284" cy="74" r="5" fill="currentColor" />
            <circle
              cx="318"
              cy="196"
              r="11"
              fill="#f0f2e8"
              stroke="currentColor"
              strokeOpacity=".4"
            />
            <path
              d="m72 49 2 7 7 2-7 2-2 7-2-7-7-2 7-2zm247 188 2 7 7 2-7 2-2 7-2-7-7-2 7-2z"
              fill="currentColor"
              fillOpacity=".5"
            />
          </svg>
          <span className="uko-orbit-label label-1">
            <BookOpen size={16} />
            {t('learning')}
          </span>
          <span className="uko-orbit-label label-2">
            <Sparkles size={16} />
            {t('idea')}
          </span>
        </div>
      </section>
      <section className="uko-stats" aria-label={t('analytics')}>
        {[
          [Clock3, measures.minutes, t('studyTime'), t('thisWeek'), 'sage'],
          [BookOpen, measures.notes, t('savedNotes'), t('knowledge'), 'sand'],
          [CircleCheck, measures.completed, t('completedTasks'), t('recordedOnly'), 'blue'],
          [Layers, measures.due, t('dueCards'), t('today'), 'rose'],
        ].map(([Icon, value, title, sub, color]) => {
          const I = Icon as typeof Clock3;
          return (
            <div className="uko-stat" key={String(color)}>
              <span className={`uko-stat-icon ${color}`}>
                <I size={20} />
              </span>
              <div>
                <span className="uko-stat-label">{String(title)}</span>
                <div className="uko-stat-value">
                  {Number(value).toLocaleString(locale)}
                  {color === 'sage' && <small>{t('min')}</small>}
                </div>
                <small>{String(sub)}</small>
              </div>
            </div>
          );
        })}
      </section>
      <div className="uko-dashboard-grid">
        <div className="uko-dashboard-main">
          <section className="uko-panel">
            <div className="uko-section-heading">
              <h2>
                {t('todayActions')}
                <span className="uko-count">{tasks.length}</span>
              </h2>
              <Link to="/knowledge/planner">
                {t('viewAll')}
                <Arrow size={15} />
              </Link>
            </div>
            <div className="uko-week-strip">
              {Array.from({ length: 7 }, (_, i) => {
                const day = addDays(monday, i);
                const date = new Date(`${day}T12:00:00`);
                const hasItems = data.records.some((e) => e.fields.date === day);
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`${selectedDay === day ? 'selected' : ''} ${day === today() ? 'is-today' : ''}`}
                    aria-pressed={selectedDay === day}
                  >
                    <small>{date.toLocaleDateString(locale, { weekday: 'short' })}</small>
                    <strong>{date.toLocaleDateString(locale, { day: 'numeric' })}</strong>
                    <span className={hasItems ? 'uko-day-dot' : ''} />
                  </button>
                );
              })}
            </div>
            {tasks.length ? (
              tasks
                .slice(0, 5)
                .map((e) => <EntryRow entry={e} key={e.id} checkable={e.kind !== 'session'} />)
            ) : (
              <Empty
                title={t('noActions')}
                text={t('noActionsText')}
                action={() => create('task', { date: selectedDay })}
              />
            )}
            <button className="uko-add-row" onClick={() => create('task', { date: selectedDay })}>
              <Plus size={17} />
              {t('addTask')}
            </button>
          </section>
          {data.settings.showResources && (
            <section className="uko-panel">
              <div className="uko-section-heading">
                <h2>{t('recentNotes')}</h2>
                <Link to="/knowledge/knowledge">
                  {t('viewAll')}
                  <Arrow size={15} />
                </Link>
              </div>
              {recent.length ? (
                recent.map((e) => <EntryRow key={e.id} entry={e} />)
              ) : (
                <div className="uko-inline-empty">
                  <span className="uko-empty-icon">
                    <BookOpen size={22} strokeWidth={1.4} />
                  </span>
                  <p>{t('noNotes')}</p>
                  <button
                    className="uko-icon-button"
                    onClick={() => create('note')}
                    aria-label={t('note')}
                  >
                    <Plus size={20} />
                  </button>
                </div>
              )}
            </section>
          )}
          {data.settings.showDomains && (
            <section className="uko-panel uko-explore">
              <div className="uko-section-heading">
                <h2>{t('explore')}</h2>
                <Link to="/knowledge/domains">
                  {t('viewAll')}
                  <Arrow size={15} />
                </Link>
              </div>
              <p>{t('exploreSub')}</p>
              <div className="uko-domain-shortcuts">
                {[domains[0], domains[18], domains[10], domains[26]].map((d) => (
                  <Link to={`/knowledge/domains?domain=${d[0]}`} key={d[0]}>
                    <span>{d[3]}</span>
                    <strong>{d[ar ? 1 : 2]}</strong>
                    <Arrow size={15} />
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
        <aside className="uko-dashboard-aside">
          <FocusTimer />
          <section className="uko-panel uko-upcoming">
            <div className="uko-section-heading">
              <h2>
                <CalendarDays size={17} />
                {t('upcoming')}
              </h2>
              <button
                className="uko-icon-button"
                aria-label={t('exam')}
                onClick={() => create('exam')}
              >
                <Plus size={17} />
              </button>
            </div>
            {upcoming.length ? (
              upcoming.slice(0, 3).map((e) => <EntryRow entry={e} key={e.id} />)
            ) : (
              <p className="uko-help">{t('noUpcoming')}</p>
            )}
            <Link to="/knowledge/planner" className="uko-text-button">
              {t('calendar')}
              <Arrow size={15} />
            </Link>
          </section>
          <section className="uko-review-callout">
            <span>
              <Circle size={17} />
              <Circle size={10} />
            </span>
            <h3>{t('weeklyReview')}</h3>
            <p>{t('weeklyText')}</p>
            <button className="uko-text-button" onClick={() => create('review', { date: today() })}>
              {t('startReview')}
              <Arrow size={16} />
            </button>
          </section>
        </aside>
      </div>
    </div>
  );
}

import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, BookOpen, CalendarDays, Film, Flag, Pencil } from 'lucide-react';
import { useKnowledge } from './context';
import { addDays, makeEntry, subjectDefs, today } from './model';
import {
  bookLessonId,
  primaryLessonIds,
  studyGoalId,
  videoGoalId,
  videoProjectId,
  schoolPlanStart,
  shiftSchoolPlan,
} from './schoolPack';
import { EntryRow } from './Dashboard';

export default function SchoolWeek() {
  const { data, t, edit, inspect, commit, busy, notify } = useKnowledge();
  const ar = data.settings.language === 'ar';
  const lessons = data.records.filter((e) => primaryLessonIds.includes(e.id));
  const sessions = data.records.filter((e) => e.id.startsWith('school-session-'));
  const earliest = schoolPlanStart(data.records);
  const [start, setStart] = useState(earliest);
  const [videoDate, setVideoDate] = useState(addDays(today(), 7));
  const goal = data.records.find((e) => e.id === studyGoalId);
  const videoGoal = data.records.find((e) => e.id === videoGoalId);
  const project = data.records.find((e) => e.id === videoProjectId);
  const locale = ar ? 'ar-MA' : 'fr-MA';
  const dateLabel = (value: string) =>
    new Date(`${value}T12:00:00`).toLocaleDateString(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });

  async function shift(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!start || !event.currentTarget.checkValidity()) return;
    if (await commit(shiftSchoolPlan(data, start))) notify(t('planShifted'));
  }

  async function anotherVideo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!videoDate || !event.currentTarget.checkValidity() || !videoGoal) return;
    if (
      data.records.some(
        (e) => e.kind === 'project' && e.links.includes(videoGoalId) && e.fields.date === videoDate,
      )
    ) {
      notify(t('videoExists'));
      return;
    }
    const next = {
      ...makeEntry('project', 'ar'),
      title: `فيديو الأسبوع — ${videoDate}`,
      fields: { date: videoDate, source: 'مشروع أسبوعي أنشأته بطلب صريح؛ لا يوجد نشر آلي.' },
      links: [videoGoalId],
    };
    const steps = data.records
      .filter((e) => e.id.startsWith('school-video-') && e.kind === 'task')
      .map((e) => ({
        ...e,
        id: crypto.randomUUID(),
        status: 'next' as const,
        createdAt: next.createdAt,
        updatedAt: next.updatedAt,
        fields: { ...e.fields, date: videoDate },
        links: [next.id, videoGoalId],
      }));
    if (await commit({ ...data, records: [...data.records, next, ...steps] }))
      notify(t('videoCreated'));
  }

  return (
    <div className="uko-school" data-testid="page-school">
      <p className="uko-info">{t('schoolNotice')}</p>
      <section className="uko-school-book">
        <div className="uko-book-spine" aria-hidden="true">
          <span>GUY DE MAUPASSANT</span>
          <strong>
            Aux
            <br />
            champs
          </strong>
          <small>CONTES DE LA BÉCASSE</small>
        </div>
        <div>
          <span className="uko-kicker">{t('bookKicker')}</span>
          <h2 dir="ltr">Aux champs</h2>
          <p>{t('bookGenre')}</p>
          <p>{t('bookPurpose')}</p>
          <Link to="/knowledge/reading" className="uko-button" data-testid="open-reading">
            <BookOpen size={17} />
            {t('openReading')}
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>
      <section className="uko-panel">
        <div className="uko-section-heading">
          <h2>
            <BookOpen size={19} />
            {t('studySheets')}
          </h2>
          <span>
            {lessons.length} {t('mainLessons')}
          </span>
        </div>
        <p className="uko-help">{t('sheetNotice')}</p>
        {subjectDefs
          .filter(([id]) => lessons.some((e) => e.fields.subject === id))
          .map(([id, name]) => (
            <div key={id} className="uko-school-subject" data-testid={`school-${id}`}>
              <h3 dir="ltr">{name}</h3>
              {lessons
                .filter((e) => e.fields.subject === id)
                .map((entry) => (
                  <EntryRow key={entry.id} entry={entry} />
                ))}
            </div>
          ))}
      </section>
      <div className="uko-school-columns">
        <section className="uko-panel">
          <div className="uko-section-heading">
            <h2>
              <CalendarDays size={19} />
              {t('proposedPlan')}
            </h2>
            <Link to="/knowledge/planner">{t('viewAll')}</Link>
          </div>
          <p className="uko-help">{t('planHelp')}</p>
          <form onSubmit={shift} className="uko-school-date-form">
            <label>
              {t('planDate')}
              <input
                data-testid="school-start"
                type="date"
                required
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </label>
            <button
              className="uko-button secondary"
              disabled={busy || !earliest}
              data-testid="shift-school-plan"
            >
              {t('shiftPlan')}
            </button>
          </form>
          {[...new Set(sessions.map((s) => s.fields.date).filter(Boolean))].sort().map((date) => (
            <div className="uko-school-day" key={date}>
              <h3>
                {dateLabel(date)}
                <small>
                  {sessions
                    .filter(
                      (s) =>
                        s.fields.date === date && !['completed', 'archived'].includes(s.status),
                    )
                    .reduce((sum, s) => sum + Number(s.fields.duration || 0), 0)}{' '}
                  {t('min')}
                </small>
              </h3>
              {sessions
                .filter((s) => s.fields.date === date)
                .map((entry) => (
                  <button className="uko-school-session" key={entry.id} onClick={() => edit(entry)}>
                    <span dir="auto">{entry.title}</span>
                    <small>
                      {t(entry.status)} · {entry.fields.duration} {t('min')} <Pencil size={12} />
                    </small>
                  </button>
                ))}
            </div>
          ))}
        </section>
        <section className="uko-panel">
          <div className="uko-section-heading">
            <h2>
              <Flag size={19} />
              {t('weekGoals')}
            </h2>
          </div>
          {goal && <EntryRow entry={goal} />}
          <div className="uko-school-video">
            <Film size={25} />
            <p>{t('videoCadence')}</p>
            {videoGoal && <EntryRow entry={videoGoal} />}
            {project && <EntryRow entry={project} />}
          </div>
          {data.records
            .filter((e) => e.id.startsWith('school-video-') && e.kind === 'task')
            .map((entry) => (
              <EntryRow key={entry.id} entry={entry} checkable />
            ))}
          <form onSubmit={anotherVideo} className="uko-school-date-form">
            <label>
              {t('videoDate')}
              <input
                type="date"
                required
                value={videoDate}
                onChange={(e) => setVideoDate(e.target.value)}
              />
            </label>
            <button
              className="uko-button secondary"
              disabled={busy || !videoGoal}
              data-testid="next-video-week"
            >
              {t('videoNextWeek')}
            </button>
          </form>
          {data.records
            .filter(
              (e) =>
                e.kind === 'project' && e.id !== videoProjectId && e.links.includes(videoGoalId),
            )
            .map((entry) => (
              <EntryRow key={entry.id} entry={entry} />
            ))}
          <div className="uko-actions wrap">
            <Link className="uko-text-button" to="/knowledge/goals">
              {t('goals')}
              <ArrowUpRight size={15} />
            </Link>
            <Link className="uko-text-button" to="/knowledge/projects">
              {t('projects')}
              <ArrowUpRight size={15} />
            </Link>
          </div>
          {lessons.some((e) => e.id === bookLessonId) && (
            <button
              className="uko-text-button"
              onClick={() => inspect(lessons.find((e) => e.id === bookLessonId)!)}
            >
              {t('details')} · Aux champs
            </button>
          )}
        </section>
      </div>
    </div>
  );
}

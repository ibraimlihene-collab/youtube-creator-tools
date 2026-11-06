import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, ChevronLeft, ChevronRight, Plus, Target } from 'lucide-react';
import { useKnowledge } from './context';
import { addDays, subjectDefs, today, type Entry } from './model';
import { applyWeek, dailyGoals, dayLoad, isAcademic, planWeek, recordDailyOutcome, saveSkill, sessionForSkill, skillsIn, suggestSkills, weeklyTarget, weekStart, type SkillInput } from './weekly';
import { weeklyTranslator } from './weekly-i18n';
import './weekly.css';

function SkillForm({ entry, onClose }: { entry?: Entry; onClose: () => void }) {
  const { data, busy, update, notify, t } = useKnowledge();
  const w = weeklyTranslator(data.settings.language);
  const [error, setError] = useState(false);
  const [value, setValue] = useState<SkillInput>({ title: entry?.title || '',
    action: entry?.fields.objective || '', evidence: entry?.fields.metric || '',
    minutes: Number(entry?.fields.duration) || 25, frequency: entry ? weeklyTarget(entry) || 2 : 2,
    academic: entry ? isAcademic(entry) : false, subject: entry?.fields.subject || '',
    sources: entry?.links || [], language: entry?.language || data.settings.language });
  const field = <K extends keyof SkillInput>(key: K, v: SkillInput[K]) => setValue(s => ({ ...s, [key]: v }));
  const sources = data.records.filter(e => ['lesson', 'goal', 'project'].includes(e.kind) && e.status !== 'archived');
  async function submit(event: FormEvent) {
    event.preventDefault(); setError(false);
    try {
      if (await update(saveSkill(value, entry))) { notify(w('saved')); onClose(); }
    } catch { setError(true); }
  }
  return <form onSubmit={submit} className="uko-weekly-form" data-testid="skill-form">
    <fieldset disabled={busy} className="uko-form-grid">
      <label>{w('name')}<input data-testid="skill-name" dir="auto" required maxLength={500} value={value.title} onChange={e => field('title', e.target.value)} /></label>
      <label>{w('language')}<select value={value.language} onChange={e => field('language', e.target.value)}>
        {['ar', 'fr', 'en', 'other'].map(l => <option value={l} key={l}>{t(l === 'ar' ? 'arabic' : l === 'fr' ? 'french' : l === 'en' ? 'english' : 'other')}</option>)}
      </select></label>
      <label className="uko-field-full">{w('action')}<textarea dir="auto" data-testid="skill-action" required maxLength={3000} value={value.action} onChange={e => field('action', e.target.value)} /></label>
      <label className="uko-field-full">{w('evidence')}<textarea dir="auto" data-testid="skill-evidence" required maxLength={3000} value={value.evidence} onChange={e => field('evidence', e.target.value)} /></label>
      <label>{w('minutes')}<input type="number" data-testid="skill-minutes" min={5} max={180} required value={value.minutes} onChange={e => field('minutes', Number(e.target.value))} /></label>
      <label>{w('frequency')}<input type="number" data-testid="skill-frequency" min={1} max={7} required value={value.frequency} onChange={e => field('frequency', Number(e.target.value))} /></label>
      <label>{w('subject')}<select data-testid="skill-subject" value={value.subject} onChange={e => field('subject', e.target.value)}>
        <option value="">—</option>
        {subjectDefs.map(([id, title]) => <option value={id} key={id}>{title}</option>)}
        {data.records.filter(e => e.kind === 'subject').map(e => <option value={e.id} key={e.id}>{e.title}</option>)}
      </select></label>
      <label className="uko-weekly-check"><input type="checkbox" checked={value.academic || !!value.subject} disabled={!!value.subject} onChange={e => field('academic', e.target.checked)} />{w('academic')}</label>
      <details className="uko-field-full"><summary>{w('sources')}</summary><div className="uko-weekly-sources">
        {sources.map(e => <label key={e.id}><input type="checkbox" checked={value.sources.includes(e.id)} onChange={event => field('sources', event.target.checked ? [...value.sources, e.id] : value.sources.filter(id => id !== e.id))} /><bdi>{e.title}</bdi></label>)}
      </div></details>
    </fieldset>
    {error && <p className="uko-error" role="alert">{w('invalidSkill')}</p>}
    <div className="uko-actions wrap"><button data-testid="skill-save" className="uko-button" disabled={busy}>{w('save')}</button><button type="button" className="uko-button secondary" onClick={onClose}>{w('cancel')}</button></div>
  </form>;
}
function GoalOutcome({ entry, onClose }: { entry: Entry; onClose: () => void }) {
  const { data, busy, update } = useKnowledge();
  const w = weeklyTranslator(data.settings.language);
  const [outcome, setOutcome] = useState(entry.fields.outcome || '');
  const [minutes, setMinutes] = useState('');
  const [status, setStatus] = useState<'completed' | 'partial'>(entry.status === 'partial' ? 'partial' : 'completed');
  const [error, setError] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); setError(false);
    try {
      if (await update(recordDailyOutcome(entry, outcome, Number(minutes), status))) onClose();
    } catch { setError(true); }
  }
  return <form className="uko-weekly-form" onSubmit={submit} data-testid="daily-outcome-form">
    <fieldset disabled={busy} className="uko-form-grid">
      <label className="uko-field-full">{w('outcomeLabel')}<textarea dir="auto" data-testid="daily-outcome" required value={outcome} onChange={e => setOutcome(e.target.value)} /></label>
      <label>{w('actual')}<input type="number" data-testid="daily-actual" required min={1} max={1440} value={minutes} onChange={e => setMinutes(e.target.value)} /></label>
      <label>{w('outcome')}<select value={status} onChange={e => setStatus(e.target.value as 'completed' | 'partial')}><option value="completed">{w('complete')}</option><option value="partial">{w('partial')}</option></select></label>
    </fieldset>
    {error && <p className="uko-error" role="alert">{w('invalidOutcome')}</p>}
    <div className="uko-actions wrap"><button className="uko-button" data-testid="daily-outcome-save" disabled={busy}>{w('outcomeSave')}</button><button type="button" className="uko-button secondary" onClick={onClose}>{w('cancel')}</button></div>
  </form>;
}
export default function WeeklyGoals() {
  const { data, busy, commit, update, inspect, create, t, notify } = useKnowledge();
  const w = weeklyTranslator(data.settings.language);
  const [first, setFirst] = useState(weekStart(today()));
  const [form, setForm] = useState<Entry | 'new' | null>(null);
  const [outcomeId, setOutcomeId] = useState<string | null>(null);
  const plan = planWeek(data.records, first, data.settings.dailyMinutes);
  const saved = dailyGoals(data.records, first);
  const proposed = [...data.records, ...plan.additions];
  const suggestions = suggestSkills(data.records, data.settings.language);
  const locale = data.settings.language === 'ar' ? 'ar-MA' : 'fr-MA';
  const dateLabel = (day: string) => new Date(`${day}T12:00:00`).toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'short' });
  async function apply() {
    // Recompute on click, never save a preview from an earlier snapshot.
    const latest = planWeek(data.records, first, data.settings.dailyMinutes);
    if (latest.additions.length && await commit({ ...data, records: applyWeek(data.records, latest) })) notify(w('added'));
  }
  return <section className="uko-panel uko-weekly" data-testid="weekly-goals" id="weekly-goals">
    <div className="uko-section-heading"><h2><Target size={19} />{w('title')}</h2></div>
    <p>{w('intro')}</p>
    <details className="uko-weekly-rules"><summary>{w('budget')}: {data.settings.dailyMinutes} {t('min')}</summary><p>{w('rules')}</p><Link className="uko-text-button" to="/knowledge/settings">{w('settings')}</Link></details>
    <div className="uko-weekly-toolbar uko-actions wrap">
      <button className="uko-icon-button" aria-label={w('previous')} onClick={() => { setFirst(addDays(first, -7)); setOutcomeId(null); }}><ChevronLeft size={18} /></button>
      <label>{w('week')}<input data-testid="weekly-start" type="date" value={first} onChange={e => { if (e.target.value) { setFirst(weekStart(e.target.value)); setOutcomeId(null); } }} /></label>
      <button className="uko-icon-button" aria-label={w('next')} onClick={() => { setFirst(addDays(first, 7)); setOutcomeId(null); }}><ChevronRight size={18} /></button>
      <button className="uko-button secondary" onClick={() => setFirst(weekStart(today()))}>{w('current')}</button>
    </div>
    <div className="uko-section-heading"><h3>{w('skills')}</h3><button data-testid="skill-add" className="uko-button secondary" onClick={() => setForm('new')}><Plus size={16} />{w('add')}</button></div>
    {form && <SkillForm key={form === 'new' ? 'new' : form.id} entry={form === 'new' ? undefined : form} onClose={() => setForm(null)} />}
    {!skillsIn(data.records).length && <p className="uko-help">{w('empty')}</p>}
    <ul className="uko-weekly-skills" data-testid="weekly-skills">
      {plan.skills.map(skill => {
        const sessions = saved.filter(e => sessionForSkill(e, skill));
        const complete = sessions.filter(e => e.status === 'completed' && e.fields.outcome?.trim()).length;
        return <li key={skill.id}>
          <div><strong dir="auto">{skill.title}</strong><small>{w('target')}: {weeklyTarget(skill) || '—'} · {skill.fields.duration || '—'} {t('min')} · {isAcademic(skill) ? w('academic') : t('project')}</small><p><span>{w('recorded')}: {complete}</span> · {w('planned')}: {sessions.length}</p></div>
          <div className="uko-actions wrap"><button className="uko-text-button" onClick={() => setForm(skill)}>{w('edit')}</button><button className="uko-text-button" onClick={() => { if (window.confirm(w('archiveConfirm'))) void update({ ...skill, status: 'archived', updatedAt: new Date().toISOString() }); }}>{w('archive')}</button></div>
        </li>;
      })}
    </ul>
    {!!suggestions.length && <div className="uko-weekly-suggestions"><p>{w('suggestionsHelp')}</p><button className="uko-button secondary" data-testid="weekly-suggest" disabled={busy} onClick={() => commit({ ...data, records: [...data.records, ...suggestSkills(data.records, data.settings.language)] })}>{w('suggest')}</button></div>}
    <p className="uko-help">{w('recordedHelp')}</p>
    <div className="uko-section-heading uko-weekly-preview"><h3><CalendarCheck size={17} />{w('preview')}</h3><strong>{w('proposed')}: <span data-testid="weekly-proposed-count">{plan.additions.length}</span></strong></div>
    {!!plan.gaps.length && <ul className="uko-weekly-gaps" data-testid="weekly-gaps">{plan.gaps.map(gap => <li key={gap.skill.id}><bdi>{gap.skill.title}</bdi> — {gap.missing ? `${w('missing')}: ${gap.missing}. ` : ''}{w(gap.reason)}</li>)}</ul>}
    <div className="uko-weekly-days">
      {Array.from({ length: 7 }, (_, i) => addDays(first, i)).map(day => {
        const goals = dailyGoals(proposed, first).filter(e => e.fields.date === day);
        const load = dayLoad(proposed, day);
        return <article key={day} className={day === today() ? 'today' : ''} data-testid="weekly-day">
          <header><h3>{dateLabel(day)}</h3><small>{w('load')}: {load} / {data.settings.dailyMinutes} {t('min')}</small></header>
          {load > data.settings.dailyMinutes && <p className="uko-error">{w('over')}</p>}
          {!goals.length && <p className="uko-help">{w(day < today() ? 'past' : 'noDay')}</p>}
          {goals.map(goal => {
            const isNew = plan.additions.some(e => e.id === goal.id);
            return <div key={goal.id} className={`uko-weekly-goal ${isNew ? 'proposed' : ''}`} data-testid={isNew ? 'daily-goal-proposed' : 'daily-goal-saved'}>
              <span className="uko-badge">{isNew ? w('proposed') : t(goal.status)}</span>
              <strong dir="auto">{goal.title}</strong><p dir="auto">{goal.fields.objective}</p><small dir="auto">{goal.fields.procedure}</small>
              <small>{goal.fields.duration} {t('min')}</small>
              {goal.fields.outcome && <blockquote data-testid="daily-saved-outcome" dir="auto">{goal.fields.outcome}</blockquote>}
              {!isNew && <div className="uko-actions wrap"><button className="uko-text-button" onClick={() => inspect(goal)}>{w('details')}</button><button className="uko-text-button" data-testid="daily-record-outcome" disabled={busy || day > today()} onClick={() => setOutcomeId(goal.id)}>{w('outcome')}</button></div>}
              {!isNew && day > today() && <small>{w('future')}</small>}
              {outcomeId === goal.id && <GoalOutcome entry={goal} onClose={() => setOutcomeId(null)} />}
            </div>;
          })}
        </article>;
      })}
    </div>
    <p className="uko-help">{w('preserved')}</p>
    <div className="uko-actions wrap"><button data-testid="weekly-apply" className="uko-button" disabled={busy || !plan.additions.length} onClick={apply}>{w(plan.additions.length ? 'apply' : 'nothing')}</button>
      <button className="uko-button secondary" data-testid="weekly-review" onClick={() => create('review', { date: addDays(first, 6) }, plan.skills.map(e => e.id))}>{w('review')}</button>
    </div>
  </section>;
}

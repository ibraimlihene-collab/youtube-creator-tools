import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Mic, Square, ArrowRight } from 'lucide-react';
import { useKnowledge } from './context';
import { normalize } from './model';
import { readConfig, zonedDay } from './brain-engine.mjs';
import { applyToday, blankAnswers, checkinLabel, planToday, prioritySources, readCheckin, saveCheckin, spokenMinutes, validAnswers, type Checkin, type DailyAnswers } from './checkin';
import { checkinTranslator } from './checkin-i18n';
import PhoneNotifications from './PhoneNotifications';
import './checkin.css';

interface Recognition {
  lang: string; interimResults: boolean; continuous: boolean;
  onresult: ((event: { results: { [index: number]: { [index: number]: { transcript: string } } } }) => void) | null;
  onerror: (() => void) | null; onend: (() => void) | null;
  start(): void; abort(): void;
}
type SpeechWindow = Window & { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
function VoiceInput({ onText, step }: { onText: (text: string) => void; step: number }) {
  const { data } = useKnowledge(), t = checkinTranslator(data.settings.language);
  const ref = useRef<Recognition | null>(null), [listening, setListening] = useState(false), [error, setError] = useState(false);
  const latest = useRef(onText); latest.current = onText;
  const browser = window as SpeechWindow, Constructor = browser.SpeechRecognition || browser.webkitSpeechRecognition;
  useEffect(() => () => { if (ref.current) { ref.current.onresult = null; ref.current.onerror = null; ref.current.onend = null; ref.current.abort(); ref.current = null; } }, [step, data.settings.language]);
  function start() {
    if (!Constructor) return;
    if (listening) { ref.current?.abort(); setListening(false); return; }
    setError(false);
    const recognition = new Constructor(); ref.current = recognition;
    recognition.lang = data.settings.language === 'ar' ? 'ar-MA' : 'fr-FR'; recognition.interimResults = false; recognition.continuous = false;
    recognition.onresult = event => { latest.current(event.results[0][0].transcript.slice(0, 2000)); };
    recognition.onerror = () => { setError(true); setListening(false); };
    recognition.onend = () => { setListening(false); };
    try { recognition.start(); setListening(true); } catch { setError(true); }
  }
  return <div className="uko-voice"><p className="uko-help">{t('voiceHelp')}</p>
    {Constructor ? <button type="button" className="uko-button secondary" aria-pressed={listening} onClick={start}>{listening ? <Square size={16} /> : <Mic size={16} />}{t(listening ? 'stop' : 'mic')}</button> : <p className="uko-help">{t('voiceUnavailable')}</p>}
    {listening && <p role="status">{t('listening')}</p>}{error && <p role="alert">{t('voiceError')}</p>}
  </div>;
}
export function DailyConversationLink() {
  const { data } = useKnowledge();
  return <Link className="uko-button secondary" data-testid="daily-conversation-link" to="/knowledge/assistant?today=1"><MessageCircle size={18} />{checkinLabel(data.settings.language)}<ArrowRight size={16} /></Link>;
}
function Conversation({ day }: { day: string }) {
  const { data, busy, commit, inspect } = useKnowledge(), t = checkinTranslator(data.settings.language);
  let stored: Checkin | null = null, damaged = false;
  try { stored = readCheckin(data.records, day); } catch { damaged = true; }
  const [answers, setAnswers] = useState<DailyAnswers>(stored?.answers || blankAnswers());
  const [step, setStep] = useState(stored?.step === 3 ? 4 : (stored?.step || 0) + 1), [error, setError] = useState('');
  const latest = useRef(data); latest.current = data;
  const sources = prioritySources(data.records);
  const field = <K extends keyof DailyAnswers>(key: K, value: DailyAnswers[K]) => setAnswers(a => ({ ...a, [key]: value }));
  let plan: ReturnType<typeof planToday> | null = null, planError = '';
  if (step === 4) try { plan = planToday(data, answers, day); } catch (e) { planError = e instanceof Error ? e.message : 'invalidCheckin'; }
  async function next(event: FormEvent) {
    event.preventDefault(); setError('');
    if (!validAnswers(answers, step)) { setError('invalidCheckin'); return; }
    try {
      const value: Checkin = { version: 1, day, answers, step, applied: stored?.applied || false };
      if (await commit(saveCheckin(latest.current, value))) setStep(step + 1);
    } catch (e) { setError(e instanceof Error ? e.message : 'invalidCheckin'); }
  }
  function voice(text: string) {
    if (step === 1) setAnswers(a => ({ ...a, time: text, minutes: spokenMinutes(text) ?? -1 }));
    else if (step === 2) {
      const match = sources.find(e => normalize(e.title) === normalize(text));
      setAnswers(a => ({ ...a, priority: text.slice(0, 500), priorityId: match?.id || '' }));
    } else {
      const textKey = normalize(text);
      const energy = /منخفض|متعب|ضعيف|faible|fatigu/.test(textKey) ? 'low' : /مرتفع|عالي|eleve|haute/.test(textKey) ? 'high' : /متوسط|moyen/.test(textKey) ? 'normal' : '';
      setAnswers(a => ({ ...a, obstacle: text, energy }));
    }
  }
  return <section className="uko-panel uko-conversation" data-testid="daily-conversation">
    <div className="uko-section-heading"><h2><MessageCircle size={20} />{checkinLabel(data.settings.language)}</h2><bdi>{day}</bdi></div>
    <p>{t('intro')}</p><p className="uko-help">{t('local')}</p>
    {damaged ? <p role="alert" className="uko-error">{t('invalidCheckin')}</p> : <>
      <ol className="uko-checkin-steps" aria-label={checkinLabel(data.settings.language)}>{[1, 2, 3].map(n => <li key={n} aria-current={step === n ? 'step' : undefined} className={step > n ? 'done' : ''}>{n}</li>)}</ol>
      {step < 4 ? <form onSubmit={next} className="uko-stack" data-testid="daily-question">
        <h3 data-testid="daily-question-title">{t(`q${step}`)}</h3>
        <fieldset disabled={busy} className="uko-stack">
          {step === 1 && <><label>{t('q1')}<textarea dir="auto" data-testid="daily-time-answer" maxLength={2000} value={answers.time} onChange={e => { const text = e.target.value; setAnswers(a => ({ ...a, time: text, minutes: spokenMinutes(text) ?? -1 })); }} /></label>
            <p className="uko-help">{t('timeHint')}</p><label>{t('minutes')}<input data-testid="daily-minutes" type="number" min={0} max={720} required value={answers.minutes < 0 ? '' : answers.minutes} onChange={e => field('minutes', e.target.value === '' ? -1 : Number(e.target.value))} /></label></>}
          {step === 2 && <><label>{t('q2')}<textarea dir="auto" data-testid="daily-priority" required maxLength={500} value={answers.priority} onChange={e => setAnswers(a => ({ ...a, priority: e.target.value, priorityId: '' }))} /></label>
            <p className="uko-help">{t('priorityHint')}</p><label>{t('savedPriorities')}<select data-testid="daily-priority-source" value={answers.priorityId} onChange={e => { const selected = sources.find(s => s.id === e.target.value); setAnswers(a => ({ ...a, priorityId: selected?.id || '', priority: selected?.title || a.priority })); }}><option value="">{t('custom')}</option>{sources.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}</select></label></>}
          {step === 3 && <><label>{t('energy')}<select data-testid="daily-energy" required value={answers.energy} onChange={e => field('energy', e.target.value as DailyAnswers['energy'])}><option value="">{t('choose')}</option>{(['low', 'normal', 'high'] as const).map(value => <option key={value} value={value}>{t(value)}</option>)}</select></label>
            <label>{t('obstacle')}<textarea dir="auto" data-testid="daily-obstacle" maxLength={2000} value={answers.obstacle} onChange={e => field('obstacle', e.target.value)} /></label></>}
          <VoiceInput key={`${step}:${data.settings.language}`} step={step} onText={voice} />
          <div className="uko-actions wrap">{step > 1 && <button className="uko-button secondary" type="button" onClick={() => setStep(step - 1)}>{t('previous')}</button>}<button className="uko-button" data-testid="daily-next">{t('next')}</button></div>
        </fieldset>
      </form> : <div data-testid="daily-plan">
        <h3>{t('preview')}</h3><p className="uko-help">{t('rules')}</p>{stored?.applied && <p className="uko-info">{t('editApplied')}</p>}<details><summary>{t('review')}</summary><p dir="auto">{answers.time}</p><p>{answers.minutes} {t('minuteUnit')}</p><p dir="auto">{answers.priority}</p><p>{t(answers.energy)}</p><p dir="auto">{answers.obstacle}</p></details>
        {planError && <p role="alert">{t(planError)}</p>}
        {plan && <><p>{t('budget')}: {plan.budget} · {t('load')}: {plan.load}</p>
          {plan.limited && <p className="uko-info">{t('overloaded')}</p>}{plan.exam && <p className="uko-info">{t('exam')}</p>}
          {!plan.existing.length && !plan.additions.length && <p>{t('empty')}</p>}
          <div className="uko-daily-actions">{[...plan.existing.slice(0, 3), ...plan.additions].map(entry => <article key={entry.id} data-testid="daily-plan-action"><span className="uko-badge">{t(plan!.additions.includes(entry) ? 'proposed' : 'existing')}</span><h4 dir="auto">{entry.title}</h4><p dir="auto">{entry.fields.objective}</p><p>{entry.fields.duration || 25} {t('minuteUnit')}</p>{!plan!.additions.includes(entry) && <button className="uko-text-button" onClick={() => inspect(entry)}>{t('planner')}</button>}</article>)}</div>
          {plan.existing.length > 3 && <p>{t('more')}: {plan.existing.length - 3}</p>}
          <button className="uko-button" data-testid="daily-apply" disabled={busy || stored?.applied} onClick={() => {
            setError('');
            try { const now = zonedDay(new Date(), readConfig(latest.current.records).timeZone); void commit(applyToday(latest.current, { version: 1, day, step: 3, answers, applied: false }, now)); }
            catch (e) { setError(e instanceof Error ? e.message : 'invalidCheckin'); }
          }}>{t(stored?.applied ? 'applied' : 'apply')}</button>
        </>}
        <div className="uko-actions wrap"><button className="uko-text-button" disabled={busy} onClick={() => setStep(1)}>{t('edit')}</button><Link className="uko-text-button" to="/knowledge/planner">{t('planner')}</Link></div>
      </div>}
      {error && <p className="uko-error" role="alert">{t(error)}</p>}
    </>}
  </section>;
}
export default function DailyConversation() {
  const { data } = useKnowledge();
  const [tick, setTick] = useState(0);
  useEffect(() => { const timer = setInterval(() => setTick(n => n + 1), 60000); return () => clearInterval(timer); }, []);
  const day = zonedDay(new Date(), readConfig(data.records).timeZone);
  return <div className="uko-daily" data-testid="page-daily" data-tick={tick}><Conversation key={day} day={day} /><PhoneNotifications /></div>;
}

import { makeEntry, normalize, validateEntry, type Entry, type Language, type Workspace } from './model';
import { dayPlus, validDay } from './brain-engine.mjs';
import { dayLoad, sessionForSkill, skillsIn, validSkill, weekStart, isAcademic } from './weekly';

export interface DailyAnswers {
  time: string; minutes: number; priority: string; priorityId: string;
  energy: '' | 'low' | 'normal' | 'high'; obstacle: string;
}
export interface Checkin { version: 1; day: string; step: number; answers: DailyAnswers; applied: boolean }
export const blankAnswers = (): DailyAnswers => ({ time: '', minutes: -1, priority: '', priorityId: '', energy: '', obstacle: '' });
const inactive = ['archived', 'completed', 'paused', 'blocked', 'waiting'];
export function prioritySources(records: Entry[]): Entry[] {
  return records.filter(e => ['task', 'session', 'homework', 'exam', 'goal', 'project', 'lesson', 'path'].includes(e.kind) && !inactive.includes(e.status));
}
// Transcription remains editable. Ambiguous durations require a numeric correction.
export function spokenMinutes(text: string): number | null {
  let value = normalize(text).replace(/[٠-٩]/g, d => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
  const phrases: [RegExp, string][] = [
    [/ساعة ونصف|ساعه ونصف|une heure et demie/g, '90 دقيقة'],
    [/نصف ساعة|نصف ساعه|une demi heure|demi-heure/g, '30 دقيقة'],
    [/ساعتين|ساعتان|deux heures/g, '120 دقيقة'],
    [/ساعة|ساعه|une heure/g, '60 دقيقة'],
    [/صفر|aucun temps|zero minute/g, '0 دقيقة'],
    [/ثلاثون|ثلاثين|trente/g, '30'], [/ستون|ستين|soixante/g, '60'],
    [/quarante[ -]cinq|خمسة واربعون|خمسة واربعين/g, '45'], [/عشرون|عشرين|vingt/g, '20'],
    [/quarante|اربعون|اربعين/g, '40'], [/quinze|خمس عشرة|خمسة عشر/g, '15'],
  ];
  // Handle longer phrases before their shorter components.
  for (const [pattern, replacement] of phrases) value = value.replace(pattern, replacement);
  const matches = [...value.matchAll(/(?:^|\s)(\d+(?:[.,]\d+)?)\s*(heures?|ساعات?|دقائق|دقيقة|minutes?|min|h)?(?=\s|$|[،,.])/g)];
  if (matches.length !== 1) return null;
  const amount = Number(matches[0][1].replace(',', '.'));
  const unit = matches[0][2] || '';
  const minutes = /heure|ساع|^h$/.test(unit) ? amount * 60 : amount;
  return Number.isInteger(minutes) && minutes >= 0 && minutes <= 720 ? minutes : null;
}
export function validAnswers(a: DailyAnswers, step = 3): boolean {
  return !!a && typeof a.time === 'string' && a.time.length <= 2000 &&
    Number.isInteger(a.minutes) && a.minutes >= 0 && a.minutes <= 720 &&
    typeof a.priority === 'string' && a.priority.length <= 500 &&
    typeof a.priorityId === 'string' && a.priorityId.length <= 120 &&
    typeof a.obstacle === 'string' && a.obstacle.length <= 2000 &&
    ['', 'low', 'normal', 'high'].includes(a.energy) &&
    (step < 2 || !!a.priority.trim()) && (step < 3 || a.energy !== '');
}
export function readCheckin(records: Entry[], day: string): Checkin | null {
  const record = records.find(e => e.id === `uko-checkin-${day}`);
  if (!record) return null;
  try {
    const value = JSON.parse(record.content);
    if (value.version === 1 && value.day === day && Number.isInteger(value.step) && value.step >= 1 && value.step <= 3 &&
      typeof value.applied === 'boolean' && validAnswers(value.answers, value.step)) return value;
  } catch { /* Preserve invalid records for manual repair. */ }
  throw new Error('invalidCheckin');
}
export function saveCheckin(workspace: Workspace, value: Checkin): Workspace {
  if (!validDay(value.day) || value.version !== 1 || !Number.isInteger(value.step) || value.step < 1 || value.step > 3 ||
    typeof value.applied !== 'boolean' || !validAnswers(value.answers, value.step)) throw new Error('invalidCheckin');
  const existing = workspace.records.find(e => e.id === `uko-checkin-${value.day}`);
  if (existing) readCheckin(workspace.records, value.day);
  const entry: Entry = { ...(existing || makeEntry('review', workspace.settings.language)), id: `uko-checkin-${value.day}`,
    title: `${workspace.settings.language === 'ar' ? 'محادثة اليوم' : 'Conversation du jour'} · ${value.day}`,
    tags: [...new Set([...(existing?.tags || []), 'daily-checkin'])], content: JSON.stringify(value),
    status: value.applied ? 'active' : 'next', fields: { ...existing?.fields, date: value.day },
    links: value.answers.priorityId ? [value.answers.priorityId] : [], updatedAt: new Date().toISOString() };
  if (!validateEntry(entry)) throw new Error('invalidCheckin');
  return { ...workspace, records: [...workspace.records.filter(e => e.id !== entry.id), entry] };
}
export interface DailyPlan { day: string; budget: number; load: number; existing: Entry[]; additions: Entry[]; exam: boolean; limited: boolean }
export function planToday(workspace: Workspace, a: DailyAnswers, day: string): DailyPlan {
  if (!validDay(day) || !validAnswers(a)) throw new Error('invalidCheckin');
  const records = workspace.records;
  const budget = Math.min(a.minutes, workspace.settings.dailyMinutes, a.energy === 'low' ? 30 : 720);
  const load = dayLoad(records, day);
  const academic = (e: Entry) => isAcademic(e) || ['exam', 'homework', 'lesson'].includes(e.kind);
  const existing = prioritySources(records).filter(e => ['task', 'session', 'homework', 'exam'].includes(e.kind) && e.fields.date === day)
    .sort((x, y) => Number(academic(y)) - Number(academic(x)) || Number(y.id === a.priorityId) - Number(x.id === a.priorityId));
  const exam = records.some(e => e.kind === 'exam' && !['archived', 'completed'].includes(e.status) && e.fields.date >= day && e.fields.date <= dayPlus(day, 6));
  const chosen = prioritySources(records).find(e => e.id === a.priorityId);
  if (a.priorityId && !chosen) throw new Error('priorityChanged');
  if (readCheckin(records, day)?.applied) return { day, budget, load, existing, additions: [], exam, limited: load > budget };
  const first = weekStart(day);
  const skills = skillsIn(records).filter(validSkill).sort((x, y) => {
    const count = (s: Entry) => records.filter(e => sessionForSkill(e, s) && e.fields.date >= first && e.fields.date <= dayPlus(first, 6) && e.status !== 'archived').length;
    return Number(academic(y)) - Number(academic(x)) || count(x) - count(y);
  });
  const candidates = [chosen, ...skills.filter(e => e.id !== chosen?.id)].filter((e): e is Entry => !!e);
  const additions: Entry[] = [];
  let used = load;
  if (!chosen && !a.priorityId && !exam && !records.some(e => e.tags.includes(`checkin-custom:${day}`)) && existing.length < 3) {
    const minutes = Math.min(25, budget - used - (used ? 10 : 0));
    if (minutes >= 5) {
      additions.push({ ...makeEntry('task', workspace.settings.language), title: a.priority.trim(),
        tags: ['daily-conversation-goal', `checkin-custom:${day}`], fields: { date: day, duration: String(minutes) } });
      used += minutes + (used ? 10 : 0);
    }
  }
  for (const source of candidates) {
    if (existing.length + additions.length >= 3) break;
    if (source.kind === 'exam' || (['homework', 'task', 'session'].includes(source.kind) && source.fields.date)) continue; // Never move a deadline or duplicate a saved action.
    if (exam && !academic(source)) continue;
    if (records.some(e => e.kind === 'session' && (e.fields.date === day || e.tags.some(t => t.startsWith(`checkin-slot:${day}:`))) && sessionForSkill(e, source))) continue;
    const slot = `checkin-slot:${day}:${additions.length}`;
    if (records.some(e => e.tags.includes(slot))) continue;
    const minutes = Number(source.fields.duration) || 25;
    if (minutes < 5 || minutes > budget - used - (used ? 10 : 0)) continue;
    const session: Entry = { ...makeEntry('session', source.language), title: source.title,
      links: [source.id], tags: ['daily-conversation-goal', slot],
      fields: { date: day, duration: String(minutes), subject: source.fields.subject || '',
        objective: source.fields.objective || a.priority, procedure: source.fields.metric || '',
        priority: academic(source) ? 'high' : 'normal' } };
    additions.push(session); used += minutes + (used ? 10 : 0);
  }
  return { day, budget, load, existing, additions, exam, limited: load > budget };
}
export function applyToday(workspace: Workspace, checkin: Checkin, day: string): Workspace {
  if (checkin.day !== day || checkin.step !== 3) throw new Error('dayChanged');
  const prior = readCheckin(workspace.records, day);
  if (prior?.applied) return workspace;
  const plan = planToday(workspace, checkin.answers, day);
  if (plan.additions.some(e => !validateEntry(e))) throw new Error('invalidCheckin');
  return saveCheckin({ ...workspace, records: [...workspace.records, ...plan.additions] }, { ...checkin, applied: true });
}
export const checkinLabel = (language: Language) => language === 'ar' ? 'ثلاثة أسئلة ليومي' : 'Trois questions pour ma journée';

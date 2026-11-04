import { addDays, makeEntry, subjectDefs, today, validateEntry, type Entry, type Language } from './model';

// Skills remain ordinary linked learning paths. No schema migration is needed for old backups.
export const skillTag = 'weekly-skill';
export const dailyGoalTag = 'weekly-daily-goal';
const frequencyPrefix = 'weekly-target:';
const academicTag = 'weekly-academic';
export const breakMinutes = 10;
export function weekStart(day: string): string {
  return addDays(day, -((new Date(`${day}T12:00:00`).getDay() + 6) % 7));
}
export function weeklyTarget(skill: Entry): number {
  return Number(skill.tags.find(t => t.startsWith(frequencyPrefix))?.slice(frequencyPrefix.length));
}
export function isAcademic(skill: Entry): boolean {
  return skill.tags.includes(academicTag) || !!skill.fields.subject;
}
export function validSkill(skill: Entry): boolean {
  return skill.kind === 'path' && skill.tags.includes(skillTag) && validateEntry(skill) &&
    !!skill.fields.objective?.trim() && !!skill.fields.metric?.trim() &&
    Number.isInteger(Number(skill.fields.duration)) && Number(skill.fields.duration) >= 5 &&
    Number(skill.fields.duration) <= 180 && Number.isInteger(weeklyTarget(skill)) &&
    weeklyTarget(skill) >= 1 && weeklyTarget(skill) <= 7;
}
export function skillsIn(records: Entry[]): Entry[] {
  return records.filter(e => e.kind === 'path' && e.tags.includes(skillTag) && e.status === 'active');
}
export interface SkillInput {
  title: string; action: string; evidence: string; minutes: number; frequency: number;
  academic: boolean; subject: string; sources: string[]; language: string;
}
export function saveSkill(input: SkillInput, existing?: Entry): Entry {
  const skill: Entry = {
    ...(existing || makeEntry('path', input.language)),
    title: input.title.trim(), language: input.language, status: 'active',
    fields: { ...existing?.fields, objective: input.action.trim(), metric: input.evidence.trim(),
      duration: String(input.minutes), subject: input.subject },
    tags: [...(existing?.tags || []).filter(t => t !== skillTag && t !== academicTag && !t.startsWith(frequencyPrefix)),
      skillTag, frequencyPrefix + input.frequency, ...(input.academic ? [academicTag] : [])],
    links: [...new Set(input.sources)], updatedAt: new Date().toISOString(),
  };
  if (!validSkill(skill)) throw new Error('invalidSkill');
  return skill;
}
export function suggestSkills(records: Entry[], language: Language): Entry[] {
  const candidates: Entry[] = [];
  const lessons = records.filter(e => e.kind === 'lesson' && !['archived', 'completed'].includes(e.status));
  for (const subject of [...new Set(lessons.map(e => e.fields.subject).filter(Boolean))]) {
    const sources = lessons.filter(e => e.fields.subject === subject);
    const title = subjectDefs.find(s => s[0] === subject)?.[1] ||
      records.find(e => e.id === subject)?.title || subject;
    candidates.push(saveSkill({ title, action: 'Répondre à une question du cours sans consulter la correction, puis vérifier le raisonnement.',
      evidence: 'Une réponse écrite, une vérification et une difficulté à revoir.', minutes: 25,
      frequency: 2, academic: true, subject, sources: sources.slice(0, 500).map(e => e.id), language: 'fr' }));
  }
  const project = records.find(e => e.id === 'school-video-project' && !['archived', 'completed'].includes(e.status));
  if (project) candidates.push({ ...saveSkill({ title: project.title,
    action: language === 'ar' ? 'اكتب فقرة من نص الفيديو وتحقق من مصدر أحد ادعاءاته.' : 'Rédiger un paragraphe du script et vérifier la source d’une affirmation.',
    evidence: language === 'ar' ? 'فقرة محفوظة ورابط مصدر مع ملاحظة عمّا يثبته.' : 'Un paragraphe enregistré et une source commentée.',
    minutes: 20, frequency: 2, academic: false, subject: '', sources: [project.id], language }),
    id: 'uko-weekly-video' });
  // A declined/archived suggestion stays declined. Never overwrite a user's earlier choice.
  return candidates.filter(e => !records.some(r => r.id === e.id ||
    (e.fields.subject && r.tags.includes(skillTag) && r.fields.subject === e.fields.subject)));
}
const calendarKinds = ['task', 'session', 'homework', 'exam', 'milestone'];
const dayValid = (d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d) &&
  Number.isFinite(Date.parse(d)) && new Date(d).toISOString().slice(0, 10) === d;
export function dayLoad(records: Entry[], day: string): number {
  const items = records.filter(e => calendarKinds.includes(e.kind) && e.status !== 'archived' && e.fields.date === day);
  // Completed work consumed time too. Unknown durations conservatively reserve 25 minutes.
  return items.reduce((sum, e) => sum + (Number(e.fields.duration) || 25), 0) + Math.max(0, items.length - 1) * breakMinutes;
}
export function dailyGoals(records: Entry[], first: string): Entry[] {
  const skills = skillsIn(records);
  return records.filter(e => e.kind === 'session' &&
    (e.tags.includes(dailyGoalTag) || skills.some(skill => sessionForSkill(e, skill))) &&
    e.status !== 'archived' && e.fields.date >= first && e.fields.date <= addDays(first, 6));
}
export function sessionForSkill(session: Entry, skill: Entry): boolean {
  return session.kind === 'session' && (session.links.includes(skill.id) ||
    session.links.some(id => skill.links.includes(id)));
}
export interface WeekPlan {
  first: string; additions: Entry[]; gaps: { skill: Entry; missing: number; reason: 'capacity' | 'exam' | 'invalid' }[];
  skills: Entry[];
}
export function planWeek(records: Entry[], first: string, capacity: number, currentDay = today()): WeekPlan {
  if (!dayValid(first) || weekStart(first) !== first || !dayValid(currentDay) ||
    !Number.isInteger(capacity) || capacity < 15 || capacity > 720) throw new Error('invalidData');
  const skills = skillsIn(records).sort((a, b) => Number(isAcademic(b)) - Number(isAcademic(a)) || a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
  const additions: Entry[] = [], gaps: WeekPlan['gaps'] = [];
  const placements = [...records];
  const days = Array.from({ length: 7 }, (_, i) => addDays(first, i)).filter(d => d >= currentDay);
  const exam = records.filter(e => e.kind === 'exam' && !['archived', 'completed'].includes(e.status) &&
    dayValid(e.fields.date) && e.fields.date >= currentDay && e.fields.date <= addDays(first, 6))
    .map(e => e.fields.date).sort().at(-1);
  // School targets take capacity first. Each group gets one round per skill before the next round.
  for (const academic of [true, false]) for (let round = 0; round < 7; round++) {
    for (const skill of skills.filter(e => isAcademic(e) === academic)) {
      if (!validSkill(skill)) {
        if (!round) gaps.push({ skill, missing: 0, reason: 'invalid' });
        continue;
      }
      if (round >= weeklyTarget(skill)) continue;
      const slot = `weekly-slot:${first}:${round}`;
      const legacyId = `uko-daily-${skill.id}-${first}-${round}`;
      const existing = records.filter(e => sessionForSkill(e, skill) &&
        (e.tags.some(tag => tag.startsWith(`weekly-slot:${first}:`)) ||
          (!['archived', 'paused', 'blocked', 'waiting'].includes(e.status) && e.fields.date >= first && e.fields.date <= addDays(first, 6))));
      if (existing.length + additions.filter(e => e.links.includes(skill.id)).length >= weeklyTarget(skill)) continue;
      // The origin slot survives moving a session, including movement into another week.
      if (records.some(e => e.id === legacyId || (e.kind === 'session' && e.links.includes(skill.id) && e.tags.includes(slot)))) continue;
      const eligible = days.filter(day => isAcademic(skill) || !exam || day > exam);
      const candidates = eligible.filter(day => {
        if (placements.some(e => e.status !== 'archived' && sessionForSkill(e, skill) && e.fields.date === day)) return false;
        const hasItems = placements.some(e => calendarKinds.includes(e.kind) && e.status !== 'archived' && e.fields.date === day);
        return dayLoad(placements, day) + Number(skill.fields.duration) + (hasItems ? breakMinutes : 0) <= capacity;
      });
      // Spread across days first, then choose the least loaded day. Ties keep chronological order.
      const target = candidates.sort((a, b) =>
        placements.filter(e => e.tags.includes(dailyGoalTag) && e.status !== 'archived' && e.fields.date === a).length -
        placements.filter(e => e.tags.includes(dailyGoalTag) && e.status !== 'archived' && e.fields.date === b).length ||
        dayLoad(placements, a) - dayLoad(placements, b))[0];
      if (!target) {
        const reason = !isAcademic(skill) && exam && !eligible.length ? 'exam' : 'capacity';
        const gap = gaps.find(g => g.skill.id === skill.id);
        if (gap) gap.missing++; else gaps.push({ skill, missing: 1, reason });
        continue;
      }
      const sources = skill.links.map(id => records.find(e => e.id === id)).filter((e): e is Entry => !!e && e.status !== 'archived');
      const source = sources[(Math.floor(Date.parse(first) / 604800000) + round) % Math.max(1, sources.length)];
      const session: Entry = { ...makeEntry('session', skill.language),
        title: (source ? `${skill.title} · ${source.title}` : skill.title).slice(0, 500),
        tags: [dailyGoalTag, slot], links: [skill.id, ...(source ? [source.id] : [])],
        fields: { date: target, duration: skill.fields.duration, subject: skill.fields.subject || '',
          objective: [skill.fields.objective, source?.fields.objective].filter(Boolean).join('\n'),
          procedure: skill.fields.metric, materials: source?.title || '', priority: isAcademic(skill) ? 'high' : 'normal' },
      };
      additions.push(session); placements.push(session);
    }
  }
  return { first, additions, gaps, skills };
}
export function applyWeek(records: Entry[], plan: WeekPlan): Entry[] {
  // Caller computes the plan from its latest snapshot; the workspace commit also uses revision CAS.
  if (plan.additions.some(e => !validateEntry(e))) throw new Error('invalidData');
  return [...records, ...plan.additions.filter(e => !records.some(r => r.id === e.id))];
}
export function recordDailyOutcome(entry: Entry, outcome: string, actualMinutes: number, status: 'completed' | 'partial', day = today()): Entry {
  if (entry.kind !== 'session' || !outcome.trim() ||
    !dayValid(day) || entry.fields.date > day || !Number.isInteger(actualMinutes) || actualMinutes < 1 || actualMinutes > 1440)
    throw new Error('invalidOutcome');
  const next = { ...entry, status, updatedAt: new Date().toISOString(),
    fields: { ...entry.fields, outcome: outcome.trim(), duration: String(actualMinutes) } };
  if (!validateEntry(next)) throw new Error('invalidOutcome');
  return next;
}

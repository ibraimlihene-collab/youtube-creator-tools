export const kinds = [
  'note',
  'knowledge',
  'resource',
  'subject',
  'lesson',
  'task',
  'homework',
  'exam',
  'session',
  'mistake',
  'flashcard',
  'goal',
  'project',
  'milestone',
  'path',
  'research',
  'journal',
  'idea',
  'vocabulary',
  'review',
  'domain',
] as const;
export type Kind = (typeof kinds)[number];
export type Language = 'ar' | 'fr';
export const evidenceLevels = [
  'established',
  'strong',
  'plausible',
  'contested',
  'speculative',
  'unknown',
] as const;
export const statuses = [
  'inbox',
  'next',
  'active',
  'waiting',
  'paused',
  'partial',
  'postponed',
  'blocked',
  'completed',
  'revisit',
  'archived',
] as const;
export type Status = (typeof statuses)[number];
export interface ReviewAttempt {
  at: string;
  rating: 'again' | 'hard' | 'good';
  interval: number;
}
export interface Entry {
  id: string;
  kind: Kind;
  title: string;
  content: string;
  language: string;
  status: Status;
  tags: string[];
  links: string[];
  createdAt: string;
  updatedAt: string;
  fields: Record<string, string>;
  reviews: ReviewAttempt[];
}
export const profileKeys = [
  'name',
  'level',
  'track',
  'strengths',
  'difficulties',
  'languages',
  'skills',
  'interests',
  'values',
  'methods',
  'available',
  'constraints',
  'objectives',
] as const;
export type Profile = Record<(typeof profileKeys)[number], string>;
export interface Settings {
  language: Language;
  theme: 'light' | 'dark';
  explanation: Language;
  dailyMinutes: number;
  reviewDays: number;
  showResources: boolean;
  showDomains: boolean;
}
export interface Workspace {
  version: 1;
  revision: number;
  records: Entry[];
  profile: Profile;
  settings: Settings;
}
export const subjectDefs = [
  ['math', 'Mathématiques', 'fr'],
  ['physics', 'Physique', 'fr'],
  ['chemistry', 'Chimie', 'fr'],
  ['svt', 'Sciences de la vie et de la Terre', 'fr'],
  ['english', 'English', 'en'],
  ['french', 'Français', 'fr'],
  ['arabic', 'اللغة العربية', 'ar'],
  ['islamic', 'التربية الإسلامية', 'ar'],
  ['history', 'التاريخ', 'ar'],
  ['geography', 'الجغرافيا', 'ar'],
] as const;
export const scienceSubjects = ['math', 'physics', 'chemistry', 'svt'];
export function freshWorkspace(): Workspace {
  return {
    version: 1,
    revision: 0,
    records: [],
    profile: Object.fromEntries(
      profileKeys.map((key) => [
        key,
        key === 'level' ? 'Tronc Commun Scientifique' : key === 'track' ? 'Option française' : '',
      ]),
    ) as Profile,
    settings: {
      language: 'ar',
      theme: 'light',
      explanation: 'ar',
      dailyMinutes: 90,
      reviewDays: 3,
      showResources: true,
      showDomains: true,
    },
  };
}
export function today(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function addDays(day: string, days: number): string {
  const date = new Date(`${day}T12:00:00`);
  date.setDate(date.getDate() + days);
  return today(date);
}
export function makeEntry(kind: Kind, language = 'ar'): Entry {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    kind,
    title: '',
    content: '',
    language,
    status: kind === 'idea' || kind === 'note' || kind === 'resource' ? 'inbox' : 'next',
    tags: [],
    links: [],
    createdAt: now,
    updatedAt: now,
    fields: {},
    reviews: [],
  };
}
export function normalize(text: string): string {
  return text
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f\u064b-\u065f\u0670\u0640]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي');
}
export function searchEntries(entries: Entry[], query: string): Entry[] {
  const words = normalize(query.trim()).split(/\s+/).filter(Boolean);
  return entries.filter((e) =>
    words.every((word) =>
      normalize([e.title, e.content, ...e.tags, ...Object.values(e.fields)].join(' ')).includes(
        word,
      ),
    ),
  );
}
export function linkedEntries(entry: Entry, entries: Entry[]): Entry[] {
  return entries.filter(
    (e) => e.id !== entry.id && (entry.links.includes(e.id) || e.links.includes(entry.id)),
  );
}
export function reviewCard(
  entry: Entry,
  rating: ReviewAttempt['rating'],
  baseDays = 3,
  now = new Date(),
): Entry {
  const previous = entry.reviews.at(-1)?.interval ?? 0;
  const interval =
    rating === 'again'
      ? 1
      : rating === 'hard'
        ? Math.max(1, Math.round(previous * 1.2))
        : Math.min(3650, Math.max(baseDays, Math.round(previous * 2.2)));
  return {
    ...entry,
    fields: { ...entry.fields, reviewDate: addDays(today(now), interval) },
    reviews: [...entry.reviews, { at: now.toISOString(), rating, interval }],
    updatedAt: now.toISOString(),
  };
}
export function stats(entries: Entry[], day = today()) {
  const week = addDays(day, -6);
  const sessions = entries.filter(
    (e) =>
      e.kind === 'session' &&
      e.status === 'completed' &&
      e.fields.outcome?.trim() &&
      (e.fields.date || e.createdAt.slice(0, 10)) >= week &&
      (e.fields.date || e.createdAt.slice(0, 10)) <= day,
  );
  return {
    minutes: sessions.reduce((sum, e) => sum + (Number(e.fields.duration) || 0), 0),
    sessions: sessions.length,
    notes: entries.filter((e) => ['note', 'knowledge'].includes(e.kind) && e.status !== 'archived')
      .length,
    completed: entries.filter(
      (e) => ['task', 'homework', 'milestone'].includes(e.kind) && e.status === 'completed',
    ).length,
    due: entries.filter(
      (e) =>
        ['flashcard', 'vocabulary'].includes(e.kind) &&
        e.status !== 'archived' &&
        (!e.fields.reviewDate || e.fields.reviewDate <= day),
    ).length,
  };
}
export function safeUrl(value: string): boolean {
  try {
    return ['https:', 'http:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}
export const fieldKeys = [
  'summary',
  'domain',
  'subdomain',
  'source',
  'url',
  'author',
  'published',
  'evidence',
  'claimType',
  'confidence',
  'questions',
  'application',
  'reflection',
  'reviewDate',
  'subject',
  'chapter',
  'objective',
  'prerequisites',
  'definition',
  'formula',
  'example',
  'explanationAr',
  'explanationFr',
  'exercise',
  'solution',
  'hints',
  'instructions',
  'date',
  'time',
  'duration',
  'materials',
  'procedure',
  'difficulty',
  'outcome',
  'nextAction',
  'attempt',
  'mistakeType',
  'answer',
  'why',
  'metric',
  'risks',
  'dependencies',
  'audience',
  'scope',
  'budget',
  'deliverable',
  'milestones',
  'supporting',
  'contradicting',
  'conclusion',
  'uncertainty',
  'queries',
  'learned',
  'unclear',
  'change',
  'accomplished',
  'level',
  'targetLevel',
  'pronunciation',
  'resourceType',
  'priority',
  'result',
  'grade',
  'explanationLanguage',
] as const;
const isObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);
const isText = (value: unknown, max = 100000): value is string =>
  typeof value === 'string' && value.length <= max;
const validDay = (value: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  !Number.isNaN(Date.parse(value)) &&
  new Date(value).toISOString().slice(0, 10) === value;
const validTimestamp = (v: unknown): v is string => isText(v, 40) && !Number.isNaN(Date.parse(v));
export function validateEntry(value: unknown): value is Entry {
  if (!isObject(value)) return false;
  const e = value;
  if (
    !isText(e.id, 120) ||
    !e.id ||
    !kinds.includes(e.kind as Kind) ||
    !isText(e.title, 500) ||
    !e.title.trim() ||
    !isText(e.content) ||
    !['ar', 'fr', 'en', 'other'].includes(e.language as string) ||
    !statuses.includes(e.status as Status) ||
    !validTimestamp(e.createdAt) ||
    !validTimestamp(e.updatedAt)
  )
    return false;
  if (
    !Array.isArray(e.tags) ||
    e.tags.length > 100 ||
    !e.tags.every((v) => isText(v, 100)) ||
    !Array.isArray(e.links) ||
    e.links.length > 500 ||
    !e.links.every((v) => isText(v, 120))
  )
    return false;
  if (
    !isObject(e.fields) ||
    !Object.entries(e.fields).every(
      ([key, v]) => (fieldKeys as readonly string[]).includes(key) && isText(v),
    )
  )
    return false;
  for (const key of ['date', 'reviewDate', 'published'])
    if (e.fields[key] && !validDay(e.fields[key] as string)) return false;
  if (e.fields.url && !safeUrl(e.fields.url as string)) return false;
  if (
    e.fields.evidence &&
    !evidenceLevels.includes(e.fields.evidence as (typeof evidenceLevels)[number])
  )
    return false;
  if (
    e.fields.duration &&
    (!/^\d+$/.test(e.fields.duration as string) ||
      Number(e.fields.duration) < 1 ||
      Number(e.fields.duration) > 1440)
  )
    return false;
  if (e.fields.time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(e.fields.time as string)) return false;
  if (
    e.fields.confidence &&
    (!/^\d+$/.test(e.fields.confidence as string) || Number(e.fields.confidence) > 5)
  )
    return false;
  if (
    ['flashcard', 'vocabulary'].includes(e.kind as string) &&
    !(e.fields.answer as string)?.trim()
  )
    return false;
  if (
    e.kind === 'session' &&
    e.status === 'completed' &&
    (!(e.fields.outcome as string)?.trim() || !e.fields.duration)
  )
    return false;
  return (
    Array.isArray(e.reviews) &&
    e.reviews.length <= 10000 &&
    e.reviews.every(
      (r) =>
        isObject(r) &&
        validTimestamp(r.at) &&
        ['again', 'hard', 'good'].includes(r.rating as string) &&
        Number.isInteger(r.interval) &&
        Number(r.interval) > 0 &&
        Number(r.interval) < 100000,
    )
  );
}
export function validateWorkspace(value: unknown): value is Workspace {
  if (
    !isObject(value) ||
    value.version !== 1 ||
    !Number.isInteger(value.revision) ||
    Number(value.revision) < 0 ||
    !Array.isArray(value.records) ||
    value.records.length > 10000 ||
    !value.records.every(validateEntry) ||
    new Set(value.records.map((e) => e.id)).size !== value.records.length
  )
    return false;
  if (
    !isObject(value.profile) ||
    !profileKeys.every((k) => isText((value.profile as Record<string, unknown>)[k], 10000))
  )
    return false;
  const s = value.settings;
  return (
    isObject(s) &&
    ['ar', 'fr'].includes(s.language as string) &&
    ['ar', 'fr'].includes(s.explanation as string) &&
    ['light', 'dark'].includes(s.theme as string) &&
    Number.isInteger(s.dailyMinutes) &&
    Number(s.dailyMinutes) >= 15 &&
    Number(s.dailyMinutes) <= 720 &&
    Number.isInteger(s.reviewDays) &&
    Number(s.reviewDays) >= 1 &&
    Number(s.reviewDays) <= 30 &&
    typeof s.showResources === 'boolean' &&
    typeof s.showDomains === 'boolean'
  );
}
export function parseBackup(text: string): Workspace {
  if (text.length > 15000000) throw new Error('invalidBackup');
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new Error('invalidBackup');
  }
  if (!validateWorkspace(value)) throw new Error('invalidBackup');
  return value;
}
export function mergeBackup(current: Workspace, incoming: Workspace): Workspace {
  // Existing records are never overwritten; conflicting records get new identities and remapped links.
  const ids = new Map(
    incoming.records.map((e) => [
      e.id,
      current.records.some((c) => c.id === e.id && JSON.stringify(c) !== JSON.stringify(e))
        ? crypto.randomUUID()
        : e.id,
    ]),
  );
  const additions = incoming.records
    .filter(
      (e) => !current.records.some((c) => c.id === e.id && JSON.stringify(c) === JSON.stringify(e)),
    )
    .map((e) => ({ ...e, id: ids.get(e.id)!, links: e.links.map((id) => ids.get(id) || id) }));
  return { ...current, records: [...current.records, ...additions] };
}
export function removeEntry(state: Workspace, id: string): Workspace {
  return {
    ...state,
    records: state.records
      .filter((e) => e.id !== id)
      .map((e) =>
        e.links.includes(id) ? { ...e, links: e.links.filter((link) => link !== id) } : e,
      ),
  };
}

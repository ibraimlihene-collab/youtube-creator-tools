import { beforeEach, expect, test } from 'bun:test';
import { IDBFactory } from 'fake-indexeddb';
import { addDays, freshWorkspace, makeEntry, mergeBackup, parseBackup, validateWorkspace } from './model';
import { installSchoolPack } from './schoolPack';
import { loadWorkspace, saveWorkspace } from './storage';
import { applyWeek, dailyGoalTag, dailyGoals, dayLoad, planWeek, recordDailyOutcome, saveSkill, skillsIn, suggestSkills, validSkill, weeklyTarget, weekStart } from './weekly';
import { weeklyAr, weeklyFr } from './weekly-i18n';
const first = '2026-11-02';
const makeSkill = (name = 'الكتابة', options = {}) => saveSkill({ title: name,
  action: 'كتابة فقرة ومراجعتها', evidence: 'فقرة مصححة مع تفسير تعديل واحد',
  minutes: 25, frequency: 2, academic: false, subject: '', sources: [], language: 'ar', ...options });
const event = (kind, date, duration = '25') => ({ ...makeEntry(kind), title: kind, fields: { date, duration } });
beforeEach(() => { globalThis.indexedDB = new IDBFactory(); });

test('uses actual saved lessons and the requested project without inventing skill levels', () => {
  expect(suggestSkills([], 'ar')).toEqual([]);
  const state = installSchoolPack(freshWorkspace());
  const suggestions = suggestSkills(state.records, 'ar');
  expect(suggestions).toHaveLength(6);
  for (const skill of suggestions) {
    expect(validSkill(skill)).toBe(true);
    expect(skill.fields.level).toBeUndefined();
    expect(skill.links.length).toBeGreaterThan(0);
    expect(skill.links.every(id => state.records.some(e => e.id === id))).toBe(true);
  }
  expect(suggestSkills([...state.records, ...suggestions], 'fr')).toEqual([]);
  expect(suggestSkills([...state.records, ...suggestions.map(e => ({ ...e, status: 'archived' }))], 'ar')).toEqual([]);
});
test('existing related school sessions cover skill targets without mutation or duplicate study', () => {
  const school = installSchoolPack(freshWorkspace(), first);
  const skills = suggestSkills(school.records, 'ar');
  const records = [...school.records, ...skills];
  const before = JSON.stringify(records);
  const plan = planWeek(records, first, 90, first);
  expect(plan.additions.filter(e => e.fields.subject && e.fields.subject !== 'chemistry')).toEqual([]);
  expect(dailyGoals(records, first).some(e => !e.tags.includes(dailyGoalTag))).toBe(true);
  expect(JSON.stringify(records)).toBe(before);
});
test('validates meaningful actions, evidence, frequency and integer duration', () => {
  for (const change of [{ title: ' ' }, { action: '' }, { evidence: ' ' }, { minutes: 0 }, { minutes: 181 }, { minutes: 5.5 }, { frequency: 8 }, { frequency: 0 }, { frequency: 1.2 }])
    expect(() => makeSkill('skill', change)).toThrow('invalidSkill');
  const skill = makeSkill();
  const changed = saveSkill({ title: 'مهارة معدّلة', action: 'أشرح الفكرة', evidence: 'تفسير مكتوب', minutes: 10, frequency: 3, academic: true, subject: 'math', sources: ['lesson'], language: 'fr' }, skill);
  expect(changed.id).toBe(skill.id);
  expect(changed.createdAt).toBe(skill.createdAt);
  expect(weeklyTarget(changed)).toBe(3);
  expect(changed.links).toEqual(['lesson']);
});
test('spreads specific linked goals across all seven days and never adds past dates', () => {
  expect(weekStart('2026-11-08')).toBe(first);
  const skill = makeSkill('Écrire', { frequency: 7, subject: 'french', sources: ['lesson'] });
  const lesson = { ...event('lesson', first), id: 'lesson', title: 'Aux champs', fields: { objective: 'Comparer les deux familles' } };
  const plan = planWeek([skill, lesson], first, 90, first);
  expect(plan.additions).toHaveLength(7);
  expect(new Set(plan.additions.map(e => e.fields.date)).size).toBe(7);
  expect(plan.additions.every(e => e.links.includes(skill.id) && e.links.includes(lesson.id) && e.fields.objective.includes(lesson.fields.objective))).toBe(true);
  const remaining = planWeek([skill], first, 90, '2026-11-06');
  expect(remaining.additions.map(e => e.fields.date).sort()).toEqual(['2026-11-06', '2026-11-07', '2026-11-08']);
  expect(remaining.gaps[0].missing).toBe(4);
  expect(planWeek([skill], first, 90, '2026-11-09').additions).toEqual([]);
});
test('reserves commitments, completed work, unknown durations and breaks before adding', () => {
  const skill = makeSkill('Study', { frequency: 7 });
  const used = event('session', first, '50');
  used.status = 'completed'; used.fields.outcome = 'Actual work';
  const task = event('task', first, '');
  expect(dayLoad([used, task], first)).toBe(85);
  const records = [skill, used, task];
  const plan = planWeek(records, first, 90, first);
  expect(plan.additions.some(e => e.fields.date === first)).toBe(false);
  expect(plan.gaps[0].missing).toBe(1);
  expect(JSON.stringify(records)).toBe(JSON.stringify([skill, used, task]));
});
test('gives every school target priority and protects dates through the last imminent exam', () => {
  const optional = makeSkill('Video', { minutes: 25, frequency: 7 });
  const school = makeSkill('Maths', { minutes: 25, frequency: 7, academic: true, subject: 'math' });
  const limited = planWeek([optional, school], first, 25, first);
  expect(limited.additions).toHaveLength(7);
  expect(limited.additions.every(e => e.links.includes(school.id))).toBe(true);
  expect(limited.gaps[0].skill.id).toBe(optional.id);
  const exam = event('exam', '2026-11-08', '60');
  const plan = planWeek([optional, exam], first, 90, first);
  expect(plan.additions).toEqual([]);
  expect(plan.gaps[0].reason).toBe('exam');
  expect(exam.fields.date).toBe('2026-11-08');
  const later = planWeek([optional, event('exam', '2026-11-04')], first, 90, first);
  expect(later.additions.every(e => e.fields.date > '2026-11-04')).toBe(true);
});
test('regeneration preserves moved, edited, completed and archived slots without duplicates', () => {
  const skill = makeSkill('Writing', { frequency: 3 });
  const plan = planWeek([skill], first, 90, first);
  const records = applyWeek([skill], plan);
  const sessions = records.filter(e => e.kind === 'session');
  sessions[0].title = 'Edited'; sessions[0].fields.date = '2026-11-10';
  sessions[1].status = 'completed'; sessions[1].fields.outcome = 'My actual result';
  sessions[2].status = 'archived';
  const before = JSON.stringify(records);
  const again = planWeek(records, first, 90, first);
  expect(again.additions).toEqual([]);
  expect(JSON.stringify(applyWeek(records, again))).toBe(before);
  expect(applyWeek(records, plan)).toHaveLength(records.length);
  const next = planWeek(records, '2026-11-09', 90, '2026-11-09');
  expect(next.additions).toHaveLength(2); // The moved session already covers one next-week target.
});
test('every addition stays within the daily limit across realistic budgets and frequencies', () => {
  for (const capacity of [15, 25, 35, 60, 90, 180]) for (const frequency of [1, 3, 7]) {
    const records = [makeSkill('school', { minutes: 15, frequency, academic: true }), makeSkill('personal', { minutes: 20, frequency }), event('homework', first, '10')];
    const plan = planWeek(records, first, capacity, first);
    const after = applyWeek(records, plan);
    for (let offset = 0; offset < 7; offset++) expect(dayLoad(after, addDays(first, offset))).toBeLessThanOrEqual(capacity);
    expect(new Set(after.map(e => e.id)).size).toBe(after.length);
  }
});
test('invalid and archived skills cannot generate misleading goals', () => {
  const skill = makeSkill();
  expect(planWeek([{ ...skill, status: 'archived' }], first, 90, first).additions).toEqual([]);
  const invalid = { ...skill, fields: { ...skill.fields, objective: '' } };
  const plan = planWeek([invalid], first, 90, first);
  expect(plan.additions).toEqual([]);
  expect(plan.gaps[0].reason).toBe('invalid');
  expect(() => planWeek([skill], '2026-11-03', 90, first)).toThrow('invalidData');
});
test('valid imported long identities produce bounded IDs and preserve origin-slot idempotence', () => {
  const skill = { ...makeSkill(), id: 's'.repeat(120) };
  const plan = planWeek([skill], first, 90, first);
  const state = { ...freshWorkspace(), records: applyWeek([skill], plan) };
  expect(validateWorkspace(state)).toBe(true);
  expect(planWeek(state.records, first, 90, first).additions).toEqual([]);
  const subject = { ...event('subject', first), id: 'm'.repeat(120) };
  const lesson = { ...event('lesson', first), fields: { subject: subject.id } };
  const suggestions = suggestSkills([subject, lesson], 'ar');
  expect(suggestions).toHaveLength(1);
  expect(validateWorkspace({ ...freshWorkspace(), records: [subject, lesson, ...suggestions] })).toBe(true);
  expect(suggestSkills([subject, lesson, ...suggestions], 'fr')).toEqual([]);
});
test('counts complete outcomes only after real recorded minutes and disallows future results', () => {
  const skill = makeSkill();
  const session = planWeek([skill], first, 90, first).additions[0];
  for (const [outcome, minutes] of [['', 25], ['done', 0], ['done', 2.5], ['done', 1441]])
    expect(() => recordDailyOutcome(session, outcome, minutes, 'completed', first)).toThrow('invalidOutcome');
  expect(() => recordDailyOutcome({ ...session, fields: { ...session.fields, date: addDays(first, 1) } }, 'done', 10, 'completed', first)).toThrow('invalidOutcome');
  const completed = recordDailyOutcome(session, 'أجبت وصححت خطأ واحدًا', 20, 'completed', first);
  expect(completed.fields.duration).toBe('20');
  expect(completed.fields.outcome).toBe('أجبت وصححت خطأ واحدًا');
  expect(completed.status).toBe('completed');
  expect(recordDailyOutcome(session, 'لم أكمل المراجعة', 10, 'partial', first).status).toBe('partial');
});
test('skill plans and outcomes survive IndexedDB, backup validation and conflict-safe import', async () => {
  const skill = makeSkill('التعلّم', { frequency: 7 });
  const state = freshWorkspace();
  state.records = applyWeek([skill], planWeek([skill], first, 90, first));
  state.records[1] = recordDailyOutcome(state.records[1], 'كتبت نتيجة حقيقية', 18, 'completed', first);
  const saved = await saveWorkspace(state, 0);
  expect(await loadWorkspace()).toEqual(saved);
  const backup = parseBackup(JSON.stringify(saved));
  expect(dailyGoals(backup.records, first)).toHaveLength(7);
  expect(planWeek(backup.records, first, 90, first).additions).toEqual([]);
  const conflict = { ...state, records: state.records.map(e => ({ ...e, title: `Modified: ${e.title}` })) };
  const merged = mergeBackup(conflict, backup);
  expect(validateWorkspace(merged)).toBe(true);
  const imported = skillsIn(merged.records).find(e => e.id !== skill.id);
  expect(merged.records.filter(e => e.tags.includes(dailyGoalTag) && e.links.includes(imported.id))).toHaveLength(7);
  // Duplicate backups are retained as separate linked records, but no new planned slots are added.
  expect(planWeek(merged.records, first, 720, first).additions).toEqual([]);
});
test('Arabic and French weekly interface dictionaries have complete matching keys', () => {
  expect(Object.keys(weeklyAr).sort()).toEqual(Object.keys(weeklyFr).sort());
  for (const key of Object.keys(weeklyAr)) {
    expect(weeklyAr[key].trim().length).toBeGreaterThan(0);
    expect(weeklyFr[key].trim().length).toBeGreaterThan(0);
  }
});

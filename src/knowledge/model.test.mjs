import { describe, test, expect } from 'bun:test';
import {
  addDays,
  freshWorkspace,
  kinds,
  linkedEntries,
  makeEntry,
  mergeBackup,
  normalize,
  parseBackup,
  removeEntry,
  reviewCard,
  safeUrl,
  searchEntries,
  stats,
  today,
  validateEntry,
  validateWorkspace,
} from './model.ts';
import { ar, fr } from './i18n.ts';
const entry = (kind = 'note', title = 'Une idée') => ({ ...makeEntry(kind, 'fr'), title });
describe('knowledge data and integrity', () => {
  test('starts empty without fabricated progress or personal facts', () => {
    const state = freshWorkspace();
    expect(validateWorkspace(state)).toBe(true);
    expect(state.records).toEqual([]);
    expect(state.profile.name).toBe('');
    expect(state.settings.language).toBe('ar');
    expect(stats(state.records)).toEqual({
      minutes: 0,
      sessions: 0,
      notes: 0,
      completed: 0,
      due: 0,
    });
  });
  test('all record types serialize, with required flashcard answers', () => {
    for (const kind of kinds) {
      const e = entry(kind);
      if (['flashcard', 'vocabulary'].includes(kind)) e.fields.answer = 'Réponse';
      expect(validateEntry(e)).toBe(true);
    }
    expect(validateEntry(entry('flashcard'))).toBe(false);
  });
  test('rejects whitespace, invalid status, oversized values and unknown fields', () => {
    expect(validateEntry(entry('note', '   '))).toBe(false);
    expect(validateEntry({ ...entry(), status: 'faked' })).toBe(false);
    expect(validateEntry({ ...entry(), title: 'a'.repeat(501) })).toBe(false);
    expect(validateEntry({ ...entry(), fields: { API_KEY: 'no secrets' } })).toBe(false);
  });
  test('accepts only safe complete HTTP source URLs', () => {
    expect(safeUrl('https://example.org/a')).toBe(true);
    for (const url of [
      'javascript:alert(1)',
      'data:text/html,hi',
      '//example.org',
      '/path',
      'file:///tmp',
    ])
      expect(safeUrl(url)).toBe(false);
  });
  test('dates and durations are real and bounded', () => {
    const e = entry('session');
    for (const date of ['2026-02-30', 'tomorrow', '2026-13-01'])
      expect(validateEntry({ ...e, fields: { date } })).toBe(false);
    for (const duration of ['0', '-2', '99999', '1.5', 'NaN'])
      expect(validateEntry({ ...e, fields: { duration } })).toBe(false);
    expect(
      validateEntry({ ...e, fields: { date: '2026-10-20', duration: '25', time: '23:45' } }),
    ).toBe(true);
  });
  test('Unicode search handles accents, Arabic vocalization and alef', () => {
    const records = [
      entry('note', 'Les équations et la géométrie'),
      entry('knowledge', 'أَفْكَار عن التعلّم'),
    ];
    expect(searchEntries(records, 'equations geometrie')).toHaveLength(1);
    expect(searchEntries(records, 'افكار التعلم')).toHaveLength(1);
    expect(normalize('École')).toBe('ecole');
    expect(searchEntries(records, 'absent')).toHaveLength(0);
  });
  test('search includes tags, sources and body', () => {
    const e = {
      ...entry(),
      content: 'un contenu',
      tags: ['physique'],
      fields: { author: 'Institut' },
    };
    expect(searchEntries([e], 'institut physique contenu')).toHaveLength(1);
  });
  test('backlinks work in both directions without duplicate neighbors', () => {
    const a = entry(),
      b = entry('project', 'B');
    a.links = [b.id];
    expect(linkedEntries(a, [a, b])).toEqual([b]);
    expect(linkedEntries(b, [a, b])).toEqual([a]);
    b.links = [a.id];
    expect(linkedEntries(a, [a, b])).toHaveLength(1);
  });
  test('confirmed deletion helper removes references, preserves other records', () => {
    const a = entry(),
      b = entry('task', 'B');
    b.links = [a.id];
    const state = { ...freshWorkspace(), records: [a, b] };
    const next = removeEntry(state, a.id);
    expect(next.records).toHaveLength(1);
    expect(next.records[0].links).toEqual([]);
    expect(state.records[1].links).toHaveLength(1);
  });
  test('completed sessions require actual outcome and duration', () => {
    const e = { ...entry('session'), status: 'completed' };
    expect(validateEntry(e)).toBe(false);
    expect(validateEntry({ ...e, fields: { duration: '25', outcome: '   ' } })).toBe(false);
    expect(
      validateEntry({ ...e, fields: { duration: '25', outcome: 'I can explain the concept' } }),
    ).toBe(true);
  });
  test('weekly analytics excludes planned sessions, missing outcomes and future dates', () => {
    const makeSession = (status, date, outcome = 'Understood') => ({
      ...entry('session'),
      status,
      fields: { duration: '30', date, outcome },
    });
    const records = [
      makeSession('completed', '2026-10-20'),
      makeSession('active', '2026-10-20'),
      makeSession('completed', '2026-10-19', ''),
      makeSession('completed', '2026-10-21'),
      makeSession('completed', '2026-10-01'),
    ];
    expect(stats(records, '2026-10-20').minutes).toBe(30);
    expect(stats(records, '2026-10-20').sessions).toBe(1);
  });
  test('review scheduling records real attempts and prioritizes forgotten cards', () => {
    const e = { ...entry('flashcard'), fields: { answer: '4' } };
    const clock = new Date('2026-10-20T12:00:00Z');
    const good = reviewCard(e, 'good', 3, clock);
    expect(good.fields.reviewDate).toBe('2026-10-23');
    expect(good.reviews[0].interval).toBe(3);
    const again = reviewCard(good, 'again', 3, clock);
    expect(again.fields.reviewDate).toBe('2026-10-21');
    expect(again.reviews).toHaveLength(2);
    expect(e.reviews).toHaveLength(0);
    expect(reviewCard(good, 'hard', 3, clock).reviews.at(-1).interval).toBe(4);
  });
  test('calendar arithmetic crosses month and leap year boundaries', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2024-02-28', 1)).toBe('2024-02-29');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    expect(today(new Date(2026, 9, 20, 22))).toBe('2026-10-20');
  });
});
describe('portable backups and localization', () => {
  test('JSON export/import round-trip preserves all records and private text', () => {
    const state = {
      ...freshWorkspace(),
      records: [{ ...entry('journal'), content: 'مذكّرة خاصة' }],
    };
    expect(parseBackup(JSON.stringify(state))).toEqual(state);
  });
  test('rejects malformed, future, invalid and duplicate-id imports', () => {
    const state = freshWorkspace(),
      a = entry();
    for (const value of [
      '{',
      'null',
      '[]',
      JSON.stringify({ ...state, version: 2 }),
      JSON.stringify({ ...state, records: [a, a] }),
      JSON.stringify({ ...state, records: [{ ...a, fields: { url: 'javascript:alert(1)' } }] }),
    ])
      expect(() => parseBackup(value)).toThrow('invalidBackup');
  });
  test('merge preserves current records, settings and profile', () => {
    const a = entry();
    const current = { ...freshWorkspace(), records: [a] };
    current.profile.name = 'Utilisateur';
    const incoming = { ...freshWorkspace(), records: [entry('project', 'New')] };
    incoming.settings.language = 'fr';
    const merged = mergeBackup(current, incoming);
    expect(merged.records).toHaveLength(2);
    expect(merged.records[0]).toEqual(a);
    expect(merged.profile.name).toBe('Utilisateur');
    expect(merged.settings.language).toBe('ar');
  });
  test('identical imports do not duplicate existing records', () => {
    const state = { ...freshWorkspace(), records: [entry()] };
    expect(mergeBackup(state, structuredClone(state)).records).toHaveLength(1);
  });
  test('conflicts become copies and incoming links follow copied identity', () => {
    const a = entry(),
      b = entry('task', 'Linked');
    b.links = [a.id];
    const current = { ...freshWorkspace(), records: [a] };
    const imported = { ...freshWorkspace(), records: [{ ...a, title: 'Conflict' }, b] };
    const merged = mergeBackup(current, imported);
    expect(merged.records).toHaveLength(3);
    expect(merged.records[0].title).toBe(a.title);
    expect(merged.records[1].id).not.toBe(a.id);
    expect(merged.records[2].links).toEqual([merged.records[1].id]);
    expect(validateWorkspace(merged)).toBe(true);
  });
  test('interface preferences never rewrite saved French scientific content', () => {
    const e = {
      ...entry('lesson', 'Un titre saisi par l’utilisateur'),
      fields: { subject: 'math', explanationAr: 'شرح عربي' },
    };
    const state = { ...freshWorkspace(), records: [e] };
    const changed = { ...state, settings: { ...state.settings, language: 'fr' } };
    expect(changed.records).toEqual(state.records);
    expect(changed.records[0].language).toBe('fr');
  });
  test('Arabic and French have exactly the same complete translation keys', () => {
    expect(Object.keys(fr).sort()).toEqual(Object.keys(ar).sort());
    for (const key of Object.keys(ar)) {
      expect(ar[key].trim().length).toBeGreaterThan(0);
      expect(fr[key].trim().length).toBeGreaterThan(0);
    }
  });
});

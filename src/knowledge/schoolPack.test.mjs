import { describe, expect, test } from 'bun:test';
import { readFileSync, statSync } from 'node:fs';
import {
  freshWorkspace,
  mergeBackup,
  parseBackup,
  removeEntry,
  stats,
  validateWorkspace,
} from './model.ts';
import {
  buildSchoolRecords,
  installSchoolPack,
  lessonSheets,
  primaryLessonIds,
  schoolPackId,
  schoolPlanStart,
  shiftSchoolPlan,
} from './schoolPack.ts';
import { readingSections } from './auxChampsContent.ts';

const start = '2026-10-20';
const installed = () => installSchoolPack(freshWorkspace(), start);
describe('requested school content and safe installation', () => {
  test('valid connected records contain only proposed activity, no invented results', () => {
    const state = installed();
    expect(validateWorkspace(state)).toBe(true);
    expect(primaryLessonIds).toHaveLength(10);
    expect(lessonSheets).toHaveLength(9);
    expect(state.records.filter((e) => e.kind === 'session')).toHaveLength(16);
    const ids = new Set(state.records.map((e) => e.id));
    for (const entry of state.records) {
      for (const link of entry.links) expect(ids.has(link)).toBe(true);
      expect(entry.status).toBe('next');
      expect(entry.reviews).toEqual([]);
      expect(entry.fields.outcome).toBeUndefined();
    }
    expect(stats(state.records, start).minutes).toBe(0);
    expect(stats(state.records, start).completed).toBe(0);
    expect(state.profile).toEqual(freshWorkspace().profile);
  });
  test('scientific content stays French with separate Arabic explanation and source disclosure', () => {
    const lessons = buildSchoolRecords(start).filter((e) => e.id.startsWith('school-lesson-'));
    for (const lesson of lessons) {
      expect(lesson.language).toBe('fr');
      expect(lesson.fields.explanationAr).toMatch(/[\u0600-\u06ff]/);
      expect(lesson.fields.exercise.length).toBeGreaterThan(20);
      expect(lesson.fields.source).toContain('Pas un programme officiel');
    }
  });
  test('installation is idempotent, preserves edits/settings and never refills a deleted record', () => {
    const state = installed();
    state.records[0].title = 'Titre corrigé par moi';
    state.settings.language = 'fr';
    state.profile.name = 'Mon profil';
    expect(installSchoolPack(state, '2026-12-01')).toBe(state);
    const removed = removeEntry(state, state.records[1].id);
    expect(installSchoolPack(removed)).toBe(removed);
    expect(removed.records[0].title).toBe('Titre corrigé par moi');
    expect(removed.settings.language).toBe('fr');
    expect(removed.profile.name).toBe('Mon profil');
  });
  test('existing matching IDs are not overwritten during first installation', () => {
    const old = { ...freshWorkspace(), records: [buildSchoolRecords(start)[0]] };
    old.records[0].title = 'Mon propre cours';
    expect(installSchoolPack(old).records[0]).toBe(old.records[0]);
    expect(installSchoolPack(old).records[0].title).toBe('Mon propre cours');
  });
  test('old backups remain valid and install markers round trip and merge safely', () => {
    expect(parseBackup(JSON.stringify(freshWorkspace())).installedPacks).toBeUndefined();
    const state = installed();
    const deleted = removeEntry(state, state.records[0].id);
    const restored = parseBackup(JSON.stringify(deleted));
    expect(installSchoolPack(restored)).toBe(restored);
    const merged = mergeBackup(freshWorkspace(), restored);
    expect(merged.installedPacks).toEqual([schoolPackId]);
    expect(installSchoolPack(merged)).toBe(merged);
    expect(validateWorkspace(merged)).toBe(true);
    for (const installedPacks of [[schoolPackId, schoolPackId], [3], 'invalid']) {
      expect(validateWorkspace({ ...state, installedPacks })).toBe(false);
    }
  });
  test('repeated shifts anchor to remaining sessions while preserving completed outcomes and personal changes', () => {
    const state = installed();
    const first = state.records.find((e) => e.id === 'school-session-gravitation');
    first.status = 'completed';
    first.fields.outcome = 'Je sais expliquer la relation.';
    const other = state.records.find((e) => e.id === 'school-session-arithmetique');
    other.fields.time = '18:30';
    other.fields.duration = '40';
    const shifted = shiftSchoolPlan(state, '2026-10-27');
    expect(shifted.records.find((e) => e.id === first.id)).toBe(first);
    expect(schoolPlanStart(shifted.records)).toBe('2026-10-27');
    const shiftedAgain = shiftSchoolPlan(shifted, '2026-11-03');
    expect(schoolPlanStart(shiftedAgain.records)).toBe('2026-11-03');
    expect(shiftedAgain.records.find((e) => e.id === first.id)).toBe(first);
    expect(shiftedAgain.records.find((e) => e.id === other.id).fields).toMatchObject({
      date: '2026-11-03',
      time: '18:30',
      duration: '40',
    });
    expect(validateWorkspace(shiftedAgain)).toBe(true);
    expect(shiftSchoolPlan(state, '')).toBe(state);
    expect(shiftSchoolPlan(state, 'invalid')).toBe(state);
  });
  test('complete reading scenes match downloadable text and real audio assets', () => {
    expect(readingSections).toHaveLength(7);
    const root = new URL('../../public/knowledge/aux-champs/', import.meta.url);
    const fr = readFileSync(new URL('original-fr.txt', root), 'utf8');
    const ar = readFileSync(new URL('traduction-ar.txt', root), 'utf8');
    const metadata = JSON.parse(readFileSync(new URL('audio-metadata.json', root), 'utf8'));
    for (const section of readingSections) {
      expect(fr).toContain(section.original);
      expect(ar).toContain(section.translation);
      expect(statSync(new URL(section.audio.split('/').at(-1), root)).size).toBeGreaterThan(100000);
    }
    expect(readingSections[0].original).toStartWith('Les deux chaumières');
    expect(readingSections.at(-1).original).toEndWith('Et il disparut dans la nuit.');
    expect(metadata.sections.reduce((sum, s) => sum + s.duration, 0)).toBeGreaterThan(900);
    expect(statSync(new URL('complete-ar.mp3', root)).size).toBeGreaterThan(7000000);
  });
});

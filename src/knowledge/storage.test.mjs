import { beforeEach, describe, test, expect } from 'bun:test';
import { IDBFactory } from 'fake-indexeddb';
import { freshWorkspace, makeEntry } from './model.ts';
import { loadWorkspace, saveWorkspace } from './storage.ts';
beforeEach(() => {
  globalThis.indexedDB = new IDBFactory();
});
describe('transactional IndexedDB persistence', () => {
  test('fresh storage loads empty; saving survives reopening database', async () => {
    const initial = await loadWorkspace();
    const note = { ...makeEntry('note'), title: 'أفكاري' };
    const saved = await saveWorkspace({ ...initial, records: [note] }, initial.revision);
    expect(saved.revision).toBe(1);
    expect(await loadWorkspace()).toEqual(saved);
  });
  test('language and theme persist without rewriting record contents', async () => {
    const state = freshWorkspace();
    const note = { ...makeEntry('lesson', 'fr'), title: 'Leçon personnelle' };
    state.records = [note];
    state.settings.language = 'fr';
    state.settings.theme = 'dark';
    await saveWorkspace(state, 0);
    const restored = await loadWorkspace();
    expect(restored.settings.language).toBe('fr');
    expect(restored.settings.theme).toBe('dark');
    expect(restored.records[0]).toEqual(note);
  });
  test('optimistic transaction rejects stale tab writes', async () => {
    const state = freshWorkspace();
    await saveWorkspace(state, 0);
    await expect(
      saveWorkspace({ ...state, records: [{ ...makeEntry('note'), title: 'stale' }] }, 0),
    ).rejects.toThrow('tabConflict');
    expect((await loadWorkspace()).records).toHaveLength(0);
  });
  test('concurrent writes have one winner rather than silently overwriting', async () => {
    const state = freshWorkspace();
    const result = await Promise.allSettled([saveWorkspace(state, 0), saveWorkspace(state, 0)]);
    expect(result.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    expect(result.filter((r) => r.status === 'rejected')).toHaveLength(1);
  });
  test('invalid writes leave current database untouched', async () => {
    const saved = await saveWorkspace(freshWorkspace(), 0);
    await expect(
      saveWorkspace({ ...saved, records: [{ ...makeEntry('note'), title: '' }] }, 1),
    ).rejects.toThrow('invalidData');
    expect(await loadWorkspace()).toEqual(saved);
  });
  test('corrupt saved data is surfaced rather than replaced with defaults', async () => {
    await saveWorkspace(freshWorkspace(), 0);
    await new Promise((resolve, reject) => {
      const req = indexedDB.open('universal-knowledge-os', 1);
      req.onsuccess = () => {
        const db = req.result;
        const tx = db.transaction('workspace', 'readwrite');
        tx.objectStore('workspace').put({ version: 99 }, 'current');
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = reject;
      };
    });
    await expect(loadWorkspace()).rejects.toThrow('corruptStorage');
  });
});

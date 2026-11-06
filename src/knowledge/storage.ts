import { freshWorkspace, validateWorkspace, type Workspace } from './model';
const databaseName = 'universal-knowledge-os';
const storeName = 'workspace';
function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(storeName);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('storageError'));
    request.onblocked = () => reject(new Error('storageError'));
  });
}
export async function loadWorkspace(): Promise<Workspace> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const request = db.transaction(storeName).objectStore(storeName).get('current');
    request.onsuccess = () => {
      db.close();
      if (request.result === undefined) resolve(freshWorkspace());
      else if (validateWorkspace(request.result)) resolve(request.result);
      else reject(new Error('corruptStorage'));
    };
    request.onerror = () => {
      db.close();
      reject(new Error('storageError'));
    };
  });
}
export async function saveWorkspace(next: Workspace, expectedRevision: number): Promise<Workspace> {
  if (!validateWorkspace(next)) throw new Error('invalidData');
  const db = await open();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.get('current');
    let reason = 'storageError';
    const saved = { ...next, revision: expectedRevision + 1 };
    request.onsuccess = () => {
      if ((request.result?.revision ?? 0) !== expectedRevision) {
        reason = 'tabConflict';
        transaction.abort();
        return;
      }
      store.put(saved, 'current');
    };
    transaction.oncomplete = () => {
      db.close();
      resolve(saved);
    };
    transaction.onabort = transaction.onerror = () => {
      db.close();
      reject(new Error(reason));
    };
  });
}

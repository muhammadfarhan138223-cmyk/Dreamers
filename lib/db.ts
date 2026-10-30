import type { LearningEvent, Pack, RecordValue } from "./types";
const STORES = [
  "packs",
  "events",
  "notes",
  "cards",
  "settings",
  "queue",
] as const;
type Store = (typeof STORES)[number];
let connection: Promise<IDBDatabase> | undefined;
function db() {
  if (!connection)
    connection = new Promise((resolve, reject) => {
      const r = indexedDB.open("dreamers-local", 1);
      r.onupgradeneeded = () => {
        for (const store of STORES)
          if (!r.result.objectStoreNames.contains(store))
            r.result.createObjectStore(store, { keyPath: "id" });
      };
      r.onsuccess = () => {
        r.result.onversionchange = () => {
          r.result.close();
          connection = undefined;
        };
        resolve(r.result);
      };
      r.onerror = () => {
        connection = undefined;
        reject(r.error);
      };
      r.onblocked = () =>
        reject(
          new Error("Close another Dreamers tab to upgrade offline storage."),
        );
    });
  return connection;
}
export async function list<T>(store: Store): Promise<T[]> {
  const d = await db();
  return new Promise((resolve, reject) => {
    const tx = d.transaction(store);
    const r = tx.objectStore(store).getAll();
    tx.oncomplete = () => resolve(r.result);
    tx.onerror = () => reject(tx.error);
  });
}
export async function put(
  store: Store,
  value: RecordValue | Pack | LearningEvent,
) {
  const d = await db();
  return new Promise<void>((resolve, reject) => {
    const tx = d.transaction(store, "readwrite");
    tx.objectStore(store).put(value);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}
export async function remove(store: Store, id: string) {
  const d = await db();
  return new Promise<void>((resolve, reject) => {
    const tx = d.transaction(store, "readwrite");
    tx.objectStore(store).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
export async function record(event: LearningEvent) {
  const d = await db();
  return new Promise<void>((resolve, reject) => {
    const tx = d.transaction(["events", "queue"], "readwrite");
    tx.objectStore("events").put(event);
    tx.objectStore("queue").put({ ...event, sync: "awaiting-account" });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}
export async function exportData() {
  const result: Record<string, unknown> = {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
  };
  for (const s of STORES) result[s] = await list(s);
  return result;
}
export async function clearData() {
  const d = await db();
  return new Promise<void>((resolve, reject) => {
    const tx = d.transaction([...STORES], "readwrite");
    for (const s of STORES) tx.objectStore(s).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
export async function installPack() {
  const response = await fetch("/packs/cells-v1.json", { cache: "no-cache" });
  if (!response.ok)
    throw new Error(
      "The learning pack could not be downloaded. Please try again.",
    );
  const pack = (await response.json()) as Pack;
  if (
    pack.id !== "cells-starter" ||
    pack.version !== 1 ||
    pack.lessons.length !== 4 ||
    pack.questions.length !== 12
  )
    throw new Error(
      "Pack validation failed. Your existing content was preserved.",
    );
  await put("packs", pack);
  return { pack, bytes: new TextEncoder().encode(JSON.stringify(pack)).length };
}

export async function restoreData(records: Record<string, RecordValue[]>) {
  const d = await db();
  return new Promise<void>((resolve, reject) => {
    const tx = d.transaction([...STORES], "readwrite");
    for (const store of STORES) {
      if (store === "packs") continue;
      for (const row of records[store] || []) {
        const objectStore = tx.objectStore(store);
        const request = objectStore.get(row.id);
        request.onsuccess = () => {
          const existing = request.result as RecordValue | undefined;
          if (
            !existing ||
            Number(row.at || row.createdAt || 0) >=
              Number(existing.at || existing.createdAt || 0)
          )
            objectStore.put(row);
        };
        if (store === "events")
          tx.objectStore("queue").put({ ...row, sync: "awaiting-account" });
      }
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

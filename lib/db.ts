import { packMeta, STARTER_PACK_ID } from "./catalog.mjs";
import { validatePack } from "./pack-validation.mjs";
import type { LearningEvent, Pack, RecordValue } from "./types";
const STORES = [
  "packs",
  "events",
  "notes",
  "cards",
  "settings",
  "queue",
  "assessments",
  "books",
  "bookPages",
] as const;
type Store = (typeof STORES)[number];
let connection: Promise<IDBDatabase> | undefined;
function db() {
  if (!connection)
    connection = new Promise((resolve, reject) => {
      const r = indexedDB.open("dreamers-local", 3);
      r.onupgradeneeded = () => {
        for (const store of STORES)
          if (!r.result.objectStoreNames.contains(store))
            r.result.createObjectStore(store, { keyPath: "id" });
        const pages = r.transaction!.objectStore("bookPages");
        if (!pages.indexNames.contains("bookId"))
          pages.createIndex("bookId", "bookId");
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
  for (const s of STORES)
    if (s !== "books" && s !== "bookPages") result[s] = await list(s);
  result.bookManifest = (await list<RecordValue>("books")).map(
    ({ blob, ...metadata }) => metadata,
  );
  result.bookBackupNotice =
    "PDF bytes and text indexes are not included. Export PDFs separately from the book library.";
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
export async function installPack(id = STARTER_PACK_ID) {
  const meta = packMeta(id);
  if (!meta) throw new Error("Unknown learning pack.");
  const response = await fetch(meta.url, { cache: "no-cache" });
  if (!response.ok)
    throw new Error(
      "The learning pack could not be downloaded. Your existing content was preserved.",
    );
  const bytes = await response.arrayBuffer();
  const digest = Array.from(
    new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)),
    (v) => v.toString(16).padStart(2, "0"),
  ).join("");
  if (digest !== meta.sha256)
    throw new Error("Pack integrity check failed. Reconnect and try again.");
  const pack = JSON.parse(new TextDecoder().decode(bytes)) as Pack;
  const errors = validatePack(pack);
  if (errors.length || pack.id !== meta.id || pack.version !== meta.version)
    throw new Error(
      "Pack validation failed. Your existing content was preserved.",
    );
  await put("packs", pack);
  return { pack, bytes: bytes.byteLength };
}
export async function removePack(id: string) {
  const meta = packMeta(id);
  if (!meta) throw new Error("Unknown learning pack.");
  await remove("packs", id);
  if (!meta.included && typeof caches !== "undefined")
    for (const name of await caches.keys())
      if (name.startsWith("dreamers-shell-")) {
        const cache = await caches.open(name);
        await cache.delete(meta.url);
      }
}

export async function restoreData(records: Record<string, RecordValue[]>) {
  const d = await db();
  return new Promise<void>((resolve, reject) => {
    const tx = d.transaction([...STORES], "readwrite");
    for (const store of STORES) {
      if (store === "packs" || store === "books" || store === "bookPages")
        continue;
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

export async function finishAssessment(
  value: RecordValue,
  events: LearningEvent[],
) {
  const d = await db();
  return new Promise<void>((resolve, reject) => {
    const tx = d.transaction(["assessments", "events", "queue"], "readwrite");
    tx.objectStore("assessments").put(value);
    for (const event of events) {
      tx.objectStore("events").put(event);
      tx.objectStore("queue").put({ ...event, sync: "awaiting-account" });
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export async function get<T>(store: Store, id: string): Promise<T | undefined> {
  const d = await db();
  return new Promise((resolve, reject) => {
    const tx = d.transaction(store);
    const r = tx.objectStore(store).get(id);
    tx.oncomplete = () => resolve(r.result);
    tx.onerror = () => reject(tx.error);
  });
}
export async function bookPages<T>(bookId: string): Promise<T[]> {
  const d = await db();
  return new Promise((resolve, reject) => {
    const tx = d.transaction("bookPages");
    const r = tx
      .objectStore("bookPages")
      .index("bookId")
      .getAll(IDBKeyRange.only(bookId));
    tx.oncomplete = () => resolve(r.result);
    tx.onerror = () => reject(tx.error);
  });
}
export async function deleteBook(id: string) {
  const d = await db();
  return new Promise<void>((resolve, reject) => {
    const tx = d.transaction(["books", "bookPages"], "readwrite");
    tx.objectStore("books").delete(id);
    const r = tx
      .objectStore("bookPages")
      .index("bookId")
      .openCursor(IDBKeyRange.only(id));
    r.onsuccess = () => {
      const cursor = r.result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}
export async function patch(
  store: Store,
  id: string,
  fields: Record<string, unknown>,
) {
  const d = await db();
  return new Promise<void>((resolve, reject) => {
    const tx = d.transaction(store, "readwrite"),
      os = tx.objectStore(store),
      r = os.get(id);
    r.onsuccess = () => {
      if (r.result) os.put({ ...r.result, ...fields, id });
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

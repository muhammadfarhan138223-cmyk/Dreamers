import { test } from "node:test";
import assert from "node:assert/strict";
import "fake-indexeddb/auto";
import * as db from "../lib/db.ts";
test("v1 device storage upgrades to v3 with saved notes and queued work intact", async () => {
  await new Promise((resolve, reject) => {
    const r = indexedDB.open("dreamers-local", 1);
    r.onupgradeneeded = () => {
      for (const s of [
        "packs",
        "events",
        "notes",
        "cards",
        "settings",
        "queue",
      ])
        r.result.createObjectStore(s, { keyPath: "id" });
    };
    r.onsuccess = () => {
      const tx = r.result.transaction(["notes", "queue"], "readwrite");
      tx.objectStore("notes").put({
        id: "old-note",
        kind: "note",
        text: "keep this",
      });
      tx.objectStore("queue").put({
        id: "old-event",
        kind: "lesson",
        target: "cell-basics",
        at: 1,
      });
      tx.oncomplete = () => {
        r.result.close();
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    };
  });
  assert.equal((await db.list("notes"))[0].text, "keep this");
  assert.equal((await db.list("queue")).length, 1);
  assert.deepEqual(await db.list("assessments"), []);
  assert.deepEqual(await db.list("books"), []);
  assert.deepEqual(await db.bookPages("missing-book"), []);
});

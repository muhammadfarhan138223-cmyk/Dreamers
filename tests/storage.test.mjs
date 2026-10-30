import { test } from "node:test";
import assert from "node:assert/strict";
import "fake-indexeddb/auto";
import * as db from "../lib/db.ts";
test("local event and sync queue are atomic and replay-safe", async () => {
  const event = {
    id: "lesson:cell-basics",
    kind: "lesson",
    target: "cell-basics",
    at: 1,
  };
  await db.record(event);
  await db.record(event);
  const events = await db.list("events"),
    queue = await db.list("queue");
  assert.equal(events.length, 1);
  assert.equal(queue.length, 1);
  assert.equal(queue[0].sync, "awaiting-account");
  assert.equal(events[0].target, "cell-basics");
});
test("removing downloaded content preserves unsynchronized attempts and notes", async () => {
  await db.put("notes", { id: "my-note", text: "A private learning note" });
  await db.put("packs", { id: "cells-starter", version: 1 });
  await db.remove("packs", "cells-starter");
  assert.equal((await db.list("packs")).length, 0);
  assert.ok((await db.list("events")).length);
  assert.equal((await db.list("notes"))[0].text, "A private learning note");
  const backup = await db.exportData();
  assert.ok(backup.queue.length);
  assert.equal(backup.schemaVersion, 1);
});
test("backup restoration merges by record ID and preserves newer local notes", async () => {
  await db.put("notes", {
    id: "merge-note",
    kind: "note",
    text: "new local",
    at: 100,
  });
  await db.restoreData({
    notes: [{ id: "merge-note", kind: "note", text: "old backup", at: 50 }],
    events: [
      {
        id: "restored-attempt",
        kind: "attempt",
        target: "q1",
        correct: true,
        at: 30,
      },
    ],
  });
  assert.equal(
    (await db.list("notes")).find((n) => n.id === "merge-note").text,
    "new local",
  );
  assert.ok((await db.list("queue")).some((e) => e.id === "restored-attempt"));
  await db.restoreData({
    events: [
      {
        id: "restored-attempt",
        kind: "attempt",
        target: "q1",
        correct: true,
        at: 30,
      },
    ],
  });
  assert.equal(
    (await db.list("events")).filter((e) => e.id === "restored-attempt").length,
    1,
  );
});

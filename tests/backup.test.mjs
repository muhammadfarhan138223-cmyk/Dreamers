import { test } from "node:test";
import assert from "node:assert/strict";
import { validateBackup } from "../lib/backup.mjs";
test("backup rejects unsupported schemas and unsafe bookmark destinations", () => {
  assert.throws(() => validateBackup({ schemaVersion: 2 }));
  assert.throws(() =>
    validateBackup({
      schemaVersion: 1,
      notes: [{ id: "x", kind: "bookmark", href: "javascript:alert(1)" }],
    }),
  );
});
test("backup validates event evidence and keeps imported packs out of runtime", () => {
  assert.throws(() =>
    validateBackup({
      schemaVersion: 1,
      events: [{ id: "x", kind: "attempt", target: "q1", at: 1 }],
    }),
  );
  const value = validateBackup({
    schemaVersion: 1,
    events: [{ id: "x", kind: "attempt", target: "q1", at: 1, correct: true }],
  });
  assert.equal(value.events.length, 1);
  assert.deepEqual(value.packs, []);
});

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
test("saved chapter assessment is importable and malformed answers are rejected", () => {
  const assessment = {
    id: "assessment:backup",
    packId: "cells-starter",
    packVersion: 1,
    status: "in-progress",
    order: Array.from({ length: 12 }, (_, i) => "q" + (i + 1)),
    answers: { q1: 2 },
    index: 0,
    startedAt: 10,
    at: 20,
    deadline: null,
  };
  assert.equal(
    validateBackup({ schemaVersion: 1, assessments: [assessment] }).assessments
      .length,
    1,
  );
  assert.throws(() =>
    validateBackup({
      schemaVersion: 1,
      assessments: [{ ...assessment, answers: { q1: 99 } }],
    }),
  );
});

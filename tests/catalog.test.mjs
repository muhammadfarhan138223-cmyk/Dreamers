import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createHash } from "node:crypto";
import { PACKS, packForRoute, packForQuestion } from "../lib/catalog.mjs";
import { validatePack } from "../lib/pack-validation.mjs";
import { validateBackup } from "../lib/backup.mjs";
import { summarize } from "../lib/progress.mjs";
test("every published pack is valid and matches its integrity digest", () => {
  for (const meta of PACKS) {
    const bytes = fs.readFileSync("public" + meta.url),
      pack = JSON.parse(bytes);
    assert.equal(createHash("sha256").update(bytes).digest("hex"), meta.sha256);
    assert.deepEqual(validatePack(pack), []);
    assert.equal(pack.lessons.length, meta.lessonIds.length);
    assert.equal(pack.questions.length, meta.questionIds.length);
  }
});
test("lesson and question IDs are unique across all science packs", () => {
  for (const key of ["lessonIds", "questionIds"]) {
    const ids = PACKS.flatMap((p) => p[key]);
    assert.equal(new Set(ids).size, ids.length);
  }
  assert.equal(packForRoute("/practice/physics").id, "motion-foundation");
  assert.equal(packForQuestion("chem-q1").subject, "chemistry");
});
test("new subject progress survives backup validation without changing legacy IDs", () => {
  const value = validateBackup({
    schemaVersion: 1,
    events: [
      { id: "legacy", kind: "attempt", target: "q1", correct: true, at: 1 },
      { id: "new", kind: "attempt", target: "chem-q1", correct: true, at: 2 },
    ],
    notes: [
      { id: "b", kind: "bookmark", href: "/learn/chemistry/atoms/chem-ions" },
    ],
  });
  assert.equal(value.events.length, 2);
  assert.equal(summarize(value.events).xp, 20);
});
test("Chemistry lessons cannot incorrectly unlock the Cell explorer achievement", () => {
  const state = summarize(
    PACKS.find((p) => p.subject === "chemistry").lessonIds.map((target, i) => ({
      id: String(i),
      kind: "lesson",
      target,
      at: i,
    })),
  );
  assert.ok(!state.achievements.includes("Cell explorer"));
});
test("malformed imports return validation errors rather than crashing", () => {
  assert.ok(validatePack({ lessons: {}, questions: {} }).length);
  assert.ok(validatePack({ lessons: [null], questions: [null] }).length);
});
test("assessment backup accepts a Chemistry run and preserves its pack identity", () => {
  const meta = PACKS.find((p) => p.subject === "chemistry");
  const run = {
    id: "chem-run",
    packId: meta.id,
    packVersion: meta.version,
    status: "in-progress",
    order: meta.questionIds,
    answers: { "chem-q1": 2 },
    index: 0,
    at: 1,
    startedAt: 1,
    deadline: null,
  };
  assert.equal(
    validateBackup({ schemaVersion: 1, assessments: [run] }).assessments[0]
      .packId,
    meta.id,
  );
});

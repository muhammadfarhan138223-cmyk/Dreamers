import { test } from "node:test";
import assert from "node:assert/strict";
import { summarize, dueAt } from "../lib/progress.mjs";
test("repeating a lesson or correct answer cannot farm XP", () => {
  const events = [
    { kind: "lesson", target: "a", at: 1 },
    { kind: "lesson", target: "a", at: 2 },
    { kind: "attempt", target: "q1", correct: true, at: 3 },
    { kind: "attempt", target: "q1", correct: true, at: 4 },
  ];
  assert.equal(summarize(events).xp, 35);
  assert.equal(summarize(events).attempts, 2);
});
test("mistake review uses latest evidence without erasing history", () => {
  const state = summarize([
    { kind: "attempt", target: "q1", correct: false, at: 1 },
    { kind: "attempt", target: "q1", correct: true, at: 2 },
  ]);
  assert.equal(state.accuracy, 50);
  assert.deepEqual(state.mistakes, []);
  assert.equal(state.xp, 10);
});
test("new learner has no invented readiness", () => {
  const state = summarize([]);
  assert.equal(state.accuracy, null);
  assert.equal(state.xp, 0);
  assert.deepEqual(state.achievements, []);
});
test("review schedule shortens after struggle", () => {
  assert.ok(dueAt(4, "again", 0).due < dueAt(4, "good", 0).due);
  assert.equal(dueAt(25, "good", 0).interval, 30);
});

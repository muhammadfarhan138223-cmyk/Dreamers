import { test } from "node:test";
import assert from "node:assert/strict";
import {
  newChapterRun,
  validChapterRun,
  chapterCoverage,
  prepareChapter,
  REQUEST_SPACING_MS,
} from "../lib/chapter-study.mjs";
import { STUDY_POLICY } from "../lib/study-practice.mjs";
import { validateBackup } from "../lib/backup.mjs";
const scope = {
  bookId: "book:" + "a".repeat(64),
  chapter: "bio12-1",
  mode: "short",
  language: "English",
  grade: "XII",
  subject: "biology",
  first: 1,
  last: 5,
};
const text =
  "Homeostasis maintains a stable internal environment despite external changes. ".repeat(
    10,
  );
test("chapter journal preserves source identity and remains exportable without secrets", () => {
  const run = newChapterRun(scope, 1);
  assert.equal(validChapterRun(run, scope), true);
  assert.ok(run.id.length <= 160);
  assert.equal(
    validChapterRun({ ...run, pages: { 100: "saved" } }, scope),
    false,
  );
  assert.equal(validChapterRun({ ...run, policy: "old" }, scope), false);
  assert.equal(validChapterRun(run, { ...scope, first: 2 }), false);
  assert.throws(() => newChapterRun({ ...scope, last: 1501 }));
  assert.equal(
    validateBackup({ schemaVersion: 1, settings: [run] }).settings[0].id,
    run.id,
  );
});
test("preparation reuses saved pages, distinguishes scans/exercises/empty answers and pauses on quota errors", async () => {
  let stored = newChapterRun(scope, 1),
    now = 0;
  const saved = new Set([1]),
    calls = [],
    waits = [];
  let unavailable = true;
  const options = {
    run: stored,
    persist: async (r) => {
      stored = structuredClone(r);
    },
    hasSaved: async (p) => saved.has(p),
    loadSource: async (p) => ({
      page: p,
      text:
        p === 2 ? "scan" : p === 3 ? "SECTION 3: LONG QUESTIONS " + text : text,
    }),
    createPractice: async (s) => {
      calls.push(s.page);
      if (s.page === 5 && unavailable)
        throw new Error("429: shared AI allowance exhausted");
      if (s.page === 4) return false;
      saved.add(s.page);
      return true;
    },
    shouldPause: () => null,
    now: () => now,
    wait: async (until) => {
      waits.push(until);
      now = until;
    },
  };
  let result = await prepareChapter(options);
  assert.equal(result.status, "paused");
  assert.match(result.message, /429/);
  assert.deepEqual(result.pages, {
    1: "saved",
    2: "unreadable",
    3: "exercise",
    4: "empty",
  });
  assert.deepEqual(calls, [4, 5]);
  assert.equal(waits[0], REQUEST_SPACING_MS);
  unavailable = false;
  result = await prepareChapter({ ...options, run: stored });
  assert.equal(result.status, "complete");
  assert.deepEqual(calls, [4, 5, 5]);
  assert.equal(result.pages[5], "saved");
});
test("a saved question set recovers after journal storage interruption without another provider call", async () => {
  const scope2 = { ...scope, last: 2 };
  let stored = newChapterRun(scope2, 0),
    failures = 0,
    interrupt = true;
  const saved = new Set(),
    calls = [];
  const options = {
    run: stored,
    persist: async (r) => {
      if (interrupt && saved.has(1) && failures++ < 2)
        throw new Error("Storage interruption");
      stored = structuredClone(r);
    },
    hasSaved: async (p) => saved.has(p),
    loadSource: async (p) => ({ page: p, text }),
    createPractice: async (s) => {
      calls.push(s.page);
      saved.add(s.page);
      return true;
    },
    shouldPause: () => null,
    wait: async () => {},
    now: () => 0,
  };
  await assert.rejects(() => prepareChapter(options), /Storage/);
  assert.deepEqual(calls, [1]);
  interrupt = false;
  const result = await prepareChapter({ ...options, run: stored });
  assert.equal(result.status, "complete");
  assert.deepEqual(calls, [1, 2]);
});
test("student pause and hidden/offline state cannot start another page request", async () => {
  let paused = false,
    stored = newChapterRun({ ...scope, last: 2 }, 0);
  const saved = new Set(),
    calls = [];
  const options = {
    run: stored,
    persist: async (r) => {
      stored = structuredClone(r);
    },
    hasSaved: async (p) => saved.has(p),
    loadSource: async (p) => ({ page: p, text }),
    createPractice: async (s) => {
      calls.push(s.page);
      saved.add(s.page);
      paused = true;
      return true;
    },
    shouldPause: () => (paused ? "Student paused" : null),
    wait: async () => {},
    now: () => 0,
  };
  const result = await prepareChapter(options);
  assert.equal(result.status, "paused");
  assert.deepEqual(calls, [1]);
  assert.equal(result.pages[1], "saved");
  const offline = await prepareChapter({
    ...options,
    run: stored,
    shouldPause: () => "Offline",
  });
  assert.equal(offline.message, "Offline");
  assert.deepEqual(calls, [1]);
});
test("coverage counts only current source sets in the selected mode/language, never answers or mastery", () => {
  const s = {
    id: "study-set:x:English",
    page: 1,
    questions: [{}],
    policy: STUDY_POLICY,
    mode: "short",
  };
  const coverage = chapterCoverage(
    1,
    3,
    [
      s,
      { ...s, page: 1 },
      { ...s, page: 2, policy: "old" },
      { ...s, page: 2, language: "Urdu" },
      { ...s, page: 3, questions: [] },
      { ...s, page: 4 },
    ],
    "short",
    "English",
  );
  assert.deepEqual(coverage, { saved: [1], total: 3 });
});

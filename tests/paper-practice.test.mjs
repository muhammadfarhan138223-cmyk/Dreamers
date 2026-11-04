import { test } from "node:test";
import assert from "node:assert/strict";
import { assemblePaper, scopedQuiz } from "../lib/paper-practice.mjs";
import { schemeForBook } from "../lib/exam-schemes.mjs";
import { urinaryMission, urinaryWritten } from "../lib/urinary-mission.mjs";

function item(chapter, kind, index) {
  const id = `${chapter}:${kind}:${index}`;
  return {
    id,
    chapter,
    kind,
    question: "Question " + id,
    answer: "Answer " + id,
  };
}

test("chapter and custom scopes keep only selected chapters, balance samples and deduplicate", () => {
  const first = item(13, "mcq", 0);
  const bank = [
    first,
    { ...first, id: "duplicate" },
    item(13, "mcq", 2),
    item(14, "mcq", 0),
    item(15, "mcq", 0),
    item(14, "short", 0),
  ];
  assert.deepEqual(
    scopedQuiz(bank, [13, 14], 3).map((q) => q.id),
    ["13:mcq:0", "14:mcq:0", "13:mcq:2"],
  );
  assert.deepEqual(scopedQuiz(bank, [21]), []);
});

test("Biology full mock opens only after every offered slot and long pair is filled", () => {
  const scheme = schemeForBook("biology-xii-supplied");
  const counts = (mapping, kind) =>
    Object.entries(mapping).flatMap(([chapter, count]) =>
      Array.from({ length: count }, (_, i) => item(Number(chapter), kind, i)),
    );
  const bank = [
    ...counts(scheme.objective.byChapter, "mcq"),
    ...scheme.shortGroups.flatMap((g) => counts(g.chapters, "short")),
    ...scheme.long.pairs.flatMap((pair) =>
      pair.chapters.map((chapter) => item(chapter, "long", 0)),
    ),
  ];
  const full = assemblePaper(scheme, bank);
  assert.equal(full.objective.length, 17);
  assert.deepEqual(
    full.short.map((g) => [g.questions.length, g.attempt, g.marksEach]),
    [
      [12, 8, 2],
      [12, 8, 2],
      [9, 6, 2],
    ],
  );
  assert.deepEqual(
    full.long[1].parts.map((q) => q.chapter),
    [14, 24],
  );
  assert.deepEqual(full.gaps, []);
  const partial = assemblePaper(
    scheme,
    bank.filter((q) => q.id !== "24:long:0"),
  );
  assert.deepEqual(partial.gaps, [{ chapter: 24, kind: "long", missing: 1 }]);
  assert.equal(
    assemblePaper(schemeForBook("english-xii-supplied"), bank),
    null,
  );
});

test("the offline mission ships eight distinct playable checkpoints and written answer keys", () => {
  assert.equal(new Set(urinaryMission.map((q) => q.id)).size, 8);
  assert.ok(urinaryMission.every((q) => q.options[q.correct] && q.explanation));
  assert.deepEqual(
    urinaryWritten.map((q) => q.marks),
    [2, 2, 2, 4],
  );
});

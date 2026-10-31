import { test } from "node:test";
import assert from "node:assert/strict";
import {
  EXAM_SCHEMES,
  schemeForBook,
  schemeChapterFacts,
} from "../lib/exam-schemes.mjs";
import { textbook } from "../lib/textbooks.mjs";
test("inspected science scheme totals and attempt rules are internally consistent with mapped book chapters", () => {
  for (const s of EXAM_SCHEMES.filter((s) => s.shortGroups)) {
    const b = textbook(s.bookId);
    const numbers = new Set(b.chapters.map((c) => c.number));
    assert.equal(
      Object.values(s.objective.byChapter).reduce((a, b) => a + b, 0),
      s.objective.marks,
    );
    for (const g of s.shortGroups) {
      assert.equal(
        Object.values(g.chapters).reduce((a, b) => a + b, 0),
        g.offered,
      );
      for (const n of Object.keys(g.chapters))
        assert.ok(numbers.has(Number(n)));
    }
    assert.equal(s.long.pairs.length, s.long.offered);
    for (const p of s.long.pairs)
      for (const n of p.chapters) assert.ok(numbers.has(n));
    assert.equal(
      s.objective.marks +
        s.shortGroups.reduce((sum, g) => sum + g.attempt * g.marksEach, 0) +
        s.long.attempt * s.long.partMarks * (s.long.parts || 2),
      s.totalMarks,
    );
  }
});
test("scheme source pages are appendices and never become last-chapter preparation pages", () => {
  for (const s of EXAM_SCHEMES) {
    const b = textbook(s.bookId);
    assert.ok(b);
    assert.ok(b.chapters.at(-1).endPage < s.sourcePages[0]);
    for (const p of s.sourcePages) assert.ok(p >= 1 && p <= b.pages);
    assert.equal(s.verification, "file-inspected-board-pending");
  }
  assert.equal(
    schemeForBook("biology-xii-supplied").yearLabel,
    "2026–27 (as printed)",
  );
  assert.equal(schemeForBook("chemistry-xii-supplied").yearLabel, null);
  assert.equal(schemeForBook("biology-xi"), undefined);
});
test("a chapter absent from long pairs still retains its MCQ and short-question preparation", () => {
  const facts = schemeChapterFacts(schemeForBook("biology-xii-supplied"), 18);
  assert.equal(facts.mcqs, 2);
  assert.deepEqual(facts.short, [{ question: 3, count: 4 }]);
  assert.deepEqual(facts.pairs, []);
  const english = schemeForBook("english-xii-supplied");
  assert.equal(
    english.objective.groups.reduce((sum, g) => sum + g.marks, 0),
    20,
  );
  assert.equal(
    english.sections.reduce((sum, g) => sum + g.marks, 0),
    80,
  );
});

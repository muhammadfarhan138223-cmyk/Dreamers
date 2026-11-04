import { test } from "node:test";
import assert from "node:assert/strict";
import { textbook } from "../lib/textbooks.mjs";
import { chapterAtPage } from "../lib/book-retrieval.mjs";
import { assemblePaper } from "../lib/paper-practice.mjs";
import { schemeForBook } from "../lib/exam-schemes.mjs";
import {
  chapterPracticeCards,
  chapterPracticeTopics,
  mappedPracticeBooks,
} from "../lib/textbook-practice.mjs";
import {
  extractExerciseMcqs,
  reviewedExerciseAnswer,
} from "../lib/exercise-mcqs.mjs";

test("all added book chapters have offline concept MCQs, short answers and a long answer", () => {
  const ids = new Set();
  for (const id of mappedPracticeBooks) {
    const book = textbook(id);
    for (const [i, chapter] of book.chapters.entries()) {
      const number = chapter.number ?? i + 1;
      const topics = chapterPracticeTopics(id, number);
      assert.ok(topics.length >= 2, chapter.title);
      for (const [page] of topics)
        assert.equal(chapterAtPage(book, page)?.id, chapter.id);
      for (const mode of ["mcq", "short", "long"]) {
        const cards = chapterPracticeCards(id, number, mode);
        assert.ok(cards.length);
        for (const card of cards) {
          assert.ok(card.question && card.answer);
          assert.ok(!ids.has(card.id));
          ids.add(card.id);
          if (mode === "mcq") {
            assert.equal(new Set(card.options).size, 4);
            assert.equal(card.options[card.correct], card.answer);
          }
        }
      }
    }
  }
  assert.deepEqual(chapterPracticeCards("unknown", 1, "mcq"), []);
});

test("Chemistry XII offline practice fills all its appendix mock slots", () => {
  const id = "chemistry-xii-supplied";
  const bank = textbook(id).chapters.flatMap(({ number }) =>
    ["mcq", "short", "long"].flatMap((kind) =>
      chapterPracticeCards(id, number, kind).map((card) => ({
        ...card,
        kind,
        chapter: number,
      })),
    ),
  );
  assert.deepEqual(assemblePaper(schemeForBook(id), bank).gaps, []);
});

test("exercise extraction handles Roman and dotted numbering across pages and skips incomplete options", () => {
  const pages = [
    {
      page: 9,
      text: "Example\n1. Ignore this item outside the section?\n(a) one (b) two (c) three (d) four\nQ1. MUTIPLE CHOICE QUESTIONS\nI) Which option has one syllable?\na) Apple b) Word",
    },
    {
      page: 10,
      text: "1 Chap 13 Header\n10\nc) Apple tree d) Two items\n13.2 Which choices have a broken layout?\n(a) first (b) second (d) fourth\n13.3 Which is a lowercase letter?\n(a) A (b) b (c) C (d) D\n[] Short Answer Questions E|\n1. Ignore later questions?\na) one b) two c) three d) four",
    },
  ];
  const items = extractExerciseMcqs(pages);
  assert.deepEqual(
    items.map(({ page, number, options }) => ({ page, number, options })),
    [
      {
        page: 9,
        number: "I",
        options: ["Apple", "Word", "Apple tree", "Two items"],
      },
      { page: 10, number: "13.3", options: ["A", "b", "C", "D"] },
    ],
  );
});

test("only reviewed exact book, chapter, page and option receive an exercise key", () => {
  const item = {
    page: 10,
    number: "1",
    options: ["A", "B", "C", "Homeostasis"],
  };
  assert.equal(
    reviewedExerciseAnswer("biology-xii-supplied", "bio12-1", item),
    3,
  );
  assert.equal(
    reviewedExerciseAnswer("biology-xii-supplied", "bio12-3", item),
    undefined,
  );
  assert.equal(
    reviewedExerciseAnswer("biology-xii-supplied", "bio12-1", {
      ...item,
      page: 9,
    }),
    undefined,
  );
  assert.equal(reviewedExerciseAnswer("unknown", "bio12-1", item), undefined);
});

test("an unnumbered textbook stem can follow a complete option block", () => {
  const items = extractExerciseMcqs([
    {
      page: 82,
      text: "Multiple Choice Questions\n1. Which material is a conductor?\n(a) Iron (b) Rubber (c) Glass (d) Dry wood\nA capacitor is connected to a DC supply. What is stored?\n(a) Charge (b) Air (c) Water (d) Sound\nShort Answer Questions",
    },
  ]);
  assert.equal(items.length, 2);
  assert.equal(
    items[1].question,
    "A capacitor is connected to a DC supply. What is stored?",
  );
});

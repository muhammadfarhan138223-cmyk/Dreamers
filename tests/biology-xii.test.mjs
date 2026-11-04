import { test } from "node:test";
import assert from "node:assert/strict";
import {
  BIOLOGY_XII,
  biologyChapterCards,
  biologyChapterTopics,
} from "../lib/biology-xii.mjs";
import { textbook } from "../lib/textbooks.mjs";
import { chapterAtPage } from "../lib/book-retrieval.mjs";
import { assemblePaper } from "../lib/paper-practice.mjs";
import { schemeForBook } from "../lib/exam-schemes.mjs";

test("Biology XII chapters have unique offline questions in each stage and PDF notes within the exact chapter", () => {
  const book = textbook(BIOLOGY_XII);
  assert.equal(book.chapters.length, 13);
  const ids = new Set();
  for (const chapter of book.chapters) {
    for (const [page] of biologyChapterTopics(book.id, chapter.number)) {
      assert.equal(chapterAtPage(book, page).id, chapter.id);
    }
    for (const mode of ["mcq", "short", "long"]) {
      const cards = biologyChapterCards(book.id, chapter.number, mode);
      assert.ok(cards.length >= (mode === "long" ? 1 : 4));
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
  assert.deepEqual(biologyChapterCards("another-book", 13, "mcq"), []);
});

test("original Biology XII bank fills its book-appendix mock without another subject or AI", () => {
  const book = textbook(BIOLOGY_XII);
  const bank = book.chapters.flatMap(({ number }) =>
    ["mcq", "short", "long"].flatMap((kind) =>
      biologyChapterCards(book.id, number, kind).map((card) => ({
        ...card,
        kind,
        chapter: number,
      })),
    ),
  );
  const mock = assemblePaper(schemeForBook(book.id), bank);
  assert.deepEqual(mock.gaps, []);
  assert.equal(mock.objective.length, 17);
  assert.equal(
    mock.short.reduce((count, group) => count + group.questions.length, 0),
    33,
  );
  assert.equal(mock.long.length, 5);
});

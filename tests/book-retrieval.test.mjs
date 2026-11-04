import { test } from "node:test";
import assert from "node:assert/strict";
import "fake-indexeddb/auto";
import * as db from "../lib/db.ts";
import {
  excerptForQuestion,
  retrievalTerms,
  chapterAtPage,
  highlightPassage,
} from "../lib/book-retrieval.mjs";
import { textbook } from "../lib/textbooks.mjs";
test("question excerpts preserve original text and find relevant material after the initial 2000 characters", () => {
  const source =
    "Unrelated opening material. ".repeat(200) +
    "Kidney filtration takes place in the nephron. " +
    "Other concluding material. ".repeat(150);
  const excerpt = excerptForQuestion(
    source,
    "Please explain kidney filtration in simple words",
  );
  assert.ok(excerpt.length <= 2000);
  assert.ok(source.includes(excerpt));
  assert.match(excerpt, /Kidney filtration/);
  assert.ok(!excerpt.startsWith("Unrelated opening"));
  assert.deepEqual(retrievalTerms("kya hai mein please explain"), []);
  assert.deepEqual(retrievalTerms("Kidney kidney"), ["kidney"]);
  assert.equal(excerptForQuestion("short source", "source"), "short source");
});
test("retrieved reference maps to its actual chapter and never labels an appendix as the last lesson", () => {
  const book = textbook("biology-xii-supplied");
  assert.equal(chapterAtPage(book, 12).id, "bio12-2");
  assert.equal(chapterAtPage(book, 246).id, "bio12-13");
  assert.equal(chapterAtPage(book, 247), null);
  assert.equal(chapterAtPage(book, 0), null);
  assert.equal(chapterAtPage(null, 12), null);
});
test("private-book retrieval cannot return a stronger match from a different local book", async () => {
  await db.put("bookPages", {
    id: "retrieve:a",
    bookId: "private-a",
    page: 12,
    text: "The kidney filters the blood through nephrons.",
  });
  await db.put("bookPages", {
    id: "retrieve:b",
    bookId: "private-b",
    page: 5,
    text: "kidney filtration nephron anatomy explanation",
  });
  const hits = await db.searchPages(
    retrievalTerms("explain kidney filtration").join(" "),
    ["private-a"],
    5,
  );
  assert.equal(hits.length, 1);
  assert.equal(hits[0].bookId, "private-a");
  assert.equal(hits[0].page, 12);
  assert.match(excerptForQuestion(hits[0].text, "kidney"), /kidney/);
});

test("highlights literal extracted text without interpreting markup", () => {
  const text = "The KIDNEY contains nephrons. <kidney>";
  const parts = highlightPassage(text, "please explain kidney nephron (.*)");
  assert.equal(parts.map((p) => p.text).join(""), text);
  assert.deepEqual(
    parts.filter((p) => p.match).map((p) => p.text),
    ["KIDNEY", "nephron", "kidney"],
  );
  assert.deepEqual(
    highlightPassage("گردے میں نیفرون", "نیفرون")
      .filter((p) => p.match)
      .map((p) => p.text),
    ["نیفرون"],
  );
});

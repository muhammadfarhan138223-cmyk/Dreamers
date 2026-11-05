import { test } from "node:test";
import assert from "node:assert/strict";
import {
  swipePage,
  readerPageQuery,
  readerQuestion,
} from "../lib/reader-tools.mjs";
import { textbook } from "../lib/textbooks.mjs";
test("horizontal swipes turn exactly one page, vertical reading and accidental drags do not", () => {
  const base = { dx: -120, dy: 12, elapsed: 220, page: 11, total: 88 };
  assert.equal(swipePage(base), 12);
  assert.equal(swipePage({ ...base, dx: 110 }), 10);
  for (const movement of [
    { dx: 20 },
    { dy: 160 },
    { elapsed: 1200 },
    { dx: 0, dy: 200 },
  ])
    assert.equal(swipePage({ ...base, ...movement }), 11);
  assert.equal(swipePage({ ...base, page: 88 }), 88);
  assert.equal(swipePage({ ...base, dx: 100, page: 1 }), 1);
});
test("page lookup accepts English, Urdu and Arabic digits without turning dates or topics into made-up pages", () => {
  for (const query of [
    "11",
    "page 11",
    "PDF page 11",
    "p. 11",
    "صفحہ ۱۱",
    "١١",
  ])
    assert.equal(readerPageQuery(query, 88), 11);
  for (const query of ["1969", "page 0", "999"])
    assert.equal(readerPageQuery(query, 88), 0);
  for (const query of ["kidney", "1969 mein kya hua", "aain kya hota hai"])
    assert.equal(readerPageQuery(query, 88), null);
});
test("typed questions in scanned or unmapped books never borrow the Biology foundation context", () => {
  const book = { title: "Pakistan Studies" };
  const catalog = textbook("pakistan-studies-xii-supplied");
  const input = readerQuestion({
    book,
    catalog,
    page: 11,
    pageText: "",
    question: "Aain kya hota hai?",
  });
  assert.equal(input.topic, "book-overview");
  assert.equal(input.textbookId, catalog.id);
  assert.equal(input.referenceOnly, false);
  assert.equal(input.bookContext.text, "");
  assert.equal(input.packId, undefined);
  const personal = readerQuestion({
    book,
    page: 11,
    pageText: "",
    question: "What does this word mean?",
  });
  assert.equal(personal.contextKind, "pdf");
  assert.equal(personal.topic, "pdf-page");
});
test("readable-page question stays bound to its chapter, source excerpt and bounded previous explanation", () => {
  const catalog = textbook("biology-xii-supplied");
  const input = readerQuestion({
    book: catalog,
    catalog,
    page: 12,
    pageText: "Kidneys filter blood. ".repeat(200),
    question: "Explain kidney",
    previous: "x".repeat(4000),
  });
  assert.equal(input.topic, "bio12-2");
  assert.equal(input.bookContext.page, 12);
  assert.ok(input.bookContext.text.length <= 2000);
  assert.equal(input.previous.length, 2000);
});

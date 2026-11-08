import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { textbook } from "../lib/textbooks.mjs";
import {
  readerChapter,
  readerIntent,
  retrieveReaderSources,
  boundedConversation,
  cleanTutorAnswer,
} from "../lib/reader-retrieval.mjs";
const catalog = textbook("english-xii-supplied");
const pack = JSON.parse(
  fs.readFileSync("public/book-text/english-xii-v1.json", "utf8"),
);
test("chapter references follow the latest user question rather than stale assistant refusals", () => {
  const conversation = [
    {
      role: "user",
      text: "the giving tree ki kiya stoey simple summary batao",
    },
    {
      role: "assistant",
      text: "The Giving Tree: I cannot count exercises from page 2.",
    },
  ];
  assert.equal(
    readerChapter(catalog, "sawaal kitny han", conversation, 2).id,
    "eng12-5",
  );
  assert.equal(
    readerChapter(catalog, "1st chaapter ky sawaal", conversation, 2).id,
    "eng12-1",
  );
  assert.equal(
    readerChapter(
      catalog,
      "journey to taif ky excersice waly question answer",
      conversation,
      2,
    ).id,
    "eng12-1",
  );
  assert.equal(readerIntent("ecerciese ma kitny han"), "exercise");
  assert.equal(readerIntent("the giving tree ki stoey summary"), "summary");
  assert.equal(
    readerChapter(catalog, "is page ko samjhao", conversation, 12).id,
    "eng12-2",
  );
});
test("real English source retrieval includes scanned exercise pages and story evidence from the named chapter", () => {
  assert.equal(pack.sha256, catalog.sha256);
  assert.equal(pack.pages.length, 165);
  assert.equal(pack.pages[8].method, "ocr");
  assert.match(pack.pages[8].text, /Answer the following questions/);
  assert.match(pack.pages[9].text, /Choose the correct option/);
  const result = retrieveReaderSources({
    catalog,
    question: "journey to taif ky exercise question answer batao",
    page: 2,
    pages: pack.pages,
  });
  assert.equal(result.chapter.id, "eng12-1");
  assert.ok(result.sources.some((p) => p.page === 9));
  assert.ok(result.sources.some((p) => p.page === 10));
  assert.ok(result.sources.some((p) => p.page === 6 || p.page === 7));
  assert.ok(
    result.sources.every(
      (p) => p.page >= 5 && p.page <= 11 && p.text.length <= 3000,
    ),
  );
  assert.ok(result.sources.length <= 6);
  const giving = retrieveReaderSources({
    catalog,
    question: "the giving tree simple summary batao",
    page: 2,
    pages: pack.pages,
  });
  assert.ok(giving.sources.every((p) => p.page >= 37 && p.page <= 42));
});
test("conversation and answer display stay bounded and do not expose raw formatting", () => {
  const history = Array.from({ length: 20 }, (_, i) => ({
    role: i % 2 ? "assistant" : "user",
    text: "x".repeat(900),
  }));
  assert.equal(boundedConversation(history).length, 6);
  assert.ok(boundedConversation(history).every((m) => m.text.length <= 500));
  assert.equal(
    cleanTutorAnswer("**Short summary** &#x20;\n1. A `tree`."),
    "Short summary  \n1. A tree.",
  );
});

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  TEXTBOOKS,
  textbookByHash,
  textbookTopic,
  topicSuggestions,
  textbookSearch,
} from "../lib/textbooks.mjs";
import { tutorScopePolicy } from "../lib/tutor-policy.mjs";
test("supplied textbook catalog has unique file fingerprints and valid source page pointers", () => {
  assert.equal(TEXTBOOKS.length, 16);
  assert.equal(new Set(TEXTBOOKS.map((b) => b.sha256)).size, 16);
  const ids = TEXTBOOKS.flatMap((b) => b.chapters.map((t) => t.id));
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(ids.length, 86);
  for (const b of TEXTBOOKS) {
    assert.match(b.sha256, /^[a-f0-9]{64}$/);
    assert.equal(b.access, "local-import");
    assert.ok(["XI", "XII", "XI–XII", "Unconfirmed"].includes(b.class));
    assert.ok(!b.downloadUrl);
    for (const t of b.chapters)
      assert.ok(Number.isInteger(t.page) && t.page >= 1 && t.page <= b.pages);
  }
});
test("file matching ignores download filename so repeated renamed copies resolve to one known book", () => {
  const book = TEXTBOOKS[0];
  assert.equal(textbookByHash(book.sha256).id, book.id);
  assert.equal(textbookByHash("wrong"), undefined);
});
test("suggestions and topic selection stay within the selected supplied textbook", () => {
  const bio = TEXTBOOKS[0],
    phy = TEXTBOOKS[1];
  assert.ok(topicSuggestions(bio.id).every((s) => !s.includes("optics")));
  assert.ok(
    topicSuggestions(phy.id).some((s) => s.includes("thermal physics")),
  );
  assert.equal(textbookTopic(bio.id, phy.chapters[0].id), undefined);
  assert.deepEqual(topicSuggestions("unknown"), []);
  assert.equal(textbookSearch("immunity")[0].bookId, bio.id);
  assert.equal(textbookSearch("python")[0].bookId, TEXTBOOKS[2].id);
  assert.deepEqual(textbookSearch("immunity", phy.id), []);
  assert.deepEqual(textbookSearch("unrelated celebrity gossip"), []);
});
test("extra teaching material requires explicit opt-in and is kept separate from exam scope", () => {
  assert.match(tutorScopePolicy(), /Textbook-focused mode is the default/);
  assert.match(tutorScopePolicy(false), /do not introduce unrelated topics/);
  assert.match(
    tutorScopePolicy(true),
    /Extra context — outside the textbook scope/,
  );
  assert.match(
    tutorScopePolicy(true),
    /fictional teaching story must be labelled fictional/,
  );
  assert.equal(tutorScopePolicy("true"), tutorScopePolicy(false));
});

test("unreviewed grammar and legacy resources do not leak into curriculum suggestions", () => {
  for (const book of TEXTBOOKS.filter((b) => !b.chapters.length)) {
    assert.deepEqual(topicSuggestions(book.id), []);
    assert.ok(!textbookSearch(book.title).some((t) => t.bookId === book.id));
  }
  const xi = TEXTBOOKS.find((b) => b.id === "chemistry-xi-supplied");
  assert.equal(xi.class, "XI");
  assert.equal(xi.chapters.length, 16);
  const older = TEXTBOOKS.find((b) => b.id === "education-xii-legacy");
  assert.equal(older.kind, "legacy");
});

test("new intake keeps duplicate grammar identity and unconfirmed/older sources out of current textbook suggestions", () => {
  assert.equal(
    TEXTBOOKS.filter(
      (b) =>
        b.sha256 ===
        "131e5ac4c579df5147652aa9c723104f0aa4493ac862523816b033b889d42eca",
    ).length,
    1,
  );
  assert.equal(
    textbookByHash(
      "f933e48f183141654b90c92d3dce39be480575fc9c6d8791d5f7ecbda26afc05",
    ).chapters.length,
    9,
  );
  const geography = TEXTBOOKS.find(
    (b) => b.id === "geography-workbook-supplied",
  );
  assert.deepEqual(geography.classes, []);
  assert.equal(geography.kind, "reference");
  assert.equal(
    TEXTBOOKS.find((b) => b.id === "psychology-xii-legacy").kind,
    "legacy",
  );
  for (const id of [
    "geography-workbook-supplied",
    "psychology-xii-legacy",
    "quran-xii-supplied",
    "pakistan-studies-xii-supplied",
  ])
    assert.deepEqual(topicSuggestions(id), []);
});

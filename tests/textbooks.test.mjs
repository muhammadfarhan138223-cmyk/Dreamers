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
  assert.equal(TEXTBOOKS.length, 3);
  assert.equal(new Set(TEXTBOOKS.map((b) => b.sha256)).size, 3);
  const ids = TEXTBOOKS.flatMap((b) => b.chapters.map((t) => t.id));
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(ids.length, 31);
  for (const b of TEXTBOOKS) {
    assert.match(b.sha256, /^[a-f0-9]{64}$/);
    assert.equal(b.access, "local-import");
    assert.equal(b.class, "XII");
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

import { test } from "node:test";
import assert from "node:assert/strict";
import "fake-indexeddb/auto";
import * as db from "../lib/db.ts";
import {
  findChapters,
  findFoundation,
  matchesSearchFilters,
} from "../lib/global-search.mjs";
import { validateSearchOutput } from "../lib/ai-search.mjs";
import fs from "node:fs";
test("global search crosses class/subject boundaries without inventing chapters", () => {
  const found = findChapters("python");
  assert.ok(found.some((x) => x.bookId === "computer-xi-supplied"));
  assert.ok(found.some((x) => x.bookId === "computer-xii-supplied"));
  assert.ok(
    findChapters("kidneys clean blood", ["urinary"]).some(
      (x) => x.bookId === "biology-xii-supplied",
    ),
  );
  assert.deepEqual(findChapters("invented subject xyz"), []);
  const pack = JSON.parse(fs.readFileSync("public/packs/cells-v1.json"));
  assert.ok(
    findFoundation([pack], "osmosis").some((x) =>
      x.url.includes("/learn/biology/cells/"),
    ),
  );
});
test("AI discovery validates known IDs, bounded search terms and complete JSON", () => {
  assert.deepEqual(
    validateSearchOutput(
      JSON.stringify({
        topicIds: ["bio12-2", "bio12-2"],
        keywords: ["kidney", "kidney"],
      }),
      "stop",
    ),
    { topicIds: ["bio12-2"], keywords: ["kidney"] },
  );
  for (const value of [
    { topicIds: ["invented-chapter"], keywords: [] },
    { topicIds: [], keywords: ["x".repeat(61)] },
    { topicIds: [], keywords: ["bad\nterm"] },
    { topicIds: ["bio12-2"] },
  ])
    assert.throws(() => validateSearchOutput(JSON.stringify(value), "stop"));
  assert.throws(() =>
    validateSearchOutput("Here is a hallucinated answer", "stop"),
  );
  assert.throws(() =>
    validateSearchOutput('{"topicIds":[],"keywords":[]}', "length"),
  );
});
test("cursor-based PDF search reads every book and retains highest-ranked late matches", async () => {
  for (let i = 0; i < 270; i++)
    await db.put("bookPages", {
      id: `search:${String(i).padStart(3, "0")}`,
      bookId: i % 2 ? "book:one" : "book:two",
      page: i + 1,
      text: i === 269 ? "electron charge atom positive" : "electron particle",
    });
  const found = await db.searchPages("electron charge atom");
  assert.equal(found.length, 12);
  assert.equal(found[0].page, 270);
  assert.ok(new Set(found.map((x) => x.bookId)).size === 2);
  assert.deepEqual(await db.searchPages("no-such-learning-keyword"), []);
  assert.equal((await db.searchPages("electron", ["book:two"], 24)).length, 24);
  assert.ok(
    (await db.searchPages("electron", ["book:two"])).every(
      (p) => p.bookId === "book:two",
    ),
  );
  assert.deepEqual(await db.searchPages("electron", []), []);
});

test("filters cover subjects, shared XI/XII resources, unconfirmed class and selected book", () => {
  const any = { subject: "all", grade: "all", book: "all" };
  const shared = {
    id: "grammar",
    subject: "urdu",
    class: "XI–XII",
    classes: ["XI", "XII"],
  };
  assert.equal(matchesSearchFilters(shared, { ...any, grade: "XI" }), true);
  assert.equal(
    matchesSearchFilters(shared, { ...any, subject: "biology" }),
    false,
  );
  assert.equal(
    matchesSearchFilters(shared, { ...any, book: "different" }),
    false,
  );
  assert.equal(
    matchesSearchFilters(
      { id: "geo", subject: "geography", class: "Unconfirmed", classes: [] },
      { ...any, grade: "Unconfirmed" },
    ),
    true,
  );
});

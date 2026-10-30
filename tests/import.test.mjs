import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { validatePack } from "../lib/pack-validation.mjs";
const pack = JSON.parse(fs.readFileSync("public/packs/cells-v1.json", "utf8"));
test("original starter pack passes import validation", () =>
  assert.deepEqual(validatePack(pack), []));
test("import blocks path traversal, missing rights and invented verification provenance", () => {
  const bad = structuredClone(pack);
  bad.id = "../../app";
  bad.license = "";
  bad.verification = "verified";
  bad.questions[0].verification = "verified";
  assert.ok(validatePack(bad).length >= 4);
});
test("import rejects broken topic references and answer keys", () => {
  const bad = structuredClone(pack);
  bad.questions[0].topic = "not-a-topic";
  bad.questions[0].answer = 50;
  assert.ok(validatePack(bad).length >= 2);
});

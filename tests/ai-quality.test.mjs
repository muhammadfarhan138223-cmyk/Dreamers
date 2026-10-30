import { test } from "node:test";
import assert from "node:assert/strict";
import {
  checkEvidenceResponse,
  needsSourceText,
  completionOptions,
} from "../lib/ai-quality.mjs";
const source =
  "Diffusion is the net movement of particles from higher to lower concentration.";
const valid = {
  supported: true,
  answer: "Particles spread down the concentration gradient.",
  sourceQuote: source,
};
test("textbook evidence is required by default; model knowledge is explicit", () => {
  assert.equal(needsSourceText({}, undefined, null), true);
  assert.equal(needsSourceText({}, false, null), false);
  assert.equal(needsSourceText({}, true, { text: source }), false);
  assert.equal(needsSourceText(null, true, null), false);
});
test("evidence responses reject invented quotes, malformed/truncated output and unsafe sizes", () => {
  assert.equal(
    checkEvidenceResponse(JSON.stringify(valid), source, "stop").sourceQuote,
    source,
  );
  for (const v of [
    {
      ...valid,
      sourceQuote: "A completely fabricated quotation from another textbook.",
    },
    { ...valid, sourceQuote: "Diffusion" },
    { ...valid, answer: "x".repeat(6001) },
    { ...valid, supported: "true" },
  ]) {
    assert.throws(() =>
      checkEvidenceResponse(JSON.stringify(v), source, "stop"),
    );
  }
  assert.throws(() =>
    checkEvidenceResponse(JSON.stringify(valid), source, "length"),
  );
  assert.throws(() =>
    checkEvidenceResponse("plain uncheckable answer", source, "stop"),
  );
});
test("unsupported answers discard any generated guesses; multilingual whitespace is normalized", () => {
  const result = checkEvidenceResponse(
    JSON.stringify({ supported: false, answer: "an ungrounded guess" }),
    source,
    "stop",
  );
  assert.equal(result.supported, false);
  assert.ok(!result.answer.includes("ungu"));
  const urdu = "پانی خلیے کی جھلی سے گزرتا ہے اور توازن قائم ہوتا ہے۔";
  assert.equal(
    checkEvidenceResponse(
      JSON.stringify({ ...valid, sourceQuote: urdu }),
      urdu.replaceAll(" ", "\n"),
      "stop",
    ).sourceQuote,
    urdu,
  );
});
test("reasoning models have a bounded budget, hidden reasoning and JSON evidence responses", () => {
  const options = completionOptions("groq", "openai/gpt-oss-120b", true);
  assert.equal(options.include_reasoning, false);
  assert.equal(options.max_completion_tokens, 2048);
  assert.deepEqual(options.response_format, { type: "json_object" });
  assert.equal(
    completionOptions("openai-compatible", "custom", false).response_format,
    undefined,
  );
});

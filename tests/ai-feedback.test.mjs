import { test } from "node:test";
import assert from "node:assert/strict";
import { quotaFailure, publicAiModel } from "../lib/ai-server.mjs";
import { aiErrorMessage } from "../lib/ai-feedback.mjs";

test("quota feedback distinguishes minute/day windows and exposes retry timing", async () => {
  const now = Date.parse("2026-11-05T12:34:45Z");
  const minute = quotaFailure(-2, now);
  assert.equal(minute.headers.get("Retry-After"), "15");
  assert.equal((await minute.json()).resetAt, "2026-11-05T12:35:00.000Z");
  const daily = await quotaFailure(-1, now).json();
  assert.equal(daily.resetAt, "2026-11-06T00:00:00.000Z");
  assert.match(aiErrorMessage(daily), /Resets/);
  assert.equal(
    aiErrorMessage({ error: "Wait", limitType: "daily", resetAt: "bad" }),
    "Wait",
  );
  assert.equal(aiErrorMessage(null, "Try later"), "Try later");
});

test("public model metadata returns identifiers and rejects credential-like values", () => {
  const provider = process.env.AI_PROVIDER,
    model = process.env.AI_MODEL;
  try {
    process.env.AI_PROVIDER = "groq";
    process.env.AI_MODEL = "openai/gpt-oss-120b";
    assert.deepEqual(publicAiModel(), {
      provider: "groq",
      model: "openai/gpt-oss-120b",
    });
    process.env.AI_MODEL = "gsk_not-a-real-key";
    assert.equal(publicAiModel().model, null);
    process.env.AI_MODEL = "sk-not-a-real-key";
    assert.equal(publicAiModel().model, null);
  } finally {
    if (provider === undefined) delete process.env.AI_PROVIDER;
    else process.env.AI_PROVIDER = provider;
    if (model === undefined) delete process.env.AI_MODEL;
    else process.env.AI_MODEL = model;
  }
});

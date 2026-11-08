import { test } from "node:test";
import assert from "node:assert/strict";
import { completeWithRouting, routedModels } from "../lib/ai-routing.mjs";
import {
  guestQuotaCookie,
  quotaIdentity,
  consumeQuota,
  quotaFailure,
} from "../lib/ai-server.mjs";
const config = {
  provider: "groq",
  model: "openai/gpt-oss-120b",
  endpoint: "https://provider.test/v1",
  key: "fixture-only",
};
test("router switches to one supported alternate on provider throttling, preserving evidence format", async (t) => {
  const calls = [];
  t.mock.method(globalThis, "fetch", async (url, options) => {
    const b = JSON.parse(options.body);
    calls.push(b);
    return calls.length === 1
      ? new Response("busy", { status: 429, headers: { "Retry-After": "30" } })
      : Response.json({ choices: [{ message: { content: "checked" } }] });
  });
  const response = await completeWithRouting(config, {
    messages: [{ role: "user", content: "Question" }],
    response_format: { type: "json_object" },
    max_completion_tokens: 2048,
  });
  assert.equal(response.status, 200);
  assert.equal(calls.length, 2);
  assert.equal(calls[0].model, config.model);
  assert.equal(calls[1].model, "openai/gpt-oss-20b");
  assert.deepEqual(calls[1].response_format, { type: "json_object" });
});
test("router does not retry authentication failures or select unapproved/enterprise models", async (t) => {
  let count = 0;
  t.mock.method(globalThis, "fetch", async () => {
    count++;
    return new Response("unauthorized", { status: 401 });
  });
  assert.equal(
    (await completeWithRouting(config, { messages: [] })).status,
    401,
  );
  assert.equal(count, 1);
  assert.deepEqual(routedModels("openai-compatible", "custom"), ["custom"]);
});
test("signed anonymous learners have separate budgets and one shared network group", () => {
  const request = (cookie) =>
    new Request("https://dreamers.test/api/ai", {
      headers: {
        "x-vercel-forwarded-for": "203.0.113.7",
        ...(cookie ? { cookie } : {}),
      },
    });
  const a = guestQuotaCookie(request(), config.key).split(";")[0],
    b = guestQuotaCookie(request(), config.key).split(";")[0];
  const one = quotaIdentity(request(a), config.key),
    two = quotaIdentity(request(b), config.key);
  assert.notEqual(one.daily, two.daily);
  assert.equal(one.group, two.group);
  assert.equal(guestQuotaCookie(request(a), config.key), null);
  const forged = a.slice(0, -1) + (a.endsWith("0") ? "1" : "0");
  assert.equal(quotaIdentity(request(forged), config.key).network, one.group);
  assert.equal(
    guestQuotaCookie(new Request("http://localhost"), config.key),
    null,
  );
});
test("atomic quota call includes learner, network and global bounds; cache hits remain burst-protected", async (t) => {
  const originalUrl = process.env.UPSTASH_REDIS_REST_URL,
    originalToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  process.env.UPSTASH_REDIS_REST_URL = "https://quota.test";
  process.env.UPSTASH_REDIS_REST_TOKEN = "fixture-only";
  let sent;
  t.mock.method(globalThis, "fetch", async (url, options) => {
    sent = JSON.parse(options.body);
    return Response.json({ result: 1 });
  });
  try {
    await consumeQuota("day", "minute", true, "network-hash");
    assert.equal(sent[2], 6);
    assert.equal(sent.at(-1), "1");
    assert.ok(sent[5].includes("network-day"));
    assert.ok(sent[7].includes("global-day"));
    assert.match(sent[1], /60,6,240,18,800,24/);
    assert.equal((await quotaFailure(-3).json()).limits.daily, 60);
  } finally {
    if (originalUrl === undefined) delete process.env.UPSTASH_REDIS_REST_URL;
    else process.env.UPSTASH_REDIS_REST_URL = originalUrl;
    if (originalToken === undefined)
      delete process.env.UPSTASH_REDIS_REST_TOKEN;
    else process.env.UPSTASH_REDIS_REST_TOKEN = originalToken;
  }
});

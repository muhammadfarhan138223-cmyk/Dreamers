// Isolated provider/quota fixtures: never a claim about live model quality.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";
const root = new URL("../", import.meta.url);
async function loadRoute(file) {
  const source = fs
    .readFileSync(new URL(file, root), "utf8")
    .replaceAll(/"@\/([^\"]+)"/g, (_, path) =>
      JSON.stringify(new URL(path, root).href),
    )
    .replace(/(from "[^"\n]+\.json");/g, '$1 with { type: "json" };');
  return import(
    "data:text/javascript;base64," +
      Buffer.from(
        ts.transpileModule(source, {
          compilerOptions: {
            module: ts.ModuleKind.ESNext,
            target: ts.ScriptTarget.ES2022,
          },
        }).outputText,
      ).toString("base64")
  );
}
const { POST } = await loadRoute("app/api/search/route.ts"),
  tutor = await loadRoute("app/api/ai/route.ts");
const request = (body, origin = "https://dreamers.test") =>
  new Request("https://dreamers.test/api/search", {
    method: "POST",
    headers: { Origin: origin, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
test("search endpoint validates source IDs, rejects unsafe requests and shares tutor quota keys", async (t) => {
  const saved = { ...process.env };
  Object.assign(process.env, {
    AI_PROVIDER: "groq",
    AI_MODEL: "openai/gpt-oss-120b",
    AI_API_KEY: "test-only",
    AI_BASE_URL: "https://provider.test/v1",
    UPSTASH_REDIS_REST_URL: "https://quota.test",
    UPSTASH_REDIS_REST_TOKEN: "test-only",
  });
  let reply = { topicIds: ["bio12-2"], keywords: ["kidney"] },
    finish = "stop",
    quota = 1,
    sent;
  const identities = [],
    cache = new Map();
  t.mock.method(globalThis, "fetch", async (url, options) => {
    const body = JSON.parse(options.body);
    if (String(url) === "https://quota.test") {
      const [cmd, key, value] = body;
      if (cmd === "EVAL") identities.push(body.slice(-2));
      return Response.json({
        result:
          cmd === "EVAL"
            ? quota
            : cmd === "GET"
              ? (cache.get(key) ?? null)
              : cmd === "SET"
                ? (cache.set(key, value), "OK")
                : 1,
      });
    }
    assert.equal(String(url), "https://provider.test/v1/chat/completions");
    sent = body;
    return Response.json({
      choices: [
        { message: { content: JSON.stringify(reply) }, finish_reason: finish },
      ],
    });
  });
  try {
    assert.equal(
      (await POST(request({ query: "kidney" }, "https://other.test"))).status,
      403,
    );
    assert.equal((await POST(request({ query: "x".repeat(601) }))).status, 400);
    assert.equal((await POST(request({ query: "  " }))).status, 400);
    const result = await POST(request({ query: "how do kidneys clean blood" }));
    assert.equal(result.status, 200);
    assert.deepEqual((await result.json()).topicIds, ["bio12-2"]);
    assert.deepEqual(JSON.parse(sent.messages[1].content), {
      query: "how do kidneys clean blood",
    });
    assert.ok(!JSON.stringify(sent).includes("private PDF excerpt"));
    cache.clear();
    reply = { topicIds: ["fake-topic"], keywords: [] };
    assert.equal((await POST(request({ query: "kidney" }))).status, 502);
    assert.equal(cache.size, 0);
    reply = { topicIds: [], keywords: [] };
    finish = "length";
    assert.equal((await POST(request({ query: "kidney" }))).status, 502);
    finish = "stop";
    quota = 0;
    assert.equal((await POST(request({ query: "kidney" }))).status, 429);
    await tutor.POST(
      request({
        question: "Explain diffusion",
        language: "English",
        mode: "Friendly Teacher",
        topic: "membranes",
      }),
    );
    assert.deepEqual(identities.at(-1), identities.at(-2));
    delete process.env.AI_API_KEY;
    assert.equal((await POST(request({ query: "kidney" }))).status, 503);
  } finally {
    for (const key of Object.keys(process.env))
      if (!(key in saved)) delete process.env[key];
    Object.assign(process.env, saved);
  }
});

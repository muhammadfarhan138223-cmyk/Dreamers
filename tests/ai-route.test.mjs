// Deterministic provider/Redis fixtures only. No external request or real model evaluation.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";
const root = new URL("../", import.meta.url);
const source = fs
  .readFileSync(new URL("app/api/ai/route.ts", root), "utf8")
  .replaceAll(/"@\/([^\"]+)"/g, (_, file) =>
    JSON.stringify(new URL(file, root).href),
  );
const compiled = ts.transpileModule(
  source.replace(/(from "[^"\n]+\.json");/g, '$1 with { type: "json" };'),
  {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  },
).outputText;
const { POST } = await import(
  "data:text/javascript;base64," + Buffer.from(compiled).toString("base64")
);
const text =
  "Diffusion is the net movement of particles from higher to lower concentration.";
const valid = {
  question: "Explain diffusion",
  language: "English",
  mode: "Friendly Teacher",
  textbookId: "biology-xii-supplied",
  topic: "bio12-1",
  bookContext: { title: "Test source", page: 1, text },
};
const request = (body) =>
  new Request("https://dreamers.test/api/ai", {
    method: "POST",
    headers: {
      Origin: "https://dreamers.test",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

test("AI route gates source evidence and withholds malformed, invented or truncated provider output", async (t) => {
  const savedEnv = { ...process.env };
  Object.assign(process.env, {
    AI_PROVIDER: "groq",
    AI_MODEL: "openai/gpt-oss-120b",
    AI_API_KEY: "test-only-not-a-real-key",
    AI_BASE_URL: "https://provider.test/v1",
    UPSTASH_REDIS_REST_URL: "https://quota.test",
    UPSTASH_REDIS_REST_TOKEN: "test-only",
  });
  let providerAnswer = JSON.stringify({
      supported: true,
      answer: "Particles spread down the concentration gradient.",
      sourceQuote: text,
    }),
    finish = "stop",
    quota = 1,
    providerCalls = 0,
    sent;
  const cache = new Map();
  t.mock.method(globalThis, "fetch", async (url, options) => {
    const body = JSON.parse(options.body);
    if (String(url) === "https://quota.test") {
      const [cmd, key, value] = body;
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
    providerCalls++;
    sent = body;
    return Response.json({
      choices: [
        { message: { content: providerAnswer }, finish_reason: finish },
      ],
    });
  });
  try {
    assert.equal(
      (await POST(request({ ...valid, bookContext: undefined }))).status,
      422,
    );
    assert.equal(providerCalls, 0);
    assert.equal(
      (await POST(request({ ...valid, referenceOnly: "true" }))).status,
      400,
    );
    assert.equal(
      (
        await POST(
          request({
            ...valid,
            bookContext: { ...valid.bookContext, page: 253 },
          }),
        )
      ).status,
      400,
    );
    const ok = await POST(request(valid));
    assert.equal(ok.status, 200);
    assert.match((await ok.json()).answer, /PDF page 1/);
    assert.equal(sent.include_reasoning, false);
    assert.deepEqual(sent.response_format, { type: "json_object" });
    assert.equal((await (await POST(request(valid))).json()).cached, true);
    assert.equal(providerCalls, 1);
    cache.clear();
    providerAnswer = JSON.stringify({
      supported: true,
      answer: "A made-up fact",
      sourceQuote: "This quotation was never in the source excerpt.",
    });
    assert.equal((await POST(request(valid))).status, 502);
    assert.equal(cache.size, 0);
    providerAnswer = JSON.stringify({
      supported: false,
      answer: "A guess that must not be displayed",
    });
    const unsupported = await (await POST(request(valid))).json();
    assert.match(unsupported.answer, /could not confirm/);
    assert.ok(!unsupported.answer.includes("A guess"));
    cache.clear();
    finish = "length";
    assert.equal((await POST(request(valid))).status, 502);
    finish = "stop";
    providerAnswer = "A general explanation";
    const general = await (
      await POST(
        request({ ...valid, referenceOnly: false, bookContext: undefined }),
      )
    ).json();
    assert.match(general.answer, /not textbook-verified/);
    assert.equal(sent.response_format, undefined);
    providerAnswer = JSON.stringify({
      supported: true,
      answer: "Particles spread from higher to lower concentration.",
      sourceQuote: text,
    });
    const privatePdf = await POST(
      request({
        ...valid,
        textbookId: undefined,
        topic: "pdf-page",
        contextKind: "pdf",
      }),
    );
    assert.equal(privatePdf.status, 200);
    assert.equal(JSON.parse(sent.messages[1].content).sourceText, text);
    assert.match(
      sent.messages[0].content,
      /chapter, edition and exam mapping are unverified/,
    );
    assert.ok(
      !sent.messages[0].content.includes("Original foundation context:"),
    );
    quota = 0;
    assert.equal((await POST(request(valid))).status, 429);
  } finally {
    for (const key of Object.keys(process.env))
      if (!(key in savedEnv)) delete process.env[key];
    Object.assign(process.env, savedEnv);
  }
});

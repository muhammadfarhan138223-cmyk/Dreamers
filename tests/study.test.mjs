// Isolated fixtures, not a substitute for live model evaluation.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";
import { checkStudyQuestions } from "../lib/study-practice.mjs";
const text =
  "Diffusion is the net movement of particles from higher to lower concentration.";
const card = {
  question: "What is diffusion?",
  answer: "from higher to lower concentration.",
  sourceQuote: text,
};
test("practice rejects invented references, malformed MCQ keys and incomplete generation", () => {
  const check = (questions, mode = "short", finish = "stop") =>
    checkStudyQuestions(JSON.stringify({ questions }), text, mode, finish);
  assert.equal(check([card]).length, 1);
  assert.throws(
    () =>
      check([
        {
          ...card,
          answer:
            "Diffusion increases entropy through random thermal motion, without external energy.",
        },
      ]),
    /reference/,
  );
  const longSource = (text + " ").repeat(5);
  assert.equal(
    checkStudyQuestions(
      JSON.stringify({ questions: [{ ...card, answer: longSource.trim() }] }),
      longSource,
      "long",
      "stop",
    ).length,
    1,
  );
  assert.deepEqual(check([]), []);
  assert.throws(() =>
    check([
      { ...card, sourceQuote: "This quotation never appeared in the source." },
    ]),
  );
  assert.throws(() => check([card], "short", "length"));
  assert.throws(() => check(Array(4).fill(card)));
  assert.throws(() => check(Array(2).fill(card), "long"));
  const mcq = {
    ...card,
    options: [card.answer, "Osmosis", "Respiration", "Digestion"],
    correct: 0,
  };
  assert.equal(check([mcq], "mcq")[0].correct, 0);
  assert.throws(() => check([{ ...mcq, correct: 1 }], "mcq"));
  assert.throws(() =>
    check([{ ...mcq, options: Array(4).fill(card.answer) }], "mcq"),
  );
});
const root = new URL("../", import.meta.url);
const code = fs
  .readFileSync(new URL("app/api/study/route.ts", root), "utf8")
  .replaceAll(/"@\/([^\"]+)"/g, (_, p) =>
    JSON.stringify(new URL(p, root).href),
  );
const { POST } = await import(
  "data:text/javascript;base64," +
    Buffer.from(
      ts.transpileModule(code, {
        compilerOptions: {
          module: ts.ModuleKind.ESNext,
          target: ts.ScriptTarget.ES2022,
        },
      }).outputText,
    ).toString("base64")
);
const request = (body, origin = "https://dreamers.test") =>
  new Request("https://dreamers.test/api/study", {
    method: "POST",
    headers: { Origin: origin, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
const valid = {
  mode: "short",
  language: "English",
  source: { title: "Original QA source", page: 1, text },
};
test("practice API enforces origin, source bounds, shared durable quota, checked cache and provider errors", async (t) => {
  const saved = { ...process.env };
  Object.assign(process.env, {
    AI_PROVIDER: "groq",
    AI_MODEL: "openai/gpt-oss-120b",
    AI_API_KEY: "test-only",
    AI_BASE_URL: "https://provider.test/v1",
    UPSTASH_REDIS_REST_URL: "https://quota.test",
    UPSTASH_REDIS_REST_TOKEN: "test-only",
  });
  let quota = 1,
    calls = 0,
    reply = { questions: [card] },
    status = 200,
    auditFlags = [true],
    sent;
  const cache = new Map();
  t.mock.method(globalThis, "fetch", async (url, options) => {
    const body = JSON.parse(options.body);
    if (String(url) === "https://quota.test") {
      const [cmd, key, value] = body;
      if (cmd === "EVAL") assert.match(body.at(-2), /^dreamers:quota:day:/);
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
    calls++;
    sent = body;
    return Response.json(
      {
        choices: [
          {
            message: {
              content: JSON.stringify(
                body.messages[0].content.startsWith("Audit educational")
                  ? { supported: auditFlags }
                  : reply,
              ),
            },
            finish_reason: "stop",
          },
        ],
      },
      { status },
    );
  });
  try {
    assert.equal(
      (await POST(request(valid, "https://other.test"))).status,
      403,
    );
    assert.equal(
      (await POST(request({ ...valid, mode: "unknown" }))).status,
      400,
    );
    assert.equal(
      (
        await POST(
          request({ ...valid, source: { ...valid.source, text: "tiny" } }),
        )
      ).status,
      400,
    );
    assert.equal(
      (
        await POST(
          request({ ...valid, source: { ...valid.source, page: 1501 } }),
        )
      ).status,
      400,
    );
    assert.equal((await POST(request({ ...valid, mode: "long" }))).status, 422);
    assert.equal(calls, 0);
    const first = await POST(request(valid));
    assert.equal(first.status, 200);
    assert.equal((await first.json()).questions.length, 1);
    assert.equal(JSON.parse(sent.messages[1].content).sourceText, text);
    assert.equal((await (await POST(request(valid))).json()).cached, true);
    assert.equal(calls, 2);
    cache.clear();
    reply = {
      questions: [
        { ...card, sourceQuote: "Unsupported quotation not in this source." },
      ],
    };
    assert.equal((await POST(request(valid))).status, 502);
    assert.equal(cache.size, 0);
    reply = { questions: [card] };
    auditFlags = [false];
    const withheld = await POST(request(valid));
    assert.equal(withheld.status, 200);
    assert.deepEqual((await withheld.json()).questions, []);
    cache.clear();
    auditFlags = ["true"];
    assert.equal((await POST(request(valid))).status, 502);
    status = 429;
    assert.equal((await POST(request(valid))).status, 503);
    quota = 0;
    assert.equal((await POST(request(valid))).status, 429);
    delete process.env.AI_API_KEY;
    assert.equal((await POST(request(valid))).status, 503);
  } finally {
    for (const k of Object.keys(process.env))
      if (!(k in saved)) delete process.env[k];
    Object.assign(process.env, saved);
  }
});

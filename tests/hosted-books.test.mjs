import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { webcrypto } from "node:crypto";
import {
  HOSTED_BOOKS,
  hostedBookUrl,
  bookCover,
  subjectBook,
} from "../lib/hosted-books.mjs";
import { downloadBook } from "../lib/book-download.mjs";
import { samplePdf } from "./helpers/pdf-fixture.mjs";
const bytes = samplePdf();
const sha = Buffer.from(
  await webcrypto.subtle.digest("SHA-256", bytes),
).toString("hex");
const fixture = { bytes: bytes.length, sha256: sha };
const url = "/textbooks/qa-fixture.pdf";
test("hosted catalogue resolves exact editions and never invents a missing cover or book", () => {
  assert.equal(HOSTED_BOOKS.length, 16);
  assert.equal(new Set(HOSTED_BOOKS.map((b) => b.sha256)).size, 16);
  for (const book of HOSTED_BOOKS) {
    assert.match(hostedBookUrl(book.id), new RegExp(book.sha256.slice(0, 16)));
    const cover = bookCover(book.id);
    if (cover) assert.ok(fs.existsSync("public" + cover));
  }
  assert.equal(bookCover("biology-xii-supplied"), null);
  assert.equal(hostedBookUrl("unknown"), null);
  assert.equal(subjectBook("physics", "XI"), undefined);
});
test("complete PDF transfer is verified before returning offline bytes", async () => {
  let progress = 0;
  const blob = await downloadBook(fixture, url, {
    fetcher: async () => new Response(bytes),
    onProgress: (n) => {
      progress = n;
    },
  });
  assert.equal(blob.size, bytes.length);
  assert.equal(progress, bytes.length);
});
test("failed, partial, changed and oversized transfers cannot become saved books", async () => {
  for (const response of [
    new Response("error", { status: 503 }),
    new Response(bytes.slice(0, -5)),
    new Response(new Uint8Array(bytes.length)),
    new Response(new Uint8Array(bytes.length + 1)),
  ]) {
    await assert.rejects(
      downloadBook(fixture, url, { fetcher: async () => response }),
    );
  }
  await assert.rejects(
    downloadBook(fixture, "https://untrusted.example/a.pdf", {
      fetcher: () => {
        throw Error("must not fetch");
      },
    }),
  );
});
test("network interruption and cancellation preserve the caller’s existing offline records", async () => {
  const failure = new ReadableStream({
    start(c) {
      c.enqueue(bytes.slice(0, 10));
      c.error(new Error("Disconnected"));
    },
  });
  await assert.rejects(
    downloadBook(fixture, url, { fetcher: async () => new Response(failure) }),
    /Disconnected/,
  );
  const abort = new AbortController();
  abort.abort();
  await assert.rejects(
    downloadBook(fixture, url, {
      signal: abort.signal,
      fetcher: async (_url, opts) => {
        opts.signal.throwIfAborted();
      },
    }),
    { name: "AbortError" },
  );
});

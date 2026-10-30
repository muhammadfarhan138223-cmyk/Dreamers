import { test } from "node:test";
import assert from "node:assert/strict";
import "fake-indexeddb/auto";
import * as db from "../lib/db.ts";
import {
  bookTitle,
  validatePdfHeader,
  MAX_PDF_BYTES,
  searchBookPages,
  meaningfulPdfText,
} from "../lib/books.mjs";
import { samplePdf } from "./helpers/pdf-fixture.mjs";
test("PDF import rejects non-PDF and oversize files without inventing edition verification", () => {
  const bytes = samplePdf();
  assert.doesNotThrow(() => validatePdfHeader(bytes, bytes.length));
  assert.throws(() =>
    validatePdfHeader(new TextEncoder().encode("<html>not PDF</html>"), 100),
  );
  assert.throws(() => validatePdfHeader(bytes, MAX_PDF_BYTES + 1));
  assert.equal(bookTitle("Biology XI.pdf"), "Biology XI");
});
test("local textbook search ranks matching pages in English and Urdu", () => {
  const pages = [
    { id: "a", page: 1, text: "Electron has a negative charge." },
    { id: "b", page: 2, text: "A proton has a positive charge." },
    { id: "c", page: 3, text: "یہ خلیہ پودوں میں پایا جاتا ہے" },
  ];
  assert.equal(searchBookPages(pages, "explain electron charge")[0].id, "a");
  assert.equal(searchBookPages(pages, "خلیہ")[0].id, "c");
  assert.deepEqual(searchBookPages(pages, "the and"), []);
  assert.deepEqual(searchBookPages(pages, "osmosis"), []);
});
test("full PDF blobs and indexes persist, atomic metadata patches merge and backups exclude bytes", async () => {
  const blob = new Blob([samplePdf()], { type: "application/pdf" });
  await db.put("books", { id: "book:a", title: "QA book", blob, at: 1 });
  await db.put("books", {
    id: "book:b",
    title: "Another QA book",
    blob,
    at: 2,
  });
  await db.put("bookPages", {
    id: "a:1",
    bookId: "book:a",
    page: 1,
    text: "private page text",
  });
  await db.put("bookPages", {
    id: "b:1",
    bookId: "book:b",
    page: 1,
    text: "keep this page",
  });
  await Promise.all([
    db.patch("books", "book:a", { lastPage: 2 }),
    db.patch("books", "book:a", { indexedPages: 2 }),
  ]);
  const saved = await db.get("books", "book:a");
  assert.deepEqual(new Uint8Array(await saved.blob.arrayBuffer()), samplePdf());
  assert.equal(saved.lastPage, 2);
  assert.equal(saved.indexedPages, 2);
  const backup = await db.exportData();
  assert.equal(backup.books, undefined);
  assert.equal(backup.bookPages, undefined);
  assert.ok(backup.bookManifest.every((b) => b.blob === undefined));
  await db.deleteBook("book:a");
  assert.equal(await db.get("books", "book:a"), undefined);
  assert.deepEqual(await db.bookPages("book:a"), []);
  assert.equal((await db.bookPages("book:b")).length, 1);
});
test("pinned PDF.js parses a real two-page PDF and extracts page-specific text", async () => {
  const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const task = getDocument({
    data: samplePdf(),
    disableFontFace: true,
    useSystemFonts: false,
    standardFontDataUrl: new URL(
      "../node_modules/pdfjs-dist/standard_fonts/",
      import.meta.url,
    ).pathname,
  });
  const pdf = await task.promise;
  try {
    assert.equal(pdf.numPages, 2);
    const first = await (await pdf.getPage(1)).getTextContent();
    const second = await (await pdf.getPage(2)).getTextContent();
    assert.match(first.items.map((x) => x.str || "").join(" "), /Diffusion/);
    assert.match(second.items.map((x) => x.str || "").join(" "), /electron/);
  } finally {
    await task.destroy();
  }
});

test("watermark-only scanned pages are not presented as readable lesson text", () => {
  assert.equal(
    meaningfulPdfText([{ str: "Web version of PCTB textbook" }, { str: "1" }]),
    "",
  );
  assert.equal(meaningfulPdfText([{ str: "www.ilmkidunya.com" }]), "");
  const sentence =
    "Osmoregulation maintains water and solute balance in body fluids.";
  assert.equal(
    meaningfulPdfText([{ str: "www.taleem360.com" }, { str: sentence }]),
    sentence,
  );
});

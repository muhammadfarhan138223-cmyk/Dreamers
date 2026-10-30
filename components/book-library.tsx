"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  BookOpen,
  Download,
  ExternalLink,
  FileText,
  Search,
  Sparkles,
  Trash2,
  Upload,
  ArrowRight,
} from "lucide-react";
import * as db from "@/lib/db";
import {
  TEXTBOOKS,
  DEFAULT_TEXTBOOK,
  textbook,
  textbookByHash,
} from "@/lib/textbooks.mjs";
import {
  MAX_PDF_BYTES,
  validatePdfHeader,
  bookTitle,
  searchBookPages,
} from "@/lib/books.mjs";
const PdfReader = dynamic(() => import("./pdf-reader"), {
  ssr: false,
  loading: () => (
    <div className="panel empty">
      <p>Preparing PDF reader…</p>
    </div>
  ),
});
export type LocalBook = {
  id: string;
  title: string;
  filename: string;
  subject: string;
  class: string;
  edition: string;
  blob: Blob;
  bytes: number;
  sha256: string;
  at: number;
  pageCount?: number;
  indexedPages?: number;
  lastPage?: number;
  catalogId?: string;
};
export type BookPage = {
  id: string;
  bookId: string;
  page: number;
  text: string;
};
export type BookContext = { title: string; page: number; text: string };
export default function BookLibrary({
  onAsk,
  requestedId,
  requestedPage = 1,
  onNavigate,
  onAskTopic,
}: {
  onAsk: (context: BookContext, subject: string, catalogId?: string) => void;
  requestedId?: string;
  requestedPage?: number;
  onNavigate: (url: string) => void;
  onAskTopic: (bookId: string, topicId: string, extra?: boolean) => void;
}) {
  const [books, setBooks] = useState<LocalBook[]>([]),
    [selected, setSelected] = useState<LocalBook | null>(null),
    [subject, setSubject] = useState("biology"),
    [grade, setGrade] = useState("XII"),
    [edition, setEdition] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [query, setQuery] = useState(""),
    [results, setResults] = useState<BookPage[]>([]),
    [targetPage, setTargetPage] = useState(1),
    [removeId, setRemoveId] = useState(""),
    [notice, setNotice] = useState("");
  const [catalogId, setCatalogId] = useState(
    requestedId && textbook(requestedId) ? requestedId : DEFAULT_TEXTBOOK,
  );
  const input = useRef<HTMLInputElement>(null);
  const activeBook = textbook(catalogId)!;
  useEffect(() => {
    const wanted = textbook(requestedId);
    if (!wanted) return;
    setCatalogId(wanted.id);
    const saved = books.find((b) => b.sha256 === wanted.sha256);
    if (saved) {
      setSelected(saved);
      setTargetPage(Math.max(1, Math.min(wanted.pages, requestedPage)));
    }
  }, [requestedId, requestedPage, books.length]);
  async function refresh() {
    setBooks((await db.list<LocalBook>("books")).sort((a, b) => b.at - a.at));
  }
  useEffect(() => {
    refresh().catch(() => setError("Device book storage is unavailable."));
  }, []);
  async function importFiles(files: File[]) {
    setBusy(true);
    setError("");
    let added = 0,
      duplicates = 0;
    const failures: string[] = [];
    const savedBooks: LocalBook[] = [];
    for (const file of files) {
      try {
        validatePdfHeader(
          new Uint8Array(await file.slice(0, 1024).arrayBuffer()),
          file.size,
        );
        const estimate = await navigator.storage?.estimate?.();
        if (
          estimate?.quota &&
          estimate.usage !== undefined &&
          estimate.quota - estimate.usage < file.size * 1.2
        )
          throw new Error(
            "Not enough browser storage. Free device space or remove an unused copy.",
          );
        const digest = Array.from(
          new Uint8Array(
            await crypto.subtle.digest("SHA-256", await file.arrayBuffer()),
          ),
          (v) => v.toString(16).padStart(2, "0"),
        ).join("");
        const id = "book:" + digest,
          existing = await db.get<LocalBook>("books", id);
        if (existing) {
          const known = textbookByHash(digest);
          if (known) {
            const fields = {
              catalogId: known.id,
              title: known.title,
              subject: known.subject,
              class: known.class,
              pageCount: known.pages,
              edition: known.edition,
            };
            await db.patch("books", id, fields);
            Object.assign(existing, fields);
          }
          duplicates++;
          savedBooks.push(existing);
          continue;
        }
        const known = textbookByHash(digest);
        const book: LocalBook = {
          id,
          title: known?.title || bookTitle(file.name),
          filename: file.name,
          subject: known?.subject || subject,
          class: known?.class || grade,
          edition:
            known?.edition ||
            edition.trim().slice(0, 80) ||
            "Edition not verified",
          blob: new Blob([file], { type: "application/pdf" }),
          bytes: file.size,
          sha256: digest,
          at: Date.now(),
          ...(known ? { catalogId: known.id, pageCount: known.pages } : {}),
        };
        await db.put("books", book);
        savedBooks.push(book);
        added++;
      } catch (e) {
        failures.push(
          `${file.name}: ${e instanceof Error ? e.message : "Could not save this file."}`,
        );
      }
    }
    try {
      await refresh();
      const wanted = textbook(requestedId);
      const open =
        savedBooks.find((b) => b.sha256 === wanted?.sha256) ||
        (files.length === 1 ? savedBooks[0] : null);
      if (open) {
        setSelected(open);
        setTargetPage(wanted ? requestedPage : open.lastPage || 1);
      }
      setNotice(
        `${added} PDF${added === 1 ? "" : "s"} added · ${duplicates} exact duplicate${duplicates === 1 ? "" : "s"} skipped. Files stay on this device.`,
      );
      if (navigator.storage?.persist)
        await navigator.storage.persist().catch(() => false);
    } catch {
      failures.push(
        "Saved files could not be refreshed. Reload the shelf to retry.",
      );
    }
    if (failures.length) setError(failures.join(" "));
    setBusy(false);
    if (input.current) input.current.value = "";
  }
  async function search() {
    setError("");
    try {
      const pages = await db.list<BookPage>("bookPages");
      setResults(searchBookPages(pages, query));
      if (!pages.length)
        setNotice(
          "Open a saved book and choose “Index book text” before searching. Scanned PDFs need OCR, which is not available in this release.",
        );
    } catch {
      setError("The saved text index could not be searched.");
    }
  }
  function openBook(book: LocalBook, page = book.lastPage || 1) {
    setSelected(book);
    setTargetPage(page);
  }
  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">YOUR OFFLINE TEXTBOOK SHELF</span>
        <h1>Your books. Your quiet corner.</h1>
        <p>
          Your supplied books, one clear shelf. Add your files once, then read
          your saved copies offline.
        </p>
      </div>
      <div
        className="supplied-book-tabs"
        aria-label="Supplied textbook selection"
      >
        {TEXTBOOKS.map((b) => {
          const saved = books.some((local) => local.sha256 === b.sha256);
          return (
            <button
              key={b.id}
              className={`${b.color} ${catalogId === b.id ? "active" : ""}`}
              aria-pressed={catalogId === b.id}
              onClick={() => setCatalogId(b.id)}
            >
              <BookOpen size={23} />
              <span>
                <b>{b.title}</b>
                <small>
                  Class {b.class} · {b.pages} pages ·{" "}
                  {(b.bytes / 1024 / 1024).toFixed(1)} MB
                </small>
              </span>
              <span className={`book-local-status ${saved ? "ready" : ""}`}>
                {saved ? "Saved locally" : "Add your PDF"}
              </span>
            </button>
          );
        })}
      </div>
      <section className={`panel textbook-chapters ${activeBook.color}`}>
        <div className="between">
          <div>
            <span className="eyebrow">
              CLASS {activeBook.class} /{" "}
              {activeBook.kind === "legacy"
                ? "LEGACY REFERENCE"
                : activeBook.kind === "grammar"
                  ? "GRAMMAR SUPPORT"
                  : "SUPPLIED COPY"}
            </span>
            <h2>{activeBook.title}: find your chapter.</h2>
            <p>{activeBook.edition}</p>
          </div>
          <span className="pill">
            {activeBook.chapters.length} checked chapters
          </span>
        </div>
        <p className="fineprint">
          {activeBook.chapters.length
            ? "Headings checked in the supplied file."
            : "Chapter map pending review; no suggested topics are generated from this file yet."}{" "}
          Current board exam exclusions are not yet verified.{" "}
          {activeBook.text !== "selectable"
            ? "This copy is scanned: image reading works; OCR text search is not available."
            : ""}
        </p>
        {!activeBook.chapters.length && (
          <div className="chapter-map-pending">
            <BookOpen size={28} />
            <h3>Read your PDF copy</h3>
            <p>
              This file can be saved and read now. Chapter suggestions will
              appear after its contents are checked.
            </p>
            <button
              className="primary"
              onClick={() => {
                const saved = books.find((b) => b.sha256 === activeBook.sha256);
                if (saved) openBook(saved, 1);
                else input.current?.click();
              }}
            >
              Open / add PDF <Upload size={16} />
            </button>
          </div>
        )}
        <div className="textbook-chapter-list">
          {activeBook.chapters.map((t, i) => (
            <div className="textbook-chapter" key={t.id}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              <div>
                <b>{t.title}</b>
                <small>
                  PDF page {t.page}
                  {t.printedPage ? ` · printed page ${t.printedPage}` : ""}
                </small>
              </div>
              <button
                className="secondary"
                onClick={() => {
                  const saved = books.find(
                    (b) => b.sha256 === activeBook.sha256,
                  );
                  if (saved) openBook(saved, t.page);
                  else {
                    setNotice(
                      `Add your ${activeBook.title} PDF below first. Its file signature will match it to this chapter map.`,
                    );
                    input.current?.click();
                  }
                }}
              >
                Read <ArrowRight size={14} />
              </button>
              <button
                className="circle-button"
                aria-label={`Ask AI about ${t.title}`}
                onClick={() => onAskTopic(activeBook.id, t.id)}
              >
                <Sparkles size={16} />
              </button>
            </div>
          ))}
        </div>
      </section>
      <section className="panel book-import">
        <div className="between">
          <div>
            <span className="eyebrow">PRIVATE / ON THIS DEVICE</span>
            <h2>Add your PDF copies</h2>
          </div>
          <Upload size={26} />
        </div>
        <p className="fineprint">
          Select several PDFs at once. Matching supplied files are named and
          classified automatically; identical files are saved only once.
        </p>
        <details className="import-details">
          <summary>Details for other PDF copies (optional)</summary>
          <p className="fineprint">
            Recognised catalogue files are classified automatically. These
            fields apply to other files.
          </p>
          <div className="book-fields">
            <label className="field">
              Subject
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              >
                {[
                  "biology",
                  "chemistry",
                  "physics",
                  "mathematics",
                  "computer-science",
                  "education",
                  "english",
                  "urdu",
                  "islamiat",
                  "pakistan-studies",
                  "tarjuma-tul-quran",
                  "other",
                ].map((s) => (
                  <option key={s} value={s}>
                    {s.replaceAll("-", " ")}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              Class
              <select value={grade} onChange={(e) => setGrade(e.target.value)}>
                <option>XI</option>
                <option>XII</option>
              </select>
            </label>
            <label className="field">
              Edition label (optional)
              <input
                value={edition}
                maxLength={80}
                onChange={(e) => setEdition(e.target.value)}
                placeholder="As printed on your book"
              />
            </label>
          </div>
        </details>
        <input
          className="sr-only"
          type="file"
          multiple
          tabIndex={-1}
          aria-label="Select local PDF files"
          accept="application/pdf,.pdf"
          ref={input}
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            if (files.length) void importFiles(files);
          }}
        />
        <button
          className="primary"
          disabled={busy}
          onClick={() => input.current?.click()}
        >
          <Upload size={17} />
          {busy ? "Saving PDF…" : "Choose PDFs from device"}
        </button>
        <p className="fineprint">
          First use prepares about 5 MB of offline reader resources. Up to{" "}
          {MAX_PDF_BYTES / 1024 / 1024} MB per file. No automatic textbook
          downloads. Files stay on this device; JSON progress backups exclude
          PDF bytes. Keep an original copy or export a book separately.
        </p>
      </section>
      {error && (
        <p className="error-banner" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="panel notice" role="status">
          {notice}
        </p>
      )}
      <div className="book-search panel">
        <form
          className="big-search"
          onSubmit={(e) => {
            e.preventDefault();
            search();
          }}
        >
          <Search size={21} />
          <input
            aria-label="Search saved textbook text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search indexed pages in English or Urdu…"
          />
          <button className="secondary" disabled={!query.trim()}>
            Search books
          </button>
        </form>
        <p className="fineprint">
          Text search runs locally. Image-only scanned pages have no searchable
          text until OCR is available.
        </p>
        {results.map((r) => {
          const book = books.find((b) => b.id === r.bookId);
          return book ? (
            <button
              className="book-result"
              key={r.id}
              onClick={() => openBook(book, r.page)}
            >
              <b>
                {book.title} · PDF page {r.page}
              </b>
              <span>
                {String((r as BookPage & { snippet: string }).snippet)}
              </span>
              <ArrowRight size={16} />
            </button>
          ) : null;
        })}
      </div>
      <div className="book-shelf">
        {books.map((b) => (
          <article className={`panel saved-book ${b.subject}`} key={b.id}>
            <FileText size={33} />
            <h3>{b.title}</h3>
            <p>
              {b.subject.replaceAll("-", " ")} · Class {b.class}
            </p>
            <p className="tiny">
              {b.edition} · {(b.bytes / 1024 / 1024).toFixed(1)} MB
            </p>
            <span className="content-badge">
              {b.catalogId
                ? "Matched supplied PDF · exam scope unverified"
                : "Personal copy · edition not verified"}
            </span>
            <p className="tiny muted">
              {b.indexedPages || 0}/{b.pageCount || "?"} pages indexed · resume
              at PDF page {b.lastPage || 1}
            </p>
            <div className="actions">
              <button className="primary" onClick={() => openBook(b)}>
                Read offline <BookOpen size={16} />
              </button>
              <button
                className="secondary"
                onClick={() => {
                  const url = URL.createObjectURL(b.blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = b.filename;
                  a.click();
                  setTimeout(() => URL.revokeObjectURL(url), 1000);
                }}
                aria-label={`Export ${b.title}, Class ${b.class}`}
              >
                <Download size={16} />
              </button>
              <button
                className="secondary"
                onClick={() => setRemoveId(b.id)}
                aria-label={`Remove ${b.title}, Class ${b.class}`}
              >
                <Trash2 size={16} />
              </button>
            </div>
            {removeId === b.id && (
              <div className="book-remove">
                <p>
                  Remove this PDF and its local text index? Your learning
                  progress and notes will stay.
                </p>
                <button
                  className="danger"
                  onClick={async () => {
                    try {
                      await db.deleteBook(b.id);
                      if (selected?.id === b.id) setSelected(null);
                      setResults([]);
                      setRemoveId("");
                      await refresh();
                    } catch {
                      setError("The PDF could not be removed.");
                    }
                  }}
                >
                  Remove PDF
                </button>
                <button className="secondary" onClick={() => setRemoveId("")}>
                  Keep book
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
      {!books.length && (
        <div className="panel empty">
          <BookOpen size={40} />
          <h2>Your first textbook belongs here.</h2>
          <p>
            Add a full PDF above. Original Dreamers lesson packs remain
            available from Downloads.
          </p>
        </div>
      )}
      <details className="panel publisher-links">
        <summary>Official sources & copy permissions</summary>
        <p>
          Personal PDFs stay on your device. Full public textbook downloads are
          not bundled: the supplied Computer/Physics copies contain reproduction
          restrictions.
        </p>
        <div className="actions">
          <a
            className="secondary"
            href="https://pectaa.edu.pk/curriculum-compliance/"
            target="_blank"
            rel="noopener noreferrer"
          >
            PECTAA catalogue <ExternalLink size={14} />
          </a>
          <a
            className="secondary"
            href="https://www.elearn.gov.pk/"
            target="_blank"
            rel="noopener noreferrer"
          >
            eLearn Punjab <ExternalLink size={14} />
          </a>
        </div>
      </details>
      {selected && (
        <PdfReader
          key={selected.id}
          book={selected}
          requestedPage={targetPage}
          onSaved={refresh}
          onClose={() => setSelected(null)}
          onAsk={(c) => onAsk(c, selected.subject, selected.catalogId)}
        />
      )}
    </>
  );
}

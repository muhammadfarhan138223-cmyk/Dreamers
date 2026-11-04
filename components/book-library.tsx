"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  BookOpen,
  Download,
  ExternalLink,
  Atom,
  Code,
  Dna,
  FileText,
  Sparkles,
  Trash2,
  Upload,
  ArrowRight,
} from "lucide-react";
import * as db from "@/lib/db";
import { TEXTBOOKS, textbook, textbookByHash } from "@/lib/textbooks.mjs";
import { MAX_PDF_BYTES, validatePdfHeader, bookTitle } from "@/lib/books.mjs";
import { preparePdfEngine } from "@/lib/pdf-client";
import {
  BISE_MODEL_PAPERS,
  PECTAA_CATALOGUE,
  PUBLISHER_BIOLOGY_XI,
  publisherUrl,
} from "@/lib/publisher-books.mjs";
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
  cover?: string;
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
  matchQuery = "",
  onNavigate,
  onAskTopic,
  focus,
}: {
  onAsk: (context: BookContext, subject: string, catalogId?: string) => void;
  focus?: { grade: string; subject: string } | null;
  requestedId?: string;
  requestedPage?: number;
  matchQuery?: string;
  onNavigate: (url: string) => void;
  onAskTopic: (bookId: string, topicId: string, extra?: boolean) => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const [shelfFilter, setShelfFilter] = useState("all");
  const [showImport, setShowImport] = useState(false);
  const [readerQuery, setReaderQuery] = useState("");
  const narrow = !!focus && !showAll && !requestedId;
  const [books, setBooks] = useState<LocalBook[]>([]),
    [selected, setSelected] = useState<LocalBook | null>(null),
    [subject, setSubject] = useState(
      focus?.subject.replaceAll("-", " ") || "biology",
    ),
    [grade, setGrade] = useState(focus?.grade || "XII"),
    [edition, setEdition] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [targetPage, setTargetPage] = useState(1),
    [removeId, setRemoveId] = useState(""),
    [notice, setNotice] = useState("");
  const [catalogId, setCatalogId] = useState(
    requestedId && textbook(requestedId) ? requestedId : "",
  );
  const input = useRef<HTMLInputElement>(null);
  const catalogue = [PUBLISHER_BIOLOGY_XI, ...TEXTBOOKS];
  const visibleCatalog = narrow
    ? catalogue.filter(
        (b) => b.subject === focus!.subject && b.classes.includes(focus!.grade),
      )
    : catalogue;
  const visibleBooks = narrow
    ? books.filter(
        (b) =>
          b.subject.replaceAll(" ", "-") === focus!.subject &&
          (b.class === focus!.grade || b.class === "XI–XII"),
      )
    : books;
  const activeBook = textbook(catalogId);
  const visibleGallery = visibleCatalog.filter(
    (book) =>
      shelfFilter === "all" ||
      (shelfFilter === "saved"
        ? visibleBooks.some((local) => local.catalogId === book.id)
        : book.classes.includes(shelfFilter)),
  );
  const personalBooks = visibleBooks.filter(
    (book) =>
      !book.catalogId &&
      (shelfFilter === "all" ||
        shelfFilter === "saved" ||
        book.class === shelfFilter),
  );
  useEffect(() => {
    setReaderQuery(matchQuery);
    const wanted = textbook(requestedId);
    if (!wanted) {
      const local = books.find(
        (b) => b.id === requestedId || encodeURIComponent(b.id) === requestedId,
      );
      if (local) {
        setSelected(local);
        setTargetPage(
          Math.max(1, Math.min(local.pageCount || 1500, requestedPage)),
        );
      }
      return;
    }
    setCatalogId(wanted.id);
    const saved = books.find((b) => b.sha256 === wanted.sha256);
    if (saved) {
      setSelected(saved);
      setTargetPage(Math.max(1, Math.min(wanted.pages, requestedPage)));
    }
  }, [requestedId, requestedPage, matchQuery, books.length]);
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
      if (savedBooks.length) {
        try {
          await Promise.all([
            preparePdfEngine(),
            import("./pdf-reader"),
            import("pdfjs-dist/legacy/build/pdf.mjs"),
          ]);
        } catch {
          failures.push(
            "Your files are saved. Reconnect and open a book once to finish offline reader setup.",
          );
        }
      }
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
  function openBook(book: LocalBook, page = book.lastPage || 1) {
    setReaderQuery("");
    setSelected(book);
    setTargetPage(page);
  }
  return (
    <>
      <header className="shelf-hero">
        <div>
          <span className="eyebrow">YOUR OFFLINE LIBRARY</span>
          <h1>My books</h1>
          <p>
            Open a saved book anywhere. Get new copies from the publisher when
            you’re online.
          </p>
        </div>
        <button className="secondary" onClick={() => onNavigate("/search")}>
          Search book text <ArrowRight size={17} />
        </button>
      </header>
      <div className="gallery-toolbar">
        <div className="gallery-filters" aria-label="Filter books">
          {[
            ["all", "All books"],
            ["saved", `Saved (${visibleBooks.length})`],
            ["XI", "First year"],
            ["XII", "Second year"],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={shelfFilter === id}
              onClick={() => setShelfFilter(id)}
            >
              {label}
            </button>
          ))}
        </div>
        {focus && (
          <button className="text-link" onClick={() => setShowAll((v) => !v)}>
            {showAll ? "Only my subject" : "Show every subject"}
          </button>
        )}
      </div>
      <div className="reading-gallery">
        {visibleGallery.map((book) => {
          const saved = visibleBooks.find(
            (local) => local.catalogId === book.id,
          );
          const source = publisherUrl(book.id);
          const CoverIcon =
            book.icon === "dna"
              ? Dna
              : book.icon === "atom"
                ? Atom
                : book.icon === "code"
                  ? Code
                  : BookOpen;
          return (
            <article className="panel gallery-card" key={book.id}>
              <div className={`gallery-cover ${book.color}`}>
                {saved?.cover ? (
                  // The preview is a small image rendered locally from the student's PDF.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={saved.cover} alt="" loading="lazy" />
                ) : (
                  <>
                    <CoverIcon size={42} aria-hidden />
                    <span>CLASS {book.class}</span>
                  </>
                )}
              </div>
              <div className="gallery-card-body">
                <span className="gallery-status">
                  {saved ? "● Ready offline" : "Class " + book.class}
                </span>
                <h2>{book.title}</h2>
                {saved ? (
                  <button className="primary" onClick={() => openBook(saved)}>
                    Read <ArrowRight size={15} />
                  </button>
                ) : source ? (
                  <a
                    className="secondary"
                    href={source}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Publisher PDF <ExternalLink size={14} />
                  </a>
                ) : (
                  <button
                    className="secondary"
                    disabled={busy}
                    onClick={() => input.current?.click()}
                  >
                    Save your PDF <Download size={15} />
                  </button>
                )}
                {textbook(book.id) && (
                  <button
                    className="text-link"
                    onClick={() => {
                      setCatalogId(book.id);
                      requestAnimationFrame(() =>
                        document
                          .getElementById("book-details")
                          ?.scrollIntoView({ block: "start" }),
                      );
                    }}
                  >
                    Chapters & details
                  </button>
                )}
              </div>
            </article>
          );
        })}
        {personalBooks.map((book) => (
          <article className="panel gallery-card" key={book.id}>
            <div className="gallery-cover violet">
              {book.cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={book.cover} alt="" loading="lazy" />
              ) : (
                <>
                  <FileText size={42} aria-hidden />
                  <span>CLASS {book.class}</span>
                </>
              )}
            </div>
            <div className="gallery-card-body">
              <span className="gallery-status">● Ready offline</span>
              <h2>{book.title}</h2>
              <button className="primary" onClick={() => openBook(book)}>
                Read <ArrowRight size={15} />
              </button>
            </div>
          </article>
        ))}
      </div>
      {!visibleGallery.length && !personalBooks.length && (
        <div className="panel empty">
          <BookOpen size={30} />
          <h2>
            {shelfFilter === "saved"
              ? "No saved books here yet"
              : "No books in this view"}
          </h2>
          <p>
            {shelfFilter === "saved"
              ? "Save a PDF from your device, then open it from this shelf."
              : "Try All books or Show every subject."}
          </p>
        </div>
      )}
      <div className="shelf-setup panel">
        <div>
          <b>Have a downloaded PDF?</b>
          <p>
            Save it on this device once. Files stay private and open offline.
          </p>
        </div>
        <button
          className="primary"
          disabled={busy}
          onClick={() => input.current?.click()}
        >
          <Download size={17} /> {busy ? "Saving…" : "Save from device"}
        </button>
        <button
          className="text-link"
          aria-expanded={showImport}
          onClick={() => setShowImport((v) => !v)}
        >
          File options
        </button>
      </div>
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
      <div id="book-details">
        {activeBook?.appendices?.length ? (
          <section className="book-appendices">
            <b>Paper patterns & model papers in this copy</b>
            <div className="row">
              {activeBook.appendices.map((a) => (
                <button
                  key={a.page}
                  className="secondary"
                  onClick={() => {
                    const saved = books.find(
                      (b) => b.catalogId === activeBook.id,
                    );
                    if (saved) openBook(saved, a.page);
                    else
                      setError(
                        "Add this PDF once to open its paper-pattern pages offline.",
                      );
                  }}
                >
                  {a.title} · PDF {a.page}
                  {a.endPage !== a.page ? `–${a.endPage}` : ""}
                </button>
              ))}
            </div>
            <small>
              Source pages checked in this supplied file; official board/year
              confirmation remains pending.
            </small>
          </section>
        ) : null}
        {activeBook && (
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
                    const saved = books.find(
                      (b) => b.sha256 === activeBook.sha256,
                    );
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
        )}
      </div>
      <section className="panel book-import" hidden={!showImport}>
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
      {!!visibleBooks.length && (
        <details className="panel publisher-links shelf-manage">
          <summary>Manage saved files</summary>
          <div className="book-shelf">
            {visibleBooks.map((b) => (
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
                  {b.indexedPages || 0}/{b.pageCount || "?"} pages indexed ·
                  resume at PDF page {b.lastPage || 1}
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
                          setRemoveId("");
                          await refresh();
                        } catch {
                          setError("The PDF could not be removed.");
                        }
                      }}
                    >
                      Remove PDF
                    </button>
                    <button
                      className="secondary"
                      onClick={() => setRemoveId("")}
                    >
                      Keep book
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        </details>
      )}
      <details className="panel publisher-links">
        <summary>Official sources & copy permissions</summary>
        <p>
          Publisher links open the source online. Download there, then use “Save
          from device” to keep a personal copy in this shelf. A publisher
          edition can differ from the supplied copy used for chapter links.
        </p>
        <div className="actions">
          <a
            className="secondary"
            href={PECTAA_CATALOGUE}
            target="_blank"
            rel="noopener noreferrer"
          >
            PECTAA catalogue <ExternalLink size={14} />
          </a>
          <a
            className="secondary"
            href={BISE_MODEL_PAPERS}
            target="_blank"
            rel="noopener noreferrer"
          >
            BISE Lahore model papers <ExternalLink size={14} />
          </a>
        </div>
      </details>
      {selected && (
        <PdfReader
          key={selected.id}
          book={selected}
          requestedPage={targetPage}
          matchQuery={readerQuery}
          onSaved={refresh}
          onClose={() => setSelected(null)}
          onAsk={(c) => onAsk(c, selected.subject, selected.catalogId)}
        />
      )}
    </>
  );
}

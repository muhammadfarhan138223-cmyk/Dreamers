"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  BookOpen,
  Download,
  ExternalLink,
  FileText,
  Search,
  Trash2,
  Upload,
  ArrowRight,
} from "lucide-react";
import * as db from "@/lib/db";
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
}: {
  onAsk: (context: BookContext, subject: string) => void;
}) {
  const [books, setBooks] = useState<LocalBook[]>([]),
    [selected, setSelected] = useState<LocalBook | null>(null),
    [subject, setSubject] = useState("biology"),
    [grade, setGrade] = useState("XI"),
    [edition, setEdition] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [query, setQuery] = useState(""),
    [results, setResults] = useState<BookPage[]>([]),
    [targetPage, setTargetPage] = useState(1),
    [removeId, setRemoveId] = useState(""),
    [notice, setNotice] = useState("");
  const input = useRef<HTMLInputElement>(null);
  async function refresh() {
    setBooks((await db.list<LocalBook>("books")).sort((a, b) => b.at - a.at));
  }
  useEffect(() => {
    refresh().catch(() => setError("Device book storage is unavailable."));
  }, []);
  async function importFile(file: File) {
    setBusy(true);
    setError("");
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
          "There is not enough available browser storage. Remove an unused book or free device space.",
        );
      const digest = Array.from(
        new Uint8Array(
          await crypto.subtle.digest("SHA-256", await file.arrayBuffer()),
        ),
        (v) => v.toString(16).padStart(2, "0"),
      ).join("");
      const id = "book:" + digest;
      const existing = await db.get<LocalBook>("books", id);
      if (existing) {
        setSelected(existing);
        setTargetPage(existing.lastPage || 1);
        setNotice(
          "This PDF is already on your device. Opened your saved copy.",
        );
      } else {
        const book: LocalBook = {
          id,
          title: bookTitle(file.name),
          filename: file.name,
          subject,
          class: grade,
          edition: edition.trim().slice(0, 80) || "Edition not verified",
          blob: new Blob([file], { type: "application/pdf" }),
          bytes: file.size,
          sha256: digest,
          at: Date.now(),
        };
        await db.put("books", book);
        setSelected(book);
        setTargetPage(1);
        setNotice(
          "Full PDF saved on this device. It has not been uploaded to a server.",
        );
        await refresh();
      }
      if (navigator.storage?.persist)
        await navigator.storage.persist().catch(() => false);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "The PDF could not be imported. Your other learning data is safe.",
      );
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
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
        <h1>Full books. On your device.</h1>
        <p>
          Open the official publisher catalogue, download the edition you need,
          then add that PDF here for personal offline study.
        </p>
      </div>
      <div className="panel official-books">
        <div>
          <BookOpen size={30} />
          <h2>Punjab official textbook sources</h2>
          <p>
            PECTAA lists Class XI/XII science and compulsory subjects. Choose
            the correct subject, year and edition on the publisher’s website.
            Direct textbook downloads are not yet verified in Dreamers. Your
            imported file’s edition remains unverified.
          </p>
        </div>
        <div className="actions">
          <a
            className="secondary"
            href="https://pectaa.edu.pk/curriculum-compliance/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open PECTAA catalogue <ExternalLink size={16} />
          </a>
          <a
            className="secondary"
            href="https://www.elearn.gov.pk/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open eLearn Punjab <ExternalLink size={16} />
          </a>
        </div>
      </div>
      <section className="panel book-import">
        <h2>Add your downloaded full PDF</h2>
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
        <input
          className="sr-only"
          type="file"
          accept="application/pdf,.pdf"
          ref={input}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) importFile(file);
          }}
        />
        <button
          className="primary"
          disabled={busy}
          onClick={() => input.current?.click()}
        >
          <Upload size={17} />
          {busy ? "Saving PDF…" : "Choose PDF from device"}
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
              Personal imported copy · edition not verified
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
                aria-label={`Export ${b.title}`}
              >
                <Download size={16} />
              </button>
              <button
                className="secondary"
                onClick={() => setRemoveId(b.id)}
                aria-label={`Remove ${b.title}`}
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
      {selected && (
        <PdfReader
          key={selected.id}
          book={selected}
          requestedPage={targetPage}
          onSaved={refresh}
          onClose={() => setSelected(null)}
          onAsk={(c) => onAsk(c, selected.subject)}
        />
      )}
    </>
  );
}

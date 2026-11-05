"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  ArrowRight,
  BookOpen,
  Download,
  ExternalLink,
  Sparkles,
  Trash2,
} from "lucide-react";
import * as db from "@/lib/db";
import { TEXTBOOKS, textbook } from "@/lib/textbooks.mjs";
import { bookCover, hostedBookUrl, HOSTED_BOOKS } from "@/lib/hosted-books.mjs";
import { installBook } from "@/lib/install-book";
import { PECTAA_CATALOGUE, publisherUrl } from "@/lib/publisher-books.mjs";
import LoadingState from "./loading-state";
const PdfReader = dynamic(() => import("./pdf-reader"), {
  ssr: false,
  loading: () => <LoadingState>Opening your book…</LoadingState>,
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
  requestedId?: string;
  requestedPage?: number;
  matchQuery?: string;
  onNavigate: (url: string) => void;
  onAskTopic: (bookId: string, topicId: string, extra?: boolean) => void;
  focus?: { grade: string; subject: string } | null;
}) {
  const [filter, setFilter] = useState("all");
  const [books, setBooks] = useState<LocalBook[]>([]);
  const [selected, setSelected] = useState<LocalBook | null>(null);
  const [details, setDetails] = useState(requestedId || "");
  const [page, setPage] = useState(requestedPage);
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState("");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [removeId, setRemoveId] = useState("");
  const controller = useRef<AbortController | null>(null);
  const openedRequest = useRef("");
  async function refresh() {
    setBooks(await db.list<LocalBook>("books"));
  }
  useEffect(() => {
    void refresh()
      .catch(() => setError("Device storage is unavailable. Please retry."))
      .finally(() => setLoading(false));
    return () => controller.current?.abort();
  }, []);
  const saved = (id: string) =>
    books.find(
      (b) =>
        b.catalogId === id || b.id === id || encodeURIComponent(b.id) === id,
    );
  async function read(id: string, target?: number) {
    if (controller.current) controller.current.abort();
    const abort = new AbortController();
    controller.current = abort;
    setError("");
    setNotice("");
    setOpening(id);
    setProgress(0);
    try {
      const local =
        saved(id) ||
        (await installBook(id, abort.signal, (n, total) =>
          setProgress(Math.floor((n / total) * 100)),
        ));
      if (abort.signal.aborted) return;
      setPage(target || local.lastPage || 1);
      setSelected(local);
      await refresh();
    } catch (e) {
      if (!abort.signal.aborted)
        setError(
          e instanceof Error
            ? e.message
            : "Could not open this book. Please retry.",
        );
    } finally {
      if (controller.current === abort) {
        setOpening("");
        controller.current = null;
      }
    }
  }
  useEffect(() => {
    const key = `${requestedId}:${requestedPage}:${matchQuery}`;
    if (!requestedId || loading || openedRequest.current === key) return;
    openedRequest.current = key;
    setDetails(requestedId);
    if (saved(requestedId) || hostedBookUrl(requestedId))
      void read(requestedId, requestedPage);
    else
      setError(
        "This edition is not hosted yet. You can browse the available books below.",
      );
    // The request is handled once; refreshing the shelf must not reopen a closed reader.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestedId, requestedPage, matchQuery, loading]);
  const visible = TEXTBOOKS.filter(
    (b) =>
      filter === "all" ||
      (filter === "offline" ? !!saved(b.id) : b.classes.includes(filter)),
  );
  const active = textbook(details);
  function download(book: LocalBook) {
    const url = URL.createObjectURL(book.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = book.filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }
  return (
    <>
      <header className="shelf-hero">
        <div>
          <span className="eyebrow">DREAMERS TEXTBOOK LIBRARY</span>
          <h1>Pick a book. Start reading.</h1>
          <p>
            Books are already here. Open one online; we keep a copy in Dreamers
            for offline reading.
          </p>
        </div>
        <button className="secondary" onClick={() => onNavigate("/search")}>
          Search books <ArrowRight size={17} />
        </button>
      </header>
      <div className="library-guide">
        <span>
          <BookOpen size={19} />
          <b>1. Choose your book</b>
        </span>
        <span>
          <ArrowRight size={19} />
          <b>2. Read inside Dreamers</b>
        </span>
        <span>
          <Download size={19} />
          <b>3. Reopen offline</b>
        </span>
      </div>
      <p className="fineprint">
        {HOSTED_BOOKS.length} supplied textbooks and study resources available.
        Only the book you open is transferred. No uploads, accounts or AI needed
        to read. Browser storage can be cleared by your device.
      </p>
      {loading && <LoadingState>Opening the library…</LoadingState>}
      {error && (
        <div className="error-banner" role="alert">
          {error}
          <button
            className="secondary"
            onClick={() =>
              requestedId
                ? void read(requestedId, requestedPage)
                : void refresh().catch(() =>
                    setError("Storage is unavailable."),
                  )
            }
          >
            Retry
          </button>
        </div>
      )}
      {notice && (
        <p className="panel notice" role="status">
          {notice}
        </p>
      )}
      {opening && (
        <section
          className="panel library-transfer"
          role="status"
          aria-live="polite"
        >
          <LoadingState>
            {progress === 100
              ? "Preparing the offline reader…"
              : `Opening ${textbook(opening)?.title || "your book"}… ${progress}%`}
          </LoadingState>
          <progress max={100} value={progress} />
          <p>Keep this page open. Once ready, this copy stays in Dreamers.</p>
          <button
            className="secondary"
            onClick={() => {
              controller.current?.abort();
              setOpening("");
            }}
          >
            Cancel
          </button>
        </section>
      )}
      <div className="gallery-toolbar">
        <div className="gallery-filters" aria-label="Filter books">
          {[
            ["all", "All books"],
            ["XI", "First year"],
            ["XII", "Second year"],
            ["offline", `On this device (${books.length})`],
          ].map(([id, label]) => (
            <button
              key={id}
              aria-pressed={filter === id}
              onClick={() => setFilter(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="reading-gallery">
        {visible.map((book) => {
          const local = saved(book.id);
          const cover = bookCover(book.id);
          const available = hostedBookUrl(book.id);
          return (
            <article
              className={`panel gallery-card ${focus?.subject === book.subject ? "focused-book" : ""}`}
              key={book.id}
            >
              <button
                className={`gallery-cover ${book.color}`}
                disabled={!!opening || (!available && !local)}
                aria-label={`Read ${book.title}, Class ${book.class}`}
                onClick={() => void read(book.id)}
              >
                {cover ? (
                  <img
                    src={cover}
                    alt={`${book.title} original cover or title page`}
                    loading="lazy"
                  />
                ) : (
                  <div className="book-cover-fallback">
                    <BookOpen size={40} />
                    <b>{book.title}</b>
                    <span>CLASS {book.class}</span>
                    <small>Cover not supplied</small>
                  </div>
                )}
              </button>
              <div className="gallery-card-body">
                <span className="gallery-status">
                  Class {book.class} ·{" "}
                  {local
                    ? "● On this device"
                    : available
                      ? `${(book.bytes / 1048576).toFixed(1)} MB`
                      : "Not hosted yet"}
                </span>
                <h2>{book.title}</h2>
                {book.kind !== "textbook" && (
                  <small className="muted">
                    {book.kind === "legacy"
                      ? "Earlier edition · reference"
                      : book.kind === "grammar"
                        ? "Grammar support"
                        : "Study resource"}
                  </small>
                )}
                {available || local ? (
                  <button
                    className="primary"
                    disabled={!!opening}
                    onClick={() => void read(book.id)}
                  >
                    Read book <ArrowRight size={15} />
                  </button>
                ) : (
                  <a
                    className="secondary"
                    href={publisherUrl(book.id) || PECTAA_CATALOGUE}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Publisher edition <ExternalLink size={14} />
                  </a>
                )}
                <details className="simple-options book-card-options">
                  <summary>Book options</summary>
                  <button
                    className="text-link"
                    onClick={() => {
                      setDetails(book.id);
                      requestAnimationFrame(() =>
                        document
                          .getElementById("book-details")
                          ?.scrollIntoView({ block: "start" }),
                      );
                    }}
                  >
                    Chapters & details
                  </button>
                  {local ? (
                    <button
                      className="text-link"
                      onClick={() => download(local)}
                    >
                      Download PDF <Download size={14} />
                    </button>
                  ) : available ? (
                    <a
                      className="text-link"
                      href={available}
                      download={book.filename}
                    >
                      Download PDF <Download size={14} />
                    </a>
                  ) : null}
                </details>
              </div>
            </article>
          );
        })}
      </div>
      {!visible.length && (
        <section className="panel empty">
          <BookOpen size={32} />
          <h2>No books saved here yet</h2>
          <p>
            Choose All books and open a book while online. Dreamers keeps it for
            your next visit.
          </p>
          <button className="primary" onClick={() => setFilter("all")}>
            Browse books
          </button>
        </section>
      )}
      <div id="book-details">
        {active && (
          <section className="panel textbook-chapters">
            <span className="eyebrow">CLASS {active.class}</span>
            <h2>{active.title}</h2>
            <p>
              {active.edition} · {active.pages} PDF pages
            </p>
            <button
              className="primary"
              disabled={
                !!opening || (!hostedBookUrl(active.id) && !saved(active.id))
              }
              onClick={() => void read(active.id, 1)}
            >
              Open full book <BookOpen size={17} />
            </button>
            <p className="fineprint">
              {active.chapters.length
                ? "Chapter links match this exact supplied PDF."
                : "Chapter links are being checked; you can read the whole book now."}{" "}
              Current exam exclusions remain unverified.
            </p>
            <div className="textbook-chapter-list">
              {active.chapters.map((t) => (
                <div className="textbook-chapter" key={t.id}>
                  <BookOpen size={19} />
                  <div>
                    <b>{t.title}</b>
                    <small>PDF page {t.page}</small>
                  </div>
                  <button
                    className="secondary"
                    disabled={
                      !!opening ||
                      (!hostedBookUrl(active.id) && !saved(active.id))
                    }
                    onClick={() => void read(active.id, t.page)}
                  >
                    Read <ArrowRight size={14} />
                  </button>
                  <button
                    className="circle-button"
                    aria-label={`Ask AI about ${t.title}`}
                    onClick={() => onAskTopic(active.id, t.id)}
                  >
                    <Sparkles size={16} />
                  </button>
                </div>
              ))}
            </div>
            {!!active.appendices?.length && (
              <details>
                <summary>Paper patterns in this copy</summary>
                {active.appendices.map((a) => (
                  <button
                    className="secondary"
                    key={a.page}
                    disabled={
                      !!opening ||
                      (!hostedBookUrl(active.id) && !saved(active.id))
                    }
                    onClick={() => void read(active.id, a.page)}
                  >
                    {a.title} · p. {a.page}
                  </button>
                ))}
              </details>
            )}
          </section>
        )}
      </div>
      <details className="panel shelf-manage">
        <summary>Manage copies on this device</summary>
        <p>Removing a book frees space. Your learning progress stays saved.</p>
        {books.map((book) => (
          <div className="between" key={book.id}>
            <span>
              {book.title} · {book.class} · {(book.bytes / 1048576).toFixed(1)}{" "}
              MB
            </span>
            <div className="row">
              <button
                className="secondary"
                onClick={() => void read(book.catalogId || book.id)}
              >
                Read
              </button>
              {removeId === book.id ? (
                <>
                  <button
                    className="secondary"
                    onClick={() => {
                      void db
                        .deleteBook(book.id)
                        .then(refresh)
                        .then(() => {
                          setRemoveId("");
                          setNotice(
                            "Book copy removed. Your learning progress is safe.",
                          );
                        })
                        .catch(() =>
                          setError("Could not remove the book. Please retry."),
                        );
                    }}
                  >
                    Confirm remove
                  </button>
                  <button className="text-link" onClick={() => setRemoveId("")}>
                    Keep
                  </button>
                </>
              ) : (
                <button
                  className="circle-button"
                  aria-label={`Remove ${book.title} from this device`}
                  onClick={() => setRemoveId(book.id)}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </details>
      <section className="panel publisher-links">
        <h2>Looking for another book?</h2>
        <p>
          Our supplied collection is not yet every Punjab textbook. Explore the
          official catalogue for additional First Year and Second Year editions.
        </p>
        <a
          className="secondary"
          href={PECTAA_CATALOGUE}
          target="_blank"
          rel="noreferrer"
        >
          Official PECTAA catalogue <ExternalLink size={15} />
        </a>
      </section>
      {selected && (
        <PdfReader
          key={selected.id}
          book={selected}
          requestedPage={page}
          matchQuery={matchQuery}
          onSaved={refresh}
          onClose={() => setSelected(null)}
          onAsk={(c) => onAsk(c, selected.subject, selected.catalogId)}
        />
      )}
    </>
  );
}

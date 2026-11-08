"use client";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { openLocalPdf, type LocalPdf } from "@/lib/pdf-client";
import {
  MAX_BOOK_PAGES,
  MAX_PAGE_TEXT,
  meaningfulPdfText,
} from "@/lib/books.mjs";
import { excerptForQuestion } from "@/lib/book-retrieval.mjs";
import LoadingState from "./loading-state";
import PassageHighlight from "./passage-highlight";
import ReaderAssistant from "./reader-assistant";
import { preparedBookPages } from "@/lib/prepared-book-text";
import {
  retrieveReaderSources,
  readerChapter,
  chapterPageRange,
} from "@/lib/reader-retrieval.mjs";
import { swipePage, readerPageQuery } from "@/lib/reader-tools.mjs";
import { textbook } from "@/lib/textbooks.mjs";
import * as db from "@/lib/db";
import type { LocalBook, BookPage, BookContext } from "./book-library";
export default function PdfReader({
  book,
  requestedPage,
  matchQuery,
  onSaved,
  onClose,
  onAsk,
}: {
  book: LocalBook;
  requestedPage: number;
  matchQuery: string;
  onSaved: () => Promise<void>;
  onClose: () => void;
  onAsk: (context: BookContext) => void;
}) {
  const [pdf, setPdf] = useState<LocalPdf | null>(null),
    [page, setPage] = useState(requestedPage || 1),
    [pageText, setPageText] = useState(""),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [indexing, setIndexing] = useState(false),
    [indexed, setIndexed] = useState(book.indexedPages || 0),
    [rendering, setRendering] = useState(false),
    [tool, setTool] = useState("read"),
    [search, setSearch] = useState(""),
    [searching, setSearching] = useState(false),
    [searchNotice, setSearchNotice] = useState(""),
    [hits, setHits] = useState<Array<{ page: number; snippet: string }>>([]),
    [readerMatch, setReaderMatch] = useState(matchQuery),
    [selection, setSelection] = useState(""),
    [pageDraft, setPageDraft] = useState(String(requestedPage || 1));
  useEffect(() => {
    setPage(
      Math.max(
        1,
        Math.min(pdf?.numPages || book.pageCount || 1500, requestedPage || 1),
      ),
    );
  }, [requestedPage, pdf, book.pageCount]);
  useEffect(() => {
    setReaderMatch(matchQuery);
  }, [matchQuery]);
  const pageRef = useRef(page),
    totalRef = useRef(0);
  pageRef.current = page;
  totalRef.current = pdf?.numPages || 0;
  const tools = useRef<HTMLDivElement>(null),
    pageView = useRef<HTMLDivElement>(null);
  const gesture = useRef<{ x: number; y: number; at: number } | null>(null);
  const wheelAt = useRef(0);
  const catalogue = textbook(book.catalogId);
  function turnPage(next: number) {
    const total = totalRef.current;
    if (!total) return;
    setPage(Math.max(1, Math.min(total, next)));
    pageView.current?.scrollIntoView({ block: "start" });
  }
  function openTool(next: string) {
    setTool(next);
    requestAnimationFrame(() =>
      tools.current?.scrollIntoView({ block: "start" }),
    );
  }
  const canvas = useRef<HTMLCanvasElement>(null),
    modal = useRef<HTMLDivElement>(null),
    closeButton = useRef<HTMLButtonElement>(null),
    stop = useRef(false),
    alive = useRef(true),
    close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeButton.current?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        stop.current = true;
        close.current();
      }
      const input = e.target as HTMLElement;
      if (
        !input.closest('input,textarea,select,[contenteditable="true"]') &&
        (e.key === "ArrowLeft" || e.key === "ArrowRight")
      ) {
        e.preventDefault();
        turnPage(pageRef.current + (e.key === "ArrowRight" ? 1 : -1));
      }
      if (e.key === "Tab") {
        const nodes = Array.from(
          modal.current?.querySelectorAll<HTMLElement>(
            'button:not(:disabled),input:not(:disabled),textarea:not(:disabled),select:not(:disabled),a[href],summary,[tabindex="0"]',
          ) || [],
        ).filter((node) => node.getClientRects().length > 0);
        if (!nodes?.length) return;
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", key);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);
  useEffect(() => {
    alive.current = true;
    let document: LocalPdf | null = null;
    openLocalPdf(book.blob)
      .then((value) => {
        document = value;
        if (!alive.current) {
          void value.loadingTask.destroy();
          return;
        }
        setPdf(value);
        setPage((p) => Math.max(1, Math.min(value.numPages, p)));
        db.patch("books", book.id, { pageCount: value.numPages })
          .then(onSaved)
          .catch(() =>
            setError("The book opened, but its page count could not be saved."),
          );
      })
      .catch(() => {
        if (alive.current)
          setError(
            "This PDF could not be opened. It may be encrypted, damaged or unsupported. The PDF reader also needs its first preparation while online. Your saved file is preserved.",
          );
      })
      .finally(() => {
        if (alive.current) setLoading(false);
      });
    return () => {
      alive.current = false;
      stop.current = true;
      void document?.loadingTask.destroy();
    };
  }, [book.id]);
  useEffect(() => setPage(requestedPage || 1), [requestedPage]);
  useEffect(() => setPageDraft(String(page)), [page]);
  useEffect(() => {
    if (!pdf || !canvas.current) return;
    let cancelled = false;
    let render: { cancel: () => void } | undefined;
    setRendering(true);
    setError("");
    setPageText("");
    (async () => {
      try {
        const view = await pdf.getPage(page);
        if (cancelled) return;
        const width = Math.max(
          280,
          Math.min(canvas.current!.parentElement!.clientWidth - 24, 1000),
        );
        const base = view.getViewport({ scale: 1 });
        const factor =
          Math.min(width / base.width, 1.5) *
          Math.min(devicePixelRatio || 1, 1.5);
        const viewport = view.getViewport({ scale: factor });
        const c = canvas.current!;
        c.width = Math.floor(viewport.width);
        c.height = Math.floor(viewport.height);
        c.style.width = Math.min(width, base.width * 1.5) + "px";
        c.style.height = "auto";
        const task = view.render({
          canvas: c,
          canvasContext: c.getContext("2d")!,
          viewport,
        });
        render = task;
        await task.promise;
        if (page === 1 && !book.cover && !cancelled) {
          try {
            const thumbnail = document.createElement("canvas");
            thumbnail.width = 216;
            thumbnail.height = Math.round((216 * c.height) / c.width);
            thumbnail
              .getContext("2d")
              ?.drawImage(c, 0, 0, thumbnail.width, thumbnail.height);
            await db.patch("books", book.id, {
              cover: thumbnail.toDataURL("image/webp", 0.72),
            });
          } catch {
            // Preview storage is optional; continue reading the PDF.
          }
        }
        const content = await view.getTextContent();
        let text = meaningfulPdfText(content.items);
        // Prepared text includes OCR for the scanned opening chapter of this exact English copy.
        try {
          const prepared = await preparedBookPages(book);
          const source = prepared?.find((p) => p.page === page);
          if (source?.text) text = source.text;
        } catch {
          /* The PDF remains readable when text preparation is unavailable. */
        }
        if (cancelled) return;
        setPageText(text);
        await db.put("bookPages", {
          id: `${book.id}:p:${page}`,
          bookId: book.id,
          page,
          text,
        });
        await db.patch("books", book.id, { lastPage: page });
        await onSaved();
      } catch (e) {
        if (
          !cancelled &&
          !(e instanceof Error && e.name === "RenderingCancelledException")
        )
          setError(
            "This page could not be rendered or saved. Your PDF is still on this device.",
          );
      } finally {
        if (!cancelled) setRendering(false);
      }
    })();
    return () => {
      cancelled = true;
      render?.cancel();
    };
  }, [pdf, page]);
  async function prepareSearch() {
    if (!pdf || indexing) return;
    setIndexing(true);
    stop.current = false;
    let last = indexed;
    try {
      for (
        let n = indexed + 1;
        n <= Math.min(pdf.numPages, MAX_BOOK_PAGES);
        n++
      ) {
        if (stop.current || !alive.current) break;
        const saved = await db.get<BookPage>("bookPages", `${book.id}:p:${n}`);
        if (!saved) {
          const current = await pdf.getPage(n);
          try {
            const content = await current.getTextContent();
            await db.put("bookPages", {
              id: `${book.id}:p:${n}`,
              bookId: book.id,
              page: n,
              text: meaningfulPdfText(content.items),
            });
          } finally {
            current.cleanup();
          }
        }
        last = n;
        if (alive.current) setIndexed(n);
        if (n % 10 === 0)
          await db.patch("books", book.id, {
            indexedPages: n,
            pageCount: pdf.numPages,
          });
        await new Promise<void>((resolve) => setTimeout(resolve, 0));
      }
    } catch {
      if (alive.current)
        setError(
          "Search preparation stopped. Saved pages are safe; search again to resume.",
        );
    } finally {
      try {
        await db.patch("books", book.id, {
          indexedPages: last,
          pageCount: pdf.numPages,
        });
        await onSaved();
      } catch {
        if (alive.current)
          setError(
            "Search progress could not be saved. Your book is still available.",
          );
      }
      if (alive.current) setIndexing(false);
    }
  }
  async function findInBook() {
    if (!pdf || searching || !search.trim()) return;
    setSearching(true);
    setHits([]);
    setSearchNotice("");
    setError("");
    try {
      const target = readerPageQuery(search, pdf.numPages);
      if (target !== null) {
        if (target) turnPage(target);
        setSearchNotice(
          target
            ? `Opened PDF page ${target}.`
            : `Enter a PDF page from 1 to ${pdf.numPages}.`,
        );
        return;
      }
      if (indexed < Math.min(pdf.numPages, MAX_BOOK_PAGES))
        await prepareSearch();
      if (!alive.current) return;
      const literal = await db.findBookText(search, book.id, 12);
      const found = literal.length
        ? literal
        : await db.searchPages(search, [book.id], 12);
      const chapters = (catalogue?.chapters || [])
        .filter((c) =>
          c.title.toLowerCase().includes(search.trim().toLowerCase()),
        )
        .map((c) => ({ page: c.page, snippet: c.title }));
      const results = [
        ...new Map(
          [...chapters, ...found].map((r) => [
            r.page,
            { page: r.page, snippet: r.snippet },
          ]),
        ).values(),
      ];
      setHits(results);
      if (!results.length) {
        const pages = await db.bookPages<BookPage>(book.id);
        const readable = pages.filter((p) => p.text.trim()).length;
        setSearchNotice(
          readable
            ? "No matching text found in the prepared pages. Try a shorter word, or ask AI what it means."
            : "This book uses scanned page pictures. Word search cannot read these images yet. Enter a PDF page number, or type the word/line in Ask AI.",
        );
      } else
        setSearchNotice(
          `Showing ${results.length} matches (up to 12 text results). Tap a page to read it.`,
        );
    } catch {
      if (alive.current)
        setSearchNotice(
          "Search could not finish. Your book is safe; please retry.",
        );
    } finally {
      if (alive.current) setSearching(false);
    }
  }
  return (
    <div className="pdf-overlay">
      <div
        className="pdf-reader panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pdf-title"
        ref={modal}
      >
        <header className="pdf-header">
          <div>
            <span className="eyebrow">DREAMERS BOOK READER</span>
            <h2 id="pdf-title">
              {book.title} <small>· Class {book.class}</small>
            </h2>
          </div>
          <button
            className="circle-button"
            ref={closeButton}
            onClick={() => {
              stop.current = true;
              close.current();
            }}
            aria-label="Close PDF reader"
          >
            <X size={20} />
          </button>
        </header>
        <div className="pdf-toolbar">
          <label className="pdf-page-label">
            PDF page
            <input
              aria-label="PDF page number"
              type="number"
              min="1"
              max={pdf?.numPages || 1}
              value={pageDraft}
              onChange={(e) => setPageDraft(e.target.value)}
              onBlur={() => {
                const value = readerPageQuery(pageDraft, pdf?.numPages || 0);
                if (value && value !== page) turnPage(value);
                else setPageDraft(String(page));
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
              }}
            />
            <span>/ {pdf?.numPages || "…"}</span>
          </label>
        </div>
        <div className="reader-tools" ref={tools}>
          <nav className="reader-tool-tabs" aria-label="Book tools">
            {[
              ["read", "Read"],
              ["search", "Find page / word"],
              ["ask", "Ask AI"],
            ].map(([id, label]) => (
              <button
                key={id}
                aria-pressed={tool === id}
                onClick={() => setTool(id)}
              >
                {id === "ask" && <Sparkles size={16} />} {label}
              </button>
            ))}
          </nav>
          {tool === "search" && (
            <section className="reader-search" aria-label="Search this book">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void findInBook();
                }}
              >
                <label className="sr-only" htmlFor="reader-search">
                  Page number, topic or word
                </label>
                <input
                  id="reader-search"
                  value={search}
                  disabled={searching}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Page 11, kidney, aain, or an exact word…"
                />
                <button
                  className="primary"
                  disabled={!pdf || searching || !search.trim()}
                >
                  <Search size={16} />
                  Find
                </button>
              </form>
              <small>
                Page numbers jump straight to the PDF page. Words and topics
                search readable text on this device. PDF page numbers can differ
                from the printed numbers.
              </small>
              {searching && (
                <>
                  <LoadingState>
                    {indexing
                      ? `Preparing searchable pages ${indexed}/${pdf?.numPages}…`
                      : "Finding your word…"}
                  </LoadingState>
                  <button
                    className="text-link"
                    onClick={() => {
                      stop.current = true;
                    }}
                  >
                    Stop preparing
                  </button>
                </>
              )}
              {searchNotice && <p role="status">{searchNotice}</p>}
              <div className="reader-search-results">
                {hits.map((hit) => (
                  <button
                    className="reader-search-hit"
                    key={hit.page}
                    onClick={() => {
                      setReaderMatch(search);
                      turnPage(hit.page);
                    }}
                  >
                    <b>
                      PDF page {hit.page} <ArrowRight size={14} />
                    </b>
                    <span dir="auto">
                      <PassageHighlight text={hit.snippet} query={search} />
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}
          <div hidden={tool !== "ask"}>
            <ReaderAssistant
              book={book}
              page={page}
              pageText={pageText}
              selection={selection}
              onRead={(target) => {
                setTool("read");
                turnPage(target);
              }}
              resolveSources={async (input, conversation, signal) => {
                const catalog = textbook(book.catalogId);
                const chapter = readerChapter(
                  catalog,
                  input,
                  conversation,
                  page,
                );
                const range = chapterPageRange(catalog, chapter);
                let pages = await preparedBookPages(book).catch(() => null);
                if (!pages && pdf) {
                  const first = range?.first || page,
                    last = Math.min(range?.last || page, first + 39);
                  pages = [];
                  for (let n = first; n <= last; n++) {
                    if (signal.aborted) return [];
                    let saved = await db.get<BookPage>(
                      "bookPages",
                      `${book.id}:p:${n}`,
                    );
                    if (!saved) {
                      const view = await pdf.getPage(n);
                      const content = await view.getTextContent();
                      saved = {
                        id: `${book.id}:p:${n}`,
                        bookId: book.id,
                        page: n,
                        text: meaningfulPdfText(content.items),
                      };
                      await db.put("bookPages", saved);
                    }
                    pages.push(saved);
                  }
                }
                return retrieveReaderSources({
                  catalog,
                  question: input,
                  conversation,
                  page,
                  pages: pages || [],
                }).sources;
              }}
            />
          </div>
        </div>
        {error && (
          <p className="error-banner" role="alert">
            {error}
          </p>
        )}
        <p className="reader-swipe-hint">
          Swipe left / right on the page to turn it. You can also use the arrow
          keys.
        </p>
        {loading ? (
          <LoadingState>Opening your saved PDF…</LoadingState>
        ) : (
          rendering && <LoadingState>Rendering page {page}…</LoadingState>
        )}
        <div
          className="pdf-canvas-wrap"
          ref={pageView}
          aria-busy={rendering}
          onPointerDown={(e) => {
            if (e.pointerType === "touch") {
              gesture.current = { x: e.clientX, y: e.clientY, at: Date.now() };
              e.currentTarget.setPointerCapture(e.pointerId);
            }
          }}
          onPointerCancel={() => {
            gesture.current = null;
          }}
          onPointerUp={(e) => {
            const start = gesture.current;
            gesture.current = null;
            if (start && !rendering) {
              const next = swipePage({
                dx: e.clientX - start.x,
                dy: e.clientY - start.y,
                elapsed: Date.now() - start.at,
                page,
                total: pdf?.numPages || page,
              });
              if (next !== page) turnPage(next);
            }
          }}
          onWheel={(e) => {
            if (
              !rendering &&
              Math.abs(e.deltaX) > 55 &&
              Math.abs(e.deltaX) > Math.abs(e.deltaY) * 1.5 &&
              Date.now() - wheelAt.current > 650
            ) {
              wheelAt.current = Date.now();
              turnPage(page + (e.deltaX > 0 ? 1 : -1));
            }
          }}
        >
          <canvas ref={canvas} aria-label={`${book.title}, PDF page ${page}`} />
        </div>
        <div className="reader-bottom-nav">
          <button
            className="secondary"
            aria-label="Previous page"
            disabled={!pdf || page <= 1 || rendering}
            onClick={() => turnPage(page - 1)}
          >
            <ArrowLeft size={17} />
          </button>
          <span>
            PDF {page} / {pdf?.numPages || "…"}
          </span>
          <button
            className="secondary"
            aria-label="Next page"
            disabled={!pdf || page >= (pdf?.numPages || 1) || rendering}
            onClick={() => turnPage(page + 1)}
          >
            <ArrowRight size={17} />
          </button>
        </div>
        <details className="pdf-text">
          <summary>Page text & selected words</summary>
          <p
            dir="auto"
            onMouseUp={() => {
              const value = window.getSelection()?.toString().trim();
              if (value) setSelection(value.slice(0, 900));
            }}
          >
            {pageText ? (
              <PassageHighlight
                text={
                  readerMatch
                    ? excerptForQuestion(pageText, readerMatch)
                    : pageText
                }
                query={readerMatch}
              />
            ) : loading || rendering ? (
              "Reading page text…"
            ) : (
              "This page has no selectable text. You can still read the page image."
            )}
          </p>
          {pageText.trim() && (
            <div className="row">
              <button className="primary" onClick={() => openTool("ask")}>
                <Sparkles size={17} /> Explain a word or line
              </button>
              <button
                className="text-link"
                onClick={() =>
                  onAsk({
                    title: book.title,
                    page,
                    text: excerptForQuestion(pageText, readerMatch),
                  })
                }
              >
                Open full AI teacher
              </button>
            </div>
          )}
          <small>
            {pageText.trim()
              ? "Select a few words here, then choose Explain a word or line. AI needs internet; saved explanations open offline."
              : "This page is a picture. Open Ask AI above and type your question or the line you want explained."}
          </small>
        </details>
      </div>
    </div>
  );
}

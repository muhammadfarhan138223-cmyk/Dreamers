"use client";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Download,
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
import * as db from "@/lib/db";
import type { LocalBook, BookPage, BookContext } from "./book-library";
export default function PdfReader({
  book,
  requestedPage,
  onSaved,
  onClose,
  onAsk,
}: {
  book: LocalBook;
  requestedPage: number;
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
    [rendering, setRendering] = useState(false);
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
      if (e.key === "Tab") {
        const nodes = modal.current?.querySelectorAll<HTMLElement>(
          'button:not(:disabled),input:not(:disabled),summary,[tabindex="0"]',
        );
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
  useEffect(() => {
    if (!pdf || !canvas.current) return;
    let cancelled = false;
    let render: { cancel: () => void } | undefined;
    setRendering(true);
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
        const content = await view.getTextContent();
        const text = meaningfulPdfText(content.items);
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
  async function indexBook() {
    if (!pdf || indexing) return;
    setIndexing(true);
    setError("");
    stop.current = false;
    let last = indexed;
    try {
      for (
        let n = indexed + 1;
        n <= Math.min(pdf.numPages, MAX_BOOK_PAGES);
        n++
      ) {
        if (stop.current) break;
        const saved = await db.get<BookPage>("bookPages", `${book.id}:p:${n}`);
        if (!saved) {
          const current = await pdf.getPage(n);
          const content = await current.getTextContent();
          const text = meaningfulPdfText(content.items);
          await db.put("bookPages", {
            id: `${book.id}:p:${n}`,
            bookId: book.id,
            page: n,
            text,
          });
          current.cleanup();
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
          "Text indexing stopped. Completed pages are preserved; you can resume indexing.",
        );
    } finally {
      await db.patch("books", book.id, {
        indexedPages: last,
        pageCount: pdf.numPages,
      });
      await onSaved();
      if (alive.current) setIndexing(false);
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
            <span className="eyebrow">
              LOCAL FULL-PDF READER · EDITION NOT VERIFIED
            </span>
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
          <button
            className="secondary"
            disabled={!pdf || page <= 1 || rendering}
            onClick={() => setPage((p) => p - 1)}
          >
            <ArrowLeft size={16} />
            Previous
          </button>
          <label className="pdf-page-label">
            PDF page
            <input
              aria-label="PDF page number"
              type="number"
              min="1"
              max={pdf?.numPages || 1}
              value={page}
              onChange={(e) => {
                if (pdf)
                  setPage(
                    Math.max(
                      1,
                      Math.min(pdf.numPages, Number(e.target.value) || 1),
                    ),
                  );
              }}
            />
            <span>/ {pdf?.numPages || "…"}</span>
          </label>
          <button
            className="secondary"
            disabled={!pdf || page >= pdf.numPages || rendering}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
            <ArrowRight size={16} />
          </button>
          <button
            className="secondary"
            disabled={
              !pdf ||
              indexing ||
              indexed >= Math.min(pdf?.numPages || Infinity, MAX_BOOK_PAGES)
            }
            onClick={indexBook}
          >
            <Search size={16} />
            {indexing
              ? `Indexing ${indexed}/${pdf?.numPages}`
              : indexed >= Math.min(pdf?.numPages || Infinity, MAX_BOOK_PAGES)
                ? "Text index ready"
                : indexed
                  ? "Resume / finish text index"
                  : "Index book text"}
          </button>
          {indexing && (
            <button className="secondary" onClick={() => (stop.current = true)}>
              Stop indexing
            </button>
          )}
        </div>
        {error && (
          <p className="error-banner" role="alert">
            {error}
          </p>
        )}
        <p className="fineprint">
          The PDF file stays on your device. Indexing extracts selectable text
          for offline search (up to 1,500 pages per book). Image-only pages need
          OCR, which is not enabled. PDF page numbers may differ from printed
          page numbers.
        </p>
        {loading && <p role="status">Preparing local PDF engine…</p>}
        <div className="pdf-canvas-wrap" aria-busy={rendering}>
          <canvas ref={canvas} aria-label={`${book.title}, PDF page ${page}`} />
        </div>
        <details className="pdf-text" open>
          <summary>Extracted text and AI reference</summary>
          <p dir="auto">
            {pageText ||
              "No selectable text was found on this page. You can still read the rendered PDF image."}
          </p>
          <button
            className="primary"
            disabled={!pageText.trim()}
            onClick={() =>
              onAsk({ title: book.title, page, text: pageText.slice(0, 2000) })
            }
          >
            <Sparkles size={17} />
            Ask AI about this page
          </button>
          <small>
            Only the selected text excerpt is sent when you submit an AI
            question. Online AI needs owner configuration; no remote AI runs
            offline.
          </small>
        </details>
      </div>
    </div>
  );
}

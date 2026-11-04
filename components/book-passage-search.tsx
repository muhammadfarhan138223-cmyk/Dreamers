"use client";
import { useEffect, useRef, useState } from "react";
import { Search, BookOpen, Check } from "lucide-react";
import * as db from "@/lib/db";
import { excerptForQuestion, retrievalTerms } from "@/lib/book-retrieval.mjs";
import type { LocalBook, BookPage, BookContext } from "./book-library";
type Hit = BookPage & { score: number; snippet: string };
export default function BookPassageSearch({
  book,
  query,
  busy,
  selectedPage,
  onSelect,
  onClear,
  onOpen,
}: {
  book: LocalBook;
  query: string;
  busy: boolean;
  selectedPage?: number;
  onSelect: (source: BookContext) => void;
  onClear: () => void;
  onOpen: () => void;
}) {
  const [hits, setHits] = useState<Hit[]>([]),
    [searching, setSearching] = useState(false),
    [notice, setNotice] = useState("");
  const sequence = useRef(0);
  useEffect(() => {
    sequence.current++;
    setHits([]);
    setNotice("");
    setSearching(false);
    return () => {
      sequence.current++;
    };
  }, [query, book.id]);
  async function find() {
    const request = ++sequence.current;
    setSearching(true);
    setNotice("");
    try {
      const terms = retrievalTerms(query);
      if (!terms.length) {
        setNotice("Include a topic or keyword, for example kidney or osmosis.");
        return;
      }
      const found = await db.searchPages(terms.join(" "), [book.id], 5);
      if (request !== sequence.current) return;
      setHits(found);
      if (!found.length)
        setNotice(
          "No matching saved passage yet. Open your PDF and choose Index book text to prepare more pages. Image-only scans need OCR, which is not enabled.",
        );
    } catch {
      if (request === sequence.current)
        setNotice(
          "Saved book text could not be searched. Your PDF is still available.",
        );
    } finally {
      if (request === sequence.current) setSearching(false);
    }
  }
  return (
    <section
      className="book-passage-search"
      aria-label="Find a source in this book"
    >
      <div className="between">
        <b>Find your question in this book</b>
        <button
          className="secondary"
          disabled={busy || searching || !query.trim()}
          onClick={() => void find()}
        >
          <Search size={16} />
          {searching ? "Searching saved text…" : "Search saved book text"}
        </button>
      </div>
      <p>
        Search runs on this device, including offline. It covers
        extracted/indexed pages only. Choose a passage; Explain simply sends at
        most 2,000 characters from that passage to the AI provider.
      </p>
      {selectedPage && (
        <div className="selected-passage">
          <Check size={16} />
          <span>
            AI reference: PDF page {selectedPage} from your book search.
          </span>
          <button className="text-link" disabled={busy} onClick={onClear}>
            Use selected chapter page instead
          </button>
        </div>
      )}
      {notice && <p role="status">{notice}</p>}
      {!!hits.length && (
        <div className="passage-hits">
          {hits.map((hit) => (
            <button
              key={hit.id}
              className={hit.page === selectedPage ? "selected" : ""}
              disabled={busy}
              aria-label={`Use PDF page ${hit.page} as AI reference`}
              onClick={() => {
                if (hit.bookId !== book.id) return;
                onSelect({
                  title: book.title.slice(0, 120),
                  page: hit.page,
                  text: excerptForQuestion(hit.text, query),
                });
              }}
            >
              <b>
                <BookOpen size={15} />
                PDF page {hit.page}
              </b>
              <span dir="auto">{hit.snippet}</span>
              <small>Use this passage →</small>
            </button>
          ))}
        </div>
      )}
      <button className="text-link" disabled={busy} onClick={onOpen}>
        Open PDF / prepare its text index →
      </button>
    </section>
  );
}

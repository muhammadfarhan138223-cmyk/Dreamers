"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, BookOpen, Search, Sparkles } from "lucide-react";
import * as db from "@/lib/db";
import {
  findChapters,
  findFoundation,
  matchesSearchFilters,
} from "@/lib/global-search.mjs";
import { searchTopics } from "@/lib/ai-search.mjs";
import { TEXTBOOKS, textbook } from "@/lib/textbooks.mjs";
import type { BookPage, LocalBook } from "./book-library";
import type { Pack } from "@/lib/types";
type PageHit = BookPage & { score: number; snippet: string };
type TopicHit = {
  id: string;
  title: string;
  bookId: string;
  bookTitle: string;
  page: number;
};
type FoundationHit = {
  id: string;
  title: string;
  subject: string;
  url: string;
  snippet: string;
};
export default function GlobalSearch({
  request,
  online,
  aiConfigured,
  navigate,
  onQuery,
}: {
  request: { query: string; id: number };
  online: boolean;
  aiConfigured: boolean;
  navigate: (url: string) => void;
  onQuery: (query: string) => void;
}) {
  const [draft, setDraft] = useState(request.query),
    [submitted, setSubmitted] = useState(""),
    [busy, setBusy] = useState(false),
    [localBusy, setLocalBusy] = useState(false),
    [error, setError] = useState(""),
    [aiStatus, setAiStatus] = useState(""),
    [keywords, setKeywords] = useState<string[]>([]),
    [chapters, setChapters] = useState<TopicHit[]>([]),
    [suggested, setSuggested] = useState<TopicHit[]>([]),
    [pages, setPages] = useState<PageHit[]>([]),
    [books, setBooks] = useState<LocalBook[]>([]),
    [foundation, setFoundation] = useState<FoundationHit[]>([]);
  const [filters, setFilters] = useState({
      subject: "all",
      grade: "all",
      book: "all",
      kind: "all",
    }),
    [filteredPages, setFilteredPages] = useState<PageHit[]>([]),
    [filterBusy, setFilterBusy] = useState(false),
    [pageLimit, setPageLimit] = useState(12);
  const active = useRef<AbortController | null>(null),
    serial = useRef(0);
  const search = useCallback(
    async (value: string, withAi = true) => {
      active.current?.abort();
      const controller = new AbortController();
      active.current = controller;
      const id = ++serial.current,
        q = value.trim();
      setSubmitted(q);
      setFilters({ subject: "all", grade: "all", book: "all", kind: "all" });
      setPageLimit(12);
      setError("");
      setAiStatus("");
      setKeywords([]);
      setSuggested([]);
      setPages([]);
      setFoundation([]);
      setChapters(q ? findChapters(q) : []);
      setBusy(false);
      if (!q) {
        setLocalBusy(false);
        return;
      }
      setLocalBusy(true);
      let packs: Pack[] = [];
      try {
        const [localBooks, hits, savedPacks] = await Promise.all([
          db.list<LocalBook>("books"),
          db.searchPages(q),
          db.list<Pack>("packs"),
        ]);
        if (id !== serial.current || controller.signal.aborted) return;
        packs = savedPacks;
        setBooks(localBooks);
        setPages(hits);
        setFoundation(findFoundation(packs, q));
      } catch {
        if (id === serial.current)
          setError(
            "The saved book index could not be read. Checked chapter results are still available.",
          );
      } finally {
        if (id === serial.current) setLocalBusy(false);
      }
      if (id !== serial.current || controller.signal.aborted || !withAi) return;
      if (!online) {
        setAiStatus(
          "Offline search: checked chapters and downloaded, indexed text only. AI search needs internet.",
        );
        return;
      }
      let configured = aiConfigured;
      if (!configured) {
        try {
          configured =
            (
              await (
                await fetch("/api/health", {
                  cache: "no-store",
                  signal: controller.signal,
                })
              ).json()
            ).aiConfigured === true;
        } catch {}
      }
      if (!configured) {
        setAiStatus(
          "AI search is not ready right now. Your local results are still available.",
        );
        return;
      }
      setBusy(true);
      setAiStatus("AI is finding related topics across the checked books…");
      try {
        // Only this search query is sent. Private PDF text, notes and files stay local.
        const response = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: q }),
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error || "AI search is unavailable.");
        if (id !== serial.current || controller.signal.aborted) return;
        const ids = new Set<string>(data.topicIds),
          terms: string[] = data.keywords;
        setSuggested(searchTopics.filter((t) => ids.has(t.id)));
        setKeywords(terms);
        setChapters(findChapters(q, terms));
        const expanded = [q, ...terms].join(" ");
        const hits = await db.searchPages(expanded);
        if (id !== serial.current || controller.signal.aborted) return;
        setPages(hits);
        setFoundation(findFoundation(packs, expanded));
        setAiStatus(
          "AI-assisted discovery finished. Topic relevance is generated; the chapter titles and page links come from the catalogue.",
        );
      } catch (e) {
        if (id === serial.current && !controller.signal.aborted)
          setAiStatus(
            e instanceof Error
              ? e.message
              : "AI search failed. Local results are still available.",
          );
      } finally {
        if (id === serial.current) setBusy(false);
      }
    },
    [online, aiConfigured],
  );
  useEffect(() => {
    setDraft(request.query);
    void search(request.query);
    return () => {
      active.current?.abort();
      serial.current++;
    };
  }, [request, search]);
  useEffect(() => {
    let cancelled = false;
    const pdfKind = filters.kind === "all" || filters.kind === "pdf";
    if (!submitted || !pdfKind) {
      setFilteredPages([]);
      setFilterBusy(false);
      return;
    }
    if (
      filters.subject === "all" &&
      filters.grade === "all" &&
      filters.book === "all" &&
      pageLimit === 12
    ) {
      setFilteredPages(pages);
      setFilterBusy(false);
      return;
    }
    setFilteredPages([]);
    setFilterBusy(true);
    const allowed = books
      .filter((book) =>
        matchesSearchFilters(book, filters, book.catalogId || book.id),
      )
      .map((book) => book.id);
    void db
      .searchPages([submitted, ...keywords].join(" "), allowed, pageLimit)
      .then((hits) => {
        if (!cancelled) setFilteredPages(hits);
      })
      .catch(() => {
        if (!cancelled) {
          setFilteredPages([]);
          setError("Filtered PDF search could not be read. Retry the search.");
        }
      })
      .finally(() => {
        if (!cancelled) setFilterBusy(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filters, submitted, keywords, books, pages, pageLimit]);
  const bookFor = (id: string) => books.find((book) => book.id === id);
  const shownSuggested =
    filters.kind === "all" || filters.kind === "chapter"
      ? suggested.filter((t) =>
          matchesSearchFilters(textbook(t.bookId), filters, t.bookId),
        )
      : [];
  const shownChapters =
    filters.kind === "all" || filters.kind === "chapter"
      ? chapters.filter(
          (t) =>
            matchesSearchFilters(textbook(t.bookId), filters, t.bookId) &&
            !shownSuggested.some((s) => s.id === t.id),
        )
      : [];
  const shownPages = filteredPages.filter((t) => bookFor(t.bookId));
  const shownFoundation =
    filters.kind === "all" || filters.kind === "foundation"
      ? foundation.filter((t) =>
          matchesSearchFilters(
            { id: "foundation", subject: t.subject, class: "foundation" },
            filters,
          ),
        )
      : [];
  const noFilteredMatches =
    shownSuggested.length +
      shownChapters.length +
      shownPages.length +
      shownFoundation.length ===
    0;
  const hasFilters = Object.values(filters).some((v) => v !== "all");
  const resetFilters = () =>
    setFilters({ subject: "all", grade: "all", book: "all", kind: "all" });
  const changeFilter = (key: keyof typeof filters, value: string) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPageLimit(12);
  };
  const topicRow = (t: TopicHit, ai = false) => (
    <article
      className="panel search-result"
      key={`${ai ? "ai" : "chapter"}-${t.id}`}
    >
      <div>
        <span className="eyebrow">
          {ai ? "AI-SUGGESTED MATCH · " : "CHECKED HEADING · "}
          {t.bookTitle} · {textbook(t.bookId)?.class} · PDF page {t.page}
        </span>
        <h3>{t.title}</h3>
      </div>
      <button
        className="circle-button"
        aria-label={`Read ${t.title}`}
        onClick={() => navigate(`/books/${t.bookId}/${t.page}`)}
      >
        <ArrowRight size={19} />
      </button>
    </article>
  );
  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">SEARCH ACROSS YOUR LEARNING LIBRARY</span>
        <h1>One question. Every book in reach.</h1>
        <p>
          Find checked chapters, indexed PDF passages and downloaded foundation
          lessons across subjects and classes.
        </p>
      </div>
      <form
        className="panel big-search"
        onSubmit={(e) => {
          e.preventDefault();
          onQuery(draft);
          void search(draft);
        }}
      >
        <Search size={22} />
        <input
          aria-label="Search all books and topics"
          placeholder="Describe what you want to understand…"
          value={draft}
          maxLength={600}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button className="primary" type="submit" disabled={!draft.trim()}>
          Search <ArrowRight size={17} />
        </button>
      </form>
      <div
        className="panel global-search-filters"
        aria-label="Filter search results"
      >
        <label className="field">
          Subject
          <select
            value={filters.subject}
            onChange={(e) => changeFilter("subject", e.target.value)}
          >
            <option value="all">All subjects</option>
            {Array.from(
              new Set([
                ...TEXTBOOKS.map((b) => b.subject),
                ...books.map((b) => b.subject),
              ]),
            )
              .sort()
              .map((subject) => (
                <option key={subject} value={subject}>
                  {subject.split("-").join(" ")}
                </option>
              ))}
          </select>
        </label>
        <label className="field">
          Class
          <select
            value={filters.grade}
            onChange={(e) => changeFilter("grade", e.target.value)}
          >
            <option value="all">All classes</option>
            <option>XI</option>
            <option>XII</option>
            <option value="Unconfirmed">Class unconfirmed</option>
            <option value="foundation">Unmapped foundations</option>
          </select>
        </label>
        <label className="field">
          Book
          <select
            value={filters.book}
            onChange={(e) => changeFilter("book", e.target.value)}
          >
            <option value="all">All books</option>
            {TEXTBOOKS.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title} · {b.class}
              </option>
            ))}
            {books
              .filter((b) => !b.catalogId)
              .map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title} · local copy
                </option>
              ))}
          </select>
        </label>
        <label className="field">
          Result type
          <select
            value={filters.kind}
            onChange={(e) => changeFilter("kind", e.target.value)}
          >
            <option value="all">All results</option>
            <option value="chapter">Chapters & AI topic matches</option>
            <option value="pdf">PDF passages</option>
            <option value="foundation">Foundation lessons</option>
          </select>
        </label>
        {hasFilters && (
          <button className="text-link" type="button" onClick={resetFilters}>
            Clear filters
          </button>
        )}
      </div>
      <div className="search-scope panel">
        <Sparkles size={22} />
        <div>
          <b>
            {online
              ? "Online: local search + AI topic discovery"
              : "Offline: local search"}
          </b>
          <p>
            Online searches send only your query to the configured AI provider.
            Your PDFs and notes stay on this device. AI searches share the tutor
            allowance.
          </p>
          <small>
            {TEXTBOOKS.length} registered resources · {searchTopics.length}{" "}
            checked headings. Full PDF text must be indexed first. Scans need
            OCR, which is not enabled; a full syllabus is not implied.
          </small>
        </div>
      </div>
      {error && (
        <p role="alert" className="error-banner">
          {error}
        </p>
      )}
      {aiStatus && (
        <p role="status" className="notice">
          {aiStatus}
        </p>
      )}
      {(busy || localBusy) && (
        <p role="status">
          {localBusy ? "Searching saved text…" : "Finding topics by meaning…"}
        </p>
      )}
      {filterBusy && <p role="status">Filtering saved PDF pages…</p>}
      {!!submitted && (
        <p className="fineprint">
          {shownChapters.length + shownSuggested.length} chapter matches ·{" "}
          {shownPages.length} PDF passages · {shownFoundation.length} foundation
          lessons. PDF results are ranked; show more below.
        </p>
      )}
      {!!keywords.length && (
        <p className="fineprint">AI search terms: {keywords.join(" · ")}</p>
      )}
      {!!shownSuggested.length && (
        <section aria-label="AI topic matches">
          <h2>AI topic matches</h2>
          <p className="fineprint">
            Suggested relevance, not a verified answer or exam-scope claim. Open
            the source to check.
          </p>
          <div className="lesson-list">
            {shownSuggested.map((t) => topicRow(t, true))}
          </div>
        </section>
      )}
      {!!shownChapters.length && (
        <section aria-label="Chapter matches">
          <h2>Chapters across books</h2>
          <div className="lesson-list">
            {shownChapters.map((t) => topicRow(t))}
          </div>
        </section>
      )}
      {!!shownPages.length && (
        <section aria-label="Saved PDF passages">
          <h2>Inside your saved PDFs</h2>
          <div className="lesson-list">
            {shownPages.map((t) => {
              const book = bookFor(t.bookId)!;
              return (
                <article className="panel search-result" key={t.id}>
                  <div>
                    <span className="eyebrow">
                      LOCAL PDF · {book.title} · {book.class} · PDF page{" "}
                      {t.page}
                    </span>
                    <p dir="auto">{t.snippet}</p>
                  </div>
                  <button
                    className="circle-button"
                    aria-label={`Read ${book.title} page ${t.page}`}
                    onClick={() =>
                      navigate(
                        `/books/${encodeURIComponent(book.catalogId || book.id)}/${t.page}`,
                      )
                    }
                  >
                    <ArrowRight size={19} />
                  </button>
                </article>
              );
            })}
          </div>
        </section>
      )}
      {shownPages.length === pageLimit && pageLimit < 100 && (
        <button
          className="secondary"
          disabled={filterBusy}
          onClick={() => setPageLimit((n) => Math.min(100, n + 12))}
        >
          Show more PDF matches
        </button>
      )}
      {!!shownFoundation.length && (
        <section aria-label="Foundation lesson matches">
          <h2>Downloaded foundation lessons</h2>
          <div className="lesson-list">
            {shownFoundation.map((t) => (
              <article className="panel search-result" key={t.id}>
                <div>
                  <span className="eyebrow">
                    ORIGINAL · UNMAPPED · {t.subject}
                  </span>
                  <h3>{t.title}</h3>
                  <p>{t.snippet}</p>
                </div>
                <button
                  className="circle-button"
                  aria-label={`Open foundation ${t.title}`}
                  onClick={() => navigate(t.url)}
                >
                  <ArrowRight size={19} />
                </button>
              </article>
            ))}
          </div>
        </section>
      )}
      {!busy && !localBusy && submitted && !filterBusy && noFilteredMatches && (
        <div className="panel empty">
          <Search size={30} />
          <h3>
            {hasFilters
              ? "No results match these filters."
              : "No matching source found yet."}
          </h3>
          <p>
            Try a shorter keyword, or import and index the relevant book. A
            missing result does not mean the topic is outside your syllabus.
          </p>
          {hasFilters && (
            <button className="secondary" onClick={resetFilters}>
              Clear filters
            </button>
          )}
        </div>
      )}
      {!submitted && (
        <div className="panel empty">
          <BookOpen size={32} />
          <h3>Search any subject, in your own words.</h3>
          <p>
            Try “immunity”, “electron charge” or “how do kidneys clean blood?”.
          </p>
        </div>
      )}
      <button className="secondary" onClick={() => navigate("/books")}>
        Manage books & text indexing <BookOpen size={17} />
      </button>
    </>
  );
}

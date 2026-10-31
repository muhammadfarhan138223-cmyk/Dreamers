"use client";
import { useEffect, useRef, useState } from "react";
import { Pause, Play, BookOpen } from "lucide-react";
import * as db from "@/lib/db";
import {
  chapterCoverage,
  chapterRunId,
  newChapterRun,
  validChapterRun,
  prepareChapter,
} from "@/lib/chapter-study.mjs";
import type { SavedSet } from "./study-hub";
type Scope = {
  bookId: string;
  chapter: string;
  grade: string;
  subject: string;
  mode: string;
  language: string;
  first: number;
  last: number;
};
type Source = { title: string; page: number; text: string };
type Run = ReturnType<typeof newChapterRun>;
export default function ChapterPreparation({
  scope,
  sets,
  busy,
  online,
  onBusy,
  loadSource,
  createPractice,
  onPage,
}: {
  scope: Scope;
  sets: SavedSet[];
  busy: boolean;
  online: boolean;
  onBusy: (v: boolean) => void;
  loadSource: (page: number) => Promise<Source>;
  createPractice: (source: Source) => Promise<boolean>;
  onPage: (p: number) => void;
}) {
  const [run, setRun] = useState<Run | null>(null),
    [active, setActive] = useState(false),
    [error, setError] = useState("");
  const mounted = useRef(true),
    stop = useRef(false),
    lock = useRef(false);
  const id = chapterRunId(scope);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      stop.current = true;
    };
  }, []);
  useEffect(() => {
    setRun(null);
    setError("");
    let current = true;
    void db
      .get<Run>("settings", id)
      .then((value) => {
        if (current && validChapterRun(value, scope))
          setRun({
            ...(value as Run),
            ...(value?.status === "running"
              ? {
                  status: "paused",
                  message:
                    "Interrupted session. Resume to continue; saved pages are safe.",
                }
              : {}),
          });
      })
      .catch(() => setError("The preparation journal could not be loaded."));
    return () => {
      current = false;
    };
  }, [id, scope.first, scope.last]);
  const coverage = chapterCoverage(
    scope.first,
    scope.last,
    sets,
    scope.mode,
    scope.language,
  );
  async function start() {
    if (lock.current || busy || !online) return;
    lock.current = true;
    stop.current = false;
    setActive(true);
    onBusy(true);
    setError("");
    const reason = () =>
      stop.current || !mounted.current
        ? "Paused. Resume when you are ready."
        : !navigator.onLine
          ? "Offline. Saved pages are safe; reconnect and resume."
          : document.visibilityState !== "visible"
            ? "Paused when this screen was hidden. Resume to continue."
            : null;
    try {
      await prepareChapter({
        run:
          run?.status === "complete"
            ? {
                ...run,
                pages: Object.fromEntries(
                  Object.entries(run.pages).filter(([, s]) => s === "saved"),
                ),
              }
            : run || newChapterRun(scope),
        persist: (value: Run) => db.put("settings", value),
        hasSaved: async (page: number) => {
          const value = await db.get<SavedSet>(
            "settings",
            `study-set:${scope.bookId}:${scope.chapter}:${scope.mode}:${page}:${scope.language}`,
          );
          return (
            value?.policy === newChapterRun(scope).policy &&
            !!value?.questions?.length
          );
        },
        loadSource,
        createPractice,
        shouldPause: reason,
        onUpdate: (value: Run) => {
          if (mounted.current) setRun(value);
        },
      });
    } catch (e) {
      if (mounted.current)
        setError(
          e instanceof Error
            ? e.message
            : "Device storage could not save the journal. Earlier work is safe.",
        );
    } finally {
      lock.current = false;
      if (mounted.current) {
        setActive(false);
        onBusy(false);
      }
    }
  }
  const gaps = run
    ? Object.entries(run.pages).filter(([, state]) => state !== "saved").length
    : 0;
  return (
    <section
      className="chapter-preparation"
      aria-label="Chapter practice coverage"
    >
      <div className="between">
        <div>
          <b>Chapter practice pages</b>
          <p>
            {coverage.saved.length} of {coverage.total} PDF pages have saved{" "}
            {scope.mode === "mcq"
              ? "MCQs"
              : scope.mode === "long"
                ? "long answers"
                : "short Q&A"}{" "}
            in {scope.language}.
          </p>
        </div>
        <span className="pill">
          {coverage.saved.length}/{coverage.total}
        </span>
      </div>
      <progress
        aria-label="Pages with saved practice, not mastery"
        value={coverage.saved.length}
        max={coverage.total}
      />
      <details>
        <summary>Prepare the missing pages</summary>
        <p>
          PDF pages {scope.first}–{scope.last}. Existing sets are reused. Each
          missing readable page uses one shared AI action; the pilot allows 12
          per day and 3 per minute for your network. Requests are spaced out.
          Image-only or unsupported pages remain gaps.
        </p>
        <p>
          Keep this screen open. Pausing, hiding it or going offline stops after
          the current request is saved. Preparation does not continue when the
          app is closed.
        </p>
        <div className="row">
          {active ? (
            <button
              className="secondary"
              onClick={() => {
                stop.current = true;
              }}
            >
              <Pause size={17} />
              Pause after this page
            </button>
          ) : (
            <button
              className="primary"
              disabled={
                busy || !online || coverage.saved.length === coverage.total
              }
              onClick={() => void start()}
            >
              <Play size={17} />
              {run?.status === "complete" && gaps
                ? "Retry gap pages"
                : run
                  ? "Resume missing pages"
                  : "Prepare chapter pages"}
            </button>
          )}
        </div>
        {(run || error) && (
          <p className="study-notice" role="status">
            {error || run?.message}
            {gaps
              ? ` ${gaps} page(s) had no suitable text or supported questions.`
              : ""}
          </p>
        )}
        <div className="coverage-pages" aria-label="Source page navigation">
          {Array.from(
            { length: coverage.total },
            (_, i) => scope.first + i,
          ).map((p) => (
            <button
              key={p}
              disabled={busy}
              className={coverage.saved.includes(p) ? "saved" : ""}
              onClick={() => onPage(p)}
              aria-label={`PDF page ${p}${coverage.saved.includes(p) ? ", practice saved" : ""}`}
            >
              <BookOpen size={13} />
              {p}
            </button>
          ))}
        </div>
        <small>
          Page coverage records available practice, not complete chapter
          understanding, exam readiness or a verified pairing scheme.
        </small>
      </details>
    </section>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, BookOpen } from "lucide-react";
import { get, put } from "@/lib/db";
import {
  extractExerciseMcqs,
  reviewedExerciseAnswer,
} from "@/lib/exercise-mcqs.mjs";
import type { LocalBook } from "./book-library";
import LoadingState from "./loading-state";

type Item = ReturnType<typeof extractExerciseMcqs>[number];
type Saved = {
  id: string;
  items: Item[];
  choices: Record<number, number>;
  at: number;
};

export default function ExercisePractice({
  book,
  chapterId,
  first,
  last,
  onRead,
}: {
  book: LocalBook;
  chapterId: string;
  first: number;
  last: number;
  onRead: (page: number) => void;
}) {
  const id = `exercise:v1:${book.id}:${chapterId}`;
  const [saved, setSaved] = useState<Saved | null>(null);
  const [cursor, setCursor] = useState<number | null>(null);
  const [phase, setPhase] = useState("Checking saved exercise practice…");
  const [error, setError] = useState("");
  const alive = useRef(false);
  useEffect(() => {
    let active = true;
    alive.current = true;
    void get<Saved>("settings", id)
      .then((record) => {
        if (active && Array.isArray(record?.items) && record.choices)
          setSaved(record);
      })
      .catch(() => {
        if (active) setError("Saved practice could not be read.");
      })
      .finally(() => {
        if (active) setPhase("");
      });
    return () => {
      active = false;
      alive.current = false;
    };
  }, [id]);

  async function loadExercise() {
    setError("");
    setPhase("Opening your local PDF…");
    const pages: Array<{ page: number; text: string }> = [];
    try {
      const { openLocalPdf } = await import("@/lib/pdf-client");
      const pdf = await openLocalPdf(book.blob);
      try {
        const end = Math.min(last, pdf.numPages);
        for (let number = first; number <= end; number++) {
          if (!alive.current) return;
          setPhase(
            `Reading exercise pages · ${number - first + 1}/${end - first + 1}`,
          );
          const page = await pdf.getPage(number);
          const content = await page.getTextContent();
          const text = content.items
            .map((item) =>
              "str" in item ? item.str + (item.hasEOL ? "\n" : " ") : "",
            )
            .join("");
          pages.push({ page: number, text });
          page.cleanup();
        }
      } finally {
        await pdf.loadingTask.destroy();
      }
      if (!alive.current) return;
      const items = extractExerciseMcqs(pages);
      if (!items.length) {
        setError(
          "No complete four-option exercise questions were readable. Open the printed chapter for scans or other layouts.",
        );
        return;
      }
      const result = { id, items, choices: {}, at: Date.now() };
      setSaved(result);
      setCursor(null);
      await put("settings", result);
    } catch {
      setError(
        "The reader could not finish saving exercise practice. Your PDF is safe. Open it to check the original page.",
      );
    } finally {
      if (alive.current) setPhase("");
    }
  }

  const pending =
    saved?.items.findIndex((_, i) => saved.choices[i] === undefined) ?? -1;
  const index =
    cursor ?? (pending >= 0 ? pending : (saved?.items.length || 1) - 1);
  const item = saved?.items[index];
  const choice = saved?.choices[index];
  const answer = item
    ? reviewedExerciseAnswer(book.catalogId, chapterId, item)
    : undefined;

  return (
    <section aria-label="Textbook exercise practice">
      <h2>Textbook exercise MCQs</h2>
      <p>
        Questions are read from your saved copy on this device. Use the printed
        page to check symbols and answers.
      </p>
      {phase && <LoadingState>{phase}</LoadingState>}
      {error && (
        <p role="status" className="notice">
          {error}
        </p>
      )}
      {!saved && !phase && (
        <div className="row">
          <button className="primary" onClick={() => void loadExercise()}>
            Load exercise MCQs
          </button>
          <button className="secondary" onClick={() => onRead(first)}>
            Read chapter in PDF <BookOpen size={16} />
          </button>
        </div>
      )}
      {item && saved && (
        <>
          <p className="eyebrow">
            Exercise question {index + 1} of {saved.items.length}
          </p>
          <article className="study-question practice-step" key={index}>
            <div>
              <h3>{item.question}</h3>
              <div className="study-mcq-options">
                {item.options.map((label, option) => (
                  <button
                    key={option}
                    aria-pressed={choice === option}
                    onClick={() => {
                      setCursor(index);
                      const next = {
                        ...saved,
                        choices: { ...saved.choices, [index]: option },
                        at: Date.now(),
                      };
                      setSaved(next);
                      void put("settings", next).catch(() =>
                        setError("This choice could not be saved."),
                      );
                    }}
                  >
                    <span>{String.fromCharCode(65 + option)}</span>
                    {label}
                  </button>
                ))}
              </div>
              {choice !== undefined && (
                <p role="status" className="answer-feedback">
                  {answer === undefined
                    ? "Choice saved. A checked answer is unavailable for this question."
                    : answer === choice
                      ? "Correct."
                      : `Reviewed answer: ${item.options[answer]}.`}
                </p>
              )}
              <button className="text-link" onClick={() => onRead(item.page)}>
                Check PDF page {item.page} <BookOpen size={15} />
              </button>
            </div>
          </article>
          <nav className="question-paging" aria-label="Exercise questions">
            <button
              className="secondary"
              disabled={!index}
              onClick={() => setCursor(index - 1)}
            >
              Previous
            </button>
            {index + 1 < saved.items.length ? (
              <button
                className="primary"
                disabled={choice === undefined}
                onClick={() => setCursor(index + 1)}
              >
                Next exercise question <ArrowRight size={15} />
              </button>
            ) : pending >= 0 && pending !== index ? (
              <button className="secondary" onClick={() => setCursor(pending)}>
                Go to first unanswered
              </button>
            ) : (
              <span className="pill">
                {pending < 0
                  ? "Exercise attempted"
                  : "Choose an answer to finish"}
              </span>
            )}
          </nav>
        </>
      )}
    </section>
  );
}

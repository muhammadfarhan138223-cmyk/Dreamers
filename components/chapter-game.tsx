"use client";
import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle, RotateCcw, Sparkles } from "lucide-react";
import * as db from "@/lib/db";
import LoadingState from "./loading-state";
type Card = {
  id: string;
  question: string;
  options?: string[];
  correct?: number;
  explanation?: string;
  answer: string;
  sourcePage?: number;
};
export default function ChapterGame({
  id,
  title,
  cards,
  onRead,
}: {
  id: string;
  title: string;
  cards: Card[];
  onRead: (page: number) => void;
}) {
  const questions = cards.filter(
    (c) => c.options?.length === 4 && Number.isInteger(c.correct),
  );
  const [at, setAt] = useState(0),
    [answers, setAnswers] = useState<Record<string, number>>({}),
    [ready, setReady] = useState(false),
    [notice, setNotice] = useState("");
  useEffect(() => {
    let active = true;
    void db
      .get<{ answers?: Record<string, number>; at?: number }>("settings", id)
      .then((saved) => {
        if (!active) return;
        const valid = Object.fromEntries(
          Object.entries(saved?.answers || {}).filter(
            ([key, value]) =>
              questions.some((q) => q.id === key) &&
              Number.isInteger(value) &&
              value >= 0 &&
              value < 4,
          ),
        );
        setAnswers(valid);
        setAt(
          Math.max(
            0,
            Math.min(
              questions.length,
              Number.isInteger(saved?.at) ? saved!.at! : 0,
            ),
          ),
        );
      })
      .catch(() => {
        if (active)
          setNotice("Saved round could not be loaded. You can still play.");
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, [id]);
  const question = questions[at],
    choice = question ? answers[question.id] : undefined;
  const score = questions.filter((q) => answers[q.id] === q.correct).length;
  async function save(next: Record<string, number>, cursor: number) {
    try {
      await db.put("settings", {
        id,
        answers: next,
        at: cursor,
        updated: Date.now(),
      });
    } catch {
      setNotice("This round could not be saved. Keep the page open.");
    }
  }
  if (!ready)
    return <LoadingState>Opening your saved chapter round…</LoadingState>;
  if (!questions.length)
    return <p>No concept questions are available for this chapter yet.</p>;
  return (
    <section className="chapter-game" aria-label="Chapter recall game">
      <span className="eyebrow">
        <Sparkles size={16} /> PLAY & REMEMBER · OFFLINE
      </span>
      <h2>{title}</h2>
      <p>
        One question at a time. Choose, learn why, then move on. These are
        original chapter concept questions; educator review is pending.
      </p>
      <progress aria-label="Round progress" value={at} max={questions.length} />
      {question ? (
        <>
          <span className="content-badge">
            {at + 1} / {questions.length}
          </span>
          <h3>{question.question}</h3>
          <div className="game-choices">
            {question.options!.map((option, i) => (
              <button
                key={i}
                className={`secondary ${choice !== undefined && i === question.correct ? "game-correct" : ""} ${choice === i ? "game-chosen" : ""}`}
                disabled={choice !== undefined}
                aria-pressed={choice === i}
                onClick={() => {
                  const next = { ...answers, [question.id]: i };
                  setAnswers(next);
                  void save(next, at);
                }}
              >
                <b>{String.fromCharCode(65 + i)}</b>
                {option}
              </button>
            ))}
          </div>
          {choice !== undefined && (
            <div className="game-feedback" role="status">
              <b>
                {choice === question.correct ? (
                  <>
                    <CheckCircle size={17} /> You got it!
                  </>
                ) : (
                  "Let’s understand this one."
                )}
              </b>
              <p>{question.explanation || question.answer}</p>
              <button
                className="primary"
                onClick={() => {
                  setAt(at + 1);
                  void save(answers, at + 1);
                }}
              >
                Next <ArrowRight size={16} />
              </button>
              {question.sourcePage && (
                <button
                  className="text-link"
                  onClick={() => onRead(question.sourcePage!)}
                >
                  Read the book explanation · PDF {question.sourcePage}
                </button>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="game-finish">
          <CheckCircle size={40} />
          <h3>Chapter round complete</h3>
          <p>
            {score} of {questions.length} answers were correct. Read the
            explanations again for the ones you found difficult.
          </p>
          <button
            className="secondary"
            onClick={() => {
              setAnswers({});
              setAt(0);
              void save({}, 0);
            }}
          >
            <RotateCcw size={16} /> Try the chapter again
          </button>
        </div>
      )}
      {notice && <p role="status">{notice}</p>}
    </section>
  );
}

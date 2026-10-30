"use client";
import { useEffect, useRef, useState } from "react";
import {
  Trophy,
  Clock,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  ShieldCheck,
  BookOpen,
} from "lucide-react";
import type { Pack, LearningEvent, RecordValue } from "@/lib/types";
import * as db from "@/lib/db";
import { scoreAssessment, shuffled } from "@/lib/assessment.mjs";
type Run = {
  id: string;
  packId: string;
  packVersion: number;
  status: "in-progress" | "complete";
  order: string[];
  answers: Record<string, number>;
  index: number;
  startedAt: number;
  deadline: number | null;
  at: number;
  score?: { correct: number; total: number; answered: number };
  finishedAt?: number;
};
export default function ChapterChallenge({
  pack,
  onSaved,
}: {
  pack: Pack;
  onSaved: () => Promise<void>;
}) {
  const [run, setRun] = useState<Run | null>(null),
    [resume, setResume] = useState<Run | null>(null),
    [timed, setTimed] = useState(false),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [now, setNow] = useState(Date.now());
  const finishing = useRef(false);
  const pendingWrite = useRef<Promise<void>>(Promise.resolve());
  const lastSaved = useRef<Run | null>(null);
  useEffect(() => {
    db.list<Run>("assessments")
      .then((all) => {
        const draft = all
          .filter(
            (r) =>
              r.packId === pack.id &&
              r.packVersion === pack.version &&
              r.status === "in-progress",
          )
          .sort((a, b) => b.at - a.at)[0];
        if (draft) setResume(draft);
      })
      .catch(() =>
        setError(
          "Your saved challenges could not be read. Please reload before starting.",
        ),
      )
      .finally(() => setLoading(false));
  }, [pack.id, pack.version]);
  const questions =
    run?.order
      .map((id) => pack.questions.find((q) => q.id === id)!)
      .filter(Boolean) || [];
  const current = questions[run?.index || 0];
  const result = run ? scoreAssessment(questions, run.answers) : null;
  async function finish(value: Run) {
    if (finishing.current || value.status === "complete") return;
    finishing.current = true;
    setBusy(true);
    try {
      await pendingWrite.current.catch(() => {});
      value = lastSaved.current?.id === value.id ? lastSaved.current : value;
      const order = value.order
        .map((id) => pack.questions.find((q) => q.id === id)!)
        .filter(Boolean);
      const scored = scoreAssessment(order, value.answers);
      const at = Date.now();
      const completed: Run = {
        ...value,
        status: "complete",
        finishedAt: at,
        at,
        score: {
          total: scored.total,
          correct: scored.correct,
          answered: scored.answered,
        },
      };
      const events: LearningEvent[] = scored.details
        .filter((d) => d.answer !== null)
        .map((d) => ({
          id: `${value.id}:${d.id}`,
          kind: "attempt",
          target: d.id,
          correct: d.correct,
          answer: d.answer!,
          at,
        }));
      await db.finishAssessment(completed as unknown as RecordValue, events);
      lastSaved.current = completed;
      setRun(completed);
      await onSaved();
      setError("");
    } catch {
      setError(
        "The result could not be saved. Your last saved answers are preserved. Try saving again.",
      );
    } finally {
      finishing.current = false;
      setBusy(false);
    }
  }
  useEffect(() => {
    if (!run || run.status !== "in-progress" || !run.deadline) return;
    let interval: ReturnType<typeof setInterval> | undefined;
    const tick = () => {
      setNow(Date.now());
      if (Date.now() >= run.deadline!) {
        if (interval) clearInterval(interval);
        finish(run);
      }
    };
    interval = setInterval(tick, 1000);
    tick();
    return () => clearInterval(interval);
  }, [run]);
  async function start() {
    setBusy(true);
    try {
      const at = Date.now();
      const next: Run = {
        id: `assessment:${crypto.randomUUID()}`,
        packId: pack.id,
        packVersion: pack.version,
        status: "in-progress",
        order: shuffled(pack.questions).map((q) => q.id),
        answers: {},
        index: 0,
        startedAt: at,
        deadline: timed ? at + 12 * 60000 : null,
        at,
      };
      const write = db.put("assessments", next);
      pendingWrite.current = write;
      await write;
      lastSaved.current = next;
      setRun(next);
      setError("");
    } catch {
      setError(
        "The challenge could not be saved. Please check device storage.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function update(next: Run) {
    if (finishing.current) return;
    setBusy(true);
    try {
      const write = db.put("assessments", next);
      pendingWrite.current = write;
      await write;
      lastSaved.current = next;
      setRun(next);
      setError("");
    } catch {
      setError(
        "Your selection could not be saved. Try again before moving on.",
      );
    } finally {
      if (!finishing.current) setBusy(false);
    }
  }
  if (loading)
    return (
      <div className="panel empty">
        <Clock size={35} />
        <p>Checking your saved challenge…</p>
      </div>
    );
  if (!run)
    return (
      <div className="panel empty challenge-intro">
        <Trophy size={55} />
        <span className="eyebrow">CHAPTER CHALLENGE</span>
        <h2>Bring your discoveries together.</h2>
        <p>
          {pack.questions.length} original questions, shuffled for this session.
          Answers are saved on this device as you go. You’ll see explanations
          after finishing.
        </p>
        <label className="timer-choice">
          <input
            type="checkbox"
            checked={timed}
            onChange={(e) => setTimed(e.target.checked)}
          />{" "}
          Optional 12-minute timer
        </label>
        <p className="fineprint">
          This is an original foundation assessment, not an official board
          paper. There is no penalty for choosing an untimed challenge.
        </p>
        {error && (
          <p role="alert" className="danger-text">
            {error}
          </p>
        )}
        <div className="actions">
          {resume && (
            <button
              className="primary"
              onClick={() => {
                lastSaved.current = resume;
                setRun(resume);
                setNow(Date.now());
              }}
            >
              Resume saved challenge <ArrowRight size={16} />
            </button>
          )}
          <button
            className={resume ? "secondary" : "primary"}
            disabled={busy || !!error}
            onClick={start}
          >
            {resume ? "Start a new challenge" : "Begin chapter challenge"}
            <Trophy size={17} />
          </button>
        </div>
      </div>
    );
  if (run.status === "complete")
    return (
      <div className="panel challenge-result">
        <div className="empty">
          <Trophy size={52} />
          <span className="eyebrow">
            CHALLENGE COMPLETE · SAVED ON THIS DEVICE
          </span>
          <h2>
            {result!.correct} / {result!.total} concepts answered correctly
          </h2>
          <p>
            {result!.answered} questions answered. Review the reasoning below,
            then revisit any concept that needs another look.
          </p>
          <span className="content-badge">
            <ShieldCheck size={13} /> Original practice · educator review
            pending
          </span>
          <p className="fineprint">
            This result describes one chapter attempt. It does not predict board
            examination marks or establish long-term mastery. Correct answers
            earn XP only once across practice and challenges.
          </p>
          <button
            className="secondary"
            onClick={() => {
              setRun(null);
              setResume(null);
            }}
          >
            Explore another attempt <RotateCcw size={16} />
          </button>
        </div>
        <div className="result-breakdown">
          {questions.map((q) => (
            <details key={q.id}>
              <summary>
                <span
                  className={
                    run.answers[q.id] === q.answer ? "positive-text" : "muted"
                  }
                >
                  {run.answers[q.id] === q.answer ? "✓" : "↻"} {q.prompt}
                </span>
              </summary>
              <p>
                <b>Your answer:</b>{" "}
                {Number.isInteger(run.answers[q.id])
                  ? q.options[run.answers[q.id]]
                  : "Not answered"}
              </p>
              <p>
                <b>Correct answer:</b> {q.options[q.answer]}
              </p>
              <p>{q.explanation}</p>
            </details>
          ))}
        </div>
      </div>
    );
  const remaining = run.deadline
    ? Math.max(0, Math.ceil((run.deadline - now) / 1000))
    : null;
  return (
    <section className="panel quiz">
      <div className="between">
        <span className="eyebrow">
          CHAPTER BOSS / {pack.title.toUpperCase()}
        </span>
        <span className="pill">
          <Clock size={13} />
          {remaining === null
            ? "Untimed"
            : `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`}
        </span>
      </div>
      <div className="progress-line">
        <span
          style={{ width: ((run.index + 1) / questions.length) * 100 + "%" }}
        />
      </div>
      <p className="muted tiny">
        Question {run.index + 1} of {questions.length} ·{" "}
        {Object.keys(run.answers).length} answers saved
      </p>
      <h2>{current.prompt}</h2>
      <div className="answer-options">
        {current.options.map((option, i) => (
          <button
            key={option}
            disabled={busy}
            className={`answer ${run.answers[current.id] === i ? "picked" : ""}`}
            onClick={() =>
              update({
                ...run,
                answers: { ...run.answers, [current.id]: i },
                at: Date.now(),
              })
            }
          >
            <span>{String.fromCharCode(65 + i)}</span>
            {option}
          </button>
        ))}
      </div>
      {error && (
        <p role="alert" className="danger-text">
          {error}
          {remaining === 0 && (
            <button
              className="secondary"
              disabled={busy}
              onClick={() => finish(run)}
            >
              Retry saving finished challenge
            </button>
          )}
        </p>
      )}
      <div className="between quiz-actions">
        <button
          className="secondary"
          disabled={busy || run.index === 0}
          onClick={() =>
            update({ ...run, index: run.index - 1, at: Date.now() })
          }
        >
          Previous
        </button>
        {run.index === questions.length - 1 ? (
          <button
            className="primary"
            disabled={busy}
            onClick={() => finish(run)}
          >
            {busy ? "Saving…" : "Finish challenge"}
            <CheckCircle2 size={17} />
          </button>
        ) : (
          <button
            className="primary"
            disabled={busy}
            onClick={() =>
              update({ ...run, index: run.index + 1, at: Date.now() })
            }
          >
            Next question <ArrowRight size={16} />
          </button>
        )}
      </div>
      <p className="fineprint">
        You can return later to this saved session. An optional timer continues
        while the app is closed.
      </p>
    </section>
  );
}

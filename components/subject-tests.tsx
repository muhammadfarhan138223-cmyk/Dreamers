"use client";

import { useEffect, useState } from "react";
import { ClipboardList, Timer } from "lucide-react";
import { get, put } from "@/lib/db";
import { assemblePaper, scopedQuiz } from "@/lib/paper-practice.mjs";
import { schemeForBook } from "@/lib/exam-schemes.mjs";
import type { PracticeItem } from "@/lib/paper-practice.mjs";

type Chapter = { id: string; number: number; title: string };
type Run = {
  questions: PracticeItem[];
  deadline: number;
  label: string;
  answers: Record<string, number>;
};

export default function SubjectTests({
  bookId,
  chapters,
  chapter,
  bank,
}: {
  bookId: string;
  chapters: Chapter[];
  chapter?: number;
  bank: PracticeItem[];
}) {
  const [scope, setScope] = useState("chapter");
  const [picked, setPicked] = useState<number[]>(chapter ? [chapter] : []);
  const [run, setRun] = useState<Run | null>(null);
  const [finished, setFinished] = useState(false);
  const [clock, setClock] = useState(0);
  const [notice, setNotice] = useState("");
  const [last, setLast] = useState<{ correct: number; total: number } | null>(
    null,
  );
  const resultId = "subject-test:latest:" + bookId;
  useEffect(() => {
    let active = true;
    void get<{ id: string; correct: number; total: number }>(
      "settings",
      resultId,
    )
      .then((record) => {
        if (
          active &&
          record &&
          Number.isInteger(record.correct) &&
          Number.isInteger(record.total)
        )
          setLast(record);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [resultId]);
  const selected =
    scope === "full"
      ? chapters.map((c) => c.number)
      : scope === "chapter"
        ? chapter
          ? [chapter]
          : []
        : picked;
  const selectedBank = bank.filter((q) => selected.includes(q.chapter));
  const quiz = scopedQuiz(bank, selected);
  const scheme = scope === "full" ? schemeForBook(bookId) : null;
  const paper = scheme && assemblePaper(scheme, bank);
  const score =
    run?.questions.filter((q) => run.answers[q.id] === q.correct).length || 0;
  const finish = (attempt: Run) => {
    setFinished(true);
    const correct = attempt.questions.filter(
      (q) => attempt.answers[q.id] === q.correct,
    ).length;
    void put("settings", {
      id: resultId,
      bookId,
      scope: attempt.label,
      correct,
      total: attempt.questions.length,
      at: Date.now(),
    })
      .then(() => setLast({ correct, total: attempt.questions.length }))
      .catch(() => setNotice("The result could not be saved on this device."));
  };
  useEffect(() => {
    if (!run || finished) return;
    const timer = window.setInterval(() => {
      const now = Date.now();
      setClock(now);
      if (now >= run.deadline) finish(run);
    }, 1000);
    return () => clearInterval(timer);
  }, [run, finished]);
  const remaining = Math.max(
    0,
    Math.ceil(((run?.deadline || 0) - clock) / 1000),
  );
  return (
    <section className="subject-tests">
      <div className="adventure-banner test-banner">
        <ClipboardList size={35} aria-hidden />
        <div>
          <span className="eyebrow">YOUR SUBJECT · AVAILABLE OFFLINE</span>
          <h2>Make a practice test</h2>
          <p>
            Choose what to revise. Questions come from original practice or sets
            saved for this book.
          </p>
        </div>
      </div>
      {!run ? (
        <>
          {last && (
            <p className="fineprint">
              Last quiz score on this device: {last.correct}/{last.total}
            </p>
          )}
          <label className="field">
            Test scope
            <select value={scope} onChange={(e) => setScope(e.target.value)}>
              <option value="chapter">Current chapter</option>
              <option value="term">Term · choose chapters</option>
              <option value="half">Half syllabus · choose chapters</option>
              <option value="full">Full syllabus · all mapped chapters</option>
            </select>
          </label>
          {(scope === "term" || scope === "half") && (
            <fieldset className="test-chapters">
              <legend>Select the chapters assigned to you</legend>
              {chapters.map((item) => (
                <label key={item.id}>
                  <input
                    type="checkbox"
                    checked={picked.includes(item.number)}
                    onChange={() =>
                      setPicked((v) =>
                        v.includes(item.number)
                          ? v.filter((n) => n !== item.number)
                          : [...v, item.number],
                      )
                    }
                  />
                  {item.number} · {item.title}
                </label>
              ))}
            </fieldset>
          )}
          <p className="fineprint">
            {new Set(selectedBank.map((item) => item.chapter)).size}/
            {selected.length} selected chapters have saved questions. A short
            quiz is sampled across available chapters.
          </p>
          <button
            className="primary"
            disabled={!quiz.length}
            onClick={() => {
              const now = Date.now();
              setNotice("");
              setClock(now);
              setRun({
                questions: quiz,
                deadline: now + quiz.length * 60_000,
                label: scope,
                answers: {},
              });
            }}
          >
            <Timer size={16} /> Start{" "}
            {quiz.length ? `${quiz.length}-question` : ""} MCQ quiz
          </button>
          {!quiz.length && (
            <p className="fineprint">
              This selection needs saved MCQs before a quiz can start.
            </p>
          )}
          {selectedBank.some((q) => q.kind !== "mcq") && (
            <details className="subject-test-details">
              <summary>Written practice and self-check</summary>
              {selectedBank
                .filter((q) => q.kind !== "mcq")
                .map((q) => (
                  <details key={q.id}>
                    <summary>{q.question}</summary>
                    <p>{q.answer}</p>
                  </details>
                ))}
            </details>
          )}
          {scope === "full" && (
            <details className="subject-test-details">
              <summary>Paper pattern and question coverage</summary>
              {paper && scheme?.long ? (
                <>
                  <p>
                    {scheme.title} · {scheme.totalMarks} marks ·{" "}
                    {scheme.minutes} minutes · supplied appendix, board/session
                    confirmation pending.
                  </p>
                  {paper.gaps.length ? (
                    <>
                      <p>
                        A complete pattern mock needs these additional
                        questions:
                      </p>
                      <ul>
                        {paper.gaps.map((gap) => (
                          <li key={gap.kind + gap.chapter}>
                            Chapter {gap.chapter}: {gap.missing}{" "}
                            {gap.kind === "mcq" ? "MCQ" : gap.kind}
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <>
                      <h3>Book-pattern mock · {scheme.totalMarks} marks</h3>
                      <p>
                        Generated or original practice using the appendix’s
                        chapter counts. Time yourself for {scheme.minutes}{" "}
                        minutes. Check written work using the answers.
                      </p>
                      <h4>Objective · answer all {paper.objective.length}</h4>
                      {paper.objective.map((q) => (
                        <PaperItem key={q.id} item={q} />
                      ))}
                      {paper.short.map((group) => (
                        <div key={group.number}>
                          <h4>
                            Q{group.number} · attempt {group.attempt} of{" "}
                            {group.questions.length} · {group.marksEach} marks
                            each
                          </h4>
                          {group.questions.map((q) => (
                            <PaperItem key={q.id} item={q} />
                          ))}
                        </div>
                      ))}
                      <h4>
                        Long questions · attempt {scheme.long.attempt} of{" "}
                        {paper.long.length} · {scheme.long.partMarks} marks per
                        part
                      </h4>
                      {paper.long.map((group) => (
                        <div key={group.number}>
                          <b>Q{group.number}</b>
                          {group.parts.map((q) => (
                            <PaperItem key={q.id} item={q} />
                          ))}
                        </div>
                      ))}
                    </>
                  )}
                </>
              ) : (
                <p>
                  A complete chapter-by-chapter paper blueprint is unavailable
                  for this book.
                </p>
              )}
            </details>
          )}
        </>
      ) : (
        <>
          <div className="between">
            <h3>
              {finished
                ? `Score: ${score}/${run.questions.length}`
                : "Choose one answer for each question"}
            </h3>
            {!finished && (
              <b aria-label="Time remaining">
                {Math.floor(remaining / 60)}:
                {String(remaining % 60).padStart(2, "0")}
              </b>
            )}
          </div>
          {run.questions.map((q, i) => (
            <fieldset key={q.id} className="subject-test-question">
              <legend>
                {i + 1}. {q.question}
              </legend>
              {q.options?.map((option, n) => (
                <label key={n}>
                  <input
                    type="radio"
                    name={q.id}
                    disabled={finished}
                    checked={run.answers[q.id] === n}
                    onChange={() =>
                      Date.now() < run.deadline &&
                      setRun({ ...run, answers: { ...run.answers, [q.id]: n } })
                    }
                  />{" "}
                  {option}
                </label>
              ))}
              {finished && <p className="fineprint">Answer: {q.answer}</p>}
            </fieldset>
          ))}
          <button
            className={finished ? "secondary" : "primary"}
            onClick={() => (finished ? setRun(null) : finish(run))}
          >
            {finished ? "Choose another scope" : "Finish and see score"}
          </button>
          {notice && <p role="status">{notice}</p>}
        </>
      )}
    </section>
  );
}

function PaperItem({ item }: { item: PracticeItem }) {
  return (
    <div className="paper-item">
      <p>{item.question}</p>
      {item.options && (
        <ol type="A">
          {item.options.map((option) => (
            <li key={option}>{option}</li>
          ))}
        </ol>
      )}
      <details>
        <summary>Check answer</summary>
        <p>{item.answer}</p>
      </details>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Download,
  Layers,
  Lock,
  Target,
  Trophy,
  Volume2,
} from "lucide-react";
import type { Pack, LearningEvent, Lesson, RecordValue } from "@/lib/types";
import { packMeta, chapterPath, lessonPath } from "@/lib/catalog.mjs";
import { summarize, dueAt } from "@/lib/progress.mjs";
import * as db from "@/lib/db";
import ChapterChallenge from "./chapter-challenge";
export default function PackWorkspace({
  id,
  path,
  packs,
  events,
  onUpdated,
  navigate,
  speak,
  onAsk,
}: {
  id: string;
  path: string;
  packs: Pack[];
  events: LearningEvent[];
  onUpdated: () => Promise<void>;
  navigate: (url: string) => void;
  speak: (text: string) => void;
  onAsk: (packId: string, topicId: string) => void;
}) {
  const meta = packMeta(id)!;
  const pack = packs.find((p) => p.id === id);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [index, setIndex] = useState(0),
    [choice, setChoice] = useState<number | null>(null),
    [checked, setChecked] = useState(false),
    [mode, setMode] = useState("mcq"),
    [draft, setDraft] = useState(""),
    [reveal, setReveal] = useState(false),
    [done, setDone] = useState(false),
    [cards, setCards] = useState<RecordValue[]>([]);
  const summary = summarize(events);
  const topic = pack?.lessons.find((l) => path === lessonPath(meta, l.id));
  const practice = path.startsWith("/practice/"),
    challenge = path.startsWith("/challenge/");
  const completed = meta.lessonIds.filter((l) => summary.completed.includes(l));
  const questions = pack?.questions || [];
  const question = questions[index];
  const written = pack?.written.filter((q) => q.type === mode) || [];
  const writtenQuestion = written[index % Math.max(1, written.length)];
  const deck =
    pack?.questions.map((q) => ({
      id: `${q.topic}:${q.id}`,
      front:
        q.prompt +
        " " +
        q.options
          .map((o, i) => String.fromCharCode(65 + i) + ") " + o)
          .join(" / "),
      back: q.options[q.answer] + " — " + q.explanation,
    })) || [];
  const card = deck[index % Math.max(1, deck.length)];
  useEffect(() => {
    setIndex(0);
    setChoice(null);
    setChecked(false);
    setReveal(false);
    setDone(false);
  }, [path, id, mode]);
  useEffect(() => {
    if (!writtenQuestion) {
      setDraft("");
      return;
    }
    let active = true;
    db.list<RecordValue>("settings")
      .then((rows) => {
        if (active)
          setDraft(
            String(
              rows.find((r) => r.id === `draft:${writtenQuestion.id}`)?.text ||
                "",
            ),
          );
      })
      .catch(() => setError("Saved drafts could not be read."));
    return () => {
      active = false;
    };
  }, [writtenQuestion?.id]);
  useEffect(() => {
    db.list<RecordValue>("cards")
      .then(setCards)
      .catch(() => {});
  }, []);
  async function action(fn: () => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      await fn();
      await onUpdated();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "The activity could not be saved. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  const open = (url: string) => navigate(url);
  const header = (
    <div className="page-heading">
      <span className="eyebrow">
        {meta.subject.toUpperCase()} / ORIGINAL FOUNDATION CHAPTER
      </span>
      <h1>{topic?.title || meta.title}</h1>
      <p>
        {topic?.subtitle ||
          "Learn through original explanations and practice. Official Punjab edition mapping and educator review are pending."}
      </p>
    </div>
  );
  if (!pack)
    return (
      <>
        {header}
        <div className="panel empty">
          <Download size={44} />
          <h2>Take this chapter with you.</h2>
          <p>
            {meta.lessonIds.length} lessons and {meta.questionIds.length} MCQs ·{" "}
            {(meta.bytes / 1024).toFixed(1)} KB · download only when you choose.
          </p>
          <button
            className="primary"
            disabled={busy}
            onClick={() =>
              action(async () => {
                await db.installPack(id);
              })
            }
          >
            {busy ? "Downloading…" : "Download chapter"}
            <Download size={16} />
          </button>
          {error && <p role="alert">{error}</p>}
        </div>
      </>
    );
  if (challenge)
    return (
      <>
        {header}
        {completed.length < pack.lessons.length ? (
          <div className="panel empty">
            <Lock size={40} />
            <h2>Explore the {pack.lessons.length} lessons first.</h2>
            <p>Ordinary practice remains available at any time.</p>
            <button className="primary" onClick={() => open(chapterPath(meta))}>
              Continue learning <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <ChapterChallenge key={pack.id} pack={pack} onSaved={onUpdated} />
        )}
      </>
    );
  return (
    <>
      {header}
      {error && (
        <p className="error-banner" role="alert">
          {error}
        </p>
      )}
      {topic ? (
        <>
          <button
            className="text-link back"
            onClick={() => open(chapterPath(meta))}
          >
            <ArrowLeft size={16} />
            Chapter map
          </button>
          <article className="panel lesson">
            <div className="between">
              <span className="content-badge">
                Original · educator review pending
              </span>
              <button
                className="icon-text"
                onClick={() => speak(topic.paragraphs.join(" "))}
              >
                <Volume2 size={16} />
                Read aloud
              </button>
            </div>
            <div className="objective">
              <BookOpen size={19} />
              <p>
                <b>Your discovery goal</b>
                <br />
                {topic.objective}
              </p>
            </div>
            {topic.paragraphs.map((p) => (
              <p className="lesson-p" key={p}>
                {p}
              </p>
            ))}
            <div className="example">
              <span className="eyebrow">WORKED EXAMPLE</span>
              <p>{topic.example}</p>
            </div>
            <details>
              <summary>Explain in simple Roman Urdu</summary>
              <p>{topic.simple}</p>
            </details>
            {meta.subject === "chemistry" && topic.id === "chem-ions" && (
              <AtomCounter />
            )}
            {meta.subject === "physics" && topic.id === "phys-equations" && (
              <MotionCalculator />
            )}
            <h3>Take these with you</h3>
            <ul className="takeaways">
              {topic.takeaways.map((t) => (
                <li key={t}>
                  <CheckCircle2 size={17} />
                  {t}
                </li>
              ))}
            </ul>
            <div className="recall">
              <BookOpen size={20} />
              <div>
                <b>Try to explain without looking.</b>
                <p>{topic.check}</p>
              </div>
            </div>
            <div className="actions">
              <button
                className="primary"
                disabled={busy}
                onClick={() =>
                  action(async () => {
                    await db.record({
                      id: `lesson:${topic.id}`,
                      kind: "lesson",
                      target: topic.id,
                      at: Date.now(),
                    });
                    const next =
                      pack.lessons[
                        pack.lessons.findIndex((l) => l.id === topic.id) + 1
                      ];
                    open(
                      next
                        ? lessonPath(meta, next.id)
                        : `/challenge/${meta.subject}/${meta.chapterSlug}`,
                    );
                  })
                }
              >
                {completed.includes(topic.id)
                  ? "Review complete"
                  : "I explored this lesson"}
                <Check size={16} />
              </button>
              <button
                className="secondary"
                onClick={() => onAsk(pack.id, topic.id)}
              >
                Ask Dreamers AI
              </button>
              <button
                className="secondary"
                onClick={() =>
                  action(() =>
                    db.put("notes", {
                      id: `bookmark:${topic.id}`,
                      kind: "bookmark",
                      title: topic.title,
                      href: lessonPath(meta, topic.id),
                      at: Date.now(),
                    }),
                  )
                }
              >
                Bookmark lesson
              </button>
            </div>
          </article>
        </>
      ) : practice ? (
        <>
          <div className="tabs">
            {[
              ["mcq", "MCQs"],
              ["short", "Short answers"],
              ["long", "Long answers"],
              ["flashcards", "Flashcards"],
            ].map(([value, label]) => (
              <button
                key={value}
                className={mode === value ? "active" : ""}
                onClick={() => setMode(value)}
              >
                {label}
              </button>
            ))}
          </div>
          {mode === "mcq" ? (
            done ? (
              <div className="panel empty">
                <Trophy size={48} />
                <h2>Another step in understanding.</h2>
                <p>
                  {
                    meta.questionIds.filter((q) => summary.correct.includes(q))
                      .length
                  }
                  /{questions.length} questions answered correctly at least
                  once. Attempts are saved.
                </p>
                <button
                  className="primary"
                  onClick={() => {
                    setDone(false);
                    setIndex(0);
                    setChoice(null);
                    setChecked(false);
                  }}
                >
                  Practice again
                </button>
                <button
                  className="secondary"
                  onClick={() =>
                    open(`/challenge/${meta.subject}/${meta.chapterSlug}`)
                  }
                >
                  Chapter challenge
                </button>
              </div>
            ) : (
              question && (
                <div className="panel quiz">
                  <div className="between">
                    <span className="eyebrow">
                      ORIGINAL PRACTICE · {meta.subject.toUpperCase()}
                    </span>
                    <span className="muted tiny">
                      {index + 1}/{questions.length}
                    </span>
                  </div>
                  <h2>{question.prompt}</h2>
                  <div className="answer-options">
                    {question.options.map((o, i) => (
                      <button
                        className={`answer ${choice === i ? "picked" : ""} ${checked && i === question.answer ? "correct" : ""} ${checked && choice === i && i !== question.answer ? "incorrect" : ""}`}
                        disabled={checked || busy}
                        key={o}
                        onClick={() => setChoice(i)}
                      >
                        <span>{String.fromCharCode(65 + i)}</span>
                        {o}
                      </button>
                    ))}
                  </div>
                  {checked && (
                    <div className="feedback positive" role="status">
                      <h3>
                        {choice === question.answer
                          ? "You’ve got it!"
                          : "Let’s look at the reasoning."}
                      </h3>
                      <p>{question.explanation}</p>
                      {choice !== question.answer && (
                        <button
                          className="text-link"
                          onClick={() => open(lessonPath(meta, question.topic))}
                        >
                          Revisit this concept →
                        </button>
                      )}
                    </div>
                  )}
                  <div className="quiz-actions between">
                    <span className="muted tiny">
                      {checked
                        ? "Attempt saved on this device"
                        : "Choose the best answer"}
                    </span>
                    {checked ? (
                      <button
                        className="primary"
                        onClick={() => {
                          if (index === questions.length - 1) setDone(true);
                          else setIndex((i) => i + 1);
                          setChoice(null);
                          setChecked(false);
                        }}
                      >
                        {index === questions.length - 1
                          ? "See results"
                          : "Next question"}
                        <ArrowRight size={16} />
                      </button>
                    ) : (
                      <button
                        className="primary"
                        disabled={choice === null || busy}
                        onClick={() =>
                          action(async () => {
                            await db.record({
                              id: crypto.randomUUID(),
                              kind: "attempt",
                              target: question.id,
                              answer: choice!,
                              correct: choice === question.answer,
                              at: Date.now(),
                            });
                            setChecked(true);
                          })
                        }
                      >
                        Check answer <Check size={16} />
                      </button>
                    )}
                  </div>
                </div>
              )
            )
          ) : mode === "flashcards" ? (
            card && (
              <>
                <button
                  className="flashcard panel"
                  onClick={() => setReveal(!reveal)}
                >
                  <Layers size={32} />
                  <span className="eyebrow">
                    {reveal ? "KEY IDEA" : "TRY ACTIVE RECALL"}
                  </span>
                  <h2>{reveal ? card.back : card.front}</h2>
                  <small>
                    Tap to flip · {(index % deck.length) + 1}/{deck.length}
                  </small>
                </button>
                <div className="flash-controls">
                  {["again", "hard", "good"].map((q) => (
                    <button
                      className="secondary"
                      disabled={!reveal || busy}
                      key={q}
                      onClick={() =>
                        action(async () => {
                          const old = cards.find((c) => c.id === card.id);
                          const value = dueAt(Number(old?.interval) || 0, q);
                          await db.put("cards", {
                            id: card.id,
                            ...value,
                            at: Date.now(),
                          });
                          setCards(await db.list("cards"));
                          setIndex((i) => (i + 1) % deck.length);
                          setReveal(false);
                        })
                      }
                    >
                      {q === "good"
                        ? "Got it"
                        : q === "hard"
                          ? "Hard"
                          : "Again"}
                    </button>
                  ))}
                </div>
                <p className="fineprint">
                  Self-rated recall schedules reviews; it is not an
                  independently graded mastery result.
                </p>
              </>
            )
          ) : (
            writtenQuestion && (
              <div className="panel quiz">
                <span className="content-badge">
                  {writtenQuestion.marks} marks · original suggested answer ·
                  self-check
                </span>
                <h2>{writtenQuestion.prompt}</h2>
                <label className="field">
                  Your answer
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    rows={6}
                  />
                </label>
                <div className="actions">
                  <button
                    className="secondary"
                    disabled={busy}
                    onClick={() =>
                      action(() =>
                        db.put("settings", {
                          id: `draft:${writtenQuestion.id}`,
                          text: draft,
                          at: Date.now(),
                        }),
                      )
                    }
                  >
                    Save draft
                  </button>
                  <button
                    className="primary"
                    onClick={() => setReveal(!reveal)}
                  >
                    Show self-check answer
                  </button>
                  <button
                    className="secondary"
                    onClick={() => {
                      setIndex((i) => i + 1);
                      setReveal(false);
                    }}
                  >
                    Next written question
                  </button>
                </div>
                {reveal && (
                  <div className="feedback positive">
                    <p>{writtenQuestion.answer}</p>
                    <ul>
                      {writtenQuestion.keyPoints.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                    <small>
                      Offline free-text answers are not automatically graded.
                    </small>
                  </div>
                )}
              </div>
            )
          )}
        </>
      ) : (
        <>
          <div className="panel chapter-summary">
            <div>
              <span className="eyebrow">YOUR NEXT FOUNDATION ADVENTURE</span>
              <h2>{pack.title}</h2>
              <p>
                {completed.length}/{pack.lessons.length} lessons explored ·{" "}
                {questions.length} MCQs · {pack.written.length} written
                questions
              </p>
            </div>
            <div className="actions">
              <button
                className="primary"
                onClick={() => open(`/practice/${meta.subject}`)}
              >
                Practice <Target size={16} />
              </button>
              <button
                className="secondary"
                onClick={() =>
                  open(`/challenge/${meta.subject}/${meta.chapterSlug}`)
                }
              >
                Chapter challenge <Trophy size={16} />
              </button>
            </div>
          </div>
          <div className="lesson-list">
            {pack.lessons.map((l, i) => (
              <div className="panel lesson-row" key={l.id}>
                <span className="lesson-step">
                  {completed.includes(l.id) ? <Check size={20} /> : i + 1}
                </span>
                <div>
                  <h3>{l.title}</h3>
                  <p>
                    {l.subtitle} · {l.minutes} min
                  </p>
                </div>
                <button
                  className="secondary"
                  onClick={() => open(lessonPath(meta, l.id))}
                >
                  Explore <ArrowRight size={16} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
      <p className="fineprint">
        {pack.edition}. {pack.board}. All examples and questions are original;
        educator review is pending.
      </p>
    </>
  );
}
function AtomCounter() {
  const [protons, setProtons] = useState(11),
    [electrons, setElectrons] = useState(10);
  const charge = protons - electrons;
  return (
    <div className="osmosis-lab">
      <span className="eyebrow">CHARGE EXPLORER</span>
      <h3>Balance positive and negative charges.</h3>
      <label className="field">
        Protons: {protons}
        <input
          type="range"
          min="1"
          max="20"
          value={protons}
          onChange={(e) => setProtons(Number(e.target.value))}
        />
      </label>
      <label className="field">
        Electrons: {electrons}
        <input
          type="range"
          min="0"
          max="22"
          value={electrons}
          onChange={(e) => setElectrons(Number(e.target.value))}
        />
      </label>
      <p aria-live="polite">
        Net charge:{" "}
        <b>
          {charge > 0 ? "+" : ""}
          {charge}
        </b>{" "}
        ·{" "}
        {charge === 0
          ? "Neutral"
          : charge > 0
            ? "Positive ion"
            : "Negative ion"}
      </p>
      <small>
        Changing proton count changes element identity. This is a
        charge-counting illustration, not an energy/stability model.
      </small>
    </div>
  );
}
function MotionCalculator() {
  const [u, setU] = useState(0),
    [a, setA] = useState(2),
    [t, setT] = useState(3);
  return (
    <div className="osmosis-lab">
      <span className="eyebrow">CONSTANT-ACCELERATION LAB</span>
      <h3>Predict the motion.</h3>
      <div className="calculator-inputs">
        {[
          ["Initial velocity (m/s)", u, setU],
          ["Acceleration (m/s²)", a, setA],
          ["Time (s)", t, setT],
        ].map(([name, value, set]) => (
          <label className="field" key={String(name)}>
            {String(name)}
            <input
              type="number"
              min={name === "Time (s)" ? 0 : undefined}
              max="1000"
              value={value as number}
              onChange={(e) =>
                (set as (n: number) => void)(
                  Math.max(
                    name === "Time (s)" ? 0 : -1000,
                    Math.min(1000, Number(e.target.value) || 0),
                  ),
                )
              }
            />
          </label>
        ))}
      </div>
      <p aria-live="polite">
        Final velocity: <b>{(u + a * t).toFixed(2)} m/s</b> · displacement:{" "}
        <b>{(u * t + 0.5 * a * t * t).toFixed(2)} m</b>
      </p>
      <small>
        One dimension, constant acceleration, consistent signed SI units.
        Displacement may differ from total distance.
      </small>
    </div>
  );
}

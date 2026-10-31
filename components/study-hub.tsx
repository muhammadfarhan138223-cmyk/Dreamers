"use client";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CloudOff,
  Dna,
  FlaskConical,
  Atom,
  Code2,
  Languages,
  Sparkles,
  Target,
  Download,
  RefreshCw,
  ChevronRight,
} from "lucide-react";
import { TEXTBOOKS, textbook } from "@/lib/textbooks.mjs";
import * as db from "@/lib/db";
import type { Pack, RecordValue } from "@/lib/types";
import type { LocalBook, BookPage } from "./book-library";
export type StudyFocus = { grade: "XI" | "XII"; subject: string };
type Card = {
  id: string;
  question: string;
  answer: string;
  options?: string[];
  correct?: number;
  sourceQuote?: string;
  explanation?: string;
};
type SavedSet = RecordValue & {
  grade: string;
  subject: string;
  mode: string;
  bookId: string;
  chapter: string;
  page: number;
  questions: Card[];
  at: number;
};
const subjectOptions = [
  {
    id: "biology",
    name: "Biology",
    icon: Dna,
    color: "mint",
    hint: "Life & living things",
  },
  {
    id: "chemistry",
    name: "Chemistry",
    icon: FlaskConical,
    color: "peach",
    hint: "Matter & reactions",
  },
  {
    id: "physics",
    name: "Physics",
    icon: Atom,
    color: "sky",
    hint: "Forces & the universe",
  },
  {
    id: "computer-science",
    name: "Computer Science",
    icon: Code2,
    color: "violet",
    hint: "Code & problem solving",
  },
  {
    id: "english",
    name: "English",
    icon: Languages,
    color: "peach",
    hint: "Language & literature",
  },
  {
    id: "urdu",
    name: "Urdu",
    icon: BookOpen,
    color: "mint",
    hint: "Read & understand",
  },
  {
    id: "mathematics",
    name: "Mathematics",
    icon: Target,
    color: "sky",
    hint: "Patterns & numbers",
  },
  {
    id: "tarjuma-tul-quran",
    name: "Tarjuma-tul-Quran",
    icon: BookOpen,
    color: "violet",
    hint: "Textbook study",
  },
  {
    id: "pakistan-studies",
    name: "Pakistan Studies",
    icon: BookOpen,
    color: "mint",
    hint: "People & history",
  },
  {
    id: "islamiat",
    name: "Islamiat",
    icon: BookOpen,
    color: "peach",
    hint: "Textbook study",
  },
];
const norm = (s: string) => s.toLowerCase().replaceAll(" ", "-");
export default function StudyHub({
  focus,
  onFocus,
  navigate,
  packs,
  online,
}: {
  focus: StudyFocus | null;
  onFocus: (value: StudyFocus) => void;
  navigate: (url: string) => void;
  packs: Pack[];
  online: boolean;
}) {
  const [choosing, setChoosing] = useState(!focus),
    [grade, setGrade] = useState<"XI" | "XII">(focus?.grade || "XI"),
    [mode, setMode] = useState("short"),
    [sourceKind, setSourceKind] = useState("book"),
    [books, setBooks] = useState<LocalBook[]>([]),
    [sets, setSets] = useState<SavedSet[]>([]),
    [bookChoice, setBookChoice] = useState(""),
    [chapter, setChapter] = useState(""),
    [page, setPage] = useState(1),
    [revealed, setRevealed] = useState<Record<string, boolean>>({}),
    [answers, setAnswers] = useState<Record<string, number>>({}),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState(""),
    [language, setLanguage] = useState("English"),
    [question, setQuestion] = useState(""),
    [reply, setReply] = useState("");
  async function refresh() {
    const [b, s] = await Promise.all([
      db.list<LocalBook>("books"),
      db.list<SavedSet>("settings"),
    ]);
    setBooks(b);
    setSets(s.filter((x) => x.id.startsWith("study-set:")));
    setAnswers(
      Object.fromEntries(
        s
          .filter(
            (x) =>
              x.id.startsWith("study-answer:") && Number.isInteger(x.choice),
          )
          .map((x) => [x.id.slice(13), Number(x.choice)]),
      ),
    );
  }
  useEffect(() => {
    void refresh().catch(() =>
      setNotice("Your saved books could not be loaded. Reload to retry."),
    );
  }, []);
  useEffect(() => {
    if (focus) {
      setChoosing(false);
      setGrade(focus.grade);
    }
  }, [focus]);
  const subject = subjectOptions.find((s) => s.id === focus?.subject),
    Icon = subject?.icon || BookOpen;
  const matches = books.filter(
    (b) =>
      focus &&
      norm(b.subject) === focus.subject &&
      (b.class === focus.grade || b.class === "XI–XII"),
  );
  const local = matches.find((b) => b.id === bookChoice) || matches[0];
  const catalog = local
    ? local.catalogId
      ? textbook(local.catalogId)
      : null
    : TEXTBOOKS.find(
        (b) =>
          b.subject === focus?.subject &&
          b.classes.includes(focus?.grade || "") &&
          b.kind === "textbook",
      );
  const selectedChapter =
    catalog?.chapters.find((t) => t.id === chapter) || catalog?.chapters[0];
  const chapterIndex =
    catalog?.chapters.findIndex((t) => t.id === selectedChapter?.id) ?? -1;
  const firstPage = selectedChapter?.page || 1;
  const lastPage = Math.max(
    firstPage,
    Math.min(
      local?.pageCount || 1500,
      chapterIndex >= 0
        ? (catalog?.chapters[chapterIndex + 1]?.page ||
            (local?.pageCount || 1500) + 1) - 1
        : local?.pageCount || 1500,
    ),
  );
  useEffect(() => {
    setPage(selectedChapter?.page || local?.lastPage || 1);
    setReply("");
    setRevealed({});
  }, [selectedChapter?.id, local?.id, focus?.grade, focus?.subject]);
  const base = packs.find((p) => p.subject === focus?.subject);
  const scopeBook = sourceKind === "foundation" ? base?.id : local?.id;
  const scopeChapter =
    sourceKind === "foundation"
      ? "foundation"
      : selectedChapter?.id || "selected-page";
  const matchingSets = sets
    .filter(
      (s) =>
        s.grade === focus?.grade &&
        s.subject === focus?.subject &&
        s.bookId === scopeBook &&
        s.chapter === scopeChapter &&
        s.mode === mode,
    )
    .sort((a, b) => a.page - b.page || a.at - b.at);
  const original: Card[] =
    sourceKind !== "foundation" || !base
      ? []
      : mode === "mcq"
        ? base.questions.map((q) => ({
            id: q.id,
            question: q.prompt,
            answer: q.options[q.answer],
            options: q.options,
            correct: q.answer,
            explanation: q.explanation,
          }))
        : base.written
            .filter((q) => q.type === mode)
            .map((q) => ({ id: q.id, question: q.prompt, answer: q.answer }));
  const cards = [
    ...original,
    ...matchingSets.flatMap((s) =>
      s.questions.map((q) => ({ ...q, id: s.id + ":" + q.id })),
    ),
  ];
  async function sourceText() {
    if (sourceKind === "foundation" && base)
      return {
        title: base.title,
        page: 1,
        text: base.lessons
          .flatMap((l) => [l.subtitle, ...l.paragraphs])
          .join("\n")
          .slice(0, 6000),
      };
    if (!local)
      throw new Error(
        "Add your PDF first. It will stay available offline on this device.",
      );
    let saved = await db.get<BookPage>("bookPages", `${local.id}:p:${page}`);
    if (!saved) {
      const { openLocalPdf } = await import("@/lib/pdf-client");
      const { meaningfulPdfText } = await import("@/lib/books.mjs");
      const pdf = await openLocalPdf(local.blob);
      try {
        const p = await pdf.getPage(page);
        saved = {
          id: `${local.id}:p:${page}`,
          bookId: local.id,
          page,
          text: meaningfulPdfText((await p.getTextContent()).items),
        };
        await db.put("bookPages", saved);
      } finally {
        await pdf.loadingTask.destroy();
      }
    }
    if (!saved.text || saved.text.trim().length < 60)
      throw new Error(
        "This page is an image or has too little readable text. Read it in PDF mode. OCR is not available yet; AI cannot read this scan automatically.",
      );
    return {
      title: local.title.slice(0, 120),
      page,
      text: saved.text.slice(0, 6000),
    };
  }
  async function generate() {
    if (busy) return;
    setNotice("");
    if (!online) {
      setNotice(
        "You are offline. Saved Q&A, MCQs and PDFs are still available.",
      );
      return;
    }
    setBusy(true);
    try {
      const source = await sourceText();
      const response = await fetch("/api/study", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, mode, language }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Practice could not be made.");
      if (!data.questions.length)
        throw new Error(
          "This page does not contain enough information for this practice type. Try another page.",
        );
      const id = `study-set:${scopeBook}:${scopeChapter}:${mode}:${source.page}:${language}`;
      await db.put("settings", {
        id,
        grade: focus!.grade,
        subject: focus!.subject,
        bookId: scopeBook,
        chapter: scopeChapter,
        mode,
        page: source.page,
        questions: data.questions,
        at: Date.now(),
        verification: "AI generated — educator review pending",
      });
      await refresh();
      setNotice("Practice saved on this device. You can use it offline now.");
    } catch (e) {
      setNotice(
        e instanceof Error
          ? e.message
          : "Connection failed. Saved practice is safe.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function ask() {
    if (!question.trim() || busy) return;
    setNotice("");
    if (!online) {
      setNotice(
        "Dreamers AI is offline. Your saved practice and PDFs still work.",
      );
      return;
    }
    setBusy(true);
    try {
      const source = await sourceText();
      const known =
        sourceKind === "book" && local?.catalogId && selectedChapter;
      const body =
        sourceKind === "foundation"
          ? { packId: base!.id, topic: base!.lessons[0].id }
          : {
              ...(known
                ? { textbookId: local!.catalogId, topic: selectedChapter!.id }
                : { contextKind: "pdf", topic: "pdf-page" }),
            };
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...body,
          question,
          language,
          mode: "Friendly Teacher",
          referenceOnly: true,
          allowEnrichment: false,
          bookContext:
            sourceKind === "book"
              ? { ...source, text: source.text.slice(0, 2000) }
              : undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "AI could not respond.");
      setReply(data.answer);
      await db.put("notes", {
        id: crypto.randomUUID(),
        kind: "ai",
        title: question,
        text: data.answer,
        at: Date.now(),
      });
    } catch (e) {
      setNotice(
        e instanceof Error ? e.message : "AI is temporarily unavailable.",
      );
    } finally {
      setBusy(false);
    }
  }
  function readPdf() {
    if (local)
      navigate(
        `/books/${encodeURIComponent(local.catalogId || local.id)}/${page}`,
      );
    else navigate("/books");
  }
  if (choosing || !focus)
    return (
      <div className="study-hub">
        <header className="study-welcome">
          <span className="eyebrow">LET'S KEEP IT SIMPLE</span>
          <h1>What are you studying?</h1>
          <p>
            Choose one class and one subject. We’ll keep your study space
            focused.
          </p>
        </header>
        <div className="study-steps">
          <span className="active">1 · Your class</span>
          <span>2 · Your subject</span>
          <span>3 · Start learning</span>
        </div>
        <div className="year-choices">
          {(["XI", "XII"] as const).map((g, i) => (
            <button
              key={g}
              className={grade === g ? "selected" : ""}
              onClick={() => setGrade(g)}
            >
              <span>{i === 0 ? "1st" : "2nd"}</span>
              <b>{i === 0 ? "First year" : "Second year"}</b>
              <small>Class {g}</small>
              {grade === g && <Check size={19} />}
            </button>
          ))}
        </div>
        <h2>Pick your subject</h2>
        <div className="study-subjects">
          {subjectOptions
            .filter((s) => s.id !== "pakistan-studies" || grade === "XII")
            .map((s) => (
              <button
                key={s.id}
                className={`subject-pick ${s.color}`}
                onClick={() => {
                  onFocus({ grade, subject: s.id });
                  setChoosing(false);
                  setSourceKind("book");
                  setBookChoice("");
                  setChapter("");
                  setPage(1);
                  setMode("short");
                  setNotice("");
                }}
              >
                <s.icon size={30} />
                <b>{s.name}</b>
                <small>{s.hint}</small>
                <ArrowRight size={18} />
              </button>
            ))}
        </div>
      </div>
    );
  return (
    <div className={`study-hub ${subject?.color || "sky"}`}>
      <header className="focus-heading">
        <div>
          <span className="eyebrow">YOUR FOCUSED STUDY SPACE</span>
          <h1>{subject?.name}</h1>
          <p>
            {focus.grade === "XI" ? "First year" : "Second year"} · Punjab Board
          </p>
        </div>
        <button className="secondary" onClick={() => setChoosing(true)}>
          Change subject
        </button>
      </header>
      <div className="focus-banner">
        <span className="focus-subject-icon">
          <Icon size={35} />
        </span>
        <div>
          <b>One chapter. One clear next step.</b>
          <p>
            Learn with short answers and MCQs. Open the full PDF whenever you
            need it.
          </p>
        </div>
        <span className="pill">{online ? "Online" : "Offline"}</span>
      </div>
      <div className="focus-source-row">
        <label className="field">
          Study material
          <select
            value={sourceKind}
            disabled={busy}
            onChange={(e) => {
              setSourceKind(e.target.value);
              setReply("");
              setNotice("");
            }}
          >
            <option value="book">My textbook PDF</option>
            {base && (
              <option value="foundation">
                Original basics · not syllabus-mapped
              </option>
            )}
          </select>
        </label>
        {sourceKind === "book" && matches.length > 1 && (
          <label className="field">
            Saved book
            <select
              value={local?.id || ""}
              onChange={(e) => {
                setBookChoice(e.target.value);
                setChapter("");
                setPage(1);
              }}
            >
              {matches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title}
                </option>
              ))}
            </select>
          </label>
        )}
        {sourceKind === "book" && !!catalog?.chapters.length && (
          <label className="field">
            Chapter
            <select
              disabled={busy}
              value={selectedChapter?.id || ""}
              onChange={(e) => {
                setChapter(e.target.value);
                setPage(
                  catalog!.chapters.find((t) => t.id === e.target.value)!.page,
                );
                setReply("");
                setNotice("");
              }}
            >
              {catalog.chapters.map((t, i) => (
                <option key={t.id} value={t.id}>
                  {i + 1}. {t.title}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      {sourceKind === "book" && !local && (
        <section className="add-study-book">
          <BookOpen size={35} />
          <div>
            <h2>
              Add your {subject?.name} {focus.grade} PDF once
            </h2>
            <p>
              Your saved copy opens offline.{" "}
              {catalog
                ? "Your chapter links are ready."
                : "A matching supplied textbook file is not registered yet."}
            </p>
            <button className="primary" onClick={() => navigate("/books")}>
              Add / open my PDF <Download size={17} />
            </button>
            {base && (
              <button
                className="text-link"
                onClick={() => setSourceKind("foundation")}
              >
                Try original basics practice <ChevronRight size={16} />
              </button>
            )}
          </div>
        </section>
      )}
      <nav className="study-tabs" aria-label="Chapter learning mode">
        {[
          ["short", "Short Q&A"],
          ["mcq", "MCQs"],
          ["long", "Long answers"],
          ["pdf", "Read PDF"],
          ["ai", "Ask AI"],
        ].map(([id, label]) => (
          <button
            key={id}
            aria-pressed={mode === id}
            className={mode === id ? "active" : ""}
            onClick={() => {
              setMode(id);
              setNotice("");
            }}
          >
            {label}
          </button>
        ))}
      </nav>
      <section className="study-content">
        {mode === "pdf" ? (
          <div className="study-empty">
            <BookOpen size={44} />
            <h2>Your full textbook, ready offline.</h2>
            <p>
              {local
                ? `${local.title} · ${local.pageCount || "?"} PDF pages · saved on this device`
                : "Add your PDF once to read without internet."}
            </p>
            <button className="primary" onClick={readPdf}>
              {local ? "Open PDF reader" : "Add my PDF"}{" "}
              <ArrowRight size={17} />
            </button>
          </div>
        ) : mode === "ai" ? (
          <div className="study-ask">
            <span className="eyebrow">ASK ABOUT YOUR SELECTED SOURCE</span>
            <h2>What would you like explained?</h2>
            <p>
              AI uses your selected readable page
              {sourceKind === "foundation" ? " / original lesson" : ""}. It does
              not have the whole book in context.
            </p>
            <label className="field">
              Your question
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                maxLength={1500}
                rows={3}
                placeholder="Explain this concept in simple words…"
              />
            </label>
            <button
              className="primary"
              disabled={
                busy ||
                !online ||
                !question.trim() ||
                (sourceKind === "book" && !local)
              }
              onClick={() => void ask()}
            >
              <Sparkles size={18} />{" "}
              {busy ? "Checking the source…" : "Explain simply"}
            </button>
            {reply && (
              <div className="study-reply" dir="auto">
                <b>AI explanation · check against your source</b>
                <p>{reply}</p>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="study-content-heading">
              <div>
                <span className="eyebrow">
                  {sourceKind === "foundation"
                    ? "ORIGINAL BASICS · UNMAPPED"
                    : "FROM YOUR SELECTED BOOK"}
                </span>
                <h2>
                  {mode === "short"
                    ? "Small questions. Clear answers."
                    : mode === "mcq"
                      ? "Choose. Check. Understand."
                      : "Long answers, when you need them."}
                </h2>
                <p>
                  {cards.length} saved {mode === "mcq" ? "MCQs" : "questions"}{" "}
                  available offline.
                </p>
              </div>
            </div>
            <div className="study-cards">
              {cards.map((q, i) => (
                <article className="study-question" key={q.id}>
                  <span className="question-number">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3>{q.question}</h3>
                    {q.options ? (
                      <div className="study-mcq-options">
                        {q.options.map((option, n) => (
                          <button
                            key={n}
                            className={
                              answers[q.id] === n
                                ? n === q.correct
                                  ? "correct"
                                  : "retry"
                                : ""
                            }
                            onClick={() => {
                              setAnswers((a) => ({ ...a, [q.id]: n }));
                              void db
                                .put("settings", {
                                  id: `study-answer:${q.id}`,
                                  choice: n,
                                  at: Date.now(),
                                })
                                .catch(() =>
                                  setNotice(
                                    "This answer could not be saved. Please try again.",
                                  ),
                                );
                            }}
                          >
                            <span>{String.fromCharCode(65 + n)}</span>
                            {option}
                          </button>
                        ))}
                        {answers[q.id] !== undefined && (
                          <p className="answer-feedback">
                            {answers[q.id] === q.correct
                              ? "Correct — well understood."
                              : `Try again. The answer is: ${q.answer}`}{" "}
                            {q.explanation}
                          </p>
                        )}
                      </div>
                    ) : (
                      <>
                        <button
                          className="answer-toggle"
                          onClick={() =>
                            setRevealed((v) => ({ ...v, [q.id]: !v[q.id] }))
                          }
                        >
                          {revealed[q.id] ? "Hide answer" : "Show answer"}{" "}
                          <ChevronRight size={15} />
                        </button>
                        {revealed[q.id] && (
                          <p className="study-answer" dir="auto">
                            {q.answer}
                          </p>
                        )}
                      </>
                    )}
                    {q.sourceQuote && (
                      <details className="source-reference">
                        <summary>Check source quote</summary>
                        <p dir="auto">“{q.sourceQuote}”</p>
                        <small>
                          Quote matched the page. AI wording still needs
                          checking.
                        </small>
                      </details>
                    )}
                  </div>
                </article>
              ))}
            </div>
            {!cards.length && (
              <div className="study-empty">
                <Target size={38} />
                <h3>
                  {local || sourceKind === "foundation"
                    ? "Turn a page into practice."
                    : "Your practice starts with your book."}
                </h3>
                <p>
                  {local || sourceKind === "foundation"
                    ? "Make a small set from a readable page, then practise it offline. Image-only scans need OCR, which is not enabled yet."
                    : "Add a matching PDF, or choose original basics above. No chapter content is invented."}
                </p>
              </div>
            )}
            {(local || sourceKind === "foundation") && (
              <div className="make-practice">
                <div>
                  <b>Make the next small practice set</b>
                  <small>
                    {mode === "long"
                      ? "Up to 1 long answer"
                      : "Up to 3 questions"}{" "}
                    · online AI · saved for offline use
                  </small>
                </div>
                <button
                  className="primary"
                  disabled={busy || !online}
                  onClick={() => void generate()}
                >
                  <Sparkles size={18} />
                  {busy ? "Making source-based questions…" : "Make practice"}
                </button>
              </div>
            )}
            <p className="fineprint">
              Generated questions are original AI practice, not official board
              questions or a verified answer key. Page batches do not establish
              complete chapter coverage.
            </p>
          </>
        )}
        {notice && (
          <p className="study-notice" role="status">
            {notice}
          </p>
        )}
        {local && sourceKind === "book" && mode !== "pdf" && (
          <div className="study-page-controls">
            <label className="field">
              Source PDF page
              <input
                type="number"
                min={firstPage}
                max={lastPage}
                value={page}
                onChange={(e) =>
                  setPage(
                    Math.max(
                      firstPage,
                      Math.min(lastPage, Number(e.target.value) || 1),
                    ),
                  )
                }
              />
            </label>
            <button className="secondary" onClick={readPdf}>
              <BookOpen size={17} /> Read this page
            </button>
            <button
              className="secondary"
              disabled={page >= lastPage}
              onClick={() => setPage((p) => p + 1)}
            >
              Next page <ArrowRight size={16} />
            </button>
          </div>
        )}
        <label className="field study-language">
          Explanation language
          <select
            value={language}
            disabled={busy}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option>English</option>
            <option>Roman Urdu</option>
            <option>Urdu</option>
          </select>
        </label>
      </section>
      <details className="exam-source-details">
        <summary>Exam pairing scheme & sources</summary>
        <p>
          Select the scheme for your actual examination year. A textbook edition
          does not establish the current pairing scheme. The official PECTAA
          listing includes Grade XI Annual 2026; the linked board PDF currently
          could not be retrieved, and 2027 has not been verified here. No
          chapter is removed or marked “important” on an unverified scheme.
        </p>
        <a
          href="https://pectaa.edu.pk/curriculum-compliance/"
          target="_blank"
          rel="noreferrer"
        >
          Open official PECTAA source ↗
        </a>
      </details>
    </div>
  );
}

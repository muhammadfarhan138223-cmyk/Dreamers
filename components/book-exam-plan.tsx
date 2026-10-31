"use client";
import { useEffect, useState } from "react";
import { BookOpen, Target } from "lucide-react";
import { schemeForBook, schemeChapterFacts } from "@/lib/exam-schemes.mjs";
import { textbook } from "@/lib/textbooks.mjs";
import * as db from "@/lib/db";
export default function BookExamPlan({
  bookId,
  chapterId,
  busy,
  onChapter,
  navigate,
}: {
  bookId: string;
  chapterId?: string;
  busy: boolean;
  onChapter: (id: string) => void;
  navigate: (href: string) => void;
}) {
  const scheme = schemeForBook(bookId),
    book = textbook(bookId);
  const [enabled, setEnabled] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    setEnabled(false);
    let current = true;
    void db
      .get<{ id: string; schemeId: string }>("settings", `exam-plan:${bookId}`)
      .then((v) => {
        if (current) setEnabled(v?.schemeId === scheme?.id);
      })
      .catch(() => setError("Saved plan could not be loaded."));
    return () => {
      current = false;
    };
  }, [bookId, scheme?.id]);
  if (!scheme || !book) return null;
  const current = book.chapters.find((c) => c.id === chapterId),
    facts = current?.number ? schemeChapterFacts(scheme, current.number) : null;
  async function toggle() {
    try {
      await db.put("settings", {
        id: `exam-plan:${bookId}`,
        schemeId: enabled ? null : scheme!.id,
        at: Date.now(),
      });
      setEnabled(!enabled);
      setError("");
    } catch {
      setError("Plan preference could not be saved. Your learning is safe.");
    }
  }
  return (
    <section
      className="book-exam-plan"
      aria-label="Paper pattern from your book"
    >
      <div className="between">
        <div>
          <span className="eyebrow">FOUND IN YOUR BOOK</span>
          <h2>{scheme.title}</h2>
          <p>
            {scheme.yearLabel || "Exam year is not stated on these pages"} ·{" "}
            {scheme.totalMarks} marks · {scheme.minutes} minutes
          </p>
        </div>
        <button
          className={enabled ? "secondary" : "primary"}
          disabled={busy}
          onClick={() => void toggle()}
        >
          {enabled ? "Use normal chapter study" : "Use this book plan"}
        </button>
      </div>
      <p className="fineprint">
        Checked against PDF pages {scheme.sourcePages.join("–")}. Official board
        confirmation is pending; this is a book-based study guide, not a
        guaranteed current exam scheme. No chapter is excluded.
      </p>
      <button
        className="text-link"
        onClick={() => navigate(`/books/${bookId}/${scheme.sourcePages[0]}`)}
      >
        <BookOpen size={16} />
        Read the scheme in my PDF
      </button>
      {enabled && (
        <>
          <div className="exam-summary">
            <span>
              <b>{scheme.objective.marks}</b> MCQ marks
            </span>
            <span>
              <b>{scheme.totalMarks - scheme.objective.marks}</b> subjective
              marks
            </span>
            {scheme.objective.minutes && (
              <span>
                <b>{scheme.objective.minutes}</b> objective minutes
              </span>
            )}
          </div>
          {facts && (
            <div className="current-chapter-pattern">
              <Target size={20} />
              <div>
                <b>
                  Selected chapter {current?.number}: {current?.title}
                </b>
                <p>
                  {facts.mcqs} MCQ(s) offered ·{" "}
                  {facts.short
                    .map(
                      (x) =>
                        `Q${x.question}: ${x.count} short questions offered`,
                    )
                    .join(" · ")}
                </p>
                <p>
                  {facts.pairs.length
                    ? facts.pairs
                        .map(
                          (p) =>
                            `Long Q${p.number}: chapters ${p.chapters.join(" + ")} (${scheme.long!.parts === 1 ? scheme.long!.partMarks : `${scheme.long!.partMarks}+${scheme.long!.partMarks}`} marks)`,
                        )
                        .join(" · ")
                    : "No long pair listed for this chapter. Keep preparing its MCQs and short questions."}
                </p>
                {facts.pairs
                  .flatMap((p) =>
                    p.chapters.filter((n) => n !== current?.number),
                  )
                  .map((n) => {
                    const other = book.chapters.find((c) => c.number === n);
                    return other ? (
                      <button
                        key={n}
                        className="text-link"
                        disabled={busy}
                        onClick={() => onChapter(other.id)}
                      >
                        Study paired chapter {n}: {other.title} →
                      </button>
                    ) : null;
                  })}
              </div>
            </div>
          )}
          <details>
            <summary>See question groups and chapter links</summary>
            {scheme.shortGroups?.map((g) => (
              <div className="exam-group" key={g.number}>
                <b>
                  Q{g.number} · attempt {g.attempt} of {g.offered} ·{" "}
                  {g.attempt * g.marksEach} marks
                </b>
                <p>
                  {Object.entries(g.chapters)
                    .map(([n, count]) => `Ch ${n}: ${count} offered`)
                    .join(" · ")}
                </p>
              </div>
            ))}
            {scheme.long && (
              <div className="exam-group">
                <b>
                  Long questions · attempt {scheme.long.attempt} of{" "}
                  {scheme.long.offered} ·{" "}
                  {scheme.long.attempt *
                    scheme.long.partMarks *
                    (scheme.long.parts || 2)}{" "}
                  marks
                </b>
                <div className="exam-pairs">
                  {scheme.long.pairs.map((p) => (
                    <div key={p.number}>
                      Q{p.number}:{" "}
                      {p.chapters.map((n, i) => {
                        const c = book.chapters.find((c) => c.number === n);
                        return (
                          <span key={n}>
                            {i ? " + " : ""}
                            {c ? (
                              <button
                                disabled={busy}
                                onClick={() => onChapter(c.id)}
                              >
                                Chapter {n}
                              </button>
                            ) : (
                              `Chapter ${n}`
                            )}
                          </span>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {scheme.objective.groups?.map((g) => (
              <p key={g.title}>
                {g.title}: {g.marks} marks
              </p>
            ))}
            {scheme.sections?.map((g) => (
              <div className="exam-group" key={g.number}>
                <b>
                  Q{g.number} · {g.title} · {g.marks} marks
                </b>
                {g.attempt && (
                  <p>
                    Attempt {g.attempt} of {g.offered}.
                  </p>
                )}
                <div className="exam-pairs">
                  {g.units.map((n) => {
                    const c = book.chapters[n - 1];
                    return c ? (
                      <button
                        key={n}
                        disabled={busy}
                        onClick={() => onChapter(c.id)}
                      >
                        Unit {n}: {c.title}
                      </button>
                    ) : null;
                  })}
                </div>
              </div>
            ))}
          </details>
          <small>
            Offered counts describe the paper structure. They do not limit the
            questions you should learn, predict questions or prove readiness.
          </small>
        </>
      )}
      {error && <p role="status">{error}</p>}
    </section>
  );
}

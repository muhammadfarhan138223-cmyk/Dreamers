"use client";
import { useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CloudDownload,
  Dna,
  Atom,
  Code2,
  Sparkles,
  Check,
  ChevronRight,
  Library,
  GraduationCap,
  Compass,
  Flame,
  Layers,
} from "lucide-react";
import { TEXTBOOKS, DEFAULT_TEXTBOOK, textbook } from "@/lib/textbooks.mjs";
export default function LearningHome({
  name,
  xp,
  completed,
  view = "home",
  onNavigate,
  onAsk,
  bookId,
  onBookChange,
}: {
  name: string;
  xp: number;
  completed: number;
  view?: "home" | "learn";
  onNavigate: (url: string) => void;
  onAsk: (book: string, topic: string, extra?: boolean) => void;
  bookId: string;
  onBookChange: (id: string) => void;
}) {
  const [filter, setFilter] = useState("all");
  const current = textbook(bookId) || textbook(DEFAULT_TEXTBOOK)!;
  const books = TEXTBOOKS.filter(
    (b) => filter === "all" || b.subject === filter,
  );
  return (
    <div className="studio-home">
      <div className="studio-heading">
        <div>
          <span className="eyebrow">YOUR SPACE TO FIGURE THINGS OUT</span>
          <h1>
            {view === "home" ? (
              <>
                A little curious.
                <br />
                <em>A lot more possible.</em>
              </>
            ) : (
              <>
                Your books.
                <br />
                <em>A clearer way in.</em>
              </>
            )}
          </h1>
          <p>
            {view === "home"
              ? `Welcome${name === "Explorer" ? "" : `, ${name}`}. Choose a book, open a chapter, make it click.`
              : "Chapter suggestions come from your supplied textbook files."}
          </p>
        </div>
        <span className="class-chip">
          <GraduationCap size={17} /> FSc / ICS · Class XII{" "}
          <span>Supplied books</span>
        </span>
      </div>
      {view === "home" && (
        <div className="studio-feature-grid">
          <section className="discovery-hero">
            <div className="hero-copy">
              <span className="hero-label">
                <span />
                ONE CONCEPT AT A TIME
              </span>
              <h2>
                Big ideas.
                <br />
                Small <span>“aha!”</span> moments.
              </h2>
              <p>
                Your textbook sets the direction.
                <br />
                Understanding makes the journey yours.
              </p>
              <button
                className="primary"
                onClick={() =>
                  onNavigate(`/books/${current.id}/${current.chapters[0].page}`)
                }
              >
                Open my textbook <ArrowRight size={17} />
              </button>
              <small>
                <BookOpen size={14} /> {current.title} · Class XII
              </small>
            </div>
            <div className="discovery-art" aria-hidden="true">
              <div className="discovery-ring ring-a" />
              <div className="discovery-ring ring-b" />
              <div className="floating-book">
                <BookOpen size={90} strokeWidth={1.1} />
                <span className="book-spark">✦</span>
              </div>
              <span className="floating-token token-dna">
                <Dna size={27} />
              </span>
              <span className="floating-token token-atom">
                <Atom size={29} />
              </span>
              <span className="floating-token token-code">
                <Code2 size={23} />
              </span>
              <i className="star-one">✦</i>
              <i className="star-two">✧</i>
            </div>
          </section>
          <aside className="teacher-invite">
            <span className="teacher-spot">
              <Sparkles size={29} />
            </span>
            <span className="eyebrow">YOUR AI STUDY COMPANION</span>
            <h2>
              “Can you explain
              <br />
              it another way?”
            </h2>
            <p>
              Start with your book. Choose a story or extra context when you
              want it.
            </p>
            <button
              className="secondary"
              onClick={() => onAsk(current.id, current.chapters[0].id)}
            >
              Meet your teacher <ArrowRight size={16} />
            </button>
            <small>Online · owner setup required</small>
          </aside>
        </div>
      )}
      <div className="studio-stats">
        <div>
          <span className="stat-pip gold">
            <Flame size={19} />
          </span>
          <b>
            {xp}
            <small>XP earned</small>
          </b>
        </div>
        <div>
          <span className="stat-pip mint">
            <Check size={19} />
          </span>
          <b>
            {completed}
            <small>Foundation lessons explored</small>
          </b>
        </div>
        <div>
          <span className="stat-pip violet">
            <Library size={19} />
          </span>
          <b>
            {TEXTBOOKS.length}
            <small>Supplied textbook entries</small>
          </b>
        </div>
        <button onClick={() => onNavigate("/downloads")}>
          <CloudDownload size={19} />
          <span>
            Learn anywhere<small>Manage offline copies</small>
          </span>
          <ChevronRight size={17} />
        </button>
      </div>
      <section>
        <div className="section-heading">
          <div>
            <span className="eyebrow">PICK YOUR NEXT CHAPTER</span>
            <h2>A whole world in every subject.</h2>
          </div>
          <button className="text-link" onClick={() => onNavigate("/books")}>
            Your PDF shelf <ArrowRight size={16} />
          </button>
        </div>
        <div className="subject-filters" aria-label="Filter textbooks">
          {[
            ["all", "All books"],
            ["biology", "Biology"],
            ["physics", "Physics"],
            ["computer-science", "Computer science"],
          ].map(([id, label]) => (
            <button
              key={id}
              className={filter === id ? "active" : ""}
              aria-pressed={filter === id}
              onClick={() => setFilter(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="studio-books">
          {books.map((book) => {
            const Icon =
              book.subject === "biology"
                ? Dna
                : book.subject === "physics"
                  ? Atom
                  : Code2;
            return (
              <article className={`textbook-tile ${book.color}`} key={book.id}>
                <div className="textbook-cover">
                  <span>CLASS XII</span>
                  <Icon size={75} strokeWidth={1} />
                  <span className="cover-orbit" />
                  <b>{book.title}</b>
                  <small>DREAMERS / READING SHELF</small>
                </div>
                <div className="textbook-tile-copy">
                  <div className="between">
                    <span className="subject-mini">
                      {book.chapters.length} chapters
                    </span>
                    <button
                      className={`choose-book ${book.id === current.id ? "chosen" : ""}`}
                      onClick={() => onBookChange(book.id)}
                      aria-label={`Use ${book.title} for suggestions`}
                    >
                      {book.id === current.id ? (
                        <>
                          <Check size={12} /> Selected
                        </>
                      ) : (
                        "Use this book"
                      )}
                    </button>
                  </div>
                  <h3>{book.title}</h3>
                  <p>{book.subtitle}</p>
                  <div className="book-facts">
                    <span>{book.pages} PDF pages</span>
                    <span>{(book.bytes / 1024 / 1024).toFixed(1)} MB</span>
                    {book.text === "scanned" && <span>Scanned copy</span>}
                  </div>
                  <button
                    className="textbook-open"
                    onClick={() => {
                      onBookChange(book.id);
                      onNavigate(`/books/${book.id}/1`);
                    }}
                  >
                    Open chapters & PDF <ArrowRight size={17} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
      <div className="studio-lower">
        <section className="panel topic-preview">
          <div className="section-heading">
            <div>
              <span className="eyebrow">FROM YOUR SELECTED BOOK</span>
              <h2>{current.title}: start here.</h2>
            </div>
            <span className="pill">Textbook headings</span>
          </div>
          {current.chapters.slice(0, 4).map((topic, i) => (
            <div className="studio-topic" key={topic.id}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3>{topic.title}</h3>
                <small>
                  PDF page {topic.page} · {current.title} XII
                </small>
              </div>
              <button
                className="circle-button"
                aria-label={`Read ${topic.title}`}
                onClick={() => onNavigate(`/books/${current.id}/${topic.page}`)}
              >
                <ArrowRight size={17} />
              </button>
              <button
                className="circle-button"
                aria-label={`Ask AI about ${topic.title}`}
                onClick={() => onAsk(current.id, topic.id)}
              >
                <Sparkles size={17} />
              </button>
            </div>
          ))}
        </section>
        <aside className="story-invite">
          <span className="eyebrow">MAKE IT MEMORABLE</span>
          <div className="story-illustration" aria-hidden="true">
            <BookOpen size={46} />
            <span>✦</span>
            <Layers size={24} />
          </div>
          <h2>
            Sometimes, a story
            <br />
            makes it stay.
          </h2>
          <p>
            Related stories, history and analogies are optional. Your textbook
            stays the starting point.
          </p>
          <button
            onClick={() => onAsk(current.id, current.chapters[0].id, true)}
          >
            Try story mode <Sparkles size={16} />
          </button>
          <small>Extra context · opt-in · online AI setup needed</small>
        </aside>
      </div>
      <div className="source-strip">
        <Compass size={19} />
        <p>
          <b>Clear sources. Honest scope.</b> Chapters were checked against the
          files you supplied. Current board notices and exclusions still need
          verification. Original foundation practice is available separately.
        </p>
        <button className="text-link" onClick={() => onNavigate("/practice")}>
          Foundation practice <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}

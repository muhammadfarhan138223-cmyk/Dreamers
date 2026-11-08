"use client";
import { aiErrorMessage } from "@/lib/ai-feedback.mjs";
import { useEffect, useRef, useState } from "react";
import { Sparkles, Send, RefreshCw } from "lucide-react";
import { preparedExerciseAnswer } from "@/lib/english-exercise.mjs";
import { readerQuestion } from "@/lib/reader-tools.mjs";
import { textbook } from "@/lib/textbooks.mjs";
import * as db from "@/lib/db";
import LoadingState from "./loading-state";
import type { LocalBook } from "./book-library";
type Source = { page: number; text: string; method?: string };
type Message = {
  role: "user" | "assistant";
  text: string;
  page: number;
  sourcePages?: number[];
};
export default function ReaderAssistant({
  book,
  page,
  pageText,
  selection,
  resolveSources,
  onRead,
}: {
  book: LocalBook;
  page: number;
  pageText: string;
  selection: string;
  resolveSources: (
    question: string,
    conversation: Message[],
    signal: AbortSignal,
  ) => Promise<Source[]>;
  onRead: (page: number) => void;
}) {
  const [question, setQuestion] = useState(""),
    [language, setLanguage] = useState("Roman Urdu"),
    [messages, setMessages] = useState<Message[]>([]),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [online, setOnline] = useState(true),
    [ready, setReady] = useState(false);
  const request = useRef<AbortController | null>(null);
  const history = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (history.current)
      history.current.scrollTop = history.current.scrollHeight;
  }, [messages.length, busy]);
  const key = `reader-chat:v1:${book.id}`;
  useEffect(() => {
    let active = true;
    setOnline(navigator.onLine);
    const changed = () => setOnline(navigator.onLine);
    window.addEventListener("online", changed);
    window.addEventListener("offline", changed);
    void db
      .get<{ messages: Message[]; id: string }>("settings", key)
      .then((r) => {
        if (active && Array.isArray(r?.messages))
          setMessages(
            r.messages
              .filter(
                (m) =>
                  m &&
                  ["user", "assistant"].includes(m.role) &&
                  typeof m.text === "string" &&
                  m.text.length <= 11000 &&
                  Number.isInteger(m.page),
              )
              .slice(-12),
          );
      })
      .catch(() => {
        if (active)
          setError(
            "Saved explanations could not be loaded. You can still ask a question.",
          );
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
      request.current?.abort();
      window.removeEventListener("online", changed);
      window.removeEventListener("offline", changed);
    };
  }, [key]);
  useEffect(() => {
    if (selection)
      setQuestion(
        `Is ka matlab simple alfaaz mein samjhao: ${selection.slice(0, 900)}`,
      );
  }, [selection]);
  async function ask(input = question) {
    if (busy || !input.trim()) return;
    const preparedAnswer = preparedExerciseAnswer(
      textbook(book.catalogId),
      input,
      messages,
      language,
      page,
    );
    if (!navigator.onLine && !preparedAnswer) {
      setError(
        "Dreamers AI is offline. Your downloaded lessons and practice activities are still available.",
      );
      return;
    }
    const abort = new AbortController();
    request.current = abort;
    setBusy(true);
    setError("");
    const previous = messages
      .map((m) => `${m.role}: ${m.text}`)
      .join("\n")
      .slice(-2000);
    const last = messages.at(-1);
    const next: Message[] =
      last?.role === "user" && last.text === input.trim()
        ? messages
        : [...messages, { role: "user", text: input.trim(), page }];
    setMessages(next);
    setQuestion("");
    try {
      const sources = preparedAnswer
        ? []
        : await resolveSources(input.trim(), messages, abort.signal);
      if (abort.signal.aborted) return;
      let value;
      if (preparedAnswer) value = preparedAnswer;
      else {
        const response = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: AbortSignal.any([abort.signal, AbortSignal.timeout(35000)]),
          body: JSON.stringify(
            readerQuestion({
              book,
              catalog: textbook(book.catalogId),
              page,
              pageText,
              question: input.trim(),
              language,
              previous,
              conversation: messages,
              sources,
            }),
          ),
        });
        value = await response.json();
        if (!response.ok)
          throw new Error(
            aiErrorMessage(
              value,
              "The teacher could not answer. Please retry.",
            ),
          );
      }
      if (abort.signal.aborted) return;
      const updated: Message[] = [
        ...next,
        {
          role: "assistant",
          text: String(value.answer),
          page,
          sourcePages: Array.isArray(value.sourcePages)
            ? value.sourcePages
                .filter(
                  (n: unknown) =>
                    Number.isInteger(n) &&
                    Number(n) > 0 &&
                    Number(n) <= (book.pageCount || 1500),
                )
                .slice(0, 6)
            : [],
        },
      ];
      setMessages(updated);
      try {
        await db.put("settings", {
          id: key,
          messages: updated.slice(-12),
          at: Date.now(),
        });
      } catch {
        setError(
          "Answer received, but it could not be saved for offline reading.",
        );
      }
    } catch (e) {
      if (!abort.signal.aborted) {
        setError(
          e instanceof Error && e.name === "TimeoutError"
            ? "The teacher took too long. Your question is ready to retry."
            : e instanceof Error
              ? e.message
              : "Could not connect to the teacher.",
        );
        setQuestion(input);
      }
    } finally {
      if (request.current === abort) {
        setBusy(false);
        request.current = null;
      }
    }
  }
  const lastAnswer = messages.filter((m) => m.role === "assistant").at(-1);
  return (
    <section className="reader-assistant" aria-label="Ask about this book">
      <div className="between">
        <b>
          <Sparkles size={18} /> Ask Dreamers
        </b>
        <label className="sr-only" htmlFor="reader-language">
          Answer language
        </label>
        <select
          id="reader-language"
          aria-label="Answer language"
          value={language}
          disabled={busy}
          onChange={(e) => setLanguage(e.target.value)}
        >
          {["Roman Urdu", "English", "Urdu", "Hinglish", "Hindi"].map((l) => (
            <option key={l}>{l}</option>
          ))}
        </select>
      </div>
      <p>
        Ask about this page or name any chapter in this book. We’ll find the
        relevant text and explain it simply.
      </p>
      {!pageText.trim() && (
        <small>
          This page has no readable text yet. Ask by chapter name; if its pages
          are also scans without prepared text, AI will say what it cannot read.
        </small>
      )}
      {!!messages.length && (
        <div
          className="reader-chat-history"
          aria-label="Book conversation"
          ref={history}
          role="log"
          aria-live="polite"
        >
          {messages.map((m, i) => (
            <article className={`reader-message ${m.role}`} key={i}>
              <b>
                {m.role === "user" ? "You" : "Dreamers"}{" "}
                <small>· PDF p. {m.page}</small>
              </b>
              <p dir="auto">{m.text}</p>
              {!!m.sourcePages?.length && (
                <details className="answer-sources">
                  <summary>Book pages used</summary>
                  {m.sourcePages.map((n) => (
                    <button
                      key={n}
                      className="secondary"
                      onClick={() => onRead(n)}
                    >
                      Read PDF page {n}
                    </button>
                  ))}
                </details>
              )}
            </article>
          ))}
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void ask();
        }}
      >
        <label className="sr-only" htmlFor="reader-question">
          Your question about this book
        </label>
        <textarea
          id="reader-question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          maxLength={1500}
          placeholder="Journey to Taif ke exercise questions ke simple answers batao…"
          rows={2}
          disabled={busy}
        />
        <button
          className="primary"
          type="submit"
          disabled={busy || !ready || !question.trim()}
        >
          <Send size={17} />
          {busy ? "Thinking…" : "Ask"}
        </button>
      </form>
      <div className="reader-ai-actions">
        {!!pageText.trim() && (
          <button
            className="text-link"
            disabled={busy || !online}
            onClick={() =>
              void ask(
                language === "English"
                  ? "Explain this page in very simple words. Define difficult words first."
                  : "Is page ko bohat simple alfaaz mein samjhao. Mushkil lafzon ka matlab pehle batao.",
              )
            }
          >
            Explain this page
          </button>
        )}
        {lastAnswer && (
          <button
            className="text-link"
            disabled={busy || !online}
            onClick={() =>
              void ask(
                language === "English"
                  ? "I still don't understand. Explain it another way with one everyday example."
                  : "Abhi samajh nahi aaya. Aur asaan misaal se samjhao.",
              )
            }
          >
            I still don’t understand <RefreshCw size={14} />
          </button>
        )}
      </div>
      {busy && (
        <>
          <LoadingState>
            Finding the chapter and preparing a simple answer…
          </LoadingState>
          <button
            className="text-link"
            onClick={() => {
              request.current?.abort();
              setBusy(false);
              setQuestion(
                messages.filter((m) => m.role === "user").at(-1)?.text || "",
              );
            }}
          >
            Stop
          </button>
        </>
      )}
      {error && (
        <p className="error-banner" role="alert">
          {error}
        </p>
      )}
      {!online && (
        <p className="study-notice">
          Dreamers AI is offline. Your downloaded lessons and practice
          activities are still available. Saved answers above still open.
        </p>
      )}
      <small>
        AI explanations can be mistaken. They are not checked textbook answers.
        Only your question, recent chat and up to six relevant page excerpts are
        sent. OCR text can contain mistakes; check the linked PDF pages. Saved
        answers stay on this device.
      </small>
    </section>
  );
}

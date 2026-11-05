"use client";
import { useEffect, useRef, useState } from "react";
import { Sparkles, Send, RefreshCw } from "lucide-react";
import { readerQuestion } from "@/lib/reader-tools.mjs";
import { textbook } from "@/lib/textbooks.mjs";
import * as db from "@/lib/db";
import LoadingState from "./loading-state";
import type { LocalBook } from "./book-library";
type Message = { role: "user" | "assistant"; text: string; page: number };
export default function ReaderAssistant({
  book,
  page,
  pageText,
  selection,
}: {
  book: LocalBook;
  page: number;
  pageText: string;
  selection: string;
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
    if (!navigator.onLine) {
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
          }),
        ),
      });
      const value = await response.json();
      if (!response.ok)
        throw new Error(
          value.error || "The teacher could not answer. Please retry.",
        );
      if (abort.signal.aborted) return;
      const updated: Message[] = [
        ...next,
        { role: "assistant", text: String(value.answer), page },
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
        Ask what a word means, explain a line, or ask a follow-up. We’ll start
        from the basics.
      </p>
      {!pageText.trim() && (
        <small>
          This page is a picture. Type the word or line you want explained; AI
          cannot see this scanned page.
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
          placeholder="Aain kya hota hai? Is line ka matlab simple words mein samjhao…"
          rows={2}
          disabled={busy}
        />
        <button
          className="primary"
          type="submit"
          disabled={busy || !ready || !question.trim() || !online}
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
          <LoadingState>Making this easier to understand…</LoadingState>
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
        Only your question and a short relevant passage are sent; saved answers
        stay on this device.
      </small>
    </section>
  );
}

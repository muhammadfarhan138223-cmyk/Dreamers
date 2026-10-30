"use client";
import { useState } from "react";
import {
  Download,
  Trash2,
  Dna,
  Atom,
  FlaskConical,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { PACKS, chapterPath } from "@/lib/catalog.mjs";
import type { Pack } from "@/lib/types";
import * as db from "@/lib/db";
export default function PackDownloads({
  packs,
  onUpdated,
  navigate,
}: {
  packs: Pack[];
  onUpdated: () => Promise<void>;
  navigate: (url: string) => void;
}) {
  const [busy, setBusy] = useState(""),
    [message, setMessage] = useState(""),
    [error, setError] = useState("");
  async function change(id: string, remove = false) {
    setBusy(id);
    setError("");
    try {
      if (remove) await db.removePack(id);
      else await db.installPack(id);
      await onUpdated();
      setMessage(
        remove
          ? "Learning pack removed; progress, notes and attempts were preserved."
          : "Pack downloaded and verified. Offline learning is ready.",
      );
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "The download did not complete. Your existing work is safe.",
      );
    } finally {
      setBusy("");
    }
  }
  return (
    <>
      <div className="pack-library">
        {PACKS.map((meta) => {
          const local = packs.find((p) => p.id === meta.id);
          const Icon =
            meta.subject === "biology"
              ? Dna
              : meta.subject === "chemistry"
                ? FlaskConical
                : Atom;
          return (
            <section className="panel download-pack" key={meta.id}>
              <div className={`download-cover ${meta.subject}`}>
                <Icon size={48} />
                <span>{meta.subject.toUpperCase()}</span>
              </div>
              <div>
                <span className="eyebrow">
                  {meta.included ? "INCLUDED STARTER" : "OPTIONAL CHAPTER PACK"}{" "}
                  · VERSION {meta.version}
                </span>
                <h2>{meta.title}</h2>
                <p>
                  {meta.lessonIds.length} original lessons ·{" "}
                  {meta.questionIds.length} MCQs · {meta.writtenCount} written
                  questions · English + Roman Urdu summaries
                </p>
                <div className="pack-tags">
                  <span>{(meta.bytes / 1024).toFixed(1)} KB</span>
                  <span>
                    {local
                      ? local.version < meta.version
                        ? "Update available"
                        : "Downloaded on this device"
                      : "Choose to download"}
                  </span>
                  <span>Educator review pending</span>
                </div>
                <div className="actions">
                  <button
                    className="primary"
                    disabled={!!busy}
                    onClick={() => change(meta.id)}
                  >
                    <Download size={16} />
                    {busy === meta.id
                      ? "Working…"
                      : local
                        ? "Refresh pack"
                        : "Download pack"}
                  </button>
                  {local && (
                    <>
                      <button
                        className="secondary"
                        disabled={!!busy}
                        onClick={() => change(meta.id, true)}
                      >
                        <Trash2 size={15} />
                        Remove content
                      </button>
                      <button
                        className="secondary"
                        onClick={() => navigate(chapterPath(meta))}
                      >
                        Open chapter <ArrowRight size={15} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </section>
          );
        })}
      </div>
      {message && (
        <p role="status" className="notice panel">
          {message}
        </p>
      )}
      {error && (
        <p role="alert" className="error-banner">
          {error}
        </p>
      )}
      <p className="fineprint">
        Only the compact Biology starter is included automatically. Optional
        packs download when you choose them. Removing a pack keeps your learning
        history. Official textbook PDFs are a separate library.
      </p>
    </>
  );
}

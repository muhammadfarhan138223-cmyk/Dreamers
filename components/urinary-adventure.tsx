"use client";

import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle, Droplets, RotateCcw } from "lucide-react";
import { get, put } from "@/lib/db";
import { urinaryMission } from "@/lib/urinary-mission.mjs";

const id = "mission:urinary-courier:v1";
type Run = {
  id: string;
  route: number[];
  step: number;
  choices: Record<number, number>;
  at: number;
};
const allStages = urinaryMission.map((_, i) => i);
const makeRun = (route = allStages): Run => ({
  id,
  route,
  step: 0,
  choices: {},
  at: Date.now(),
});

function validRun(value: Run | undefined): value is Run {
  return (
    !!value &&
    Array.isArray(value.route) &&
    value.route.length > 0 &&
    new Set(value.route).size === value.route.length &&
    value.route.every(
      (index) => Number.isInteger(index) && !!urinaryMission[index],
    ) &&
    Number.isInteger(value.step) &&
    value.step >= 0 &&
    value.step <= value.route.length &&
    !!value.choices &&
    typeof value.choices === "object"
  );
}

export default function UrinaryAdventure() {
  const [run, setRun] = useState<Run | null>(null);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    let active = true;
    void get<Run>("settings", id).then(
      (saved) => {
        if (active) setRun(validRun(saved) ? saved : makeRun());
      },
      () => {
        if (active) {
          setRun(makeRun());
          setNotice("Saved mission could not be restored on this device.");
        }
      },
    );
    return () => {
      active = false;
    };
  }, []);
  function save(next: Run) {
    setRun(next);
    setNotice("");
    void put("settings", { ...next, at: Date.now() }).catch(() =>
      setNotice("This step is visible now. It could not be saved for later."),
    );
  }
  if (!run) return <p role="status">Opening your mission…</p>;
  const current = run.route[run.step];
  const scene = urinaryMission[current];
  const answer = run.choices[current];
  const missed = run.route.filter(
    (i) => run.choices[i] !== urinaryMission[i].correct,
  );

  return (
    <section className="chapter-adventure">
      <div className="adventure-banner">
        <Droplets aria-hidden size={38} />
        <div>
          <span className="eyebrow">ORIGINAL BIOLOGY XII · PLAY OFFLINE</span>
          <h2>Kidney Courier</h2>
          <p>
            Follow a droplet through the body. Save the supplies and find the
            exit.
          </p>
        </div>
      </div>
      <progress
        aria-label="Mission progress"
        value={run.step}
        max={run.route.length}
      />
      {scene ? (
        <div className="adventure-stage">
          <span className="eyebrow">
            {scene.stage} · Step {run.step + 1} of {run.route.length}
          </span>
          <h3>{scene.story}</h3>
          <div className="study-mcq-options">
            {scene.options.map((option, i) => (
              <button
                key={option}
                disabled={answer !== undefined}
                className={
                  answer === undefined
                    ? ""
                    : i === scene.correct
                      ? "correct"
                      : i === answer
                        ? "retry"
                        : ""
                }
                onClick={() =>
                  save({ ...run, choices: { ...run.choices, [current]: i } })
                }
              >
                {option}
              </button>
            ))}
          </div>
          {answer !== undefined && (
            <div className="adventure-feedback" role="status">
              <p>
                <strong>
                  {answer === scene.correct
                    ? "Checkpoint cleared."
                    : "Here’s what happens."}
                </strong>{" "}
                {scene.explanation}
              </p>
              <button
                className="primary"
                onClick={() => save({ ...run, step: run.step + 1 })}
              >
                {run.step + 1 === run.route.length
                  ? "See mission results"
                  : "Next checkpoint"}{" "}
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="adventure-stage">
          <CheckCircle size={32} aria-hidden />
          <h3>Mission complete</h3>
          <p>
            You got {run.route.length - missed.length} of {run.route.length}{" "}
            checkpoints right on this route.
          </p>
          <p>
            <strong>Remember the route.</strong> Blood enters through the renal
            artery. The nephron filters, recovers useful material and adds
            selected waste. Urine leaves through the ureter.
          </p>
          <div className="row">
            {!!missed.length && (
              <button className="primary" onClick={() => save(makeRun(missed))}>
                Replay missed checkpoints
              </button>
            )}
            <button className="secondary" onClick={() => save(makeRun())}>
              <RotateCcw size={16} /> Play again
            </button>
          </div>
        </div>
      )}
      {notice && <p role="status">{notice}</p>}
    </section>
  );
}

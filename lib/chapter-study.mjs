import { STUDY_POLICY } from "./study-practice.mjs";
export const REQUEST_SPACING_MS = 22000;
export function chapterRunId(scope) {
  return `study-run:${scope.bookId}:${scope.chapter}:${scope.mode}:${scope.language}:${STUDY_POLICY}`;
}
export function newChapterRun(scope, now = Date.now()) {
  if (
    !Number.isInteger(scope.first) ||
    !Number.isInteger(scope.last) ||
    scope.first < 1 ||
    scope.last < scope.first ||
    scope.last > 1500
  )
    throw new Error("Choose a checked chapter page range.");
  return {
    id: chapterRunId(scope),
    version: 1,
    policy: STUDY_POLICY,
    ...scope,
    pages: {},
    status: "paused",
    message: "Ready to prepare the missing pages.",
    at: now,
    nextAt: 0,
  };
}
export function validChapterRun(run, scope) {
  return (
    !!run &&
    run.id === chapterRunId(scope) &&
    run.version === 1 &&
    run.policy === STUDY_POLICY &&
    ["bookId", "chapter", "mode", "language", "first", "last"].every(
      (k) => run[k] === scope[k],
    ) &&
    ["paused", "running", "complete"].includes(run.status) &&
    Number.isFinite(run.at) &&
    Number.isFinite(run.nextAt) &&
    typeof run.message === "string" &&
    run.message.length <= 500 &&
    run.pages &&
    !Array.isArray(run.pages) &&
    Object.entries(run.pages).every(
      ([p, s]) =>
        /^\d+$/.test(p) &&
        Number(p) >= scope.first &&
        Number(p) <= scope.last &&
        ["saved", "empty", "unreadable", "exercise"].includes(s),
    )
  );
}
export function chapterCoverage(first, last, sets, mode, language) {
  const saved = new Set(
    sets
      .filter(
        (s) =>
          s.policy === STUDY_POLICY &&
          s.mode === mode &&
          (s.language === language ||
            (!s.language && s.id.endsWith(`:${language}`))) &&
          s.questions?.length &&
          s.page >= first &&
          s.page <= last,
      )
      .map((s) => s.page),
  );
  return { saved: [...saved].sort((a, b) => a - b), total: last - first + 1 };
}
// Persist question sets BEFORE advancing this journal. Replays recover saved pages
// even if the previous journal write failed. No remote work resumes automatically.
/** @param {{run:any,persist:(run:any)=>Promise<any>,hasSaved:(page:number)=>Promise<boolean>,loadSource:(page:number)=>Promise<any>,createPractice:(source:any)=>Promise<boolean>,shouldPause:()=>string|null,onUpdate?:(run:any)=>void,wait?:(until:number,check:()=>string|null)=>Promise<void>,now?:()=>number}} options */
export async function prepareChapter({
  run: initial,
  persist,
  hasSaved,
  loadSource,
  createPractice,
  shouldPause,
  onUpdate = () => {},
  wait = waitForSlot,
  now = Date.now,
}) {
  let run = {
    ...initial,
    pages: { ...initial.pages },
    status: "running",
    message: "Checking saved pages.",
  };
  const checkpoint = async () => {
    run.at = now();
    await persist({ ...run, pages: { ...run.pages } });
    onUpdate({ ...run, pages: { ...run.pages } });
  };
  const pause = async (reason) => {
    run.status = "paused";
    run.message = String(reason).slice(0, 500);
    await checkpoint();
    return run;
  };
  await checkpoint();
  for (let page = run.first; page <= run.last; page++) {
    const reason = shouldPause();
    if (reason) return pause(reason);
    if (await hasSaved(page)) {
      run.pages[page] = "saved";
      continue;
    }
    // A lost/removed set is missing again; empty/scan pages stay explicit gaps.
    if (["empty", "unreadable", "exercise"].includes(run.pages[page])) continue;
    try {
      run.message = `Reading PDF page ${page}.`;
      await checkpoint();
      const source = await loadSource(page);
      if (
        /\bSECTION\s*[1-3]\s*[:.]\s*(?:LONG|SHORT|MULTIPLE\s*CHOICE)\s*QUESTIONS\b|\bINQUISITIVE\s+QUESTIONS\b/i.test(
          source.text.slice(0, 600),
        )
      ) {
        run.pages[page] = "exercise";
        run.message = `Page ${page} contains exercise prompts; no answer key was assumed. Read it in PDF mode.`;
        await checkpoint();
        continue;
      }
      if (source.text.trim().length < (run.mode === "long" ? 600 : 60)) {
        run.pages[page] = "unreadable";
        run.message = `Page ${page} has insufficient selectable text for this mode.`;
        await checkpoint();
        continue;
      }
      if (run.nextAt > now()) {
        run.message = "Waiting briefly to respect the shared AI allowance.";
        await checkpoint();
        await wait(run.nextAt, shouldPause);
      }
      const stopped = shouldPause();
      if (stopped) return pause(stopped);
      run.message = `Making practice from PDF page ${page}.`;
      await checkpoint();
      const saved = await createPractice(source);
      run.pages[page] = saved ? "saved" : "empty";
      run.nextAt = now() + REQUEST_SPACING_MS;
      run.message = saved
        ? `Practice from page ${page} saved offline.`
        : `No supported questions returned for page ${page}.`;
      await checkpoint();
    } catch (error) {
      return pause(
        error instanceof Error
          ? error.message
          : "Preparation interrupted. Saved pages are safe.",
      );
    }
  }
  run.status = "complete";
  run.message =
    "This preparation pass finished. Check saved pages and gaps below; this is not proof of complete concept coverage.";
  await checkpoint();
  return run;
}
async function waitForSlot(until, shouldPause) {
  while (Date.now() < until && !shouldPause())
    await new Promise((resolve) =>
      setTimeout(resolve, Math.min(500, until - Date.now())),
    );
}

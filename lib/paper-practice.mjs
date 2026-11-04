/** @typedef {{ id:string, chapter:number, kind:string, question:string, answer:string, options?:string[], correct?:number }} PracticeItem */

/** @param {PracticeItem[]} bank @param {number[]} chapters @param {number} limit */
export function scopedQuiz(bank, chapters, limit = 12) {
  const groups = [...new Set(chapters)].map((chapter) =>
    bank.filter((q) => q.chapter === chapter && q.kind === "mcq"),
  );
  const result = [],
    used = new Set();
  for (let round = 0; groups.some((group) => group.length > round); round++) {
    for (const group of groups) {
      const item = group[round];
      const key = item?.question.trim().toLowerCase();
      if (!item || used.has(key)) continue;
      used.add(key);
      result.push(item);
      if (result.length >= limit) return result;
    }
  }
  return result;
}

/** @typedef {{
 * objective: PracticeItem[],
 * short: { number:number, attempt:number, marksEach:number, questions:PracticeItem[] }[],
 * long: { number:number, parts:PracticeItem[] }[],
 * gaps: { kind:string, chapter:number, missing:number }[]
 * }} BookPaper */

// All offered questions must be available. Every long part occupies its own
// chapter slot. The blueprint represents the book's count rules only.
/** @param {any} scheme @param {PracticeItem[]} bank @returns {BookPaper|null} */
export function assemblePaper(scheme, bank) {
  if (
    !scheme?.objective?.byChapter ||
    !scheme?.shortGroups?.length ||
    !scheme?.long?.pairs?.length
  )
    return null;
  const used = new Set(),
    gaps = new Map();
  function take(kind, chapter, count) {
    const picked = [];
    for (const item of bank) {
      if (picked.length >= count) break;
      const key = item.question.trim().toLowerCase();
      if (item.kind !== kind || item.chapter !== chapter || used.has(key))
        continue;
      used.add(key);
      picked.push(item);
    }
    if (picked.length < count) {
      const key = kind + ":" + chapter;
      const previous = gaps.get(key);
      gaps.set(key, {
        kind,
        chapter,
        missing: (previous?.missing || 0) + count - picked.length,
      });
    }
    return picked;
  }
  const objective = Object.entries(scheme.objective.byChapter).flatMap(
    ([chapter, count]) => take("mcq", Number(chapter), Number(count)),
  );
  const short = scheme.shortGroups.map((group) => ({
    number: group.number,
    attempt: group.attempt,
    marksEach: group.marksEach,
    questions: Object.entries(group.chapters).flatMap(([chapter, count]) =>
      take("short", Number(chapter), Number(count)),
    ),
  }));
  const long = scheme.long.pairs.map((pair) => ({
    number: pair.number,
    parts: pair.chapters.flatMap((chapter) => take("long", chapter, 1)),
  }));
  return { objective, short, long, gaps: [...gaps.values()] };
}

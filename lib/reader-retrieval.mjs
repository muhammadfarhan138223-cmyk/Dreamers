import {
  chapterAtPage,
  excerptForQuestion,
  retrievalTerms,
} from "./book-retrieval.mjs";
const normalize = (text) =>
  String(text || "")
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
const generic = new Set([
  "chapter",
  "unit",
  "story",
  "summary",
  "question",
  "questions",
  "exercise",
  "mcqs",
  "sawaal",
  "answer",
  "answers",
  "short",
  "long",
  "simple",
  "batao",
  "ky",
  "ki",
  "ka",
  "ke",
  "the",
  "of",
  "to",
  "and",
]);
export function namedChapter(catalog, question) {
  if (!catalog?.chapters?.length) return null;
  const q = normalize(question);
  const ordinal =
    q.match(/(?:^|\s)(\d+)(?:st|nd|rd|th)?\s+(?:cha+p\w*|unit)\b/) ||
    q.match(/\b(?:cha+p\w*|unit)\s+(\d+)\b/);
  if (ordinal) return catalog.chapters[Number(ordinal[1]) - 1] || null;
  if (/\b(?:first|pehla|pehly|pehle)\s+(?:cha+p\w*|unit)\b/.test(q))
    return catalog.chapters[0];
  const matches = catalog.chapters
    .map((chapter) => {
      const words = normalize(chapter.title)
        .split(" ")
        .filter((w) => w.length > 2 && !generic.has(w));
      const hits = words.filter((w) => q.split(" ").includes(w)).length;
      return { chapter, score: words.length && hits / words.length, hits };
    })
    .filter((x) => x.score >= 0.66 && x.hits > 0)
    .sort((a, b) => b.score - a.score || b.hits - a.hits);
  return matches[0]?.chapter || null;
}
export function readerIntent(question) {
  const q = normalize(question);
  if (
    /exer|exce|ecerc|excise|sawaal|saval|questions?|mcqs?|comprehension|مشق|سوال/.test(
      q,
    )
  )
    return "exercise";
  if (/summary|kahani|story|stoey|stoy|khulasa|خلاصہ/.test(q)) return "summary";
  return "explain";
}
/** @param {any} catalog @param {string} question @param {{role:string,text:string}[]} conversation @param {number} page */
export function readerChapter(catalog, question, conversation = [], page = 1) {
  const explicit = namedChapter(catalog, question);
  if (explicit) return explicit;
  // An explicit current-page/line request overrides the earlier chapter discussion.
  if (/\b(this page|is page|this line|is line|selected text)\b/i.test(question))
    return chapterAtPage(catalog, page);
  // Never infer a topic from the AI's old refusal or a repeated wrong answer.
  for (const message of [...conversation].reverse()) {
    if (message.role !== "user") continue;
    const prior = namedChapter(catalog, message.text);
    if (prior) return prior;
  }
  return chapterAtPage(catalog, page);
}
export function chapterPageRange(catalog, chapter) {
  if (!catalog || !chapter) return null;
  const i = catalog.chapters.findIndex((c) => c.id === chapter.id);
  return {
    first: chapter.page,
    last:
      chapter.endPage ||
      (catalog.chapters[i + 1]?.page || catalog.pages + 1) - 1,
  };
}
/** @param {{catalog:any,question:string,conversation?:{role:string,text:string}[],page?:number,pages?:{page:number,text:string,method?:string}[]}} input */
export function retrieveReaderSources({
  catalog,
  question,
  conversation = [],
  page = 1,
  pages = [],
}) {
  const chapter = readerChapter(catalog, question, conversation, page);
  const range = chapterPageRange(catalog, chapter);
  const intent = readerIntent(question);
  const currentOnly =
    /\b(this page|is page|this line|is line|selected text)\b/i.test(question) &&
    !namedChapter(catalog, question);
  const candidates = pages.filter(
    (p) =>
      p.text?.trim() &&
      (currentOnly
        ? p.page === page
        : range
          ? p.page >= range.first && p.page <= range.last
          : p.page === page),
  );
  const terms = retrievalTerms(question).filter((t) => !generic.has(t));
  const ranked = candidates
    .map((p) => ({
      ...p,
      score:
        (intent === "exercise" &&
        /answer the following|choose the correct|comprehension|reading and critical thinking|exercise/i.test(
          p.text,
        )
          ? 20
          : 0) + terms.filter((t) => normalize(p.text).includes(t)).length,
    }))
    .sort((a, b) => b.score - a.score || a.page - b.page);
  // Keep question pages and story evidence, rather than only the contents-page heading.
  const selected = ranked.slice(0, 6).sort((a, b) => a.page - b.page);
  return {
    chapter,
    intent,
    sources: selected.map((p) => ({
      page: p.page,
      method: p.method || "pdf-text",
      text:
        intent === "exercise" || intent === "summary"
          ? p.text.slice(0, 3000)
          : excerptForQuestion(p.text, question, 1500),
    })),
  };
}
export function boundedConversation(messages) {
  return messages
    .filter(
      (m) =>
        ["user", "assistant"].includes(m.role) && typeof m.text === "string",
    )
    .slice(-6)
    .map((m) => ({ role: m.role, text: m.text.slice(0, 500) }));
}
export function cleanTutorAnswer(text) {
  return String(text)
    .replace(/&#(?:x20|32);/gi, " ")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^#{1,4}\s+/gm, "")
    .trim();
}

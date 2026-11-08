import { chapterAtPage, excerptForQuestion } from "./book-retrieval.mjs";
import { readerChapter, boundedConversation } from "./reader-retrieval.mjs";
// Ignore vertical reading gestures, tiny movements and slow accidental drags.
export function swipePage({ dx, dy, elapsed, page, total }) {
  if (elapsed > 900 || Math.abs(dx) < 55 || Math.abs(dx) < Math.abs(dy) * 1.5)
    return page;
  return Math.max(1, Math.min(total, page + (dx < 0 ? 1 : -1)));
}
export function readerPageQuery(query, total) {
  const normalized = String(query)
    .trim()
    .replace(/[۰-۹٠-٩]/g, (c) =>
      String(c.charCodeAt(0) - (c >= "۰" ? 1776 : 1632)),
    );
  const match = normalized.match(
    /^(?:(?:pdf\s*)?(?:page|p\.?|صفحہ)\s*)?(\d+)$/iu,
  );
  if (!match) return null;
  const page = Number(match[1]);
  // A bare out-of-range number can be a year or a number printed in the book.
  // Only an explicit page request should produce a page-range error.
  return page >= 1 && page <= total
    ? page
    : /^\d+$/u.test(normalized)
      ? null
      : 0;
}
/** @param {{book:any,catalog?:any,page:number,pageText:string,question:string,language?:string,previous?:string,referenceOnly?:boolean,conversation?:{role:string,text:string}[],sources?:{page:number,text:string,method?:string}[]}} input */
export function readerQuestion({
  book,
  catalog,
  page,
  pageText,
  question,
  language = "Roman Urdu",
  previous = "",
  referenceOnly = false,
  conversation = [],
  sources = [],
}) {
  const text = sources[0]?.text || excerptForQuestion(pageText, question);
  const sourcePage = sources[0]?.page || page;
  return {
    question,
    language,
    mode: "Complete Beginner",
    referenceOnly,
    topic: catalog
      ? readerChapter(catalog, question, conversation, page)?.id ||
        "book-overview"
      : "pdf-page",
    ...(catalog ? { textbookId: catalog.id } : { contextKind: "pdf" }),
    bookContext: {
      title: book.title.slice(0, 120),
      page: sourcePage,
      text: text.slice(0, 2000),
    },
    conversation: boundedConversation(conversation),
    bookSources: sources.slice(1, 6).map((s) => ({
      page: s.page,
      text: s.text.slice(0, 1500),
      method: s.method,
    })),
    previous: previous.slice(-2000),
  };
}

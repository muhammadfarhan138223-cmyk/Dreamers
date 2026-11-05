import { chapterAtPage, excerptForQuestion } from "./book-retrieval.mjs";
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
  return page >= 1 && page <= total ? page : 0;
}
export function readerQuestion({
  book,
  catalog,
  page,
  pageText,
  question,
  language = "Roman Urdu",
  previous = "",
  referenceOnly = false,
}) {
  const text = excerptForQuestion(pageText, question);
  return {
    question,
    language,
    mode: "Complete Beginner",
    referenceOnly,
    topic: catalog
      ? chapterAtPage(catalog, page)?.id || "book-overview"
      : "pdf-page",
    ...(catalog ? { textbookId: catalog.id } : { contextKind: "pdf" }),
    bookContext: { title: book.title.slice(0, 120), page, text },
    previous: previous.slice(-2000),
  };
}

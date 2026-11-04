// Local lexical retrieval only. No embeddings, remote search or full-book upload.
const stop = new Set([
  "why",
  "are",
  "for",
  "can",
  "you",
  "your",
  "will",
  "they",
  "them",
  "was",
  "were",
  "when",
  "where",
  "help",
  "understand",
  "mujhy",
  "mujhe",
  "batao",
  "hain",
  "ka",
  "ki",
  "ke",
  "ko",
  "se",
  "to",
  "in",
  "is",
  "it",
  "on",
  "an",
  "as",
  "be",
  "by",
  "of",
  "we",
  "or",
  "at",
  "the",
  "and",
  "what",
  "how",
  "does",
  "this",
  "that",
  "with",
  "from",
  "about",
  "into",
  "explain",
  "please",
  "which",
  "hai",
  "kya",
  "mein",
  "samjhao",
  "mujhe",
  "words",
  "simple",
]);
export function retrievalTerms(query) {
  return [
    ...new Set(
      (
        String(query)
          .toLowerCase()
          .match(/[\p{L}\p{N}]+/gu) || []
      ).filter((t) => t.length > 1 && !stop.has(t)),
    ),
  ].slice(0, 24);
}
export function excerptForQuestion(text, query, max = 2000) {
  text = String(text || "");
  max = Math.max(200, Math.min(2000, max));
  if (text.length <= max) return text.trim();
  const lower = text.toLowerCase(),
    terms = retrievalTerms(query),
    starts = new Set([0]);
  for (const term of terms) {
    let at = lower.indexOf(term),
      count = 0;
    while (at >= 0 && count++ < 8) {
      starts.add(
        Math.max(0, Math.min(text.length - max, at - Math.floor(max / 3))),
      );
      at = lower.indexOf(term, at + term.length);
    }
  }
  let best = 0,
    score = -1;
  for (const start of starts) {
    const window = lower.slice(start, start + max);
    const found = terms.filter((t) => window.includes(t)).length;
    if (found > score) {
      score = found;
      best = start;
    }
  }
  return text.slice(best, best + max).trim();
}
export function chapterAtPage(book, page) {
  return (
    book?.chapters.find(
      (c, i) =>
        page >= c.page &&
        page <=
          (c.endPage || (book.chapters[i + 1]?.page || book.pages + 1) - 1),
    ) || null
  );
}

/** Split a literal excerpt into display segments without introducing HTML. */
export function highlightPassage(text, query) {
  const terms = retrievalTerms(query).sort((a, b) => b.length - a.length);
  if (!terms.length) return [{ text, match: false }];
  const pattern = new RegExp(terms.join("|"), "giu");
  const segments = [];
  let offset = 0;
  for (const match of text.matchAll(pattern)) {
    if (match.index > offset)
      segments.push({ text: text.slice(offset, match.index), match: false });
    segments.push({ text: match[0], match: true });
    offset = match.index + match[0].length;
  }
  if (offset < text.length)
    segments.push({ text: text.slice(offset), match: false });
  return segments;
}

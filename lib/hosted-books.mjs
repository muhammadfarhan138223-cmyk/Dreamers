// Owner-curated copies. Digests bind downloads to the exact supplied editions.
import assets from "./hosted-books-data.json" with { type: "json" };
import { TEXTBOOKS, textbook } from "./textbooks.mjs";
export const HOSTED_BOOKS = TEXTBOOKS.filter((b) => assets[b.id]);
export function hostedBookUrl(id) {
  const b = textbook(id);
  return b && assets[id]
    ? `/textbooks/${b.id}-${b.sha256.slice(0, 16)}.pdf`
    : null;
}
export function sourceBookUrl(id) {
  return assets[id]?.url || null;
}
export function bookCover(id) {
  return textbook(id) && id !== "biology-xii-supplied"
    ? `/book-covers/${id}.svg`
    : null;
}
export function subjectBook(subject, grade) {
  return (
    TEXTBOOKS.find(
      (b) =>
        b.subject === subject &&
        b.classes.includes(grade) &&
        b.kind === "textbook",
    ) ||
    TEXTBOOKS.find((b) => b.subject === subject && b.classes.includes(grade))
  );
}

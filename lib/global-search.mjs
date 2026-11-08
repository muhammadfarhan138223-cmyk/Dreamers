import { textbookSearch } from "./textbooks.mjs";
import { packMeta, lessonPath } from "./catalog.mjs";
import { searchBookPages } from "./books.mjs";
export function findChapters(query, keywords = []) {
  const found = new Map();
  const phrase = (value) =>
    value
      .toLocaleLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .trim();
  for (const [index, word] of [query, ...keywords].entries())
    for (const hit of textbookSearch(word, undefined, 200)) {
      // An AI phrase such as "urinary system" must not expand into every "system" chapter.
      if (index > 0 && !phrase(hit.title).includes(phrase(word))) continue;
      if (!found.has(hit.id)) found.set(hit.id, hit);
    }
  return [...found.values()];
}
export function findFoundation(packs, query) {
  return packs
    .flatMap((pack) => {
      const meta = packMeta(pack.id);
      if (!meta) return [];
      return searchBookPages(
        pack.lessons.map((lesson, i) => ({
          id: lesson.id,
          page: i + 1,
          text: [lesson.subtitle, ...lesson.paragraphs, lesson.example].join(
            " ",
          ),
        })),
        query,
      ).map((hit) => ({
        ...hit,
        title: pack.lessons.find((l) => l.id === hit.id).subtitle,
        subject: pack.subject,
        url: lessonPath(meta, hit.id),
      }));
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 50);
}

export function matchesSearchFilters(source, filters, bookId = source?.id) {
  if (!source) return false;
  const grades =
    (source.classes?.length ? source.classes : null) ||
    (source.class === "XI–XII" ? ["XI", "XII"] : [source.class]);
  return (
    (filters.subject === "all" || source.subject === filters.subject) &&
    (filters.grade === "all" || grades.includes(filters.grade)) &&
    (filters.book === "all" || bookId === filters.book)
  );
}

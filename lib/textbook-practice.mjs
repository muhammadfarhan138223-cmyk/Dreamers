import { TAIF_SHORTS } from "./english-exercise.mjs";
import {
  BIOLOGY_XII,
  biologyChapterCards,
  biologyChapterTopics,
} from "./biology-xii.mjs";
import books from "./textbook-practice-data.json" with { type: "json" };

/** @typedef {[number, string, string, string, string[], string, string]} Topic */
export const mappedPracticeBooks = [BIOLOGY_XII, ...Object.keys(books)];

/** @returns {Topic[]} */
export function chapterPracticeTopics(bookId, number) {
  if (bookId === BIOLOGY_XII) return biologyChapterTopics(bookId, number);
  return books[bookId]?.[number]?.topics || [];
}

export function chapterPracticeCards(bookId, number, mode) {
  if (bookId === BIOLOGY_XII) return biologyChapterCards(bookId, number, mode);
  if (bookId === "english-xii-supplied" && number === 1 && mode === "short")
    return TAIF_SHORTS.map((q) => ({
      id: `${bookId}:1:short:comprehension:${q.n}`,
      question: q.enQ,
      answer: q.enA,
      sourcePage: q.page,
      topic: "Journey to Taif · comprehension",
    }));
  const rows = chapterPracticeTopics(bookId, number);
  if (!rows.length) return [];
  if (mode === "long") {
    const [question, answer] = books[bookId][number].long;
    return [{ id: `${bookId}:${number}:long`, question, answer }];
  }
  if (mode !== "mcq" && mode !== "short") return [];
  return rows.map(
    (
      [sourcePage, topic, prompt, key, distractors, explanation, recall],
      index,
    ) => {
      const correct = (number + index) % 4;
      const options = [...distractors];
      options.splice(correct, 0, key);
      return {
        id: `${bookId}:${number}:${mode}:${index}`,
        sourcePage,
        topic,
        question: mode === "mcq" ? prompt : recall,
        answer: mode === "mcq" ? key : explanation,
        ...(mode === "mcq" ? { options, correct, explanation } : {}),
      };
    },
  );
}

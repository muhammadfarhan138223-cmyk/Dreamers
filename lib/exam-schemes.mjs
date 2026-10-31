// Numeric paper-structure facts transcribed from supplied appendices, not a
// declaration that an official board has approved them for a current exam.
export const EXAM_SCHEMES = [
  {
    id: "computer-xii-book-pattern",
    bookId: "computer-xii-supplied",
    title: "Computer Science book paper pattern",
    yearLabel: null,
    sourcePages: [141, 142],
    verification: "file-inspected-board-pending",
    totalMarks: 75,
    minutes: 150,
    objective: {
      marks: 15,
      minutes: null,
      byChapter: { 1: 2, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2, 7: 1, 8: 1, 9: 1 },
    },
    subjectiveMinutes: null,
    shortGroups: [
      {
        number: 2,
        attempt: 6,
        offered: 9,
        marksEach: 2,
        chapters: { 1: 3, 2: 4, 6: 2 },
      },
      {
        number: 3,
        attempt: 6,
        offered: 9,
        marksEach: 2,
        chapters: { 3: 2, 4: 4, 5: 3 },
      },
      {
        number: 4,
        attempt: 6,
        offered: 9,
        marksEach: 2,
        chapters: { 7: 5, 8: 2, 9: 2 },
      },
    ],
    long: {
      attempt: 3,
      offered: 5,
      partMarks: 8,
      parts: 1,
      pairs: [
        { number: 5, chapters: [1] },
        { number: 6, chapters: [3] },
        { number: 7, chapters: [6] },
        { number: 8, chapters: [8] },
        { number: 9, chapters: [9] },
      ],
    },
  },

  {
    id: "biology-xii-book-2026-27",
    bookId: "biology-xii-supplied",
    title: "Biology book pairing scheme",
    yearLabel: "2026–27 (as printed)",
    sourcePages: [247, 248],
    verification: "file-inspected-board-pending",
    totalMarks: 85,
    minutes: 180,
    objective: {
      marks: 17,
      minutes: 20,
      byChapter: {
        13: 1,
        14: 1,
        15: 2,
        16: 1,
        17: 1,
        18: 2,
        19: 2,
        20: 2,
        21: 1,
        22: 1,
        23: 1,
        24: 1,
        25: 1,
      },
    },
    subjectiveMinutes: 160,
    shortGroups: [
      {
        number: 2,
        attempt: 8,
        offered: 12,
        marksEach: 2,
        chapters: { 13: 3, 14: 3, 19: 3, 20: 3 },
      },
      {
        number: 3,
        attempt: 8,
        offered: 12,
        marksEach: 2,
        chapters: { 15: 2, 16: 2, 17: 2, 18: 4, 24: 2 },
      },
      {
        number: 4,
        attempt: 6,
        offered: 9,
        marksEach: 2,
        chapters: { 21: 2, 22: 2, 23: 3, 25: 2 },
      },
    ],
    long: {
      attempt: 3,
      offered: 5,
      partMarks: 4,
      pairs: [
        { number: 5, chapters: [13, 25] },
        { number: 6, chapters: [14, 24] },
        { number: 7, chapters: [15, 21] },
        { number: 8, chapters: [16, 20] },
        { number: 9, chapters: [17, 19] },
      ],
    },
  },
  {
    id: "chemistry-xii-book-pattern",
    bookId: "chemistry-xii-supplied",
    title: "Chemistry book paper pattern",
    yearLabel: null,
    sourcePages: [262],
    verification: "file-inspected-board-pending",
    totalMarks: 85,
    minutes: 180,
    objective: {
      marks: 17,
      minutes: null,
      byChapter: Object.fromEntries(
        Array.from({ length: 17 }, (_, i) => [17 + i, 1]),
      ),
    },
    subjectiveMinutes: null,
    shortGroups: [
      {
        number: 2,
        attempt: 8,
        offered: 12,
        marksEach: 2,
        chapters: { 17: 1, 18: 1, 19: 3, 20: 2, 24: 3, 25: 2 },
      },
      {
        number: 3,
        attempt: 8,
        offered: 12,
        marksEach: 2,
        chapters: { 21: 1, 22: 1, 23: 2, 27: 2, 28: 3, 29: 3 },
      },
      {
        number: 4,
        attempt: 6,
        offered: 9,
        marksEach: 2,
        chapters: { 26: 1, 30: 2, 31: 2, 32: 2, 33: 2 },
      },
    ],
    long: {
      attempt: 3,
      offered: 5,
      partMarks: 4,
      pairs: [
        { number: 5, chapters: [17, 21] },
        { number: 6, chapters: [18, 26] },
        { number: 7, chapters: [20, 31] },
        { number: 8, chapters: [22, 32] },
        { number: 9, chapters: [23, 33] },
      ],
    },
  },
  {
    id: "english-xii-book-pattern",
    bookId: "english-xii-supplied",
    title: "English book paper-setting instructions",
    yearLabel: null,
    sourcePages: [160, 161],
    verification: "file-inspected-board-pending",
    totalMarks: 100,
    minutes: 180,
    objective: {
      marks: 20,
      minutes: 30,
      groups: [
        { title: "Synonyms: units 1, 2, 4, 5, 6", marks: 3 },
        { title: "Synonyms: units 8, 9, 11, 12", marks: 3 },
        { title: "Synonyms: unit 13 (novel)", marks: 4 },
        { title: "Prepositions across the textbook", marks: 5 },
        {
          title: "Correct sentences / parts of speech across the textbook",
          marks: 5,
        },
      ],
    },
    subjectiveMinutes: 150,
    sections: [
      {
        number: 2,
        title: "Short answers: units 1, 2, 4, 5, 6",
        marks: 10,
        attempt: 5,
        offered: 8,
        units: [1, 2, 4, 5, 6],
      },
      {
        number: 3,
        title: "Short answers: units 8, 9, 11, 12",
        marks: 10,
        attempt: 5,
        offered: 8,
        units: [8, 9, 11, 12],
      },
      {
        number: 4,
        title: "Short answers: unit 13 (novel)",
        marks: 14,
        attempt: 7,
        offered: 11,
        units: [13],
      },
      {
        number: 5,
        title: "Stanza explanation: units 3, 7, 10",
        marks: 6,
        units: [3, 7, 10],
      },
      {
        number: 6,
        title: "Essay: choose one of four topics (Grammar & Composition 11–12)",
        marks: 15,
        units: [],
      },
      {
        number: 7,
        title: "Idioms (Grammar & Composition 11–12)",
        marks: 10,
        attempt: 5,
        offered: 8,
        units: [],
      },
      {
        number: 8,
        title:
          "Urdu-to-English translation; paragraph alternative for foreign / English-medium candidates (Grammar & Composition 11–12)",
        marks: 15,
        units: [],
      },
    ],
  },
];
export const schemeForBook = (bookId) =>
  EXAM_SCHEMES.find((s) => s.bookId === bookId);
/** @returns {{mcqs:number,short:{question:number,count:number}[],pairs:{number:number,chapters:number[]}[]}|null} */
export function schemeChapterFacts(scheme, number) {
  if (!scheme?.shortGroups) return null;
  return {
    mcqs: scheme.objective.byChapter[number] || 0,
    short: scheme.shortGroups.flatMap((g) =>
      g.chapters[number]
        ? [{ question: g.number, count: g.chapters[number] }]
        : [],
    ),
    pairs: scheme.long.pairs.filter((p) => p.chapters.includes(number)),
  };
}

// Chapter headings checked against the owner's supplied PDFs, not a board exam notification.
// Only metadata is published. Full textbook bytes stay in the student's local library.
/** @param {string} prefix @param {Array<[string, number, number?]>} rows */
const chapterList = (prefix, rows) =>
  rows.map(([title, page, printedPage], i) => ({
    id: `${prefix}-${i + 1}`,
    title,
    page,
    printedPage: printedPage ?? null,
  }));
export const TEXTBOOKS = [
  {
    id: "biology-xii-supplied",
    subject: "biology",
    title: "Biology",
    subtitle: "Systems, inheritance & the living world",
    class: "XII",
    pages: 252,
    bytes: 8335252,
    sha256: "881c89fd323f7e95fe741358cb41b91fcc5d81758a55dba21bdc6f5add926829",
    color: "mint",
    icon: "dna",
    edition: "Supplied XII chapter collection · cover/edition page absent",
    text: "selectable",
    source: "Owner-supplied PDF · chapter headings checked",
    sourceStatus: "file-inspected",
    examStatus: "Current board syllabus / exclusions not verified",
    access: "local-import",
    filename: "02-12th-Biology-New-Book-By-Pecktaa.pdf",
    chapters: chapterList("bio12", [
      ["Thermoregulation and Osmoregulation", 1, 1],
      ["Human Urinary System", 12, 12],
      ["Human Nervous System", 25, 25],
      ["Human Endocrine System", 57, 57],
      ["Human Reproductive Systems", 73, 73],
      ["Inheritance", 83, 83],
      ["Chromosome and DNA", 115, 115],
      ["Biotechnology", 155, 155],
      ["Immunity", 169, 169],
      ["Biostatistics", 186, 186],
      ["Pharmacology", 208, 208],
      ["Evolution", 215, 215],
      ["Ecology", 228, 228],
    ]),
  },
  {
    id: "physics-xii-supplied",
    subject: "physics",
    title: "Physics",
    subtitle: "From thermal motion to distant galaxies",
    class: "XII",
    pages: 186,
    bytes: 24135553,
    sha256: "559b765f9dc07e3f8a4c0d6b415d9cca64b7e901a3edac2b34e0010f8a185237",
    color: "violet",
    icon: "atom",
    edition: "PECTAA-branded supplied copy · exact edition unverified",
    text: "selectable",
    source: "Owner-supplied PDF · contents page checked",
    sourceStatus: "file-inspected",
    examStatus: "Current board syllabus / exclusions not verified",
    access: "local-import",
    filename: "03-2nd-Year-Physics-New-Book-By-Pecktaa-1-.pdf",
    chapters: chapterList("phy12", [
      ["Thermal Physics", 4, 1],
      ["Simple Harmonic Motion", 18, 15],
      ["Physical Optics", 45, 42],
      ["Electrostatics", 61, 57],
      ["Alternating Current", 85, 81],
      ["Quantum Physics", 118, 114],
      ["Nuclear and Particle Physics", 137, 133],
      ["Medical Physics", 156, 152],
      ["Space and Environment", 169, 165],
    ]),
  },
  {
    id: "computer-xii-supplied",
    subject: "computer-science",
    title: "Computer Science",
    subtitle: "Code, create & solve something new",
    class: "XII",
    pages: 147,
    bytes: 23054650,
    sha256: "23939a80686d006035385453267cae834031b613a73be7e5701580f9ccc91bc9",
    color: "peach",
    icon: "code",
    edition: "Computer Science and Entrepreneurship · July 2026 printing",
    text: "scanned",
    source: "Owner-supplied scan · contents page checked",
    sourceStatus: "file-inspected",
    examStatus: "Current board syllabus / exclusions not verified",
    access: "local-import",
    filename: "01-2nd-Year-Computer-New-Book-By-Pecktaa.pdf",
    chapters: chapterList("cs12", [
      ["Computer Networks", 6, 1],
      ["Computational Thinking & Algorithms", 25, 20],
      ["Object Oriented Programming Using Python", 38, 33],
      ["Development of Graphical User Interface (GUI)", 50, 45],
      ["Code Testing and Debugging", 65, 60],
      ["Data and Analysis", 77, 72],
      ["Hypothesis Testing", 94, 89],
      ["Applications of Computer Science", 108, 103],
      ["Cybersecurity and Safe Digital Collaboration", 123, 118],
    ]),
  },
];
export const DEFAULT_TEXTBOOK = TEXTBOOKS[0].id;
export const textbook = (id) => TEXTBOOKS.find((b) => b.id === id);
export const textbookByHash = (hash) =>
  TEXTBOOKS.find((b) => b.sha256 === hash);
export const textbookTopic = (id, topicId) =>
  textbook(id)?.chapters.find((t) => t.id === topicId);
export function topicSuggestions(id) {
  return (textbook(id)?.chapters || [])
    .slice(0, 3)
    .map((t) => `Explain ${t.title.toLowerCase()} in simple words.`);
}
/** @param {string} query @param {string} [id] */
export function textbookSearch(query, id) {
  const tokens = (
    String(query)
      .toLowerCase()
      .match(/[\p{L}\p{N}]+/gu) || []
  ).filter((t) => t.length > 1);
  if (!tokens.length) return [];
  return TEXTBOOKS.filter((b) => !id || b.id === id)
    .flatMap((book) =>
      book.chapters.map((topic) => ({
        bookId: book.id,
        bookTitle: book.title,
        subject: book.subject,
        ...topic,
        score: tokens.filter((t) =>
          (book.title + " " + topic.title).toLowerCase().includes(t),
        ).length,
      })),
    )
    .filter((t) => t.score)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);
}

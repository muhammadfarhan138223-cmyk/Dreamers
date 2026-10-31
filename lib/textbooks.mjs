// Chapter headings checked against the owner's supplied PDFs, not a board exam notification.
// Only metadata is published. Full textbook bytes stay in the student's local library.
import data from "./textbooks-data.json" with { type: "json" };
/** @typedef {{id:string,title:string,page:number,printedPage:number|null,endPage?:number,number?:number}} Chapter */
/** @typedef {{id:string,subject:string,title:string,subtitle:string,class:string,classes:string[],kind:string,pages:number,bytes:number,sha256:string,color:string,icon:string,edition:string,text:string,source:string,sourceStatus:string,examStatus:string,access:string,filename:string,chapters:Chapter[],appendices?:{title:string,page:number,endPage:number,kind:string}[]}} Textbook */
/** @type {Textbook[]} */
export const TEXTBOOKS = data;
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
/** @param {string} query @param {string} [id] @param {number} [limit] */
export function textbookSearch(query, id, limit = 20) {
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
    .slice(0, limit);
}

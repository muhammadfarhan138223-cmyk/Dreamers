import { TEXTBOOKS } from "./textbooks.mjs";
export const SEARCH_POLICY_VERSION = "catalog-discovery-v1";
export const searchTopics = TEXTBOOKS.flatMap((book) =>
  book.chapters.map((topic) => ({
    id: topic.id,
    title: topic.title,
    bookId: book.id,
    bookTitle: book.title,
    class: book.class,
    page: topic.page,
  })),
);
const topicIds = new Set(searchTopics.map((t) => t.id));
export function validateSearchOutput(raw, finishReason) {
  if (finishReason !== "stop")
    throw new Error(
      "AI search was incomplete. Local results are still available.",
    );
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error("AI search returned an invalid topic map.");
  }
  if (
    !data ||
    !Array.isArray(data.topicIds) ||
    data.topicIds.length > 6 ||
    data.topicIds.some((id) => typeof id !== "string" || !topicIds.has(id)) ||
    !Array.isArray(data.keywords) ||
    data.keywords.length > 5 ||
    data.keywords.some(
      (word) =>
        typeof word !== "string" ||
        word.trim().length < 2 ||
        word.length > 60 ||
        /[\u0000-\u001f]/u.test(word),
    )
  )
    throw new Error(
      "AI search returned unsupported topics or terms. Local results are still available.",
    );
  return {
    topicIds: [...new Set(data.topicIds)],
    keywords: [...new Set(data.keywords.map((s) => s.trim()))],
  };
}

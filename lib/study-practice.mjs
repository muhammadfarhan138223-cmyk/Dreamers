export const STUDY_MODES = ["short", "mcq", "long"];
export const STUDY_POLICY = "source-practice-v2-audit";
const normal = (text) => text.normalize("NFC").replace(/\s+/gu, " ").trim();
const bounded = (value, max) =>
  typeof value === "string" && value.trim().length > 0 && value.length <= max;
export function checkStudyQuestions(raw, source, mode, finish) {
  if (finish !== "stop")
    throw new Error("Practice was incomplete. Try a shorter source page.");
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error("Practice could not be checked. Try again.");
  }
  const max = mode === "long" ? 1 : 3;
  if (!data || !Array.isArray(data.questions) || data.questions.length > max)
    throw new Error("Practice could not be checked.");
  return data.questions.map((q, i) => {
    if (
      !q ||
      !bounded(q.question, 300) ||
      !bounded(q.answer, mode === "long" ? 1800 : 700) ||
      !bounded(q.sourceQuote, 240) ||
      normal(q.sourceQuote).length < 20 ||
      !normal(source).includes(normal(q.sourceQuote))
    )
      throw new Error(
        "A practice reference did not match the page. Those questions were withheld.",
      );
    if (
      mode === "mcq" &&
      (!Array.isArray(q.options) ||
        q.options.length !== 4 ||
        q.options.some((x) => !bounded(x, 180)) ||
        new Set(q.options).size !== 4 ||
        !Number.isInteger(q.correct) ||
        q.correct < 0 ||
        q.correct > 3 ||
        q.answer !== q.options[q.correct])
    )
      throw new Error("The MCQ answer key could not be checked.");
    return {
      id: `q${i + 1}`,
      question: q.question.trim(),
      answer: q.answer.trim(),
      sourceQuote: normal(q.sourceQuote),
      ...(mode === "mcq" ? { options: q.options, correct: q.correct } : {}),
    };
  });
}

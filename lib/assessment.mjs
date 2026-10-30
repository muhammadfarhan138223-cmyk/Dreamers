/** @param {Array<import("./types").Question>} questions @param {Record<string,number>} answers */
export function scoreAssessment(questions, answers) {
  let correct = 0,
    answered = 0;
  const details = questions.map((q) => {
    const answer = answers[q.id];
    const attempted =
      Number.isInteger(answer) && answer >= 0 && answer < q.options.length;
    if (attempted) answered++;
    const right = attempted && answer === q.answer;
    if (right) correct++;
    return {
      id: q.id,
      topic: q.topic,
      answer: attempted ? answer : null,
      correct: right,
      explanation: q.explanation,
    };
  });
  return { total: questions.length, correct, answered, details };
}
/** @template T @param {T[]} items @param {()=>number} random @returns {T[]} */
export function shuffled(items, random = Math.random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

import { test } from "node:test";
import assert from "node:assert/strict";
import { scoreAssessment, shuffled } from "../lib/assessment.mjs";
const questions = [
  {
    id: "a",
    topic: "cell",
    answer: 1,
    options: ["a", "b"],
    explanation: "reason",
  },
  {
    id: "b",
    topic: "cell",
    answer: 0,
    options: ["a", "b"],
    explanation: "another reason",
  },
];
test("assessment distinguishes incorrect and unanswered questions", () => {
  const score = scoreAssessment(questions, { a: 1 });
  assert.equal(score.correct, 1);
  assert.equal(score.answered, 1);
  assert.equal(score.total, 2);
  assert.equal(score.details[1].answer, null);
});
test("invalid answer indexes cannot count as attempted or correct", () => {
  const score = scoreAssessment(questions, { a: 9, b: -1 });
  assert.equal(score.correct, 0);
  assert.equal(score.answered, 0);
});
test("shuffling preserves the question set without mutating source", () => {
  const copy = [...questions];
  const result = shuffled(questions, () => 0);
  assert.deepEqual(questions, copy);
  assert.equal(new Set(result.map((q) => q.id)).size, questions.length);
});

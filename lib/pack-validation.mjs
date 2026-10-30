export function validatePack(pack) {
  const errors = [];
  const str = (v, min = 1, max = 10000) =>
    typeof v === "string" && v.length >= min && v.length <= max;
  if (!pack || typeof pack !== "object") return ["Pack must be a JSON object."];
  for (const field of [
    "title",
    "subject",
    "class",
    "board",
    "edition",
    "academicYear",
    "verification",
    "license",
    "description",
  ])
    if (!str(pack[field])) errors.push(`Missing or invalid ${field}.`);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(pack.id || ""))
    errors.push("A safe lowercase pack slug is required.");
  if (!Number.isInteger(pack.version) || pack.version < 1)
    errors.push("Positive integer version required.");
  if (
    !Array.isArray(pack.lessons) ||
    !pack.lessons.length ||
    pack.lessons.length > 500
  )
    errors.push("Provide 1–500 lessons.");
  const ids = new Set();
  for (const lesson of pack.lessons || []) {
    if (!str(lesson.id, 1, 100) || ids.has(lesson.id))
      errors.push("Lesson IDs must be unique.");
    ids.add(lesson.id);
    for (const f of [
      "title",
      "subtitle",
      "objective",
      "example",
      "simple",
      "check",
    ])
      if (!str(lesson[f])) errors.push(`Lesson ${lesson.id}: invalid ${f}.`);
    if (
      !Array.isArray(lesson.paragraphs) ||
      !lesson.paragraphs.length ||
      !lesson.paragraphs.every((p) => str(p))
    )
      errors.push(`Lesson ${lesson.id}: explanations required.`);
    if (
      !Array.isArray(lesson.takeaways) ||
      !lesson.takeaways.length ||
      !lesson.takeaways.every((p) => str(p))
    )
      errors.push(`Lesson ${lesson.id}: takeaways required.`);
  }
  if (!Array.isArray(pack.questions) || pack.questions.length > 10000)
    errors.push("A question array with at most 10,000 items is required.");
  const questions = new Set();
  for (const q of pack.questions || []) {
    if (!str(q.id, 1, 100) || questions.has(q.id))
      errors.push("Question IDs must be unique.");
    questions.add(q.id);
    if (!ids.has(q.topic)) errors.push(`Question ${q.id}: unknown topic.`);
    if (
      !str(q.prompt) ||
      !str(q.explanation) ||
      !str(q.source) ||
      !str(q.verification) ||
      !str(q.difficulty)
    )
      errors.push(
        `Question ${q.id}: prompt, explanation, difficulty and source/review status required.`,
      );
    if (!Number.isInteger(q.marks) || q.marks < 1)
      errors.push(`Question ${q.id}: positive marks required.`);
    if (
      !Array.isArray(q.options) ||
      q.options.length < 2 ||
      q.options.length > 8 ||
      !q.options.every((p) => str(p))
    )
      errors.push(`Question ${q.id}: valid options required.`);
    if (
      !Number.isInteger(q.answer) ||
      q.answer < 0 ||
      q.answer >= (q.options?.length || 0)
    )
      errors.push(`Question ${q.id}: invalid answer index.`);
    if (
      q.verification === "verified" &&
      (!str(q.reviewedBy) || !str(q.reviewedAt))
    )
      errors.push(`Question ${q.id}: reviewer and review date required.`);
  }
  if (
    /^(official|verified)$/i.test(pack.verification) &&
    (!str(pack.sourceUrl) || !str(pack.reviewedBy) || !str(pack.reviewedAt))
  )
    errors.push(
      "Official/reviewed claims require source URL and review provenance.",
    );
  return errors;
}

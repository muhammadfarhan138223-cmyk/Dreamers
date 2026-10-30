import {
  packMeta,
  packForLesson,
  packForQuestion,
  packForRoute,
} from "./catalog.mjs";
const stores = [
  "packs",
  "events",
  "notes",
  "cards",
  "settings",
  "queue",
  "assessments",
];
const allowedEvents = new Set(["lesson", "attempt", "review"]);
export function validateBackup(input) {
  if (!input || typeof input !== "object" || input.schemaVersion !== 1)
    throw new Error("This is not a supported Dreamers backup.");
  let total = 0;
  /** @type {Record<string, any[]>} */ const result = {};
  for (const store of stores) {
    const rows = input[store] ?? [];
    if (!Array.isArray(rows)) throw new Error(`Invalid ${store} records.`);
    total += rows.length;
    if (total > 10000) throw new Error("The backup contains too many records.");
    for (const row of rows) {
      if (
        !row ||
        typeof row !== "object" ||
        typeof row.id !== "string" ||
        row.id.length > 160 ||
        !row.id
      )
        throw new Error(`Invalid ${store} record ID.`);
      if (JSON.stringify(row).length > 100000)
        throw new Error("A backup record is too large.");
      if (
        ["events", "queue"].includes(store) &&
        (!allowedEvents.has(row.kind) ||
          typeof row.target !== "string" ||
          (row.kind === "lesson" && !packForLesson(row.target)) ||
          (row.kind === "attempt" && !packForQuestion(row.target)) ||
          !Number.isFinite(row.at) ||
          (row.kind === "attempt" && typeof row.correct !== "boolean"))
      )
        throw new Error("Invalid learning event.");
      if (
        store === "notes" &&
        (!["note", "bookmark", "ai"].includes(row.kind) ||
          (row.kind === "bookmark" &&
            (typeof row.href !== "string" ||
              !packForRoute(row.href) ||
              row.href.split("/").length !== 5 ||
              !packForLesson(row.href.split("/").at(-1)))))
      )
        throw new Error("Invalid note or bookmark.");
      if (
        store === "packs" &&
        (!packMeta(row.id) || row.version !== packMeta(row.id).version)
      )
        throw new Error("This backup pack is not supported by this release.");
      if (store === "assessments") {
        const meta = packMeta(row.packId);
        if (!meta) throw new Error("Unknown assessment pack.");
        if (
          !["in-progress", "complete"].includes(row.status) ||
          row.packId !== meta.id ||
          row.packVersion !== meta.version ||
          !Array.isArray(row.order) ||
          row.order.length !== meta.questionIds.length ||
          !row.order.every((q) => meta.questionIds.includes(q)) ||
          new Set(row.order).size !== meta.questionIds.length ||
          !row.answers ||
          typeof row.answers !== "object" ||
          Array.isArray(row.answers) ||
          !Object.entries(row.answers).every(
            ([key, value]) =>
              row.order.includes(key) &&
              Number.isInteger(value) &&
              Number(value) >= 0 &&
              Number(value) < meta.questionOptions[key],
          ) ||
          !Number.isInteger(row.index) ||
          row.index < 0 ||
          row.index >= meta.questionIds.length ||
          !Number.isFinite(row.startedAt) ||
          !Number.isFinite(row.at) ||
          (row.deadline !== null && !Number.isFinite(row.deadline))
        )
          throw new Error("Invalid chapter assessment.");
        if (
          row.status === "complete" &&
          (!row.score ||
            row.score.total !== meta.questionIds.length ||
            !Number.isInteger(row.score.correct) ||
            row.score.correct < 0 ||
            row.score.correct > meta.questionIds.length ||
            !Number.isInteger(row.score.answered) ||
            row.score.answered < row.score.correct ||
            row.score.answered > meta.questionIds.length ||
            !Number.isFinite(row.finishedAt))
        )
          throw new Error("Invalid completed assessment result.");
      }
      if (
        store === "cards" &&
        (!Number.isFinite(row.due) || !Number.isFinite(row.interval))
      )
        throw new Error("Invalid review schedule.");
    }
    result[store] = rows;
  }
  // Pack bytes are reinstalled from the trusted app resource; backups cannot inject learning packs.
  result.packs = [];
  return result;
}

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
          (row.kind === "lesson" &&
            !["cell-basics", "organelles", "membranes", "osmosis"].includes(
              row.target,
            )) ||
          (row.kind === "attempt" && !/^q(?:[1-9]|1[0-2])$/.test(row.target)) ||
          !Number.isFinite(row.at) ||
          (row.kind === "attempt" && typeof row.correct !== "boolean"))
      )
        throw new Error("Invalid learning event.");
      if (
        store === "notes" &&
        (!["note", "bookmark", "ai"].includes(row.kind) ||
          (row.kind === "bookmark" &&
            (typeof row.href !== "string" ||
              !/^\/learn\/biology\/cells\/[a-z-]+$/.test(row.href))))
      )
        throw new Error("Invalid note or bookmark.");
      if (
        store === "packs" &&
        (row.id !== "cells-starter" ||
          row.version !== 1 ||
          !Array.isArray(row.lessons) ||
          row.lessons.length !== 4 ||
          !Array.isArray(row.questions) ||
          row.questions.length !== 12)
      )
        throw new Error("This backup pack is not supported by this release.");
      if (store === "assessments") {
        if (
          !["in-progress", "complete"].includes(row.status) ||
          row.packId !== "cells-starter" ||
          row.packVersion !== 1 ||
          !Array.isArray(row.order) ||
          row.order.length !== 12 ||
          !row.order.every((q) => /^q(?:[1-9]|1[0-2])$/.test(q)) ||
          new Set(row.order).size !== 12 ||
          !row.answers ||
          typeof row.answers !== "object" ||
          Array.isArray(row.answers) ||
          !Object.entries(row.answers).every(
            ([key, value]) =>
              row.order.includes(key) &&
              Number.isInteger(value) &&
              Number(value) >= 0 &&
              Number(value) < 4,
          ) ||
          !Number.isInteger(row.index) ||
          row.index < 0 ||
          row.index >= 12 ||
          !Number.isFinite(row.startedAt) ||
          !Number.isFinite(row.at) ||
          (row.deadline !== null && !Number.isFinite(row.deadline))
        )
          throw new Error("Invalid chapter assessment.");
        if (
          row.status === "complete" &&
          (!row.score ||
            row.score.total !== 12 ||
            !Number.isInteger(row.score.correct) ||
            row.score.correct < 0 ||
            row.score.correct > 12 ||
            !Number.isInteger(row.score.answered) ||
            row.score.answered < row.score.correct ||
            row.score.answered > 12 ||
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

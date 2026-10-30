import catalog from "./catalog-data.mjs";
export const PACKS = catalog;
export const STARTER_PACK_ID = "cells-starter";
export function packMeta(id) {
  return PACKS.find((p) => p.id === id);
}
export function packForSubject(subject) {
  return PACKS.find((p) => p.subject === subject);
}
export function packForLesson(id) {
  return PACKS.find((p) => p.lessonIds.includes(id));
}
export function packForQuestion(id) {
  return PACKS.find((p) => p.questionIds.includes(id));
}
export function lessonPath(meta, lessonId) {
  return `/learn/${meta.subject}/${meta.chapterSlug}/${lessonId}`;
}
export function chapterPath(meta) {
  return `/learn/${meta.subject}/${meta.chapterSlug}`;
}
export function packForRoute(path) {
  const segments = path.split("/").filter(Boolean);
  if (!["learn", "practice", "challenge"].includes(segments[0])) return;
  return packForSubject(segments[1]);
}

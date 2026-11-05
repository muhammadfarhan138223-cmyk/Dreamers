import * as db from "./db";
import { textbook } from "./textbooks.mjs";
import { hostedBookUrl, bookCover } from "./hosted-books.mjs";
import { downloadBook } from "./book-download.mjs";
import { preparePdfEngine } from "./pdf-client";
import type { LocalBook } from "@/components/book-library";
const pending = new Map<string, Promise<LocalBook>>();
export async function installBook(
  id: string,
  signal: AbortSignal,
  onProgress: (received: number, total: number) => void,
) {
  const book = textbook(id);
  if (!book) throw new Error("This book is not registered.");
  const existing = await db.get<LocalBook>("books", "pdf:" + book.sha256);
  if (existing) {
    await preparePdfEngine();
    return existing;
  }
  if (pending.has(id)) return pending.get(id)!;
  const task = (async () => {
    const blob = await downloadBook(book, hostedBookUrl(id), {
      signal,
      onProgress,
    });
    if (signal.aborted)
      throw new DOMException("Opening cancelled", "AbortError");
    const local: LocalBook = {
      id: "pdf:" + book.sha256,
      title: book.title,
      filename: book.filename,
      subject: book.subject,
      class: book.class,
      edition: book.edition,
      sha256: book.sha256,
      blob,
      bytes: book.bytes,
      pageCount: book.pages,
      catalogId: book.id,
      at: Date.now(),
      ...(bookCover(id) ? { cover: bookCover(id)! } : {}),
    };
    // A reader setup/network failure never removes a completely received book.
    await db.put("books", local);
    await preparePdfEngine();
    void navigator.storage?.persist?.().catch(() => false);
    return local;
  })();
  pending.set(id, task);
  try {
    return await task;
  } finally {
    pending.delete(id);
  }
}

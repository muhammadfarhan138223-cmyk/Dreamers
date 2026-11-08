import * as db from "./db";
import type { LocalBook, BookPage } from "@/components/book-library";
// An exact digest check prevents text from a different edition being attached to a book.
export async function preparedBookPages(book: LocalBook) {
  if (
    book.catalogId !== "english-xii-supplied" ||
    book.sha256 !==
      "9b52e3be040966b9347d6bf71e48e5ffca9717f5d9f6cd649afe8cd5eca2d952"
  )
    return null;
  const key = "prepared-text:v1:" + book.id;
  if (await db.get("settings", key)) {
    const cached = await db.bookPages<BookPage>(book.id);
    if (cached.length === 165) return cached;
  }
  const response = await fetch("/book-text/english-xii-v1.json", {
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) return null;
  const pack = await response.json();
  if (
    pack.sha256 !== book.sha256 ||
    pack.pageCount !== 165 ||
    !Array.isArray(pack.pages) ||
    pack.pages.length !== 165
  )
    throw Error("Book text does not match this edition.");
  for (const p of pack.pages) {
    if (
      !Number.isInteger(p.page) ||
      p.page < 1 ||
      p.page > 165 ||
      typeof p.text !== "string" ||
      p.text.length > 20000
    )
      throw Error("Invalid book text page.");
    await db.put("bookPages", {
      id: `${book.id}:p:${p.page}`,
      bookId: book.id,
      page: p.page,
      text: p.text,
      method: p.method,
    });
  }
  await db.patch("books", book.id, { indexedPages: 165 });
  await db.put("settings", { id: key, at: Date.now() });
  return db.bookPages<BookPage>(book.id);
}

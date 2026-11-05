import { validatePdfHeader } from "./books.mjs";
// Fetch the app-owned static asset only. Commit to IndexedDB after complete verification.
/** @param {{bytes:number,sha256:string}} book @param {string|null} url @param {{signal?:AbortSignal,onProgress?:(received:number,total:number)=>void,fetcher?:typeof fetch}} options */
export async function downloadBook(
  book,
  url,
  { signal, onProgress = () => {}, fetcher = fetch } = {},
) {
  if (!url?.startsWith("/textbooks/") || url.includes(".."))
    throw new Error("Book is not available in this app yet.");
  const deadline = AbortSignal.timeout(180000);
  const requestSignal = signal ? AbortSignal.any([signal, deadline]) : deadline;
  const response = await fetcher(url, {
    signal: requestSignal,
    cache: "no-store",
  });
  if (!response.ok)
    throw new Error("The book could not be opened. Reconnect and try again.");
  const reader = response.body?.getReader();
  if (!reader)
    throw new Error("Your browser could not read this book. Please retry.");
  const chunks = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > book.bytes)
        throw new Error("This copy has changed. Please refresh Dreamers.");
      chunks.push(value);
      onProgress(size, book.bytes);
    }
  } catch (error) {
    await reader.cancel().catch(() => {});
    throw error;
  }
  const blob = new Blob(chunks, { type: "application/pdf" });
  validatePdfHeader(
    new Uint8Array(await blob.slice(0, 1024).arrayBuffer()),
    size,
  );
  const digest = Array.from(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", await blob.arrayBuffer()),
    ),
    (n) => n.toString(16).padStart(2, "0"),
  ).join("");
  if (size !== book.bytes || digest !== book.sha256)
    throw new Error(
      "Book verification failed. Your saved books are safe; try again.",
    );
  return blob;
}

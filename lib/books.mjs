export const MAX_PDF_BYTES = 100 * 1024 * 1024;
export const MAX_BOOK_PAGES = 1500;
export const MAX_PAGE_TEXT = 20000;
export function validatePdfHeader(bytes, size) {
  if (!Number.isFinite(size) || size <= 0 || size > MAX_PDF_BYTES)
    throw new Error(
      "Choose a PDF smaller than 100 MB. Large books can be imported in separate volumes.",
    );
  if (!new TextDecoder("latin1").decode(bytes.slice(0, 1024)).includes("%PDF-"))
    throw new Error(
      "This file does not have a PDF header. Please choose the downloaded PDF file.",
    );
}
export function bookTitle(filename) {
  return (
    filename
      .replace(/\.pdf$/i, "")
      .replace(/[\u0000-\u001f]/g, " ")
      .trim()
      .slice(0, 120) || "My textbook"
  );
}
const stop = new Set([
  "the",
  "and",
  "what",
  "how",
  "does",
  "this",
  "that",
  "with",
  "from",
  "about",
  "into",
  "explain",
  "please",
  "which",
  "hai",
  "kya",
  "mein",
]);
export function searchBookPages(pages, query) {
  const tokens = [
    ...new Set(
      (query.toLowerCase().match(/[\p{L}\p{N}]+/gu) || []).filter(
        (t) => t.length > 1 && !stop.has(t),
      ),
    ),
  ];
  if (!tokens.length) return [];
  return pages
    .map((p) => {
      const text = String(p.text || ""),
        lower = text.toLowerCase();
      let score = 0,
        position = -1;
      for (const token of tokens) {
        const first = lower.indexOf(token);
        if (first >= 0) {
          score++;
          if (position < 0 || first < position) position = first;
        }
      }
      return {
        ...p,
        score,
        snippet:
          position < 0
            ? ""
            : text.slice(Math.max(0, position - 70), position + 230),
      };
    })
    .filter((p) => p.score > 0)
    .sort((a, b) => b.score - a.score || a.page - b.page)
    .slice(0, 12);
}

// Some scans contain only a publisher/mirror watermark text layer; that is not OCR.
export function meaningfulPdfText(items) {
  const joined = items
    .map((item) => (typeof item.str === "string" ? item.str : ""))
    .join(" ")
    .slice(0, MAX_PAGE_TEXT);
  const cleaned = joined
    .replace(/web\s*version\s*of\s*(?:pctb|pectaa)\s*(?:textbook)?/gi, "")
    .replace(/w\s*w\s*w\s*\.\s*(?:taleem\s*360|ilmkidunya)\s*\.\s*com/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  return (cleaned.match(/[\p{L}]/gu) || []).length < 30 ? "" : cleaned;
}

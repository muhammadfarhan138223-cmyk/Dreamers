export const PDF_ASSETS = "/pdf-worker/6.4.299/";
export async function openLocalPdf(blob: Blob) {
  await preparePdfEngine();
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = PDF_ASSETS + "pdf.worker.min.mjs";
  return pdfjs.getDocument({
    data: new Uint8Array(await blob.arrayBuffer()),
    disableFontFace: true,
    useSystemFonts: false,
    cMapUrl: PDF_ASSETS + "cmaps/",
    cMapPacked: true,
    standardFontDataUrl: PDF_ASSETS + "standard_fonts/",
    wasmUrl: PDF_ASSETS + "wasm/",
  }).promise;
}
export type LocalPdf = Awaited<ReturnType<typeof openLocalPdf>>;

// A separate cache keeps the complete, versioned reader engine across app updates.
// No textbook files or AI requests are stored in this cache.
export async function preparePdfEngine() {
  if (!("caches" in globalThis))
    throw new Error("Offline PDF caching is unavailable.");
  const cache = await caches.open("dreamers-pdf-engine-6.4.299");
  const manifestUrl = PDF_ASSETS + "assets.json";
  if (await cache.match(manifestUrl)) return;
  const response = await fetch(manifestUrl);
  if (!response.ok) throw new Error("Reconnect to prepare the offline reader.");
  const manifest = (await response.clone().json()) as { files: string[] };
  if (
    !Array.isArray(manifest.files) ||
    manifest.files.some(
      (f) => !/^[a-zA-Z0-9_./-]+$/.test(f) || f.includes(".."),
    )
  )
    throw new Error("Invalid PDF engine manifest.");
  for (let n = 0; n < manifest.files.length; n += 6) {
    await Promise.all(
      manifest.files.slice(n, n + 6).map(async (file) => {
        const url = PDF_ASSETS + file;
        if (await cache.match(url)) return;
        const asset = await fetch(url);
        if (!asset.ok)
          throw new Error(
            "PDF preparation interrupted; reconnect and reopen your book.",
          );
        await cache.put(url, asset);
      }),
    );
  }
  await cache.put(manifestUrl, response);
}

import assert from "node:assert/strict";
const base = process.argv[2];
if (!base || new URL(base).protocol !== "https:")
  throw new Error("Pass the exact HTTPS deployment origin.");
const get = async (path) => {
  const r = await fetch(base + path, { signal: AbortSignal.timeout(15000) });
  assert.equal(r.status, 200, `GET ${path}`);
  return r;
};
const health = await (await get("/api/health")).json();
assert.equal(health.status, "ok");
const manifest = await (await get("/manifest.webmanifest")).json();
assert.equal(manifest.display, "standalone");
assert.equal(manifest.scope, "/");
assert.ok(manifest.icons.some((i) => i.purpose === "maskable"));
for (const icon of manifest.icons) {
  const bytes = new Uint8Array(await (await get(icon.src)).arrayBuffer());
  const view = new DataView(bytes.buffer);
  assert.equal(view.getUint32(16), Number(icon.sizes.split("x")[0]));
  assert.equal(view.getUint32(20), Number(icon.sizes.split("x")[1]));
}
const worker = await get("/sw.js");
assert.match(worker.headers.get("cache-control"), /no-cache/);
assert.match(await worker.text(), /api/);
for (const path of [
  "/dashboard",
  "/learn/biology/cells/osmosis",
  "/practice/biology",
  "/downloads",
  "/books",
  "/learn/chemistry",
  "/practice/physics",
  "/ai-tutor",
  "/settings",
  "/progress",
  "/challenge/biology/cells",
])
  assert.match(await (await get(path)).text(), /DREAMERS/);
for (const name of ["cells", "atoms", "motion"]) {
  const pack = await (await get(`/packs/${name}-v1.json`)).json();
  assert.equal(pack.questions.length, 12);
}
const pdfAssets = await (await get("/pdf-worker/6.4.299/assets.json")).json();
assert.ok(pdfAssets.files.includes("pdf.worker.min.mjs"));
const pdfWorker = await get("/pdf-worker/6.4.299/pdf.worker.min.mjs");
assert.match(pdfWorker.headers.get("content-type"), /javascript/);
const valid = {
  question: "Explain diffusion",
  language: "English",
  mode: "Friendly Teacher",
  topic: "membranes",
};
const post = async (body, origin = base, contentType = "application/json") =>
  fetch(base + "/api/ai", {
    method: "POST",
    headers: {
      "Content-Type": contentType,
      ...(origin ? { Origin: origin } : {}),
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
assert.equal((await post(valid, "https://unrelated.test")).status, 403);
assert.equal((await post({ ...valid, question: "" })).status, 400);
assert.equal((await post("not json")).status, 400);
assert.equal((await post(valid, base, "text/plain")).status, 415);
const textbookRequest = {
  ...valid,
  textbookId: "biology-xii-supplied",
  topic: "bio12-1",
  allowEnrichment: false,
};
assert.equal(
  (await post({ ...textbookRequest, topic: "phy12-1" })).status,
  400,
);
assert.equal(
  (await post({ ...textbookRequest, allowEnrichment: "true" })).status,
  400,
);
assert.equal(
  (await post({ ...textbookRequest, textbookId: "invented" })).status,
  400,
);
if (!health.aiConfigured) {
  assert.equal((await post(textbookRequest)).status, 503);
  assert.equal(
    (await post({ ...textbookRequest, allowEnrichment: true })).status,
    503,
  );
}
const reference = {
  title: "QA original",
  page: 1,
  text: "Diffusion moves particles.",
};
assert.equal(
  (await post({ ...valid, bookContext: { ...reference, page: -1 } })).status,
  400,
);
assert.equal(
  (
    await post({
      ...valid,
      bookContext: { ...reference, text: "x".repeat(2001) },
    })
  ).status,
  400,
);
if (!health.aiConfigured) {
  assert.equal((await post(valid)).status, 503);
  assert.equal((await post({ ...valid, bookContext: reference })).status, 503);
}
console.log(
  "PASS: HTTPS routes, health, manifest, icon dimensions, worker headers, AI origin/input checks and missing-configuration handling.",
);

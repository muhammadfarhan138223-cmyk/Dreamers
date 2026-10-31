/* Only public app assets are cached. AI, auth and account APIs never enter Cache Storage. */
const VERSION = "dreamers-shell-v12";
const CORE = [
  "/",
  "/manifest.webmanifest",
  "/brand/icon.svg",
  "/brand/icon-192.png",
  "/brand/icon-512.png",
  "/brand/maskable-512.png",
  "/packs/cells-v1.json",
];
self.addEventListener("install", (event) =>
  event.waitUntil(
    (async () => {
      const cache = await caches.open(VERSION);
      await cache.addAll(CORE);
      const html = await (await cache.match("/")).text();
      const urls = [...html.matchAll(/(?:src|href)="([^" ]+)"/g)]
        .map((m) => m[1].replaceAll("&amp;", "&"))
        .filter((u) => u.startsWith("/_next/static/"));
      await cache.addAll([...new Set(urls)]);
    })(),
  ),
);
self.addEventListener("activate", (event) =>
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys())
        if (key.startsWith("dreamers-shell-") && key !== VERSION)
          await caches.delete(key);
      await self.clients.claim();
    })(),
  ),
);
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});
self.addEventListener("fetch", (event) => {
  const req = event.request,
    u = new URL(req.url);
  if (
    req.method !== "GET" ||
    u.origin !== self.location.origin ||
    u.pathname.startsWith("/api/") ||
    u.pathname.startsWith("/admin") ||
    req.headers.has("RSC")
  )
    return;
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then(async (response) =>
          response.status >= 500
            ? (await (await caches.open(VERSION)).match("/")) || response
            : response,
        )
        .catch(
          async () =>
            (await (await caches.open(VERSION)).match("/")) || Response.error(),
        ),
    );
    return;
  }
  if (
    u.pathname.startsWith("/_next/static/") ||
    u.pathname.startsWith("/brand/") ||
    u.pathname.startsWith("/pdf-worker/") ||
    u.pathname === "/manifest.webmanifest" ||
    u.pathname.startsWith("/packs/")
  )
    event.respondWith(
      (async () => {
        const cache = await caches.open(VERSION);
        const engine = u.pathname.startsWith("/pdf-worker/")
          ? await caches.open("dreamers-pdf-engine-6.4.299")
          : null;
        const cached =
          (engine && (await engine.match(req))) || (await cache.match(req));
        if (cached) return cached;
        const response = await fetch(req);
        if (response.ok) await cache.put(req, response.clone());
        return response;
      })(),
    );
});

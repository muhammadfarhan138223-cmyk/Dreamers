import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
function worker() {
  let offline = false;
  const handlers = {},
    stores = new Map();
  const origin = "https://dreamers.test";
  const key = (x) => new URL(typeof x === "string" ? x : x.url, origin).href;
  const network = async (req) => {
    if (offline) throw new TypeError("Network disconnected");
    const url = key(req);
    if (url === origin + "/")
      return new Response(
        '<html><script src="/_next/static/app.js"></script><link href="/_next/static/app.css" rel="stylesheet"></html>',
      );
    if (url.endsWith("/packs/cells-v1.json"))
      return new Response(fs.readFileSync("public/packs/cells-v1.json"));
    return new Response("public-static-asset");
  };
  const caches = {
    open: async (name) => {
      if (!stores.has(name)) stores.set(name, new Map());
      const values = stores.get(name);
      return {
        addAll: async (urls) => {
          for (const u of urls) values.set(key(u), await network(u));
        },
        match: async (req) => values.get(key(req))?.clone(),
        put: async (req, response) => values.set(key(req), response.clone()),
      };
    },
    keys: async () => [...stores.keys()],
    delete: async (name) => stores.delete(name),
  };
  const self = {
    location: { origin },
    clients: { claim: async () => {} },
    skipWaiting() {},
    addEventListener: (type, handler) => (handlers[type] = handler),
  };
  vm.runInNewContext(fs.readFileSync("public/sw.js", "utf8"), {
    self,
    caches,
    fetch: network,
    URL,
    Response,
  });
  return {
    stores,
    caches,
    offline: () => (offline = true),
    run: async (type) => {
      let task;
      handlers[type]({ waitUntil: (p) => (task = p) });
      await task;
    },
    fetch: async (path, mode = "cors") => {
      let task;
      handlers.fetch({
        request: {
          url: new URL(path, origin).href,
          method: "GET",
          mode,
          headers: new Headers(),
        },
        respondWith: (p) => (task = p),
      });
      return task ? await task : undefined;
    },
  };
}
test("worker precaches root and referenced application JavaScript and CSS", async () => {
  const w = worker();
  await w.run("install");
  const cache = await w.caches.open("dreamers-shell-v2");
  assert.ok(await cache.match("/_next/static/app.js"));
  assert.ok(await cache.match("/_next/static/app.css"));
});
test("deep lesson and practice navigations load cached shell with network disconnected", async () => {
  const w = worker();
  await w.run("install");
  w.offline();
  for (const path of [
    "/learn/biology/cells/osmosis",
    "/practice/biology",
    "/downloads",
  ]) {
    const response = await w.fetch(path, "navigate");
    assert.equal(response.status, 200);
    assert.match(await response.text(), /app.js/);
  }
});
test("offline pack remains available with all answer explanations", async () => {
  const w = worker();
  await w.run("install");
  w.offline();
  const pack = await (await w.fetch("/packs/cells-v1.json")).json();
  assert.equal(pack.questions.length, 12);
  assert.ok(pack.questions.every((q) => q.explanation));
  const script = await w.fetch("/_next/static/app.js");
  assert.equal(await script.text(), "public-static-asset");
});
test("private API and admin requests are never served from public shell cache", async () => {
  const w = worker();
  await w.run("install");
  w.offline();
  for (const path of ["/api/ai", "/api/health", "/admin/users"])
    assert.equal(await w.fetch(path, "navigate"), undefined);
});
test("cache upgrades preserve unrelated application caches", async () => {
  const w = worker();
  await w.caches.open("other-app-cache");
  await w.caches.open("dreamers-shell-old");
  await w.run("activate");
  assert.ok(w.stores.has("other-app-cache"));
  assert.ok(!w.stores.has("dreamers-shell-old"));
});

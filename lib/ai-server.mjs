import { createHmac } from "node:crypto";
export const json = (data, status = 200) =>
  Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
/** @param {Request} request */
export async function readBody(request) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error("Missing body");
  let size = 0;
  const chunks = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 20000) {
      await reader.cancel();
      throw new Error("Request is too large");
    }
    chunks.push(value);
  }
  const all = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    all.set(chunk, offset);
    offset += chunk.length;
  }
  return JSON.parse(new TextDecoder().decode(all));
}
/** @param {(string|number)[]} command */
export async function redis(command) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error("Quota service unavailable");
  const r = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    signal: AbortSignal.timeout(4000),
    cache: "no-store",
  });
  if (!r.ok) throw new Error("Quota service unavailable");
  const data = await r.json();
  if (data.error) throw new Error("Quota service unavailable");
  return data.result;
}

/** @param {Request} request @param {string} key */
export function quotaIdentity(request, key) {
  const ip =
    request.headers.get("x-vercel-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    "unknown";
  const network = createHmac("sha256", key)
    .update(ip)
    .digest("hex")
    .slice(0, 32);
  const day = Math.floor(Date.now() / 86400000),
    minute = Math.floor(Date.now() / 60000);
  return {
    network,
    day,
    daily: `dreamers:quota:day:${day}:${network}`,
    burst: `dreamers:quota:minute:${minute}:${network}`,
  };
}
/** @param {string} daily @param {string} burst */
export async function consumeQuota(daily, burst) {
  return redis([
    "EVAL",
    "local d=tonumber(redis.call('GET',KEYS[1]) or '0'); local b=tonumber(redis.call('GET',KEYS[2]) or '0'); if d>=12 or b>=3 then return 0 end; redis.call('INCR',KEYS[1]); redis.call('EXPIRE',KEYS[1],90000); redis.call('INCR',KEYS[2]); redis.call('EXPIRE',KEYS[2],120); return 1",
    2,
    daily,
    burst,
  ]);
}
export function aiConfiguration() {
  const key = process.env.AI_API_KEY,
    model = process.env.AI_MODEL,
    provider = process.env.AI_PROVIDER || "groq";
  if (
    !key ||
    !model ||
    !["groq", "openai-compatible"].includes(provider) ||
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN
  )
    return null;
  const endpoint =
    process.env.AI_BASE_URL ||
    (provider === "groq"
      ? "https://api.groq.com/openai/v1"
      : "https://api.openai.com/v1");
  try {
    if (new URL(endpoint).protocol !== "https:") return null;
  } catch {
    return null;
  }
  return { key, model, provider, endpoint };
}

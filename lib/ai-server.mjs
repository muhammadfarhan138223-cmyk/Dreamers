import { AI_LIMITS } from "./ai-limits.mjs";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
export const json = (data, status = 200, headers = {}) =>
  Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store", ...headers },
  });
/** @param {Request} request */
export async function readBody(request, limit = 20000) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error("Missing body");
  let size = 0;
  const chunks = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > limit) {
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

const guestName = "__Host-dreamers-learner";
function learnerId(request, key) {
  const token =
    request?.headers
      .get("cookie")
      ?.split(";")
      .map((s) => s.trim())
      .find((s) => s.startsWith(guestName + "="))
      ?.slice(guestName.length + 1) || "";
  const [id, signature] = token.split(".");
  if (
    !/^[a-f0-9-]{36}$/.test(id || "") ||
    !/^[a-f0-9]{32}$/.test(signature || "")
  )
    return null;
  const expected = createHmac("sha256", key)
    .update("guest:" + id)
    .digest("hex")
    .slice(0, 32);
  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
    ? id
    : null;
}
export function guestQuotaCookie(request, key) {
  if (
    !request ||
    !key ||
    learnerId(request, key) ||
    new URL(request.url).protocol !== "https:"
  )
    return null;
  const id = randomUUID(),
    signature = createHmac("sha256", key)
      .update("guest:" + id)
      .digest("hex")
      .slice(0, 32);
  return `${guestName}=${id}.${signature}; Path=/; Max-Age=2592000; HttpOnly; Secure; SameSite=Lax`;
}
/** @param {Request} request @param {string} key */
export function quotaIdentity(request, key) {
  const ip =
    request.headers.get("x-vercel-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    "unknown";
  const group = createHmac("sha256", key).update(ip).digest("hex").slice(0, 32);
  const learner = learnerId(request, key);
  const network = learner
    ? createHmac("sha256", key)
        .update("actor:" + learner)
        .digest("hex")
        .slice(0, 32)
    : group;
  const day = Math.floor(Date.now() / 86400000),
    minute = Math.floor(Date.now() / 60000);
  return {
    network,
    group,
    day,
    daily: `dreamers:quota:day:${day}:${network}`,
    burst: `dreamers:quota:minute:${minute}:${network}`,
  };
}
/** @param {string} daily @param {string} burst @param {boolean} cached @param {string} group */
export async function consumeQuota(
  daily,
  burst,
  cached = false,
  group = "unknown",
) {
  const day = Math.floor(Date.now() / 86400000),
    minute = Math.floor(Date.now() / 60000);
  return redis([
    "EVAL",
    "local hit=ARGV[1]=='1'; local caps={60,6,240,18,800,24}; local codes={-1,-2,-3,-4,-5,-6}; for i=1,6 do if (i%2==0 or not hit) and tonumber(redis.call('GET',KEYS[i]) or '0')>=caps[i] then return codes[i] end end; for i=1,6 do if i%2==0 or not hit then redis.call('INCR',KEYS[i]); redis.call('EXPIRE',KEYS[i],i%2==0 and 120 or 90000) end end; return 1",
    6,
    daily,
    burst,
    `dreamers:quota:network-day:${day}:${group}`,
    `dreamers:quota:network-minute:${minute}:${group}`,
    `dreamers:quota:global-day:${day}`,
    `dreamers:quota:global-minute:${minute}`,
    cached ? "1" : "0",
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

export function quotaFailure(reason, now = Date.now()) {
  const minute = [-2, -4, -6].includes(reason);
  const period = minute ? 60000 : 86400000,
    reset = (Math.floor(now / period) + 1) * period;
  const retryAfter = Math.max(1, Math.ceil((reset - now) / 1000));
  const personal = reason === -1 || reason === -2;
  const error = personal
    ? minute
      ? `Please pause for ${retryAfter} seconds. This device can send ${AI_LIMITS.perMinute} AI requests per minute.`
      : `This device has used today's ${AI_LIMITS.daily} new AI requests. Your saved answers and book activities still work.`
    : minute
      ? `AI is busy with other learners. Try again in ${retryAfter} seconds; your books and offline practice still work.`
      : "The shared AI service has reached its daily safety budget. Your books, saved answers and offline practice remain available.";
  return json(
    {
      error,
      limitType: minute ? "minute" : "daily",
      retryAfter,
      resetAt: new Date(reset).toISOString(),
      limits: AI_LIMITS,
    },
    429,
    { "Retry-After": String(retryAfter) },
  );
}
// Only operational model identifiers are public; never keys, tokens or provider URLs.
export function publicAiModel() {
  const provider = process.env.AI_PROVIDER || "groq";
  const model = process.env.AI_MODEL || "";
  return {
    provider: ["groq", "openai-compatible"].includes(provider)
      ? provider
      : null,
    model:
      /^[a-zA-Z0-9._:/-]{1,160}$/.test(model) &&
      !/^(?:gsk_|sk-|AIza)/.test(model)
        ? model
        : null,
  };
}

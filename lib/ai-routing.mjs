const supported = new Set(["openai/gpt-oss-120b", "openai/gpt-oss-20b"]);
export function routedModels(provider, model) {
  if (provider !== "groq" || !supported.has(model)) return [model];
  const configured = process.env.AI_FALLBACK_MODELS;
  const fallback =
    configured === undefined
      ? ["openai/gpt-oss-20b"]
      : configured
          .split(",")
          .map((s) => s.trim())
          .filter((s) => supported.has(s));
  return [...new Set([model, ...fallback])].slice(0, 2);
}
// One alternate model at most. Never retry authentication/validation failures or wait
// past the request budget; provider Retry-After never causes a same-model retry.
export async function completeWithRouting(config, body, timeoutMs = 18000) {
  const deadline = Date.now() + Math.max(500, Math.min(18000, timeoutMs));
  let last;
  const candidates = routedModels(config.provider, config.model);
  for (const [i, model] of candidates.entries()) {
    const remaining = deadline - Date.now();
    if (remaining < 500) break;
    try {
      const response = await fetch(
        config.endpoint.replace(/\/$/, "") + "/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${config.key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...body, model }),
          cache: "no-store",
          signal: AbortSignal.timeout(
            Math.min(
              remaining,
              i === 0 && candidates.length > 1 ? 10000 : 18000,
            ),
          ),
        },
      );
      if (response.ok || ![429, 500, 502, 503, 504].includes(response.status))
        return response;
      last = response;
    } catch (error) {
      if (i === candidates.length - 1 && !last) throw error;
    }
  }
  return (
    last ||
    Response.json(
      { error: "Provider temporarily unavailable" },
      { status: 503 },
    )
  );
}

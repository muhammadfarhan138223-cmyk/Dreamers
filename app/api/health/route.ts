import { AI_LIMITS } from "@/lib/ai-limits.mjs";
import { routedModels } from "@/lib/ai-routing.mjs";
import { publicAiModel, guestQuotaCookie } from "@/lib/ai-server.mjs";
import { HOSTED_BOOKS } from "@/lib/hosted-books.mjs";
export function GET(request: Request) {
  const cookie = guestQuotaCookie(request, process.env.AI_API_KEY);
  return Response.json(
    {
      status: "ok",
      version: "0.5.12",
      storage: "device-local",
      ai: {
        ...publicAiModel(),
        limits: AI_LIMITS,
        models: routedModels(
          process.env.AI_PROVIDER || "groq",
          process.env.AI_MODEL || "",
        ),
      },
      hostedBooks: HOSTED_BOOKS.length,
      aiConfigured: !!(
        process.env.AI_API_KEY &&
        process.env.AI_MODEL &&
        ["groq", "openai-compatible"].includes(
          process.env.AI_PROVIDER || "groq",
        ) &&
        process.env.UPSTASH_REDIS_REST_URL &&
        process.env.UPSTASH_REDIS_REST_TOKEN
      ),
      accountsConfigured: false,
    },
    {
      headers: {
        "Cache-Control": "no-store",
        ...(cookie ? { "Set-Cookie": cookie } : {}),
      },
    },
  );
}

import { publicAiModel } from "@/lib/ai-server.mjs";
import { HOSTED_BOOKS } from "@/lib/hosted-books.mjs";
export function GET() {
  return Response.json(
    {
      status: "ok",
      version: "0.5.10",
      storage: "device-local",
      ai: {
        ...publicAiModel(),
        limits: { daily: 12, perMinute: 3, scope: "shared-network" },
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
    { headers: { "Cache-Control": "no-store" } },
  );
}

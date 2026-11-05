import { HOSTED_BOOKS } from "@/lib/hosted-books.mjs";
export function GET() {
  return Response.json(
    {
      status: "ok",
      version: "0.5.8",
      storage: "device-local",
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

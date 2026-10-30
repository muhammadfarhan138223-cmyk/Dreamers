# Deployment

Repository: https://github.com/muhammadfarhan138223-cmyk/Dreamers
Vercel team: PERSONAL (`team_jwuAswY9vD3bNmcKQM2LqjoF`)
Vercel project: dreamers-learning (`prj_iBQ97PXJcJd0SVdtUeivIIYZeMZd`)
Runtime: Node 24, framework Next.js, build `npm run build`, install `npm ci`.

No production deployment has been verified yet. No secrets are required for the offline guest release.

## Owner AI configuration

Use the Vercel environment variable UI; never paste keys into chat or public source. Configure once per environment:

- AI_PROVIDER: `groq` or `openai-compatible`
- AI_MODEL: selected model ID
- AI_API_KEY: encrypted secret
- AI_BASE_URL: optional HTTPS chat-completions base URL, default Groq
- UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN: durable quota/cache service. The API must fail closed without it.

A live AI request must be tested after credentials are configured. Missing credentials return an honest service-unavailable message; no fake response is provided. Check actual provider pricing and quotas; free unlimited usage is not promised.

## Future accounts

NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY are planned. No Supabase project has been selected or changed, and no migrations applied. A service-role key must never be sent to a browser.

## Verification checklist

Run typecheck, tests, production build, browser navigation and real offline reload/practice/persistence. Verify manifest and icons over HTTPS. PWA installation depends on browser support and must not be inferred from a shortcut. Test accounts/RLS and live AI only after setup; do not mark them verified beforehand.

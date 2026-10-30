# Owner AI setup and evidence limits

Checked against provider documentation on 30 October 2026. No owner key is configured and no real provider response has been evaluated. Examples below are deployment configuration, not a promise of availability or accuracy.

## Free pilot recommendation

Start by evaluating **Groq / `openai/gpt-oss-120b`** on the Free plan. It is currently a production text/reasoning model, supports JSON responses and appears in the official free quota table. The currently published base Free limits are 30 requests/minute, 1,000 requests/day, 8,000 tokens/minute and 200,000 tokens/day, shared at organization level; whichever limit is hit first applies. Your console limits and current model access are authoritative. These are the provider's allowances, not a per-student entitlement. Dreamers additionally restricts each guest network to 12 questions/day and 3/minute. Stay on Free; do not enable paid upgrades or paid automatic fallback to follow this pilot plan. Growth may require a different capacity plan.

The older `.env.example` Llama 3.3 70B ID is now listed as Enterprise rather than in the free table. The example has been updated; existing owner deployments are never silently reconfigured. The 20B GPT-OSS model is another free candidate, but must pass the same educational evaluation before any fallback is enabled. No automatic fallback is implemented.

This recommendation is a candidate selection based on availability/capabilities, **not** a tested claim that it is the best Urdu tutor or free of hallucinations. A second model agreeing with the first is not independent factual verification.

Google's Gemini Developer API has free offerings, but its current additional terms prohibit API clients directed towards or likely accessed by under-18s. Its unpaid-service inputs/outputs may also be used for product improvement and reviewed by humans. Do not configure that service for this under-18 product under those terms. Reassess the exact service/terms if they change; a paid tier alone does not establish suitability.

Groq documents that inference data is not retained by default, with exceptions for reliability/abuse monitoring. All customers may enable Zero Data Retention in Data Controls. Enable ZDR for this text-only deployment and avoid stateful/batch/fine-tuning features. This is not a claim of zero metadata collection or automatic suitability for every jurisdiction. Before enabling student access, the adult owner must review current provider API terms and student data requirements. Do not send student names, contact details, private notes or entire copyrighted books.

Official sources:

- https://console.groq.com/docs/models
- https://console.groq.com/docs/model/openai/gpt-oss-120b
- https://console.groq.com/docs/rate-limits
- https://console.groq.com/docs/reasoning
- https://console.groq.com/docs/your-data
- https://ai.google.dev/gemini-api/docs/pricing
- https://ai.google.dev/gemini-api/terms

## Configure once in Vercel

1. Adult owner creates a Groq account and an API key in https://console.groq.com/keys. Review account Free limits and Data Controls. Students never create provider accounts or keys.
2. Open the existing Vercel **dreamers** project → Settings → Environment Variables. Add `AI_PROVIDER=groq`, `AI_MODEL=openai/gpt-oss-120b`, `AI_BASE_URL=https://api.groq.com/openai/v1` and encrypted `AI_API_KEY`. Never send the key through chat or GitHub; never prefix it with `NEXT_PUBLIC_`.
3. Set encrypted `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` from a dedicated quota/cache database. Use an available free tier only after reviewing its actual current allowance. No resource or subscription is created by this guide. Without durable quota protection the endpoint stays unavailable.
4. Configure Preview separately for the quality pilot. Redeploy so the server receives the variables; never expose keys to the client. Health reports only configuration presence, not provider success.
5. Verify real responses and the rubric below before enabling broad student use. The built-in deterministic tests use isolated test fixtures, not live provider evidence.

## Answer modes

**Provided-text mode is the default.** A supplied textbook question needs a readable selected PDF excerpt. The backend refuses a heading-only request before spending quota. Original foundation questions have bounded original lesson text; these lessons are still educator-unreviewed. The model must return JSON with a supported flag, answer and an exact 20–360-character quotation. The backend checks the quotation against provided text, hides mismatches/malformed/truncated answers and produces a fixed “could not confirm” response when support is absent. Page provenance is labelled student-provided, never independently verified. The entire textbook is not sent or searched. Image-only PDFs need OCR; OCR is not implemented.

**General explanation** requires the student to turn off provided-text mode. Answers are labelled not textbook-verified. Related stories/history remain a separate explicit opt-in, labelled outside textbook scope. A fictional teaching story must be labelled fictional. No invented verses, dates, quotations, exam questions or attributions are allowed by the prompt.

These checks can catch a fabricated quotation or missing context; they do **not** prove that an answer follows from that quotation, that the imported text is correct, or that optional extra context is accurate. Low temperature is for consistency, not a correctness guarantee. No automatic fact checker, OCR, whole-book RAG, educator-approved generated answer bank or guaranteed hallucination detection is claimed. Generated explanations remain labelled AI-generated. Do not publish them as verified answer keys without human review.

## Quality pilot before release

Have a subject teacher prepare a held-out set with source passages and expected answers: routine concepts, numericals/units, Urdu/Roman Urdu, missing context, false premises, incomplete excerpts and attempts to override instructions. Include religious/history exact-text questions where attribution matters. Check factual correctness, passage support, citation match, uncertainty/refusal when unsupported, scope, language clarity and calculation units separately. Record model ID/date/settings and every failure. A small evaluation does not establish universal safety; set and document a teacher-approved acceptance policy before student rollout. Do not invent a success rate without measured results.

On unsupported context, quota exhaustion or provider failure, retain downloaded learning and saved progress. Never silently replace a failed model with a weaker or paid provider.

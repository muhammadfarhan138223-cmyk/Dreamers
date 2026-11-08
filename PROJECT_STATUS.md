# 0.5.12 checkpoint — 2026-11-08

Current milestone: remove known model factual/paraphrasing errors from the first English exercise.101 tests and production build passed before final wording polish. Production b1e4d956cd53410b625f055063ec3d943c37248c / tree9d269ada27fc9a268664b0e0db6fdc0bb3c9345a is READY. Health confirmed120B primary,20B fallback,60/day6/minute per-device limits and signed anonymous cookie issuance. Browser verified chapter recall answer feedback; reload and final prepared-answer checks pending.

Live quality finding: general AI correctly found chapters, counts and pages, but still changed actors/wording in some exercise answers (e.g. Addaas/Bismillah). Do not call generated answers verified. New lib/english-exercise.mjs contains original source-based English/Roman Urdu answers to the8 Section A questions, with supporting pages6–8 and question page9. These responses are explicitly prepared, generated=false, educator-review-pending. They bypass AI and quota, work locally offline in the reader, and are shared with the fullscreen endpoint and offline Short answers. Other chapters/languages continue through bounded source-aware AI and retain uncertainty; no complete authored-answer claim.

Next: protected preview → production, verify prepared answers on the reported page2 question and the game reload/chapter isolation, capture screenshots and update exact verified commits/deployments. Storage v3, shell26; no env/migration changes. Core milestones, missing OCR/current pairing/account/admin/physical Android limitations remain below.

# 0.5.11 checkpoint — 2026-11-08

Current milestone: useful chapter games, per-device AI budgets and bounded provider routing. 100 automated tests and production build passed before final documentation/UI loading polish; final checks, preview and live QA follow. Prior production2074fe231efa1cf1ee18a9f233d64f9c5be16408 / tree62607daa3ba2a3ca17a75e8fcb42d682c9ed47c1 is READY. Its live reader returned actual Journey to Taif exercise Q&A from page2, then correctly answered a short follow-up:8 short questions on PDF9/printed5. No claim all AI wording was correct; final polish shortens answers and avoids dramatic/garbled wording.

Completed in this checkpoint: secure signed HttpOnly anonymous-device quota identity;60 new requests/day and6/minute/device, plus network240/day18/minute and service800/day24/minute protections. Cache hits skip daily new-generation counts, retain burst protection. Existing Groq120B remains primary; one20B alternate on429/5xx/timeouts, no auth/validation retry and no billing/secret changes. The same routing is used by search, tutor, practice and source audit, with bounded deadlines. Optional AI_FALLBACK_MODELS allows only the supported GPT-OSS IDs; default needs no env change.

Games: one-question-at-a-time chapter recall for available mapped MCQ banks, with source links, explanations and saved offline rounds; no invented XP. Eight original Journey to Taif concept MCQs/short questions plus a summary/long answer added from the supplied chapter. Other English chapters are NOT claimed complete. Kidney adventure now appears only in Human Urinary System, not every Biology chapter. My study tools links to chapter games/notes/bookmarks/progress, removing unrelated demo shortcuts. Missing chapter banks get honest read/exercise alternatives. Reader user-message contrast repaired in both themes.

Pending: verify new quota health metadata and genuine AI reply, game progress persistence, selected chapter isolation and final browser screenshots; record exact deploy/commit. Physical Android, other scanned-book OCR, full current official pairing/complete question banks and accounts/admin remain pending. Storage IndexedDBv3 unchanged, shell25. No DB migration or credentials retrieved. Required env unchanged; latest confirmed primary Groq openai/gpt-oss-120b. Historical records follow.

# 0.5.10 checkpoint — 2026-11-08

Current milestone: source-aware reader tutoring and follow-up repair. 95 automated tests passed; final production build and deployment/browser verification follow this source checkpoint. Prior verified production: a8d2d1a4ddcabfbc9738ea21ac14fe66b56b9fdf (0.5.9; tree 0ccb4d01af589855fdb9275798e94d801ab633b6).

Completed: resolve named/numbered chapters before prior chat; bounded structured recent conversation; retrieve relevant readable chapter pages in any mapped local book (up to 40 pages inspected, 6 excerpts sent); source-page links in answers; English XII exact-source text pack (165 pages, 8 pages recovered with local English OCR); reusable offline text index and offline pack cache; simple latest-question/language instructions and clean plain text; keep strict quotation checking and durable quotas. Fixed unrelated keyword expansion in AI Search and removed duplicate chapter-list AI buttons. Reader now follows changed page-link props.

Limits: prepared OCR is English XII only. Other image-only books still need authorized prepared OCR/text and are not claimed readable by AI. OCR is fallible, source-page images are authoritative. English Journey to Taif section A count/page (8, PDF9/printed5) and section B count/page (8, PDF10/printed6) were checked visually; these are not counts of every unit activity and no question-answer accuracy guarantee is implied. No full official current pairing scheme or all-Punjab-book coverage. Account/cloud sync/admin remain pending.

Storage: IndexedDB v3; shell v24, existing PDFs/progress retained. No migrations, credentials or external service changes. Required env unchanged: AI_PROVIDER, AI_MODEL, AI_API_KEY, UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN; optional AI_BASE_URL. Last confirmed production model: Groq openai/gpt-oss-120b. Next: deploy protected preview, verify production with Farhan's exact chapter/follow-up questions and source-page navigation, then record evidence. Historical records follow.

# 0.5.9 checkpoint — 2026-11-05

Current milestone: usability and AI quota feedback hardening. Application checks: 90 tests and production build (including TypeScript) passed. Preview/production deployment and browser QA pending at this source checkpoint; prior verified production remains 0.5.8 / 033f4b916cc7e584612accbcb1c7cc6e26800000.

Completed: normal book search runs locally without AI quota; explicit AI Search; configuration refresh cannot resubmit searches; visible result summary/focus; collapsible filters; shared animated loading feedback with reduced-motion support; clearer dark/light action colors; book options and advanced tutor settings collapsed; single chapter activity selector; duplicate reader page controls removed. Shared durable limits remain 12 new AI requests/day and 3 requests/minute per network. Cached responses skip new daily generation consumption while retaining burst protection. Errors distinguish minute/day reset windows; health exposes safe provider/model identifiers, never credentials.

Partially implemented: responsive styling awaits actual browser QA; comprehensive device/accessibility coverage pending. Known limits: no OCR, account/cloud sync, full current official pairing scheme or complete reviewed question bank. Scans remain readable but not searchable as text. Existing 16 resources remain 11 catalogued textbooks + 5 support/reference resources, not all Punjab textbooks.

Storage/migrations: IndexedDB v3 unchanged; shell v23 preserves PDF caches and saved learning. No cloud migrations. Env unchanged: AI_PROVIDER, AI_MODEL, AI_API_KEY, UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN; optional AI_BASE_URL. No secrets pulled or changed. Next task: protected preview checks, production deployment, verify actual provider/model and search/filter/theme/reader/study flows in browser, then record exact commits/deployments. Historical records follow.

# DREAMERS project status

Updated: 2026-11-05. Current release: **0.5.8 — book reader, search and simple AI teacher**.

## Verified release

- Latest verified application commit: `033f4b916cc7e584612accbcb1c7cc6e26800000`, exact tree `98e0dad792d7866af264c765b7f81cb15920128d`.
- Live: https://dreamers-sooty.vercel.app/books
- Repository: https://github.com/muhammadfarhan138223-cmyk/Dreamers
- Vercel project `dreamers` / `prj_ol5nVtQ2DprVqMgNY140bM86Lsvu`, team `team_jwuAswY9vD3bNmcKQM2LqjoF`. Preview `dpl_AvhwWezEqpk9VdAeD13p4nE466Ju` and production `dpl_5xx1ejpMYt7BhZsRcnYakwSKQbYV` READY. Stable health returned 0.5.8, 16 hosted books and AI configured. Preserve preview protection.
- 88 automated tests, TypeScript and production build passed. The resumed session changed documentation/screenshot only, so these checks were not unnecessarily repeated.

## Completed

- Direct in-app reading of 16 exact supplied PDF resources: 11 catalogued textbooks, two grammar resources, two earlier editions and a reference workbook (259 MB total). Students do not upload files. Opening a book transfers only that exact copy, verifies SHA/size, saves its Blob in IndexedDB and prepares the reader for offline reuse. Optional PDF export, existing personal copies and progress remain intact.
- Reproducible build preparation from vetted sources; generated PDFs excluded from Git. Fifteen genuine cover/title-page previews. Biology XII supplied collection lacks a cover. This is not every Punjab XI/XII book.
- One-page PDF rendering, horizontal touch swipe, keyboard arrows, bottom controls and page-number entry on Enter/blur. Vertical/pinch reading gestures are preserved by implementation; physical Android gesture testing remains pending.
- Integrated Find page / word replaces index-ready jargon. Local readable-text preparation has progress/stop/resume. Literal search supports common words and numeric years; page requests accept English/Urdu/Arabic digits. Up to12 text results plus matching chapter headings appear in a compact list. Scanned-only books clearly report no OCR rather than pretending their image text is searchable.
- Inline Ask Dreamers in every book: typed words/lines/questions, five languages, Roman Urdu default, simpler follow-up button, bounded relevant passage/recent conversation and book-specific saved answers. Saved answers reopen on the device. New AI answers require internet; the AI does not see scanned page images.
- Fullscreen teacher accepts general questions in unmapped books without substituting Biology. Strict source-only mode continues to require a readable passage. Beginner/friendly prompts start with simpler wording/examples and allow explicitly requested related background separately from exam scope.
- Earlier offline packs/practice/XP, original science chapter banks, local exercise extraction, games, notes/bookmarks, flashcards/revision, assessment history, source appendices and local backups preserved. Their coverage/review limits remain; see CHANGELOG and roadmap.

## Browser verification

- 0.5.7/0.5.8: Pakistan Studies PDF opened directly; Urdu page query jumped to11, keyboard advanced to12; scanned-word search showed its actual limitation. Biology kidney search prepared252 pages, returned original-text snippets and opened result page13.
- 2026-11-05: genuine configured-provider question about aain received a Roman Urdu school-classroom analogy. I still don't understand produced a different school-canteen analogy. Both replies and their questions survived closing/reloading/reopening the saved book. This tests interaction/persistence, not factual completeness.
- Fullscreen teacher: Pakistan Studies selection showed Ask about a word or idea, enabled general Send, blocked Send when source-only was selected without a passage, then re-enabled it when general mode was restored. No extra provider call was needed for this boundary check.
- Screenshot: `docs/screenshots/reader-tutor-0.5.8.png`. Full disconnected-browser and physical Android installation/airplane-mode testing remain unverified; worker-disconnection/IndexedDB/gesture-boundary tests pass.

## Partial features and known limitations

- Missing First Year books, remaining exact-edition chapter maps, Biology XII cover, comprehensive reviewed question banks and current official board pairing remain outstanding. Do not call the current bank every possible MCQ or all syllabus coverage.
- AI replies are general generated explanations, not verified textbook answers. They can over-simplify or show raw Markdown despite style instructions; educator review remains needed. Source-quotation checks do not prove every claim.
- Scanned PDFs need OCR before literal word search/automatic passage extraction; students can type a word/line into the teacher now. No image interpretation is claimed.
- Accounts, dedicated Supabase/RLS, authenticated cloud sync/guest migration, secured admin, complete adaptive/readiness workflows and advanced media remain planned. Guest events stay local and are never called cloud-synced.
- First opening needs internet for the chosen PDF/reader assets. Browser storage clearing/eviction can remove local copies. Progress JSON excludes full PDF bytes/indexes.

## Database and configuration

IndexedDB v3, shell v22 and preserved PDF engine cache6.4.299. No cloud migration or new service/dependency. Existing settings store holds latest12 reader-chat messages per book. Owner-only server env: AI_PROVIDER, AI_MODEL, AI_API_KEY, UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN; AI_BASE_URL optional. Production keys/quotas unchanged; no secrets retrieved or committed. Students supply no keys. Shared durable guest-network allowance remains12/day and3/minute.

## Exact next task

Test touch swipe, install and airplane-mode reading on physical Android; address actual device failures. Then expand missing authorised First Year resources and educator-reviewed question coverage. Preserve direct Read/no-student-upload, verified-vs-generated separation and source-only safeguards. Read this file, architecture, deployment, changelog and roadmap before continuing; do not regenerate the app.

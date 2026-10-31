# DREAMERS project status

Updated: 2026-10-31. Release 0.4.2 — focused study, private offline PDFs and source-extract practice. Read this file and the roadmap/architecture/deployment/changelog before editing.

## Verified application

Latest verified application commit: 185b44c52149d75ae83db7ed1e4126abbd703481.
Application tree: 2913b5125e7ff83daf447d1d052244be965a4cab.
Preview: dpl_BU6k2PeDPmTTKSzcaHXhfnMtNiiP — READY.
Production: dpl_54xPk1bQtrvsah1trPVCEzmxZxv9 — READY, stable alias assigned.
Live: https://dreamers-sooty.vercel.app
Repository: https://github.com/muhammadfarhan138223-cmyk/Dreamers
Vercel project: dreamers / prj_ol5nVtQ2DprVqMgNY140bM86Lsvu / team_jwuAswY9vD3bNmcKQM2LqjoF. Never deploy to the unused dreamers-learning project. Documentation-only checkpoint commits may deploy identical application code.

## Completed in this release

- New class → one subject → chapter workspace, saved focus, colorful cards, light default for new devices, dark/light/system settings, short Q&A first and five learning tabs. Four-item mobile bottom navigation; optional tools collapsed. Sticky mobile tabs account for the header. Physical-device testing is pending.
- PDF shelf follows selected subject/class with an all-books option and an early Add PDF button. Private full-PDF import, SHA-256 duplicate prevention, auto-classification, offline Blob reader, selectable-text indexing/search, page resume/export/removal remain working. Existing private imports are not automatically shared with other devices or students.
- Sixteen canonical supplied PDF identities, seven checked maps and 86 headings. Biology XI was not supplied; Biology XII is a chapter collection without a cover/edition page. Unmatched private imports do not inherit checked chapter maps. Chapter labels use heading/page rather than invented ordinal chapter numbers.
- Online `/api/study` creates up to three short questions/statement MCQs or one long question per selected readable page. Policy v3 requires exact contiguous source-extract answer keys, quote/key checks and a separate model support audit. Short/MCQ keys have ≥20 characters; long keys have 300–1800 characters and need ≥600 source characters. Source keys retain book language; question wording may be translated. Simplification/translation/stories use separately labelled AI explanations.
- Saved question sets and MCQ choices work locally and survive reload/update and JSON backup. Content revision IDs prevent changed questions inheriting old answers. Earlier policy sets remain stored/exportable, but are withheld until regenerated. Generating questions does not award XP.
- AI configuration now refreshes on window focus/reconnection. Search checks health again before reporting missing setup. Tutor explicitly receives original lesson text; private unmatched PDF references have their own context rather than default Biology grounding. Optional related-story mode is off by default.
- Owner AI/Upstash configuration is present in production and genuine teacher/search/practice calls succeeded. Metadata was checked without decrypting credentials. Secret rather than Config types work; no key re-entry is needed.

## Earlier working scope preserved

Three original foundation science packs: 12 lessons, 36 MCQs, nine written self-checks, diagrams and light simulations. Offline attempts/drafts, resumable scored challenges, deduplicated XP, levels/achievements, notes/bookmarks, flashcards/revision, evidence summaries, backups and deletion. Global search covers checked headings, downloaded lessons and indexed private PDF passages, with subject/class/book/result filters and online AI topic discovery. Full PDF word search needs selectable text and indexing. No OCR is implied.

PWA manifest/icons, HTTPS, standalone shell v13, separate preserved PDF.js engine cache and IndexedDB v3. Queued guest events remain local and are never described as cloud-synced. No cloud migration or unrelated project change.

## Verification

56 tests pass; production build includes successful TypeScript checks. Tests cover source-answer expansion rejection, malformed quotes/keys/audits, exact long extracts, shared quota, API origin/body bounds, worker network failures, storage upgrade, backup of source sets/choices/focus and existing progression/search behavior. Initial corrupted generated Turbopack cache was resolved by deleting only .next and rebuilding.

Live 0.4.2: health configured=true, manifest standalone, shell v13 and deployment/alias READY. Browser imported and rendered the actual supplied 252-page Biology XII PDF privately. Genuine v3 generation produced three short questions and two statement MCQs with exact source keys. Answers were inspected; selected MCQ feedback survived reload, and short sets persisted through shell update. Both themes inspected; dark secondary-button computed contrast verified after transitions. Earlier live checks covered original-source tutor, private-PDF tutor, AI topic search, profile link, global filters and all main HTTPS routes/assets/API boundaries.

Quality finding: matching quotations and a second model audit still accepted unsupported expansion (long answers and a definition inferred from an outcome list). V3 therefore checks answer keys deterministically as source extracts. Questions still need educator review for relevance/ambiguity; the source itself is not independently verified. Generated AI tutoring is not hallucination-free. See docs/VERIFICATION.md for history. Positive live v3 long generation, physical Android installation/airplane mode and mobile viewport emulation were not verified; browser tools exposed no network/viewport controls.

## Partial / pending

- Complete chapter question banks/coverage tracking: current generation is page-sized, not a whole chapter or full syllabus. Teacher-reviewed questions and source correctness remain pending.
- Biology XI copy, exact publisher editions and current official board pairing scheme/exclusions. PECTAA listing references XI Annual 2026; linked scheme could not be retrieved, and 2027 is not verified. No scheme-based deletion, weightage or readiness claim has been applied.
- Nine scan/support/legacy maps need review. OCR, whole-book AI retrieval and reliable exam-scope mapping remain pending.
- Accounts, dedicated Supabase/RLS migrations, authenticated cloud sync/guest migration, secure administration, full readiness/adaptive plans and advanced media remain pending. No public chat or insecure admin operations enabled.

## Privacy, environment and known limits

Restricted supplied PDF bytes are absent from public Git/Vercel. Students import permitted copies once on each device; JSON progress backups exclude PDF bytes/indexes, so keep/export originals separately. Browser eviction remains possible. Original attachments unchanged.

No environment needed for guest offline learning. Production AI: AI_PROVIDER, AI_MODEL, AI_API_KEY, UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN; AI_BASE_URL optional. All six currently target production as sensitive variables. No secrets retrieved/printed/committed. Preview has no AI credentials by design. Tutor/search/practice share durable guest-network limits (12 actions/day, 3/minute); practice generation may use two bounded provider calls. Provider exhaustion fails gracefully. Students never enter keys.

Database migration status: IndexedDB v3 unchanged; no cloud migration. Existing unrelated Supabase resources untouched. Existing Vercel SSO retained. No paid resource created. No known blocking production error; browser/device coverage and educator review remain incomplete.

## Exact next task

Obtain the missing Biology XI PDF and a retrievable official pairing scheme for the student's actual examination year. Review one complete source chapter, add teacher-reviewed Q&A/MCQs and explicit multi-page coverage tracking. Evaluate v3 question relevance and long extracts against sources. Then implement whole-book retrieval and the dedicated authenticated Supabase/RLS/sync milestone while preserving all local work.

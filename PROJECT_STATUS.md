# DREAMERS project status

Updated: 2026-10-31. Current working release: 0.4.2 source-extract practice keys. 0.4.1 is live; 0.4.2 deployment verification pending.

## Verified release

Latest verified application commit: 3f6ef8c088d33e30ad0a2339310ca8eda71d03d7.
Production deployment: dpl_HoViS5YKXXBqXsNDh3NmyC9YoTna — READY.
Live: https://dreamers-sooty.vercel.app
Repository: https://github.com/muhammadfarhan138223-cmyk/Dreamers
Vercel: dreamers / prj_ol5nVtQ2DprVqMgNY140bM86Lsvu / team_jwuAswY9vD3bNmcKQM2LqjoF.
Documentation-only checkpoint commits may deploy identical application code.

## Completed

- Colorful responsive home/learn, original brand, light/dark/system themes, subtle decorative motion and reduced-motion CSS; clear book→chapter→read/ask flow and class/resource filters.
- Sixteen unique supplied PDF identities registered by SHA-256/byte size. The additional six-file intake added five identities and skipped one exact Urdu Grammar duplicate. Seven checked maps contain 86 headings, including nine Computer XI chapter starts checked visually. Practical Geography is a class-unconfirmed workbook; older Psychology remains a legacy elective reference.
- Private multi-file PDF import, automatic source/class matching, exact duplicate skipping, full local Blob storage, canvas reader, selected text, local search/indexing, page resume, separate export/removal. Recognized files bypass optional manual fields. Actual Biology/Chemistry pages and all 11-file intake were browser-verified.
- Default provided-text AI mode rejects heading-only textbook requests, requires a matching quotation, withholds malformed/truncated output and labels explicit general explanations not textbook-verified. Quotation matching does not establish factual correctness; real model evaluation remains pending. Current free-pilot candidate and owner steps are in docs/AI_SETUP.md. Source-specific tutor/search suggestions. Suggestion selection updates its topic ID and clears stale PDF context. Textbook focus is default; related stories/history require explicit enrichment opt-in and separate labelling. Pending-map sources need a readable selected PDF excerpt. Watermark-only scans are not treated as OCR.
- Three original foundation packs, 12 lessons, 36 MCQs, nine written self-checks, diagrams/osmosis lab, atom/motion tools, saved attempts/drafts, resumable scored challenges, deduplicated XP/levels/achievements, flashcards/review schedules, notes/bookmarks, progress evidence and JSON backup/restore/deletion.
- PWA manifest/icons, HTTPS, versioned shell v12, separately preserved PDF.js engine cache, IndexedDB v3, atomic pending queue and storage recovery. Optional packs require explicit download and SHA-256/schema checks. No progress is described as cloud-synced.

- Header avatar now navigates to profile via a keyboard-accessible link and 44px touch target. Global search scans all checked chapters, downloaded foundation lessons and local PDF indexes, with subject/class/book/result-type filters below the search box. Filtered PDF ranking happens before result limits. Search/page links support manually imported book IDs.
- Bounded `/api/search` discovery returns validated catalogue IDs and keywords using the owner's AI provider; only typed queries are sent, never private books. Search and tutor share durable network quotas; local results remain available when AI is offline/unconfigured. Current-word text requires indexed selectable PDF pages; no OCR is implied.

## Verification

53 tests, TypeScript and production build passed for 0.3.3. Preview dpl_88VpqTxwwYYeqFphGZbrysygr1v1 and production dpl_HoViS5YKXXBqXsNDh3NmyC9YoTna reached READY at the exact application commit above; stable alias assigned. Expanded anonymous live regression passed, including search/profile routes and search origin/input/configuration boundaries. Browser verified header DP→profile, header Python search returning XI and XII chapters, class filter narrowing to XI, combined subject/book/result-type filters, Clear filters, new keyword resetting to all books, and light/dark layouts. A 949-byte original QA PDF was imported/indexed privately; global electron search returned page 2 and its encoded local-book link opened that exact passage. This is QA-only local data, not a seventeenth public source. Canonical catalogue remains 16 identities/86 checked headings. No real provider result, mobile device install or OCR evaluation is claimed. Earlier PDF/source evidence remains in docs/VERIFICATION.md.

## Partial / pending

- Nine scan/support/legacy maps remain unreviewed and excluded from topic suggestions. No on-device OCR or whole-book semantic retrieval is implemented.
- Exact publisher editions and current board exam inclusion/exclusion notices remain unverified. Biology starts at chapter 13 without a cover/edition page. Grammar and legacy references are not promoted into current FSc syllabus.
- AI adapter, server-only credentials, durable Redis network quotas, validation, bounded references and caching are implemented. Owner AI and Upstash variables are now configured as sensitive values in production. Live health reports configured; a real search returned the relevant kidney chapter. Initial source-only tutor returned an unsupported refusal despite supplied lesson evidence. Explicit sourceText prompt fix is in this release; useful live tutor/practice responses still need verification. Quotation checks cannot establish semantic correctness.
- Accounts, authenticated cloud sync, dedicated Supabase/RLS migrations, administration, full syllabus question banks/readiness and advanced media remain pending. Physical Android installation/airplane-mode verification remains pending.

## Privacy / deployment boundary

Supplied Computer/Physics/Chemistry files contain reproduction restrictions. Public Git/Vercel deployment includes metadata/maps, not restricted full PDF bytes. Students import their own copies once via Textbook PDFs → Choose PDFs from device. The QA browser's saved copies are not storage on a student's phone. Original attachments remain unchanged. JSON progress backups exclude PDF bytes/indexes; export books separately. Browser eviction can remove local storage, so retain originals.

Known environment issue: local development preview did not hydrate; production did. A shared Turbopack generated-cache conflict was resolved by stopping preview and regenerating .next. No known blocking production issue was observed; device coverage is incomplete.

Database migration status: IndexedDB v3 active; no cloud migrations applied. Existing unrelated Supabase project remains untouched. No new paid resource created.

Required environment: none for guest learning. Owner AI: AI_PROVIDER, AI_MODEL, AI_API_KEY, UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN; AI_BASE_URL optional. Configure secrets securely in Vercel, never chat/GitHub; students never supply keys.

## Exact next task

Verify this focused release in preview and production, then evaluate useful tutor and generated practice responses against source text with teacher-reviewed cases. Inspect further PDFs by hash/cover/edition before adding source metadata. Complete the nine pending maps without inventing headings or syllabus; verify current board notices/exclusions. Obtain publisher permission/permitted official URLs before shared full-PDF distribution. Configure owner AI/quota service and verify a real response. Then select/create a dedicated Dreamers Supabase project with confirmed organization/cost for accounts/RLS/sync. Preserve all local work and queues; read these checkpoint documents before editing.

## 0.4.0 focused study checkpoint

- Class → one subject → chapter focus, persisted on device. Colorful class/subject cards, light default for new devices, five learning tabs (short Q&A first), four-item mobile navigation and optional collapsed tools. Existing theme preference remains.
- PDF shelf follows selected subject/class with an explicit all-books option. Private full PDFs remain locally readable; no copyrighted PDF bytes enter public Git or deployments. Biology XI was not supplied; only Biology XII is registered. Unmatched private books never inherit a checked chapter map.
- Source-page practice API creates up to three original short answers/MCQs or one long answer per request. Exact quote and answer-key structure checks; source-bounded prompt; shared durable tutor/search quotas and network-private one-hour cache. Generated wording is review-pending, never official questions or full-chapter coverage. Saved sets and MCQ attempts live in IndexedDB settings and work offline. No XP for generation.
- Focused AI uses selected readable PDF text; generic private PDF context is supported without substituting Biology lesson grounding. Scans without selectable text remain readable but cannot generate practice without OCR.
- Health state refreshes on focus/reconnection; global search rechecks health before declaring owner configuration missing. Six required/optional AI and quota variables were verified by metadata only, without decrypting credentials; all currently target production.
- Official PECTAA listing mentions Grade XI Annual 2026. Linked scheme PDF could not be retrieved; 2027 scheme is not verified. No invented chapter weightings, exclusions or pairing map were applied.
- Local verification: 55 tests pass, production build including TypeScript passes. Initial generated Turbopack cache failed; deleting only .next and rebuilding resolved it. Live/browser verification of 0.4.0 is pending. No cloud migration or unrelated resource change.

Next: verify source-grounded real tutor and practice, mobile focus flow and saved practice reload; deploy verified application; then obtain Biology XI and a retrievable official pairing scheme for the student's actual exam year. Full chapter batch orchestration remains pending.

## Live 0.4.0 QA and 0.4.1 corrective checkpoint

Application 4e4a6592d2f665f7446fe532ea01777fb18cca4f, preview dpl_Ff4d2R2P83QGNtzYKEjU4qzXnAft and production dpl_Btc1vGjyL2wg7XPD34hJ4HZtgTt8 reached READY. Stable alias verified; production health aiConfigured=true. Existing HTTPS route/icon/manifest/API-boundary regression passed. Real Groq source-only diffusion tutor returned a correct definition and ATP statement supported by its original lesson.

Browser verified class XI Biology focus and its missing supplied book message, original Q&A/MCQs/feedback, subject persistence through update/reload, focused shelf, private 949-byte original QA PDF import/read, genuine short and MCQ generation from that page, matched answer/source quotation, saved questions across reload and genuine private-PDF tutor response. Generated sets were local; no supplied restricted PDF was published.

Long-answer QA revealed unsupported expansion despite a matched quote. 0.4.1 now requires ≥600 source characters for long mode and a second model audit checking every question/answer claim against source. Unsupported items are withheld; audit failure fails closed. Practice policy/cache version changed; older generated sets remain in IndexedDB/backups but are withheld until regenerated. This is still probabilistic AI checking, not teacher review or a guarantee of accuracy. Each new generation may make two bounded provider calls within one shared student allowance action. Content-derived revision IDs prevent old MCQ choices attaching to changed questions.

Physical mobile/Android installation and airplane-mode tests remain pending; browser backend provides no viewport/network emulation. Automated worker/network-disconnected and IndexedDB backup checks cover the offline layer. Current source-audit build and live QA will be recorded after verification.

## 0.4.2 source-answer correction

Further live checks showed the model audit could accept an inferred ectotherm definition from a learning-outcome list and could accept roles not explained on that single page. Correct general knowledge is still not evidence from the selected source. Therefore practice policy v3 requires every answer key to be an exact contiguous source excerpt (whitespace-normalized), in addition to quotation, MCQ structure and model audit checks. Short keys must contain at least 20 characters; MCQs use source statements; long keys require 300–1800 source characters and a fuller source page. Out-of-source answer claims now fail deterministic validation. Questions still need educator review for relevance/ambiguity. The separate AI tutor remains generated and cannot be described as hallucination-free.

Questions may be translated; answer keys retain the original source language. Ask AI provides separately labelled simplification/translation and optional stories. Earlier generated policies remain saved/exportable but are withheld from current practice until regenerated. Do not claim complete chapter coverage from page batches.

Latest verified core/audit application: 5709c8149dc3f9630ee14baf57e868f337ccff80; production dpl_5DXpeE9CtSuBFVNk8zqDcbzQwZKx READY and configured. Cosmetic application 2ec7c2f530f9dc54b17af104279f44cae09fc551 passed build/preview. It adds an early PDF import button, source page labels rather than misleading artificial chapter numbers, larger bottom-nav labels and sticky tabs below the mobile header. 56 tests and production build pass for local 0.4.2. No new dependency or database migration.

Exact next task: deploy and verify v3 source-extract practice using the actual supplied Biology PDF, preserve local books/attempts, record final deployment; then source teacher review, Biology XI and an official current-year pairing scheme.

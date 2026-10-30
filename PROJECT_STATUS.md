# DREAMERS project status

Updated: 2026-10-30. Current release/milestone: 0.3.3 profile navigation and global book search — live and verified.

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
- PWA manifest/icons, HTTPS, versioned shell v10, separately preserved PDF.js engine cache, IndexedDB v3, atomic pending queue and storage recovery. Optional packs require explicit download and SHA-256/schema checks. No progress is described as cloud-synced.

- Header avatar now navigates to profile via a keyboard-accessible link and 44px touch target. Global search scans all checked chapters, downloaded foundation lessons and local PDF indexes, with subject/class/book/result-type filters below the search box. Filtered PDF ranking happens before result limits. Search/page links support manually imported book IDs.
- Bounded `/api/search` discovery returns validated catalogue IDs and keywords using the owner's AI provider; only typed queries are sent, never private books. Search and tutor share durable network quotas; local results remain available when AI is offline/unconfigured. Current-word text requires indexed selectable PDF pages; no OCR is implied.

## Verification

53 tests, TypeScript and production build passed for 0.3.3. Preview dpl_88VpqTxwwYYeqFphGZbrysygr1v1 and production dpl_HoViS5YKXXBqXsNDh3NmyC9YoTna reached READY at the exact application commit above; stable alias assigned. Expanded anonymous live regression passed, including search/profile routes and search origin/input/configuration boundaries. Browser verified header DP→profile, header Python search returning XI and XII chapters, class filter narrowing to XI, combined subject/book/result-type filters, Clear filters, new keyword resetting to all books, and light/dark layouts. A 949-byte original QA PDF was imported/indexed privately; global electron search returned page 2 and its encoded local-book link opened that exact passage. This is QA-only local data, not a seventeenth public source. Canonical catalogue remains 16 identities/86 checked headings. No real provider result, mobile device install or OCR evaluation is claimed. Earlier PDF/source evidence remains in docs/VERIFICATION.md.

## Partial / pending

- Nine scan/support/legacy maps remain unreviewed and excluded from topic suggestions. No on-device OCR or whole-book semantic retrieval is implemented.
- Exact publisher editions and current board exam inclusion/exclusion notices remain unverified. Biology starts at chapter 13 without a cover/edition page. Grammar and legacy references are not promoted into current FSc syllabus.
- AI adapter, server-only credentials, durable Redis network quotas, validation, bounded references and caching are implemented. Owner credentials/quota service are absent; real provider output/compliance remains unverified. Valid requests return honest 503, never fake answers.
- Accounts, authenticated cloud sync, dedicated Supabase/RLS migrations, administration, full syllabus question banks/readiness and advanced media remain pending. Physical Android installation/airplane-mode verification remains pending.

## Privacy / deployment boundary

Supplied Computer/Physics/Chemistry files contain reproduction restrictions. Public Git/Vercel deployment includes metadata/maps, not restricted full PDF bytes. Students import their own copies once via Textbook PDFs → Choose PDFs from device. The QA browser's saved copies are not storage on a student's phone. Original attachments remain unchanged. JSON progress backups exclude PDF bytes/indexes; export books separately. Browser eviction can remove local storage, so retain originals.

Known environment issue: local development preview did not hydrate; production did. A shared Turbopack generated-cache conflict was resolved by stopping preview and regenerating .next. No known blocking production issue was observed; device coverage is incomplete.

Database migration status: IndexedDB v3 active; no cloud migrations applied. Existing unrelated Supabase project remains untouched. No new paid resource created.

Required environment: none for guest learning. Owner AI: AI_PROVIDER, AI_MODEL, AI_API_KEY, UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN; AI_BASE_URL optional. Configure secrets securely in Vercel, never chat/GitHub; students never supply keys.

## Exact next task

Configure owner provider/model/key and the dedicated quota service securely in Vercel, redeploy and verify real AI tutor/search responses with teacher-reviewed cases. Inspect further PDFs by hash/cover/edition before adding source metadata. Complete the nine pending maps without inventing headings or syllabus; verify current board notices/exclusions. Obtain publisher permission/permitted official URLs before shared full-PDF distribution. Configure owner AI/quota service and verify a real response. Then select/create a dedicated Dreamers Supabase project with confirmed organization/cost for accounts/RLS/sync. Preserve all local work and queues; read these checkpoint documents before editing.

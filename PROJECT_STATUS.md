# DREAMERS project status

Updated: 2026-10-30

Current milestone: 0.2.1 guest offline science library and personal full-PDF reader. Milestones 1–4 have working foundation scope. Milestone 5 has a real server integration awaiting owner configuration.

## Completed

Responsive dashboard, original SVG identity and PWA icons, themes/navigation; three original science chapters (Biology cells, Chemistry atoms/ions, Physics motion), 12 lessons, 36 MCQs and 9 written self-check questions. Interactive diagrams, qualitative osmosis lab, atom charge counter and motion calculator. Optional Chemistry/Physics packs download only at student request, with SHA-256/schema validation. Pack removal preserves progress. Global evidence and subject-specific practice, written drafts, flashcards, bookmarked lessons and resumable chapter challenges are supported.

IndexedDB learning/activity records, atomic pending queue, versioned offline shell, deduplicated XP/levels/achievements, local content search, notes, revision schedules, read-aloud and JSON progress export/restore/deletion are implemented. JSON backups preserve legacy Biology IDs and the newer science IDs.

Personal textbook library (/books): full local PDF Blob import (100 MB/file), SHA-256 deduplication, page rendering, selectable text extraction, resumable index (up to 1,500 pages/book), English/Urdu local text search, last-page resume, PDF export and local deletion. The complete versioned PDF.js engine is cached separately on first opening (about 5 MB); books remain in IndexedDB. Image-only scanned PDFs render but have no OCR. JSON progress backups exclude PDF bytes/text; export books separately. Official catalogue links are provided; no full official textbook PDF has been downloaded, verified or redistributed.

A selected page excerpt (up to 2,000 characters) can be attached to an AI question. It is sent only on explicit question submission and is treated as untrusted reference text. The assistant is instructed to cite the PDF page and disclose missing information. This is selected-page context, not whole-book retrieval or verified curriculum grounding.

## Verification and commits

Latest verified deployed application commit: 2902e3efdf76f4795593deee7bbba7963592ed44 (0.2.1).
Science production deployment: dpl_HugnhbmuUCppHqtQPNAy8JJ8kmQo — READY. Live Chemistry download, question answer/feedback and storage flow passed.
PDF release checks: 36 automated tests include actual PDF.js parsing, Blob persistence, metadata merge, scoped deletion, backup exclusions, English/Urdu search, v1→v3 storage preservation and offline worker/engine-cache serving. TypeScript, all 36 tests and production build passed. Live PDF import, two-page rendering, indexing, keyword search, page-2 resume after full navigation, AI reference attachment and honest 503 setup handling passed. Exported PDF matched the original file byte for byte. See docs/VERIFICATION.md for coverage/limits.
PDF production deployment: dpl_HKXbLyx2SkUiLcakPPuBgUCuqYSM — READY. Production: https://dreamers-sooty.vercel.app — Git-linked project dreamers, prj_ol5nVtQ2DprVqMgNY140bM86Lsvu.
Local storage: IndexedDB v3 adds books/bookPages and a bookId index without deleting learning data. Cloud database migrations: none applied. Existing unrelated Supabase project left unchanged.

## Partially implemented / pending

AI adapter supports Groq/OpenAI-compatible completions, server-only secrets, input/origin/size limits, timeouts, token limits, durable Redis network quotas and scoped caching. Real AI/provider responses remain unverified until owner setup. No fake responses are used. Accounts, authenticated cloud sync, RLS migrations, administration and semantic/whole-book AI retrieval remain pending. Queued guest work is local and is not described as synchronized.

## Known limits

Original science content awaits educator review and official XI/XII mapping. Official PECTAA catalogue direct fetch encountered Bot Verification; eLearn Grade 11 fetch returned an error. No full official PDF/edition or redistribution permission has been verified. Physical Android installation/offline and large/scanned/Urdu PDF device testing remain pending. Budget-device storage can be evicted by the browser; students should retain/export PDFs. No exam-readiness percentage is invented. No runtime monitoring drain is configured.

Required environment: none for guest learning. AI: AI_PROVIDER, AI_MODEL, AI_API_KEY, UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN; AI_BASE_URL optional. Configure secrets in Vercel, never chat or GitHub. Students never supply keys.

Exact next task: inspect any textbook embed codes supplied by the owner and verify their publisher, edition, embedding permission and actual PDF download availability. An iframe alone does not provide offline bytes or AI text access. Verify permitted full textbook URLs, or accept publisher/user-provided PDFs; configure owner AI and durable quota service, then verify a real response. Select/create a dedicated Dreamers Supabase project only with confirmed organization/cost; do not reuse another project's database. Read checkpoint documents before further edits.

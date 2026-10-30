# Architecture

Next.js 16 App Router, React 19 and TypeScript; Tailwind 4 with a compact original CSS design system. A catch-all app route rejects unknown API paths and renders one learning workspace, and client history navigation keeps downloaded learning usable without route fetches. API routes remain server-only and are excluded from service-worker caches.

## Local-first boundary

`dreamers-local` IndexedDB version 3 has `packs`, `events`, `queue`, `notes`, `cards`, `settings`, `assessments`, `books`, `bookPages` stores. Activity and pending queue entries are committed in the same transaction. Lesson IDs are stable and first-correct rewards are derived from unique question IDs: repeating activities cannot generate additional XP. Attempts keep full local history; latest answers identify unresolved mistakes. Atomic transaction completion is awaited before success UI.

The public shell cache stores the HTML root and its referenced Next.js static chunks. Navigations use the network when available and the cached public shell when offline. AI, account and admin endpoints are never cached. The initial compact original pack is included in shell preparation and materialized to IndexedDB on first use. Optional packs will require explicit download. Pack removal preserves progress.

Guest data is not cloud synchronized. Queue entries are retained for the account milestone. Future sync must use authenticated ownership, idempotent event UUIDs, server-validated XP and per-user RLS. Never treat device XP as trusted competitive currency.

## Content

The pack schema contains stable IDs, original source attribution, edition status, objectives, topics, difficulty, marks and answer explanations. It is explicitly unmapped to official textbook editions. The command-line import validator rejects broken topic references, duplicate IDs, invalid answer keys and missing rights metadata. Reviewed claims require reviewer/date provenance. UI-based reviewed publication remains an administration milestone. Do not claim curriculum coverage from this demo.

## Privacy

No account or personal details are required. Display names and class preferences are local. No trackers, public student profiles, messaging or leaderboards. Exports contain private learning data and must remain in the student's control. Server APIs must not log question text or raw identifiers.

## Cloud roadmap

Supabase PostgreSQL + Auth are intended for a dedicated project. Do not reuse unrelated MovieHub/SARAS tables. No database migrations have been applied. Accounts must be verified before enabling private API operations; authorization must use server-controlled roles. AI fails closed without durable quotas. Admin routes currently expose no data and no actions.

## Recovery

JSON backups are schema/size checked and merged in one IndexedDB transaction. Newer local notes survive older imports; events retain unique IDs and restored events are queued. Pack bytes from backups are ignored; reinstallation uses the app-owned resource. The starter seed marker prevents user-removed packs from silently reappearing on reload.

## Chapter assessment checkpoint

Version 2 adds the assessments store without modifying existing stores. Chapter runs persist shuffled question IDs, answers, navigation index and an optional absolute deadline. Finalization writes the completed run and idempotent per-question event/queue records in a single transaction. A pending answer write is awaited before scoring to avoid timer/selection races. An unfinished run resumes after reload. Test scores describe the starter chapter, never full-syllabus readiness.

## Optional science catalog

`scripts/build-catalog.mjs` validates the three explicit original packs and creates shared metadata (IDs, subject/chapter paths, bytes and SHA-256). Only Biology is in the compact starter shell. Chemistry and Physics need explicit download. The installer checks the exact raw digest and schema before committing; content removal keeps historical evidence. Lesson/question IDs are globally unique and legacy IDs remain unchanged. The server AI selects among the same three original packs.

## Personal textbook PDF boundary

PDF.js 6.4.299 is pinned and lazily loaded only when the local reader opens. Build preparation copies the local worker, fonts, character maps and wasm resources from the package; generated resources are not committed. On first opening, a complete engine manifest is fetched and its resources cached in `dreamers-pdf-engine-6.4.299`, independently of shell-cache updates. The manifest is marked ready only after all resources succeed. A failed preparation retains partial resources for retry and never removes the book Blob. The service worker serves engine resources from this versioned cache offline. No PDF scripting viewer, annotation actions or external document links are enabled.

`books` holds full Blobs, digest, user-labelled class/subject/edition and reading/index progress. `bookPages` holds extracted text keyed by book/page with a bookId index. Metadata patches use a single read/write transaction to avoid index/reading-position lost updates. Removal deletes the chosen book and its page index atomically. JSON backups exclude books/pages and include only a book manifest/notice; file export is separate. Whole-device deletion clears PDF stores too.

Imported content is never labelled officially verified. Local search uses selectable text, with no OCR. Explicit selected-page AI context is bounded and validated server-side, included in the cache key, and sent as untrusted user reference data. No whole-book upload, embedding service, public book hosting or copyrighted book redistribution is implemented.

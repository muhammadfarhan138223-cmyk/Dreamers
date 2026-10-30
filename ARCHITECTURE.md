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

## Textbook-first catalogue and scope

`lib/textbooks.mjs` publishes only metadata and checked chapter headings from three owner-supplied PDFs. Exact hashes identify renamed duplicate downloads and attach class/subject/page metadata during private local import. Raw book bytes remain device-local; public redistribution is not configured because supplied copies contain reproduction restrictions. Computer's scan has no OCR implementation. A source catalogue is not an official current examination syllabus.

Home and /learn share LearningHome with original CSS/SVG subject art, actual local learning totals and separate source labels. /books/[catalogueId]/[pdfPage] opens a matched local Blob or prompts for its import; chapter page links are independent of printed-page numbering. /search searches catalogue chapter headings. Foundation packs keep their stable routes and progress.

Tutor requests may select a catalogue ID/chapter ID or an original foundation pack/topic. Server validation rejects cross-book topic IDs and non-boolean enrichment consent. Textbook focus is the default; explicit enrichment enables related stories/history labelled outside textbook scope. Scope/source are part of the cache identity. The tutor has only chapter metadata and optional selected excerpt, not the full uploaded library. Real model behavior remains setup-dependent.

The canonical source metadata is `lib/textbooks-data.json` (16 exact hashes). Grammar resources shared by XI/XII and older reference material have explicit kinds/classes. Pending chapter maps generate no suggestions. Seven source-checked maps contain 86 headings. A Practical Geography workbook has unconfirmed class and a separate reference kind; older Psychology remains a legacy elective reference. Book headings are separate from official exam inclusion/exclusion notices. Text extraction removes known publisher/mirror watermark-only layers and requires meaningful letter content; image-only pages still have no OCR. A pending-map book can support an explicitly selected readable PDF excerpt, never invented chapter context.

Final UI/source boundary: class-labelled file/reader controls distinguish Chemistry XI from XII. Recognized files bypass optional manual metadata fields. Tutor suggestions set the exact topic ID and clear stale PDF context. Pending-map sources require an explicitly selected meaningful PDF excerpt; this never implies whole-book retrieval or OCR. All eleven PDFs have been imported privately on the QA device, with source data preserved across app updates.

## Provided-text answer boundary (0.3.2)

`lib/ai-quality.mjs` implements default provided-text mode. The server rejects supplied-book heading-only requests with 422 before any quota/provider call, validates the PDF page against known page counts, and requests JSON support/answer/quotation. It withholds malformed/truncated/mismatched quotations and never shows an unsupported generated guess. A matched quotation is displayed with student-supplied page provenance, not a verified badge. Semantic entailment and source truth are not automatically checked. An explicit general-explanation control bypasses the reference requirement and labels output not textbook-verified. Policy/provider/endpoint/mode are included in network-scoped cache identity. GPT-OSS requests bound combined output/reasoning to 2048 tokens and omit reasoning from returned output. No provider fallback or new service has been provisioned.

## Global search and profile navigation (0.3.3)

The header avatar uses the same client navigation profile link as the sidebar, with accessible labelling/focus and a 44px target. `components/global-search.tsx` is lazy-loaded. Checked chapter metadata is searched across classes; `db.searchPages` scans IndexedDB using 128-page cursor batches, retaining ranked bounded results instead of loading the complete text index into React. PDF filters are applied before ranking so another book's top results cannot hide all selected-book matches. Subject/class/book/result-type filters work locally and do not invoke AI again. Unknown local-book IDs support encoded page navigation. AI topic suggestions are checked against existing IDs in `/api/search`, with at most six IDs/five terms and no generated factual answer. Quotas/body bounds/Redis handling are shared with tutoring in `lib/ai-server.mjs`; versioned network-scoped caches separate purposes. No private PDF passage is submitted by global search. Scans need actual OCR and are not falsely described as searchable.

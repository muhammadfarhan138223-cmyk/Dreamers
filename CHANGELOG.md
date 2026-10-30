# Changelog

## 0.1.0 — 2026-10-30

First original DREAMERS guest learning release. Includes responsive learning workspace, original identity, local-first Biology pack, practice and progress, revision tools, lightweight illustrations and installable PWA assets. Scope and configuration gaps are documented rather than shown as completed features.

## 0.1.1 — 2026-10-30

Hardened backup restoration, persisted pack-removal choice, stable mistake-review queues, context selection for the AI tutor, first cache upgrade, API path handling, import validation and official curriculum source metadata. Added 19 automated tests and live HTTP verification. Formatted source for maintenance. Remote AI and cloud accounts remain setup-dependent.

## 0.1.2 — 2026-10-30

Added a distinct chapter challenge unlocked after four lessons: shuffled questions, optional timer, per-answer local persistence, resume after reload, atomic scoring/evidence save, explanations and assessment history. Added v1→v2 IndexedDB upgrade coverage and assessment backup validation. Improved light-theme contrast.

## 0.2.0 — 2026-10-30

Added optional original Chemistry and Physics packs: 12 lessons, 36 MCQs and 9 written self-check questions across three sciences. Added a catalog with SHA-256 download validation, subject workspaces, saved practice/drafts/bookmarks, per-pack challenges and local search across downloaded packs. Preserved legacy Biology IDs and progress. AI context supports all three packs but still requires owner configuration.

## 0.2.1 — Personal offline full-PDF shelf

- Added full local PDF import, SHA-256 deduplication, page rendering/resume, selectable-text indexing/search and separate export/removal. No official book bytes are redistributed; imported editions remain unverified.
- Added lazy pinned PDF.js engine with complete versioned offline asset preparation, preserved across shell upgrades.
- Added bounded selected-page AI references with request validation and source limitations; real provider setup remains pending.
- Upgraded IndexedDB to v3 without deleting saved work; JSON backups explicitly exclude PDFs/text indexes.
- Added actual PDF parsing, Blob storage/deletion, multilingual search, backup and offline-engine tests.

0.2.1 release verification: production READY, 36 tests/typecheck/build and live HTTP regression passed. Browser import/render/index/search/resume/AI-context and byte-identical PDF export passed; no official PDF book file or live provider response is claimed.

## 0.3.0 — Textbook-first learning studio

- Redesigned home/learn with colorful subject covers, a clearer chapter-first structure, subtle motion, responsive layouts and reduced-motion support.
- Registered three unique supplied textbook hashes and 31 source-checked chapter headings; exact edition and current exam exclusions remain unverified.
- Added private batch PDF import, automatic matching/classification and duplicate skipping, with deep chapter/page navigation. No restricted textbook binaries are publicly redistributed.
- Replaced generic tutor/search suggestions with selected-book headings, added explicit extra-context/story opt-in and source/scope validation. Live AI setup is still pending.
- Added catalogue identity, cross-book topic and default/opt-in scope tests; 40 automated tests pass.

## 0.3.1 — Expanded supplied-book intake

Registered eight additional unique file identities (11 total), XI/XII and grammar/reference filters, 77 checked headings, and honest pending-map states. Added detection of watermark-only scans. Fixed a tutor suggestion to select its corresponding chapter and clear stale PDF reference text. Preserved private PDF storage and original learning data.

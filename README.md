# DREAMERS

**Learn. Play. Understand. Achieve.**

An incremental, mobile-first learning platform for FSc students. The first release is a real guest learning app with three original science foundation chapters and offline PWA support. It is not a complete Punjab syllabus or a board-approved resource.

Live application: https://dreamers-sooty.vercel.app

## Run

```sh
npm ci
npm run dev
npm run typecheck
npm test
npm run build
```

Open the development URL printed by Next.js. Node 24 is recommended.

## Working features

- Responsive dashboard and dark/light/system themes; original SVG brand and PWA icons.
- 12 original Biology/Chemistry/Physics lessons, cell/osmosis diagrams, atom counter and motion calculator.
- 36 MCQs with explanations, subject practice/history and 9 written self-check answers.
- IndexedDB learning pack, progress events, notes, bookmarks, written drafts and review schedules.
- Versioned public app-shell caching; offline navigation and practice after preparation.
- First-completion XP, meaningful lesson map, 3 achievements, evidence-based progress summaries.
- Saved chapter challenge with optional timer, resume, score and answer explanations.
- Local text search, 12 self-rated flashcards, chapter study plan, data export/restore and device deletion.
- Read-aloud using available browser voices, with text always available.

- Optional science packs use explicit downloads, content validation and SHA-256 integrity checks.
- Personal full-PDF import/reader, resumable selectable-text index/search, reading-position resume, separate PDF export and selected-page AI references. First opening caches about 5 MB of engine resources. Scans have no OCR; imported editions stay unverified.

- Textbook-first colorful home/learn, 86 checked chapter/unit headings from seven maps within 16 unique supplied resources, chapter search and private batch PDF import with automatic hash matching.
- Tutor suggestions follow the selected book; related stories/history require explicit extra-context opt-in. Current exam exclusions and live model behavior remain unverified.

## Explicit limitations

Content is original, educator review is pending, and official edition/chapter mapping is not yet verified. Compulsory-subject lessons and complete syllabus coverage are planned. Accounts, cloud synchronization, administrative operations and semantic AI search are not enabled. Guest events remain queued for a future authenticated migration; they are never silently discarded or described as synced. No exam outcome is guaranteed.

AI requires owner-only environment configuration. Never commit `.env` files. Students never supply API keys. See DEPLOYMENT.md for setup and current verification status.

The authoring import validator and official source register are documented in docs/CURRICULUM_SOURCES.md. Verification evidence and limits are in docs/VERIFICATION.md.

## Continue development

Read PROJECT_STATUS.md, DEVELOPMENT_ROADMAP.md, ARCHITECTURE.md, DEPLOYMENT.md and CHANGELOG.md before edits. Keep each release functional. Verify changes before committing; preserve local guest data across upgrades.

## Content and brand

Learning text, practice questions and production SVG assets are original DREAMERS work. Supplied textbook binaries remain private on the student’s device and are not redistributed in this repository. Official resources should be verified and licensed before import. Source code is private-use by default unless the owner chooses a license; no third-party textbook rights are granted by this repository.

AI configuration and verified current free-provider options: [Owner AI setup](docs/AI_SETUP.md). Provided-text mode is default; quotation matching is a reference check, not automatic factual verification. Remote provider evaluation is still pending.

Global search (`/search`) searches checked chapters across all books, indexed local PDF passages and downloaded foundation lessons. Filter by subject, class, book and result type. Online AI-assisted discovery uses the owner's configured provider; it sends only the query and never silently uploads private books. Full PDF word search requires selectable text and local indexing; scanned pages still need OCR.

### Focused study (0.4.0)
Choose class and one subject on My study. Add your own permitted PDF once, read it offline, then make small source-page short Q&A/MCQ/long-answer sets online and reuse saved questions offline. Original basics are clearly separate from syllabus mapping. Biology XI and current-year official pairing mapping are pending. Generated practice is review-pending and does not establish full chapter coverage.

# DREAMERS

**Learn. Play. Understand. Achieve.**

An incremental, mobile-first learning platform for FSc students. The first release is a real guest learning app with an original Biology foundation chapter and offline PWA support. It is not a complete Punjab syllabus or a board-approved resource.

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
- 4 original cell biology lessons, cell diagram and qualitative osmosis lab.
- 12 MCQs with answer explanations, attempt history, mistake review; 2 short and 1 long self-check answer.
- IndexedDB learning pack, progress events, notes, bookmarks, written drafts and review schedules.
- Versioned public app-shell caching; offline navigation and practice after preparation.
- First-completion XP, meaningful lesson map, 3 achievements, evidence-based progress summaries.
- Local text search, 12 self-rated flashcards, chapter study plan, data export/restore and device deletion.
- Read-aloud using available browser voices, with text always available.

## Explicit limitations

Content is original, educator review is pending, and official edition/chapter mapping is not yet verified. Chemistry, Physics and compulsory-subject content are planned. Accounts, cloud synchronization, administrative operations and semantic AI search are not enabled. Guest events remain queued for a future authenticated migration; they are never silently discarded or described as synced. No exam outcome is guaranteed.

AI requires owner-only environment configuration. Never commit `.env` files. Students never supply API keys. See DEPLOYMENT.md for setup and current verification status.

The authoring import validator and official source register are documented in docs/CURRICULUM_SOURCES.md. Verification evidence and limits are in docs/VERIFICATION.md.

## Continue development

Read PROJECT_STATUS.md, DEVELOPMENT_ROADMAP.md, ARCHITECTURE.md, DEPLOYMENT.md and CHANGELOG.md before edits. Keep each release functional. Verify changes before committing; preserve local guest data across upgrades.

## Content and brand

Learning text, practice questions and production SVG assets are original DREAMERS work. No textbook pages or copyrighted question banks have been copied. Official resources should be verified and licensed before import. Source code is private-use by default unless the owner chooses a license; no third-party textbook rights are granted by this repository.

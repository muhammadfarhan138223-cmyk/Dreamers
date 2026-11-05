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

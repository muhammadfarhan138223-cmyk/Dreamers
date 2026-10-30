# Release verification

Date: 30 October 2026. Test learning activities were created in the agent's browser session only; new student devices start at 0 XP.

## Automated

25 Node tests cover content integrity, answer keys, XP deduplication, latest-answer mistake detection, recall scheduling, service-worker precaching and navigation with fetch forced to reject, offline pack/script access, private API cache exclusion, cache upgrade isolation, IndexedDB atomic event/queue writes, pack removal, backup validation and restoration, and authoring import validation.

`npm run typecheck`, `npm test`, `npm run build` passed. The build uses Next.js 16.4.3 and React 19.2.6.

`node scripts/check-live.mjs https://dreamers-sooty.vercel.app` passed for the first deployed release: main routes, health, manifest, PWA icon dimensions, service-worker headers, AI request origin checks, invalid input rejection and missing-configuration 503. Re-run after the hardening release.

## Browser evidence

The live desktop browser loaded the dashboard and registered the offline shell. Navigating to a lesson, opening the Roman Urdu explanation, bookmarking and completing a lesson worked. The next lesson opened. MCQ wrong-answer feedback and a correct retry worked. Reload retained attempt history; progress showed exactly 35 XP, 1 completed lesson and 50% across two actual test attempts. No arbitrary readiness score was shown.

## Verification limits

A physical Android PWA install and a real browser-wide network-off toggle have not been exercised. Network loss is covered by tests executing the actual worker with all network requests rejected, plus live service-worker readiness and browser reload persistence. Responsive CSS is implemented for mobile/tablet/desktop but this browser exposes no viewport emulation control. Live AI responses, accounts, Supabase RLS and cloud synchronization are not verified because those services have not been configured for Dreamers.

The local development preview rendered a shell but did not hydrate; switching its bundler did not resolve it. The production deployment hydrated and all browser learning interactions above succeeded. Development uses a wrapper to normalize the preview daemon's Vite-style flags for Next.js. Do not rewrite working production logic merely to address that environment-specific preview issue.

The 0.1.1 live regression script passed. Browser checks additionally verified saved written drafts after reload, a service-worker update, and pack removal staying removed after reload. Re-downloading remains available. The 0.1.2 tests add assessment scoring, invalid answer indexes, shuffle integrity, backup records, storage upgrade preservation, and atomic/idempotent finalization. Live challenge QA passed: the saved session resumed at question 2 with one saved answer after reload. A run with three correct answers and nine unanswered questions saved exactly 3/12. History showed that score, and XP rose from 110 to 130 because the already rewarded q1 did not earn XP twice. The v2 upgrade preserved existing notes, written draft, preferences and learning events. The live HTTP regression script passed again for 0.1.2.

## 0.2.0 science catalog

Commit 9447e33e0cec0cd124f7a6ee788a8624f2658ddd passed 31 tests, TypeScript and production build and deployed READY. Live Chemistry pack download and a correct MCQ response saved successfully. Live Physics optional pack download and the constant-acceleration calculator were checked: u=0, a=3 m/s², t=2 s produced v=6 m/s and s=6 m. All pack IDs/digests, backup references and Biology-only achievement rules are tested.

## 0.2.1 full personal PDF library

Story: choose a local PDF → validate/header/hash → persist full Blob in IndexedDB → prepare complete local PDF.js engine cache → render page/extract text → persist/resume index → search locally → attach selected excerpt to explicit AI submission.

Application commit 2902e3efdf76f4795593deee7bbba7963592ed44; preview dpl_77t61rZZSYFUtC8AmxbcggokhnoP and production dpl_HKXbLyx2SkUiLcakPPuBgUCuqYSM both READY. 36 tests, TypeScript and production build passed. Added tests parse an actual original two-page PDF with the pinned PDF.js package; persist/re-read the Blob; merge simultaneous reading/index metadata; delete a book without deleting another book index; exclude PDFs/text from JSON backups; search English/Urdu; preserve v1 storage during the v3 upgrade; and serve the separately cached PDF worker with network requests rejected after shell activation.

The live browser imported the original two-page QA fixture, rendered both pages and extracted their correct selectable text. Full indexing reported 2/2 pages. Searching “electron” matched PDF page 2 and opened it. “Ask AI about this page” attached the correct bounded page excerpt to the tutor. Submission displayed the actual missing-owner-configuration error, with no fake answer. Returning via full navigation and opening the saved book resumed at page 2, retained its 2/2 index and rendered the saved Blob. Export download was compared by SHA-256 against the original QA file and was byte-for-byte identical. QA content was not placed in the public textbook shelf/repository as an official book. Console errors observed in this session came from the browser extension metadata reporter; no application PDF error was observed.

The updated live HTTP regression script passed on the production alias: routes (including /books and new science routes), all three packs, health, manifest/PWA icon dimensions, service-worker headers, PDF asset manifest and JavaScript worker MIME, cross-origin/input rejection, invalid PDF reference bounds and honest 503 configuration handling.

Limits: no complete official textbook file has been fetched or verified. Large real textbook scans, Urdu PDF shaping, encrypted/corrupt books, storage eviction and physical Android airplane-mode reload are not browser-verified. Engine/worker offline behavior is covered by the actual service-worker test with a rejected network; this is not a claim of physical device installation testing. PDF text extraction is not OCR. Provider-generated PDF explanations and whole-book retrieval remain unverified/unimplemented respectively.

## 0.3.0 supplied-source studio

Commit 7b2fbacf8b32d7d04d5bbf958ca45d07316a0034, production dpl_TNJi1Wqfjrd8S9YarzG9ZHAr5MWa, READY. 40 tests/typecheck/build passed. Live home hydrated. Selecting Physics changed the tutor suggestions to Thermal Physics / Simple Harmonic Motion / Physical Optics with textbook focus off-enrichment by default. Three supplied PDFs imported privately in one multi-file selection and matched class/subject/hash metadata. Re-importing Biology reported 0 added / 1 duplicate skipped. The actual 252-page Biology PDF rendered correctly and selected-page text attached to its correct source/chapter. The full live HTTP regression script passed. The protected preview was inspected via authorized Vercel fetch; deployment protection was unchanged.

## 0.3.1 expanded intake (pre-release checks)

11 attached source hashes are unique. Each catalogue fingerprint/byte size was compared against the source file. 42 tests, TypeScript and production build passed. New tests ensure pending/legacy sources contribute no suggested topics and watermark-only scans are not mistaken for extracted learning text. Catalogue contains 77 checked headings in six source maps. Five resource maps remain pending. Grammar and legacy resources are separated from textbook filters. Tutor suggestion selection updates its topic ID and clears an unrelated previous page excerpt. Actual generation compliance, official current board exclusions and physical Android offline installation remain unverified. Live release evidence is appended after deployment.

0.3.1 live verification: application commit ba820a7b89ea20d8f11e0f0ce2d5d2789373b7f7 deployed READY as dpl_6whsHB9Ldq51VcNJ3hkzq1At4NAM. Eight additional PDFs imported privately in one selection, reported 8 added / 0 duplicates and correctly matched all identities. All eleven supplied files remained visible after activating shell v7. XI filtering showed the XI Chemistry resource only in textbook mode. Choosing Chemical Bonding from suggestions updated both the input question and selected chapter; enrichment was off by default and changed only on explicit selection. The actual XII Chemistry PDF opened at PDF page 4 and extracted Group 2 Elements text; the page AI action was enabled. Both light/dark themes were visually inspected. The expanded live HTTP/API script passed.

A final wording/accessibility pass distinguishes XI/XII on library controls and reader headings, makes import metadata optional, clarifies pending-map tutoring and updates the shell to v8. A local Turbopack persistence-cache error was resolved by stopping the development preview and clearing only generated .next build artifacts; the clean production build passed. No student data or source files were removed.

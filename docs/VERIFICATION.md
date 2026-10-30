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

Final application commit e5fd7d69999b029a9f2589b0196d1edd43fb1c51, deployment dpl_6CYtJtGmuwDkqWsCJTKduknEACpA, READY. The final production endpoint checks passed: health 0.3.1, shell v8, pending-map excerpt-only validation (missing context and non-boolean scope rejected with 400), and valid unconfigured AI request returned 503. Class XI/XII is visible in library file controls and reader heading; optional manual import fields are collapsed. The three initial and eight additional source PDFs remained saved across full navigation and app-cache updates. Test-device storage is explicitly separate from a student's phone; public deployment contains metadata only.

## 0.3.2 local verification

48 tests, TypeScript and production build passed. New isolated provider/Redis fixtures exercise the real route: default source gate (422 before any provider call), invalid boolean/page bounds (400), valid matching quote, cache reuse, unsupported-answer discard, fabricated-quote withholding (502), truncated response (502), explicit general-explanation labelling and quota denial (429). No fixture result is a live model output. Catalogue tests enforce 16 unique hashes, 86 checked headings, one Urdu Grammar identity and no unreviewed-source suggestions. Computer XI chapter starts were rendered and visually checked. Supplied files remain unchanged/outside the public repository. Live release QA is pending at this checkpoint.

## 0.3.2 production/browser verification

Application `921e24958614d5c6169547d23ed6485e9c142a2d` passed protected native preview health and production READY verification (`dpl_2c2Jtx7EYwxMNgCMr2unRVTQTBay`, stable alias assigned). `node scripts/check-live.mjs https://dreamers-sooty.vercel.app` passed: routes, manifest/icons, PDF engine assets, origin/input checks, default missing-evidence 422, explicit general mode without owner setup 503, valid evidence without setup 503, and malformed-policy flags 400.

Live browser: 0.3.2 footer, default provided-text checkbox checked and stories unchecked; selecting a heading leaves Send disabled without a passage. Explicitly unchecking evidence enables Send, and submission returned the real owner-configuration service status, never a fake explanation. Applying the service-worker update preserved the offline starter. A fresh QA browser imported the latest six attachments (6 added, 0 duplicates because this browser initially had no books), matched all six to known metadata, rendered actual Computer XI PDF page 4, correctly disabled AI page context for its image-only text layer, and retained all six saved files after reload. The Computer XI reading position persisted as page 4. Exact duplicate attachment detection was also rechecked by source SHA-256 against the catalogue; the new Urdu Grammar file is the existing identity, not a seventeenth entry. Prior-release duplicate re-import UI evidence remains documented above; no new duplicate re-upload is claimed in this run.

The browser file transfer took about ten minutes in this environment; the tool's shorter requested timeout did not interrupt it. This is not claimed as typical student-device performance. Full-page screenshot capture timed out; a normal viewport screenshot succeeded. Physical Android/airplane-mode, model factual/language evaluation, OCR and semantic entailment checks remain unverified. All 16 canonical hashes/byte sizes were checked against unchanged uploaded PDFs. No remote AI credentials or new database resources were provisioned.

## 0.3.3 local verification

53 tests, TypeScript and production build passed before the final small result-reset polish. New regression checks cover cross-class chapters, original lesson matches, known-ID/keyword bounds, filtered cursor searches beyond the initial ranking limit, expanded result limits, shared XI/XII/class-unconfirmed filters, endpoint origin/body/configuration checks, shared tutor/search quota identity and withholding invalid/truncated AI topic maps. Provider/quota responses are isolated test fixtures; real model quality remains unverified. Live profile/search/filter QA is pending at this checkpoint. No database schema change, secret value or textbook binary is part of the release.

## 0.3.3 live verification

Application commit `3f6ef8c088d33e30ad0a2339310ca8eda71d03d7` passed protected preview health and production READY (`dpl_HoViS5YKXXBqXsNDh3NmyC9YoTna`, stable alias assigned). Expanded `check-live.mjs` passed, covering `/profile`, `/search` and search origin (403), blank/oversize input (400), and honest unconfigured response (503). Existing tutoring/PWA/pack/asset checks remained passing.

Browser QA on production confirmed actual header-avatar click→`/profile`; Python search from the header found Computer XI/XII; Class XI left one XI result; changing to immunity reset filters and found Biology XII; combined Subject/Book/Result type narrowed correctly; Clear filters restored both Python results. Both light and dark layouts were inspected. A clearly labelled 949-byte original QA PDF was imported, both pages indexed, and global `electron` search returned its exact page 2 passage. The result opened `/books/book%3A…/2`, showed page value 2, and rendered/extracted the expected original text. That fixture exists only on the QA device, not as an official textbook or public catalogue entry. Screenshot records search/filters and honest owner-configuration status. No private textbook text was sent to an AI service. No real provider/model quality claim is made; full selectable-text indexing, scans/OCR, physical Android and official exam scope retain the limits above.

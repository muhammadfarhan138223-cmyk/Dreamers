## 0.5.10 — 2026-11-08

- Fix reader chat treating every question as a question about the open contents page. Resolve named/numbered chapters, send bounded structured chat, and prioritize the latest request.
- Add exact-source English XII text pack, with eight locally OCR-read scan pages and page provenance. Prepare its offline search index automatically when reading; no student uploads.
- Retrieve relevant chapter excerpts, offer source-page navigation, keep the requested answer language, simplify responses and strip raw formatting artifacts.
- Preserve strict source-quote checks, server-only secrets, durable quotas and bounded requests. No new service or package dependency.
- Tighten AI Search phrase matches and remove redundant per-chapter AI icons. Shell24 preserves existing learning/PDF data.

## 0.5.9 — 2026-11-05

- Separate free local book search from explicitly requested AI topic discovery; prevent health refresh from resubmitting searches.
- Make result completion obvious with focused result summary, counts, stronger Read actions and collapsible filters.
- Simplify book cards, chapter activity selection, reader navigation and advanced tutor controls.
- Improve shared loading animations, reduced-motion behavior and dark/light button visibility.
- Preserve shared durable AI budgets, distinguish minute/day retries and avoid charging cached answers as new daily generations. Expose safe runtime provider/model identifiers without secret values.
- 90 automated tests and production build passed; deployment verification recorded separately.

## 0.5.8 verification completed — 2026-11-05

- Verified live typed question and simpler follow-up in the scanned Pakistan Studies reader; both answers persisted through reload.
- Verified fullscreen general questions stay enabled for the selected unmapped book, while strict source-only mode blocks missing passages.
- Recorded actual browser evidence and remaining physical-device/content-review limits; no application code changed in this documentation checkpoint.

## 0.5.8 — 2026-11-04

- Fix fullscreen tutor selection for unmapped books: allow general questions and retain the chosen book instead of substituting Biology.
- Refine subject-specific beginner explanations and following requested everyday examples after live teaching-quality review.
- Search literal common words without conversational stop-word filtering.
- Search numeric years as text when they are not valid bare page numbers; retain explicit page bounds.
- Keep word-search results compact and disclose their result cap. Shell v22; existing downloads remain intact.

## 0.5.7 — 2026-11-04

- Add mobile swipe and keyboard page turning, bottom navigation, and reliable page-number entry.
- Replace technical index controls with local Find page / word, automatic readable-text preparation, progress/stop/resume and honest scan limitations.
- Add inline book-specific AI questions, language choice, follow-up simplification and saved offline conversation history. Scans accept typed questions without pretending image understanding.
- Support general questions in unmapped books and personal scans while retaining strict source-only validation, shared quotas and server-only credentials. Simplify beginner/friendly teaching across the app and allow explicitly requested related background.
- Shell v21; no database migration or new dependency.

## 0.5.6 — 2026-11-04

- Replaced student PDF import with direct app-hosted reading of the 16 exact supplied books/resources, automatic verified offline copies, transfer progress/cancel/retry and optional PDF downloads.
- Added 15 original cover/title-page thumbnails to the shelf and matching subject cards. Biology XII explicitly lacks a supplied cover. Kept personal copies/progress intact.
- Added reproducible build asset preparation from vetted sources, SHA/size verification, failure-closed builds and no public credential/proxy endpoint. Large generated PDFs stay outside Git.
- Corrected English chapter page links, made new subject visits read-first and improved unavailable-practice guidance. Updated shell to v20.

# 0.5.5 — 2026-11-04

- Add a separate Exercise MCQs tab that reads questions directly from the local textbook PDF, preserves page links and saves attempts. Use checked keys for three Biology XII chapters, with ungraded self-check for other extracted questions. Incomplete and image-only layouts may need the printed PDF.
- Add mapped offline concept MCQs, short answers, long answers and topic notes to Chemistry XI, Chemistry XII and Physics XII. Chemistry XII now fills its book-appendix mock.
- Expand the first Biology XII chapter from 7 to 21 concept MCQs and Human Reproductive Systems from 4 to 9. Existing IDs and saved progress are preserved.
- Shell v19. Source PDF bytes and extracted text remain on the learner’s device.

# 0.5.4 — 2026-11-04

- Add 74 original MCQs, 74 short answers and 13 long-answer models across the 13 Biology XII chapters. Topic notes link to pages in the registered copy. The existing Chapter 14 mission and practice remain available.
- Present one question at a time, retain local progress, and offer MCQs → short answers → long answers → next chapter. The available bank fills the Biology XII book-appendix mock.
- Open the chosen book and page from the subject workspace. General tutor questions can be sent immediately, and a reader-selected excerpt keeps strict evidence mode.
- Separate optional starter downloads from app startup, and show consistent loading and recovery states for device storage, PDF reading and online AI.
- Shell v18. No database migration or publisher PDF bytes in the release.

# 0.5.3 — 2026-11-04

- Add the official PECTAA Biology XI Annual 2026 paper reference under Test, with per-chapter objective and short-question counts, timing, long pairs, and a direct board link.
- Keep the reference session-specific and separate from Biology XII book appendices and 2027 preparation.
- Shell v17. No database migration, account or secret changes.

# 0.5.2 — 2026-11-04

- Add a resumable original eight-checkpoint Kidney Courier mission for Class XII Biology and Chapter 14 practice with eight MCQs, three short answers and one long answer.
- Add offline chapter, custom term, custom half and full mapped-book scopes, timed sampled MCQs with a saved latest score, and written self-check.
- Assemble a book-appendix mock only if every offered chapter slot and long-question part has a saved question. Show the missing question slots otherwise.
- Put Learn, Test and Play first, with the pairing source under a disclosure. Shell v16.

# 0.5.1 — 2026-11-04

- Put supplied textbook entries and private saved copies in one mobile cover gallery with class and offline filters.
- Link to PECTAA's published editions, including Biology XI. The publisher download and private save steps are separate. Chapter maps still require a matching supplied file hash.
- Highlight literal local search matches, name the mapped chapter, and open its exact PDF page with the highlighted excerpt ready for the online tutor.
- Add scoped passage selection in the subject tutor and basic public-home SEO metadata, robots and sitemap.
- Shell v15. No database migration or textbook PDF bytes in the deployment.

# 0.5.0 — 2026-10-31

- Add four source-linked book paper plans with actual chapter groups, attempt rules and source/year/verification labels; preserve all chapters.
- Register five books' pattern/model appendices, including a partial Urdu instruction page. Exclude inspected appendices from chapter preparation bounds.
- Add durable per-chapter practice preparation with manual pause/resume, existing-set reuse, request spacing and explicit unreadable/exercise/unsupported gaps.
- Persist chapter/mode/language selection; show five practice questions per screen and retain source page labels.
- Shell v14; IndexedDB v3 and existing progress remain unchanged.

# 0.4.2 — 2026-10-31 (live and verified)

- Require practice answer keys to match the selected source verbatim; a matching quote and model audit alone proved insufficient in live QA. Original generated questions retain review-pending status.
- Keep answer extracts in the book's language; question language and separately labelled AI simplification/translation remain available.
- Withhold older generated policies while preserving their stored records and backup.
- Shell v13; no cloud migration or new dependency.

# 0.4.1 — 2026-10-31

- Add an independent model source-support audit after quote checks; withhold unsupported questions. Long-answer generation requires fuller source text. This reduces unsupported expansion, without claiming educator verification.
- Preserve older generated sets in backup while withholding them pending regeneration with the new check.
- Version question choices by content so regenerated questions do not inherit stale answers.
- Align sidebar class with selected study focus; add an explicit optional story/analogy switch and ground original-basics tutoring in the full selected pack.
- Offline shell v12; source practice/focus/choice backup regression test.

# 0.4.0 — 2026-10-31

- Replace crowded home with class and single-subject study focus, colorful cards, short Q&A first and simple mobile navigation.
- Focus private offline PDF shelf; keep unmatched imports separate from checked maps.
- Add source-page short/MCQ/long practice with exact quotation checks, shared quotas and offline saved sets/answers.
- Refresh stale AI configuration status on focus/reconnect; explicitly include lesson evidence in tutor requests.
- Keep current pairing schemes and Biology XI marked unavailable rather than inventing coverage.

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

Final 0.3.1 clarity pass: show class on PDF selection/export/removal/reader controls, keep manual import fields optional, and explain why a pending-map source requires readable PDF text for tutoring.

0.3.1 verified live at commit e5fd7d69999b029a9f2589b0196d1edd43fb1c51: 42 tests/typecheck/clean build, source-specific UI/scope controls, private 11-file intake, duplicate skip, reload preservation, Biology/Chemistry page rendering and current HTTP/API checks passed. Publisher-restricted PDFs are not publicly redistributed.

## 0.3.2 — Evidence-aware tutor and additional books

- Added five unique PDF identities (Computer XI, Practical Geography workbook, older Psychology XII, Tarjuma-tul-Quran XII, Pakistan Studies XII); skipped a byte-identical Urdu Grammar attachment. Registered 16 total identities and 86 checked headings, with nine chapter maps still pending.
- Added explicit class-unconfirmed workbook classification and dynamic subject filters; retained separate grammar/legacy categories.
- Defaulted tutor to provided-text evidence, refused heading-only textbook answers before provider calls, validated page bounds, checked returned source quotations and withheld malformed/incomplete/mismatched answers. General model knowledge requires an explicit control and is labelled not textbook-verified. A quotation check is not semantic fact verification.
- Updated free-pilot model example and owner guide from current official documentation. No real provider/key/account/service configuration is claimed. Added deterministic quality and route regression tests. Shell v9 preserves all device storage.

## 0.3.3 — Profile navigation and cross-book search

- Made the header avatar a keyboard-accessible profile link with a 44px touch target.
- Added lazy global search over all checked textbook headings, streamed IndexedDB PDF text indexes and downloaded original lessons. Added subject/class/book/result-type filters below search, ranked page expansion and direct local PDF page navigation.
- Added bounded online AI topic discovery with validated existing catalogue IDs/terms, explicit generated relevance labels and honest configuration/offline/failure states. Only queries leave the device; private PDFs/notes are not uploaded. Search and tutor share durable quota protection.
- Preserved IndexedDB v3 and PDF engine caches; shell v10 refreshes application assets. Current board exclusions, scanned-page OCR and real provider evaluation remain pending.

0.4.2 verified application: 185b44c52149d75ae83db7ed1e4126abbd703481; production dpl_54xPk1bQtrvsah1trPVCEzmxZxv9. Real supplied-PDF source-extract short/MCQ generation, saved sets/choices and shell update persistence passed.

0.5.0 live UI/source/upgrade and real quota-pause persistence passed at f6a6c2542399f8e3c12275479035085683d24abe. Positive multi-page generation remains fixture-verified only.

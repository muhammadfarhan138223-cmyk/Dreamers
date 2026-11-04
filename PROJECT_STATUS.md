# DREAMERS project status

Updated: 2026-11-04. Current checkpoint is 0.5.5, textbook exercise extraction and expanded science practice. Read the roadmap, architecture, deployment and changelog before changing code.

## Current checkpoint

- 0.5.5 adds locally extracted textbook exercise MCQs and topic practice for all mapped chapters in Chemistry XI, Chemistry XII and Physics XII. Biology XII Chapters 13 and 17 have more original questions.
- Real-PDF extraction found 134 Biology XII, 143 Chemistry XI, 144 Chemistry XII and 71 Physics XII readable exercise items. OCR-damaged and scanned pages may not yield questions. Checked exercise answers cover Biology XII Chapters 13, 14 and 17. Remaining extracted questions save choices without grading.
- Other subjects and unreviewed exercise keys remain outstanding. These banks do not establish complete subtopic or 2027 board coverage.

- 0.5.4 adds an original offline Biology XII bank for all 13 chapters, with selectable topic notes and source-page mapping. Available content covers selected topics rather than every textbook paragraph or possible exam question. Other books retain checked chapter maps where available and can use saved practice or page-grounded generation.
- MCQ → short → long → next chapter with one question at a time, local answer/review progress and mock assembly from the registered book’s appendix. The applicable 2027 official scheme is unverified.
- Main loading releases the app before optional network pack setup. The tutor accepts general questions without a PDF and preserves strict evidence for selected passages. Source PDFs remain device-local.

- 0.5.1 gallery/search release verified on the production alias. GitHub 1ba17633d6690da7712db7f6abe040df75c326d8. Protected preview dpl_2JBxqZSe9m2zh7ZGhTBDtiKdqLKt and production dpl_J1DWgfgYn9aWtWny6SF7vpAhc9sY were READY.
- 0.5.2 is live at GitHub 4f27cd62b2983e2ba52d20b72d52fee2d65d026f, preview dpl_99Wu2EpsqGoFU8M6JsDviy94Gd8S and production dpl_F8PohCrwwkBUJjPeTbcx5sx8SUN9 (READY). Browser checks covered mission feedback and reload persistence, quiz score and full-paper gaps.
- 0.5.2 adds offline Kidney Courier (eight scenes, progress and missed-scene replay), Chapter 14 original short and long answers, and timed sampled MCQ quizzes with local last score. The full-book blueprint reports uncovered slots until all required questions are available.
- Mobile cover gallery links to publisher editions; they are saved individually via the local file chooser. PECTAA’s Drive publisher download prompted browser verification during QA. Cloud-browser file transfer returned no readable bytes, so fresh-browser real PDF import and disconnect testing are pending for this release.
- Public health returned configured, and a fresh production AI search found Biology XII Chapter 14 for kidney/nephron. All six AI/Upstash metadata entries were production scoped. No credentials changed.
- 0.5.3 adds the official Biology XI Annual 2026 chapter counts and long pairs under Test, verified against BISE Sargodha PDF pp. 55–56. The app applies no exclusions to other sessions.
- Shell v19, IndexedDB v3, no cloud migration, no new runtime dependency.

## Deployment

Live: https://dreamers-sooty.vercel.app
Repository: https://github.com/muhammadfarhan138223-cmyk/Dreamers
Vercel project: dreamers / prj_ol5nVtQ2DprVqMgNY140bM86Lsvu / team_jwuAswY9vD3bNmcKQM2LqjoF.
Use the linked production project and keep the existing preview protection.

## Completed in this release

- New class → one subject → chapter workspace, saved focus, colorful cards, light default for new devices, dark/light/system settings, short Q&A first and five learning tabs. Four-item mobile bottom navigation; optional tools collapsed. Sticky mobile tabs account for the header. Physical-device testing is pending.
- PDF shelf follows selected subject/class with an all-books option and an early Add PDF button. Private full-PDF import, SHA-256 duplicate prevention, auto-classification, offline Blob reader, selectable-text indexing/search, page resume/export/removal remain working. Existing private imports are not automatically shared with other devices or students.
- Sixteen canonical supplied PDF identities, seven checked maps and 86 headings. Biology XI was not supplied; Biology XII is a chapter collection without a cover/edition page. Unmatched private imports do not inherit checked chapter maps. Chapter labels use heading/page rather than invented ordinal chapter numbers.
- Online `/api/study` creates up to three short questions/statement MCQs or one long question per selected readable page. Policy v3 requires exact contiguous source-extract answer keys, quote/key checks and a separate model support audit. Short/MCQ keys have ≥20 characters; long keys have 300–1800 characters and need ≥600 source characters. Source keys retain book language; question wording may be translated. Simplification/translation/stories use separately labelled AI explanations.
- Saved question sets and MCQ choices work locally and survive reload/update and JSON backup. Content revision IDs prevent changed questions inheriting old answers. Earlier policy sets remain stored/exportable, but are withheld until regenerated. Generating questions does not award XP.
- AI configuration now refreshes on window focus/reconnection. Search checks health again before reporting missing setup. Tutor explicitly receives original lesson text; private unmatched PDF references have their own context rather than default Biology grounding. Optional related-story mode is off by default.
- Owner AI/Upstash configuration is present in production and genuine teacher/search/practice calls succeeded. Metadata was checked without decrypting credentials. Secret rather than Config types work; no key re-entry is needed.

## Earlier working scope preserved

Three original foundation science packs: 12 lessons, 36 MCQs, nine written self-checks, diagrams and light simulations. Offline attempts/drafts, resumable scored challenges, deduplicated XP, levels/achievements, notes/bookmarks, flashcards/revision, evidence summaries, backups and deletion. Global search covers checked headings, downloaded lessons and indexed private PDF passages, with subject/class/book/result filters and online AI topic discovery. Full PDF word search needs selectable text and indexing. No OCR is implied.

PWA manifest/icons, HTTPS, standalone shell v13, separate preserved PDF.js engine cache and IndexedDB v3. Queued guest events remain local and are never described as cloud-synced. No cloud migration or unrelated project change.

## Verification

56 tests pass; production build includes successful TypeScript checks. Tests cover source-answer expansion rejection, malformed quotes/keys/audits, exact long extracts, shared quota, API origin/body bounds, worker network failures, storage upgrade, backup of source sets/choices/focus and existing progression/search behavior. Initial corrupted generated Turbopack cache was resolved by deleting only .next and rebuilding.

Live 0.4.2: health configured=true, manifest standalone, shell v13 and deployment/alias READY. Browser imported and rendered the actual supplied 252-page Biology XII PDF privately. Genuine v3 generation produced three short questions and two statement MCQs with exact source keys. Answers were inspected; selected MCQ feedback survived reload, and short sets persisted through shell update. Both themes inspected; dark secondary-button computed contrast verified after transitions. Earlier live checks covered original-source tutor, private-PDF tutor, AI topic search, profile link, global filters and all main HTTPS routes/assets/API boundaries.

Quality finding: matching quotations and a second model audit still accepted unsupported expansion (long answers and a definition inferred from an outcome list). V3 therefore checks answer keys deterministically as source extracts. Questions still need educator review for relevance/ambiguity; the source itself is not independently verified. Generated AI tutoring is not hallucination-free. See docs/VERIFICATION.md for history. Positive live v3 long generation, physical Android installation/airplane mode and mobile viewport emulation were not verified; browser tools exposed no network/viewport controls.

## Partial / pending

- Complete chapter question banks/coverage tracking: current generation is page-sized, not a whole chapter or full syllabus. Teacher-reviewed questions and source correctness remain pending.
- Biology XI copy, exact publisher editions and current official board pairing scheme/exclusions. XI Biology Annual 2026 is verified and labelled as historical. The applicable 2027 scheme is not verified. No scheme-based deletion, weightage or readiness claim has been applied.
- Nine scan/support/legacy maps need review. OCR, whole-book AI retrieval and reliable exam-scope mapping remain pending.
- Accounts, dedicated Supabase/RLS migrations, authenticated cloud sync/guest migration, secure administration, full readiness/adaptive plans and advanced media remain pending. No public chat or insecure admin operations enabled.

## Privacy, environment and known limits

Restricted supplied PDF bytes are absent from public Git/Vercel. Students import permitted copies once on each device; JSON progress backups exclude PDF bytes/indexes, so keep/export originals separately. Browser eviction remains possible. Original attachments unchanged.

No environment needed for guest offline learning. Production AI: AI_PROVIDER, AI_MODEL, AI_API_KEY, UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN; AI_BASE_URL optional. All six currently target production as sensitive variables. No secrets retrieved/printed/committed. Preview has no AI credentials by design. Tutor/search/practice share durable guest-network limits (12 actions/day, 3/minute); practice generation may use two bounded provider calls. Provider exhaustion fails gracefully. Students never enter keys.

Database migration status: IndexedDB v3 unchanged; no cloud migration. Existing unrelated Supabase resources untouched. Existing Vercel SSO retained. No paid resource created. No known blocking production error; browser/device coverage and educator review remain incomplete.

## Exact next task

Obtain a usable official Biology XI copy and confirm chapter headings against that edition. Then add educator-reviewed content and enough diverse questions for all Biology XII pairing slots. Continue to track official board/session confirmation separately from book appendices. Test PDF indexing and offline reload with a fresh mobile browser using a known local PDF. Accounts and sync remain planned.

## 0.5.0 prepared checkpoint — 2026-10-31

At the user's suggestion, PDF endings were inspected with text extraction and rendered-page checks. Found Biology scheme at PDF 247–248 (printed label 2026–27), Chemistry instructions at PDF 262, Computer Science instructions at PDF 141–142, English instructions at PDF 160–161. Chemistry/Computer/English pages do not state an exam year; filenames do not establish one. No official board confirmation has been obtained. Urdu has a partial instruction page at PDF 153 (starts at Q3) and model paper 154–156; no complete Urdu scheme was invented. Scheme/model appendices are linked in the private PDF shelf.

Four opt-in book-based study plans show actual marks, question groups and chapter relationships with source-page links and board-pending status. Biology/Chemistry two-chapter long pairs and Computer single-chapter long questions are distinguished. English unit/grammar sections are mapped as observed. Long-omitted chapters remain available for short/MCQ study. Biology chapters 13–25 and Chemistry 17–33 were checked; Computer 1–9 matches its inspected map.

Last chapter ends now exclude appendix/model pages (Biology246, Chemistry261, English159, Computer140). Chapter preparation saves one page at a time with pause/manual resume, cached-set reuse, 22-second request spacing, visible gaps for scans/exercise-only/unsupported pages, and fail-safe quota/network/storage interruption handling. No closed-app background work or full concept mastery is implied. Preparation journals, selected chapter/mode/language and question choices remain local and backed up. Five questions per screen reduce long scrolling.

64 tests, TypeScript/production build pass. New cases cover interrupted journals after successful question writes, replay without duplicate provider calls, pause/offline state, exercise gaps, language/policy coverage, scheme totals/source bounds and retained non-long chapters. Local preview rendered SSR but did not hydrate, matching the prior environment issue; it was stopped. Live browser verification pending. Shell v14, IndexedDB v3 unchanged; no new service, secret, dependency or cloud migration.

Next: push/test preview, release and verify scheme enable/pair navigation, private source links, chapter journal failure/resume and persisted view on production. Then add indexed whole-book retrieval and remaining account/sync/revision milestones.

## 0.5.0 live verification

Production f6a6c2542399f8e3c12275479035085683d24abe / dpl_8pLfgjkQtbouureyDP8J3hGFfDaM READY; protected preview dpl_GjYWcdMPiSe7MB99XWhzs5TrHmM9 READY. Browser preserved a privately imported actual Biology PDF through upgrade, enabled the book plan, showed Ch13 MCQ1/Q2-short3/long13+25 (4+4), navigated to Ecology and correctly bounded it to 19 pages (228–246), then restored chapter/plan through shell update. Source link opened the actual saved PDF247 and rendered/extracted the printed scheme. Chemistry showed Ch17/long17+21; Computer showed75 total and8-mark single-chapter long questions; English showed20+80 and source-defined unit/grammar sections.

Real chapter request returned429 shared-network quota. Journal paused with0/11 (no fake saved pages), exposed manual Resume and retained that state after reload without auto-running. No quota reset/bypass was attempted. Positive multi-page generation, request spacing and interruption recovery are tested with isolated fixtures, not claimed live. Five appendix-bearing source files' SHA256/byte sizes match canonical identities.

Exact next feature: local indexed-book passage retrieval inside focused Ask AI, with explicit chosen source and bounded excerpt. New live AI calls are blocked by this QA network's daily allowance; preserve rate limits. Broader teacher review, official board confirmation, missing Biology XI and dedicated accounts/sync remain pending.

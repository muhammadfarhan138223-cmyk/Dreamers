# Curriculum source register

Inspected 30 October 2026:

- https://pectaa.edu.pk/curriculum-compliance/ — official PECTAA listing. Class XI includes Biology, Chemistry and Physics 11 2025–26 labels; Class XII includes updated Biology and Physics labels dated 27 August 2026 alongside older resources. The site also lists compulsory subjects and religious alternatives. These listing labels alone do not verify chapter contents, redistribution rights, or applicability to a particular examination year.
- https://www.elearn.gov.pk/elearn_app/grades/11 — official Grade 11 science repository. Current textbook edition equivalence has not been established.

The original Cells & membranes pack must remain unverified and unmapped until an educator reviews it against the selected edition. Do not infer chapter numbers from older resources. No PDF or textbook pages have been redistributed.

## Publishing a new pack

Use `node scripts/import-pack.mjs path/to/pack.json` for validation. Add `--publish` only after content/source/rights checks; unreviewed original content must stay labelled unreviewed. The tool writes only a slug-named JSON file beneath public/packs. A reviewed pack requires a reviewer identifier and review date. Deployment and curriculum index updates must be reviewed together.

## Full textbook investigation and personal imports

The PECTAA catalogue's cached listing was inspected on 30 October 2026. Its direct fetch returned a Bot Verification page; no challenge was bypassed and no full XI/XII textbook PDF was fetched. The eLearn Grade 11 request failed (500/timeout). The general official eLearn portal https://www.elearn.gov.pk/ is linked as a source catalogue. Catalogue labels are insufficient to verify an edition, file, applicable exam year or redistribution permission.

The /books library therefore supports student-controlled import of a personally downloaded PDF, with explicit unverified source/edition labels. Files remain local; no textbook bytes are placed in this public Git repository. An iframe/embed can provide an online viewer when the publisher permits embedding, but cannot alone supply offline file access or AI text extraction. Only verified/permitted PDF URLs should be added to a future managed download catalogue; do not scrape around access controls or treat a third-party mirror as an official publisher.

Original Chemistry and Physics practice packs use scientific reference links in their source metadata (OpenStax), but still await educator review and official curriculum mapping. These references are not copied textbook chapters.

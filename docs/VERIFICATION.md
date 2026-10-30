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

The 0.1.1 live regression script passed. Browser checks additionally verified saved written drafts after reload, a service-worker update, and pack removal staying removed after reload. Re-downloading remains available. The 0.1.2 tests add assessment scoring, invalid answer indexes, shuffle integrity, backup records, storage upgrade preservation, and atomic/idempotent finalization. Live challenge QA is pending deployment.

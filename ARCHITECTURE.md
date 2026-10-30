# Architecture

Next.js 16 App Router, React 19 and TypeScript; Tailwind 4 with a compact original CSS design system. A catch-all app route renders one learning workspace, and client history navigation keeps downloaded learning usable without route fetches. API routes remain server-only and are excluded from service-worker caches.

## Local-first boundary

`dreamers-local` IndexedDB version 1 has `packs`, `events`, `queue`, `notes`, `cards`, `settings` stores. Activity and pending queue entries are committed in the same transaction. Lesson IDs are stable and first-correct rewards are derived from unique question IDs: repeating activities cannot generate additional XP. Attempts keep full local history; latest answers identify unresolved mistakes. Atomic transaction completion is awaited before success UI.

The public shell cache stores the HTML root and its referenced Next.js static chunks. Navigations use the network when available and the cached public shell when offline. AI, account and admin endpoints are never cached. The initial compact original pack is included in shell preparation and materialized to IndexedDB on first use. Optional packs will require explicit download. Pack removal preserves progress.

Guest data is not cloud synchronized. Queue entries are retained for the account milestone. Future sync must use authenticated ownership, idempotent event UUIDs, server-validated XP and per-user RLS. Never treat device XP as trusted competitive currency.

## Content

The pack schema contains stable IDs, original source attribution, edition status, objectives, topics, difficulty, marks and answer explanations. It is explicitly unmapped to official textbook editions. A publishing/import validation step must be added before external question banks are accepted. Do not claim curriculum coverage from this demo.

## Privacy

No account or personal details are required. Display names and class preferences are local. No trackers, public student profiles, messaging or leaderboards. Exports contain private learning data and must remain in the student's control. Server APIs must not log question text or raw identifiers.

## Cloud roadmap

Supabase PostgreSQL + Auth are intended for a dedicated project. Do not reuse unrelated MovieHub/SARAS tables. No database migrations have been applied. Accounts must be verified before enabling private API operations; authorization must use server-controlled roles. AI fails closed without durable quotas. Admin routes currently expose no data and no actions.

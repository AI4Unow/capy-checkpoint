# Phase 03: Improvement Plan

Status: draft
Date: 2025-12-19

## Guiding principles
- Fix critical security issues first.
- Minimal churn; avoid refactors unless needed.
- Keep client/server boundaries explicit.

## Phase 03.1 — Security hygiene (must)
1. Stop tracking `firebase_service_account.json` and rotate the compromised key.
2. Add repo-wide ignore rules for `.DS_Store`.
3. Ensure Admin SDK runs in Node runtime only.

Success criteria
- No secrets tracked by git.
- Admin endpoints do not run on edge.

## Phase 03.2 — Gameplay UX correctness (must)
1. Show `SessionSummary` on `GameEvents.GAME_OVER`.
2. Confirm `GO_TO_MENU` / `RESTART` flows reset local state consistently.

Success criteria
- Session summary reliably appears at game over.

## Phase 03.3 — Firebase Admin modularization (should)
1. Create `src/lib/firebaseAdmin.ts` (server-only) exporting `adminDb`.
2. Route handlers import from that module only.
3. Normalize private key formatting from env.

Success criteria
- Single init path; no duplicate initialization logic.

## Phase 03.4 — Abuse controls for AI hint (should)
1. Add request validation for payload shape/size.
2. Add rate limiting (simple in-memory for MVP) or require a per-session token.

Success criteria
- Reduced risk of quota drain.

## Unresolved Questions
- Preferred approach for admin operations: keep API route, or rely on local scripts only?

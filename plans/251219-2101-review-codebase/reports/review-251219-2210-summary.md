# Codebase Review Summary (Mathie)

Date: 2025-12-19

## Top Findings (prioritized)

### Critical
1) **Secret committed to git**: `firebase_service_account.json` is tracked in the parent repo.
   - Impact: full Firebase project admin compromise if leaked.
   - Action: rotate key immediately, remove from repo, purge history if necessary.

### High
2) **Session summary never shown**: `capy-checkpoint-next/src/app/page.tsx` never sets `showSummary` to `true`.
   - Impact: game-over UX incomplete.
   - Action: listen to `GameEvents.GAME_OVER` and enable summary.

3) **Admin upload endpoint hardening needed**: `capy-checkpoint-next/src/app/api/admin/upload-questions/route.ts`
   - Uses Admin SDK init in route file; no explicit runtime.
   - `GET` status endpoint unauthenticated.
   - Action: move admin init to `server-only` module, add `runtime='nodejs'`, auth protect `GET`.

### Medium
4) **Gemini hint endpoint abuse risk**: `capy-checkpoint-next/src/app/api/hint/route.ts` is unauthenticated; can drain API quota.
   - Action: add basic rate limiting and/or require authenticated session.

5) **Phaser wrapper cleanup**: `capy-checkpoint-next/src/game/PhaserGame.tsx` destroys Phaser, but the `'ready'` handler isn’t explicitly removed.
   - Action: ensure listeners removed on cleanup; prefer container ref for `parent` over hard-coded id.

## What’s solid
- Client-only Phaser loading is correct: `dynamic(..., { ssr: false })` in `capy-checkpoint-next/src/app/page.tsx` and `"use client"` in `capy-checkpoint-next/src/game/PhaserGame.tsx`.
- Firebase client SDK is browser-gated: `capy-checkpoint-next/src/lib/firebase.ts`.
- Adaptive learning engine is reasonably modular: `capy-checkpoint-next/src/engine/*` with Vitest coverage.

## Plan artifacts
- `plans/251219-2101-review-codebase/plan.md`
- `plans/251219-2101-review-codebase/phase-01-codebase-map.md`
- `plans/251219-2101-review-codebase/phase-02-risks-and-recommendations.md`
- `plans/251219-2101-review-codebase/phase-03-improvement-plan.md`
- Research: `plans/251219-2101-review-codebase/research/research-251219-2202-nextjs-phaser-firebase-best-practices.md`

## Unresolved questions
- Are Firestore Security Rules defined somewhere (Firebase console / repo)? If yes, share them to validate client reads/writes.
- Should `capy-checkpoint-next` remain a git submodule, or be vendored into the parent repo?

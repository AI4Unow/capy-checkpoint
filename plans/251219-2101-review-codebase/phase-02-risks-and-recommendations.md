# Phase 02: Risks & Recommendations

Status: draft
Date: 2025-12-19

## Security

### 1) Tracked service account key (critical)
- Finding: parent repo tracks `firebase_service_account.json`.
- Risk: credential leak => full project compromise (Firestore admin, auth admin).
- Recommendation:
  - Remove from git history if already shared externally (rotate key immediately).
  - Add to `.gitignore` and use env vars / secret manager instead.

### 2) Admin upload endpoint hardening (high)
File: `capy-checkpoint-next/src/app/api/admin/upload-questions/route.ts`
- Findings:
  - Uses `FIREBASE_SERVICE_ACCOUNT` JSON parsed directly; no newline normalization.
  - Fallback `initializeApp({ projectId: NEXT_PUBLIC_FIREBASE_PROJECT_ID })` is risky/ambiguous.
  - No explicit `export const runtime = 'nodejs'` (Admin SDK incompatible w/ edge).
  - `GET` endpoint exposes counts without auth (minor info leak).
- Recommendations:
  - Move Admin init into a `server-only` module (singleton).
  - Require auth on `GET` too (or restrict in prod).
  - Add basic rate limiting / request size limits if exposed.

### 3) Gemini hint endpoint (medium)
File: `capy-checkpoint-next/src/app/api/hint/route.ts`
- Findings:
  - No auth/abuse control; could be used to burn API quota.
- Recommendations:
  - Add minimal abuse controls (rate limit, require gameplay session token, or restrict origin).
  - Consider logging redaction (avoid logging full prompts if they can contain PII).

## Correctness / Gameplay

### 4) React↔Phaser lifecycle and StrictMode (medium)
File: `capy-checkpoint-next/src/game/PhaserGame.tsx`
- Findings:
  - Guard `if (... || gameRef.current) return;` helps prevent double init.
  - Uses hard-coded parent id `game-container` while also keeping a ref; safe but slightly inconsistent.
  - Listener added to `gameRef.current.events.on('ready', ...)` never explicitly removed.
- Recommendations:
  - Prefer container ref for `parent` to avoid id collisions.
  - Remove Phaser `ready` handler on cleanup.

### 5) Session summary display bug (high)
File: `capy-checkpoint-next/src/app/page.tsx`
- Finding: `showSummary` state is never set true (only initialized false and set false).
- Impact: `SessionSummary` UI never appears even when `isGameOver` is true.
- Recommendation:
  - Listen to `GameEvents.GAME_OVER` and flip `showSummary` true.

## Maintainability

### 6) Mixed responsibilities in client/store layer (medium)
- `authStore.ts` mixes auth, profile CRUD, learning sync merge.
- Recommendation:
  - Keep KISS: extract Firebase sync to `lib/` (already partially done) and keep stores thin.

### 7) Duplicated question upload paths (low)
- Both `capy-checkpoint-next/scripts/upload-questions-to-firebase.ts` and `app/api/admin/upload-questions` exist.
- Recommendation:
  - Pick one canonical path (script for one-off ops; API for admin UI), delete/disable the other.

## Unresolved Questions
- Do you intend `capy-checkpoint-next` to remain a submodule long-term, or should it be vendored into the parent repo?

# Phase 01: Codebase Map

Status: draft
Date: 2025-12-19

## Scope
Primary app: `capy-checkpoint-next/` (Next.js App Router + Phaser 3 + Zustand + Firebase client + Firebase Admin route handlers).

## Repo structure (high signal)
- `capy-checkpoint-next/`: Next.js app (submodule in parent repo)
- `capy-checkpoint/`: older app (Vite/React)
- `conductor/`: product + track specs
- `docs/`: design guidelines
- `plans/`: planning artifacts

## Runtime entry points
- UI shell: `capy-checkpoint-next/src/app/layout.tsx`
- Main page (game host): `capy-checkpoint-next/src/app/page.tsx`

## Game integration
- React wrapper for Phaser: `capy-checkpoint-next/src/game/PhaserGame.tsx`
  - Creates Phaser instance once per mount (guard via `gameRef.current`).
  - Subscribes to `EventBus` for game events -> updates Zustand stores.
  - Destroys Phaser on unmount.
- Phaser config: `capy-checkpoint-next/src/game/config.ts`
- Scenes:
  - Boot: `capy-checkpoint-next/src/game/scenes/Boot.ts` (procedural texture generation)
  - Menu: `capy-checkpoint-next/src/game/scenes/Menu.ts`
  - Game: `capy-checkpoint-next/src/game/scenes/Game.ts`

## React ↔ Phaser communication
- Event bus: `capy-checkpoint-next/src/game/EventBus.ts`
  - Custom emitter with `on/off/emit`.
  - Events used by UI overlays and Phaser wrapper.

## State management
- Game runtime/UI state: `capy-checkpoint-next/src/stores/gameStore.ts` (score/lives/coins/currentQuestion)
- Learning/adaptive state: `capy-checkpoint-next/src/stores/learningStore.ts`
  - Elo rating (`src/engine/elo.ts`)
  - Mastery tracking (`src/engine/mastery.ts`)
  - SM-2 spaced repetition (`src/engine/sm2.ts`)
  - Question selection (`src/engine/questionSelector.ts`)
- Auth + cloud sync: `capy-checkpoint-next/src/stores/authStore.ts`
  - Uses Firebase Auth (anonymous + Google) and Firestore sync helpers.

## Data / question bank
- Local questions: `capy-checkpoint-next/src/data/all-questions.json`
- Fetching service: `capy-checkpoint-next/src/lib/questionsService.ts`
  - Cache + Firebase (client Firestore) fallback to local JSON.

## Firebase client integration
- Client SDK init (browser-only): `capy-checkpoint-next/src/lib/firebase.ts`
- Firestore sync helpers (client): `capy-checkpoint-next/src/lib/firebaseSync.ts`
- App-level initializer: `capy-checkpoint-next/src/components/AuthProvider.tsx`
  - Starts auth listener, sync on tab hide/unload.

## Server/API routes
- Admin upload: `capy-checkpoint-next/src/app/api/admin/upload-questions/route.ts`
  - Uses Firebase Admin SDK to bulk upload local questions.
  - Simple bearer `ADMIN_API_KEY` auth.
- Gemini hint: `capy-checkpoint-next/src/app/api/hint/route.ts`
  - Calls Google Generative Language endpoint using `GEMINI_API_KEY`.

## Notable repo hygiene findings
- Parent repo tracks `firebase_service_account.json` (high-risk secret exposure).
- Parent repo tracks `.DS_Store`.
- `capy-checkpoint-next` is a git submodule (commit pinned).

## Unresolved Questions
- None

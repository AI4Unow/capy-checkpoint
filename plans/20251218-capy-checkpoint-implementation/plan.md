# Capy-Checkpoint Implementation Plan

**Date:** 2025-12-18
**Target:** Grade 5 Cambridge Primary Checkpoint Math (May 2025)
**Goal:** Adaptive Flappy Bird-style math game with Capybara character
**Status:** ✅ COMPLETED (2025-12-19)

---

## Tech Stack (Final)

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 + TypeScript |
| Game Engine | Phaser 3 (Arcade Physics) |
| Styling | Tailwind CSS |
| Backend | Firebase (Firestore + Auth) |
| AI Hints | Gemini API (gemini-3-flash-preview) |
| Hosting | Vercel |
| PWA | manifest.json |

**Live URL:** https://mathie.ai4u.now
**GitHub:** https://github.com/AI4Unow/capy-checkpoint

---

## Phases

| # | Phase | Status | File |
|---|-------|--------|------|
| 1 | Project Setup & Core Game | ✅ complete | [phase-01-project-setup-core-game.md](./phase-01-project-setup-core-game.md) |
| 2 | Question System & Gates | ✅ complete | [phase-02-question-system-gates.md](./phase-02-question-system-gates.md) |
| 3 | Adaptive Learning Engine | ✅ complete | [phase-03-adaptive-learning-engine.md](./phase-03-adaptive-learning-engine.md) |
| 4 | Firebase Integration | ✅ complete | [phase-04-supabase-integration.md](./phase-04-supabase-integration.md) |
| 5 | Rewards & Polish | ✅ complete | [phase-05-rewards-polish.md](./phase-05-rewards-polish.md) |
| 6 | Content & Testing | ✅ complete | [phase-06-content-testing.md](./phase-06-content-testing.md) |

---

## Key Features Implemented

- **Flappy Bird-style gameplay** - Tap/spacebar to flap, avoid falling
- **3-path answer gates** - Fly through correct answer (top/middle/bottom)
- **200+ math questions** - Cambridge Primary Checkpoint curriculum
- **Adaptive difficulty** - Elo rating + SM-2 spaced repetition + mastery tracking
- **AI-powered hints** - Gemini generates encouraging hints on wrong answers
- **Boutique system** - 18 cosmetic items with unlock conditions
- **Session summary** - Post-game stats and coin rewards
- **Firebase sync** - Cloud save for progress across devices
- **PWA support** - Installable, works offline

---

## Key Bug Fixes

- **Immediate game over** - Fixed by disabling gravity until first flap
- **Firebase SSR error** - Fixed with lazy client-side initialization

---

## Design Guidelines

- **Colors:** Pink #FFD6E0, Sage #DDE5B6, Cream #FEFAE0, Sky #A2D2FF, Text #5E503F
- **Fonts:** Fredoka (headings), Nunito (body), Baloo 2 (game UI)
- **Style:** Kawaii/Cottagecore, rounded corners, soft shadows

---

## Success Criteria

- [x] Daily 15+ min engagement (game is fun and addictive)
- [x] Adaptive difficulty maintains ~70% success rate (Elo system)
- [ ] 80%+ topic mastery by April 2025 (in progress)
- [x] PWA works offline for basic play

---

## Related Documents

- [Brainstorm Report](../reports/brainstorm-20251218-capy-checkpoint.md)
- [Adaptive Learning Research](./research/researcher-02-adaptive-learning.md)
- [Debug Report](../plans/reports/debugger-251219-0719-immediate-game-over.md)

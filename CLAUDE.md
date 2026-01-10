# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Capy-Checkpoint** - Educational math game for Cambridge Primary Checkpoint (Grade 5) preparation. Flappy Bird-style gameplay with a Capybara character flying through math question gates.

## Architecture

```
├── capy-checkpoint-next/     # Active Next.js application
│   └── src/                  # Source code
├── docs/
│   └── design-guidelines.md  # Visual identity, colors, typography
├── plans/
│   └── reports/
│       └── brainstorm-*.md   # Research and decisions
```

## Design System

**Aesthetic:** Kawaii / Cottagecore

**Typography:**
- Headings: 'Fredoka' (rounded, friendly)
- Body: 'Nunito' (clear, soft)
- Game UI: 'Baloo 2' (bubbly)

**Color Palette:**
- Pink: #FFD6E0 | Sage: #DDE5B6 | Cream: #FEFAE0
- Sky: #A2D2FF | Text: #5E503F (soft brown)

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Game Engine:** Phaser 3.90
- **UI:** React 19, Tailwind CSS 4
- **State:** Zustand (11 modular stores)
- **Backend:** Firebase (Firestore + Auth)
- **AI:** Gemini API (hints)
- **PWA:** Serwist 9.3
- **Hosting:** Vercel

## Game Mechanics

- 3-path answer gates (fly through correct answer)
- Elo rating system for adaptive difficulty
- Spaced repetition for weak topics
- 5 themed worlds matching Cambridge math strands

## Key Files

- `docs/design-guidelines.md` - Visual design rules
- `plans/reports/brainstorm-20251218-capy-checkpoint.md` - Full requirements and adaptive learning system design

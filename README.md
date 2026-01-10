# Mathie

Educational math game for **Cambridge Primary Checkpoint (Grade 5)** preparation. Combines Flappy Bird-style gameplay with adaptive learning.

## Live Demo

- **Production:** https://mathie18.vercel.app
- **Custom Domain:** https://mathie.ai4u.now

## Features

### Adaptive Learning
- **Elo Rating:** 400-1600 range, matches question difficulty to student ability
- **SM-2 Spaced Repetition:** Optimal review scheduling for long-term retention
- **Mastery Tracking:** Per-topic with 80% weighted threshold
- **Smart Selection:** Multi-mode question picker (Adventure, Practice, Review, Challenge)

### Gamification
- **21 Badges:** Achievements across accuracy, streak, mastery, daily, special
- **18 Cosmetics:** Hats, trails, accessories, backgrounds
- **Daily Challenges:** 3-question progressive difficulty with streak tracking
- **Spin Wheel & Mystery Box:** Random reward systems
- **Stats Dashboard:** Comprehensive progress visualization

### Gameplay
- Flappy Bird-style mechanics with Capybara character
- 3-path answer gates
- Keyboard (1/2/3) and touch controls
- 447 Cambridge Primary Checkpoint questions (2014-2026)
- AI hints via Gemini on wrong answers

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Game Engine | Phaser 3.90 |
| UI | React 19, Tailwind CSS 4 |
| State | Zustand (11 stores) |
| Backend | Firebase (Firestore + Auth) |
| AI | Gemini API |
| PWA | Serwist 9.3 |
| Testing | Vitest |
| Hosting | Vercel |

## Project Structure

```
├── capy-checkpoint-next/    # Active Next.js app
│   └── src/
│       ├── app/             # Next.js routes & API
│       ├── components/      # 25 React components
│       ├── engine/          # Adaptive learning (Elo, SM-2, Mastery)
│       ├── game/            # Phaser 3 integration
│       ├── stores/          # 11 Zustand stores
│       ├── lib/             # Utilities
│       ├── data/            # Questions, badges, cosmetics
│       └── types/           # TypeScript definitions
├── docs/                    # Documentation
├── plans/                   # Implementation plans
├── conductor/               # Project orchestration
└── materials/               # Source PDFs
```

## Quick Start

```bash
cd capy-checkpoint-next
npm install
npm run dev
```

Open http://localhost:3000

## Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run test         # Run tests
npm run test:coverage # Coverage report
npm run lint         # ESLint
```

## Environment Variables

Copy `.env.example` to `.env.local`:

```bash
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=

# Gemini AI
GOOGLE_AI_API_KEY=
```

## Documentation

- [Project Overview & PDR](docs/project-overview-pdr.md)
- [Codebase Summary](docs/codebase-summary.md)
- [System Architecture](docs/system-architecture.md)
- [Code Standards](docs/code-standards.md)
- [Project Roadmap](docs/project-roadmap.md)
- [Design Guidelines](docs/design-guidelines.md)

## Metrics

| Metric | Value |
|--------|-------|
| Codebase | ~32,800 lines |
| Components | 25 React |
| Stores | 11 Zustand |
| Questions | 447 |
| Badges | 21 |
| Cosmetics | 18 |

## License

Private - All rights reserved.

# Mathie 🌿🥥

An adaptive educational math game for **Cambridge Primary Checkpoint (Grade 5)** preparation. Help your Capybara fly through math gates, collect Yuzu coins, and master the curriculum!

## 🎮 Play Now

- **Live:** https://mathie18.vercel.app

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## ✨ Features

| Category | Features |
|----------|----------|
| **Learning** | Elo rating, SM-2 spaced repetition, topic mastery tracking |
| **Stats** | Stats dashboard with Elo trend, topic progress, weak topics |
| **Gamification** | 21 badges, daily challenges, streaks, spin wheel |
| **Customization** | 18 boutique items (hats, trails, accessories) |
| **Accessibility** | Pause/settings, reduced motion, keyboard + touch controls |
| **AI** | Gemini-powered hints on wrong answers |

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Game Engine | Phaser 3.90 |
| UI | React 19 + Tailwind CSS 4 |
| State | Zustand (11 stores) |
| Backend | Firebase (Firestore + Auth) |
| Testing | Vitest |

## 📂 Project Structure

```
src/
├── app/          # Next.js pages + API routes
├── components/   # 25 React components
├── data/         # 447 questions, badges, boutique items
├── engine/       # Elo, SM-2, mastery, question selector
├── game/         # Phaser scenes + EventBus
├── stores/       # Zustand state management
└── lib/          # Firebase, utilities
```

## 📖 Documentation

See `docs/` directory:
- [Project Overview & PDR](../docs/project-overview-pdr.md)
- [System Architecture](../docs/system-architecture.md)
- [Codebase Summary](../docs/codebase-summary.md)
- [Code Standards](../docs/code-standards.md)
- [Project Roadmap](../docs/project-roadmap.md)

## 🎯 Game Mechanics

- **Flappy Controls:** Tap/click left side to flap, right side to select answer
- **Answer Gates:** Fly through the gate matching the correct answer
- **Adaptive Difficulty:** Questions match your Elo rating (~70% success rate)
- **Daily Challenges:** 3 questions with progressive difficulty
- **Boutique:** Spend coins on capybara customizations

## 📊 Stats Dashboard

Access from menu → 📊 Stats button:
- Session stats (questions, best score, streak)
- Learning progress (Elo trend ↑↓, topic mastery bars)
- Gamification (badges, daily streak, coins)

# Capy-Checkpoint 🌿🥥

An adaptive, educational math game designed for **Cambridge Primary Checkpoint (Grade 5)** preparation. Help your Capybara fly through math gates, collect Yuzu coins, and master the curriculum!

## 🚀 Quick Start

```bash
cd capy-checkpoint-next
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to start playing.

## 🎮 Game Features

- **Adaptive Learning:** Powered by Elo rating and SM-2 spaced repetition.
- **Flappy Mechanics:** Phaser 3 physics-based gameplay.
- **Engagement:** Daily challenges, streaks, badges, and a boutique for capybara accessories.
- **Curriculum-Aligned:** Questions extracted from Cambridge past papers.

## 🏗️ Architecture

- **Framework:** Next.js 16 (App Router)
- **Game Engine:** Phaser 3.90
- **UI:** React 19 + Tailwind CSS 4
- **State:** Zustand
- **Backend:** Firebase (Firestore + Auth)
- **Logic:** Custom Adaptive Engine (Elo, SM-2, Mastery tracking)

## 📂 Project Structure

- `src/app`: Next.js pages and layouts.
- `src/game`: Phaser game scenes, config, and EventBus.
- `src/engine`: Adaptive learning logic (Elo, SM-2, Mastery).
- `src/stores`: Zustand state stores (Game, User, Mood, etc.).
- `src/components`: React UI components.
- `src/lib`: Shared utilities and Firebase config.

## 🛠️ Tech Stack

- **Frontend:** TypeScript, React, Next.js, Phaser
- **Styling:** Tailwind CSS, PostCSS
- **State Management:** Zustand
- **Database/Auth:** Firebase
- **Testing:** Vitest

## 📖 Documentation

For more details, check the `./docs` directory:
- [Project Overview & PDR](./docs/project-overview-pdr.md)
- [System Architecture](./docs/system-architecture.md)
- [Code Standards](./docs/code-standards.md)
- [Codebase Summary](./docs/codebase-summary.md)
- [Project Roadmap](./docs/project-roadmap.md)

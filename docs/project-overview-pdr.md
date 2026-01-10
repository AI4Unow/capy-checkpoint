# Project Overview & PDR

## 1. Project Overview

**Mathie** (formerly Capy-Checkpoint) is an educational math game for **Cambridge Primary Checkpoint (Grade 5)** preparation. Combines Flappy Bird-style gameplay with adaptive learning to make math practice engaging.

### Core Concept
Players control a Capybara flying through themed worlds, passing through "Answer Gates" matching correct solutions to real-time math problems.

### Live Demo
- **Production:** https://mathie18.vercel.app
- **Custom Domain:** https://mathie.ai4u.now

---

## 2. Technical Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Game Engine | Phaser 3.90 |
| UI | React 19, Tailwind CSS 4 |
| State | Zustand (11 modular stores) |
| Backend | Firebase (Firestore + Auth) |
| AI | Gemini API (hints) |
| PWA | Serwist 9.3 (service worker) |
| Testing | Vitest |
| Hosting | Vercel |

---

## 3. Product Development Requirements

### 3.1 Adaptive Learning Engine ✅
- **Elo Rating:** 400-1600 range, K-factor adjusted for onboarding (K=40 first 10 questions)
- **Spaced Repetition:** SM-2 algorithm for optimal review scheduling
- **Mastery Tracking:** Per-subtopic with 80% weighted threshold
- **Question Selector:** Multi-mode (Adventure, Practice, Review, Challenge)
- **Elo History:** Last 20 ratings tracked for trend analysis
- **Calibration:** First 10 questions for initial skill estimation

### 3.2 Game Mechanics ✅
- **Phaser-React Bridge:** EventBus for bidirectional communication
- **Answer Gates:** 3-path obstacle system
- **Input:** Keyboard (1/2/3 keys), touch (left=flap, right=select)
- **Themed Worlds:** 5 worlds matching Cambridge strands
- **Pause/Resume:** ESC key and pause button

### 3.3 Engagement Systems ✅
- **Boutique:** 18 cosmetics (hats, trails, accessories, backgrounds)
- **Badges:** 21 achievements across accuracy, streak, mastery, daily, special
- **Daily Challenges:** 3-question progressive difficulty, streak tracking, coin rewards
- **Spin Wheel & Mystery Box:** Random reward systems
- **Stats Dashboard:** Session, learning, and gamification stats
- **Capy Mood:** Emotional state reactions

### 3.4 Question Bank ✅
- **447 Questions:** Extracted from Cambridge 2014-2026 papers
- **Topics:** Number (170), Calculation (118), Measure (61), Geometry (56), Data (42)
- **Pipeline:** PDF extraction → OCR → Gemini MC generation → Firestore sync

### 3.5 PWA & Offline ✅
- **Service Worker:** Serwist-based with caching
- **Offline Queue:** IndexedDB for pending sync
- **Online Indicator:** Network status display

### 3.6 Accessibility ✅
- **Reduced Motion:** Respects prefers-reduced-motion
- **Keyboard Navigation:** Full keyboard support
- **Settings Modal:** Audio, motion preferences

---

## 4. Feature Summary

| Category | Features |
|----------|----------|
| Learning | Elo rating, SM-2 review, topic mastery, adaptive selection, calibration |
| Stats | Stats dashboard, Elo trend, topic progress bars, weak topics, questions-to-next-level |
| Gamification | 21 badges, daily challenges, streaks, coins, spin wheel, mystery box |
| Customization | 18 boutique items (hats, trails, accessories, backgrounds) |
| Accessibility | Pause/settings, reduced motion, audio controls |
| AI | Gemini-powered hints on wrong answers |
| PWA | Offline support, service worker, sync queue |

---

## 5. Acceptance Criteria

- [x] Elo rating updates correctly after each answer
- [x] Questions match student's Elo range
- [x] Mastery progress visible in Stats dashboard
- [x] Boutique items applied to capybara in-game
- [x] Stats dashboard shows session, learning, gamification stats
- [x] 60 FPS performance on target devices
- [x] iPad touch controls work for answer selection
- [x] Pause/resume works with ESC key
- [x] Daily challenge tracks streaks correctly
- [x] Badges unlock on achievement
- [x] AI hints display on wrong answers

---

## 6. Architecture Highlights

### Phaser-React Bridge
- `EventBus.ts` enables bidirectional communication
- Events: SCORE_UPDATE, ANSWER, GAME_OVER, MASTERY_ACHIEVED, PAUSE, RESUME

### State Persistence
- localStorage for offline-first
- Firebase sync for authenticated users
- Zustand with persist middleware

### Question Pipeline
- Local JSON (447 questions) with Firestore fallback
- Caching in questionsService

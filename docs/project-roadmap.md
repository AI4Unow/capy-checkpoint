# Project Roadmap

## Completed Phases

### Phase 1: Foundation & Core Mechanics ✅
- [x] Project setup: Next.js 16 + Phaser 3 + Tailwind CSS 4
- [x] Firebase integration: Auth + Firestore
- [x] Phaser-React bridge: PhaserGame + EventBus
- [x] Question bank: 447 Cambridge math questions (2014-2026)
- [x] Core gameplay: Capybara physics, 3-path answer gates
- [x] Zustand stores: 11 modular state stores

### Phase 2: Adaptive Learning Engine ✅
- [x] Elo rating system (400-1600, K=40 for calibration)
- [x] SM-2 spaced repetition algorithm
- [x] Mastery tracking (weighted decay, 80% threshold)
- [x] Smart question selector (Adventure, Practice, Review, Challenge modes)
- [x] Elo history tracking (last 20 ratings for trend)

### Phase 3: Engagement & Gamification ✅
- [x] Boutique: 18 cosmetic items (hats, trails, accessories, backgrounds)
- [x] Badges: 21 achievements across 5 categories
- [x] Daily challenges: 3-question progressive difficulty with streaks
- [x] Spin Wheel & Mystery Box: Random reward systems
- [x] AI hints: Gemini integration for wrong answers
- [x] Audio: Web Audio synthesized sounds
- [x] Kawaii/Cottagecore aesthetic

### Phase 4: Stats & Analytics ✅ (Dec 2024)
- [x] Stats Dashboard (StatsModal)
  - Session stats: questions answered, best score, best streak
  - Learning progress: Elo trend, topic mastery bars, weak topics
  - Gamification: badges, daily streak, coins, spins
- [x] Elo history tracking (last 20 ratings)
- [x] Topic progress getters (getAllTopicProgress)
- [x] Weak topics identification (getWeakTopics)
- [x] Questions-to-next-level estimation

### Phase 5: UX & Accessibility ✅ (Dec 2024)
- [x] iPad touch controls (left=flap, right=select answer)
- [x] Question text repositioning (avoid HUD overlap)
- [x] Boutique price balancing
- [x] Pause/resume system with ESC key
- [x] Settings modal (audio, reduced motion)
- [x] Reduced motion support (prefers-reduced-motion)
- [x] Keyboard navigation (1/2/3 for answers)

### Phase 6: PWA & Offline ✅ (Dec 2024)
- [x] Service Worker (Serwist 9.3)
- [x] Offline queue (IndexedDB)
- [x] Online/offline indicator
- [x] Firebase sync when online
- [x] Cache-first strategy for assets

---

## Current Phase

### Phase 7: Content & Polish (In Progress)
- [ ] Additional question banks
- [ ] More themed worlds
- [ ] Performance optimization
- [ ] Bug fixes and polish

---

## Planned Phases

### Phase 8: Parent/Teacher Features
- [ ] Parent dashboard (view child's progress)
- [ ] Teacher analytics dashboard
- [ ] Multi-student profiles (shared device support)
- [ ] Progress reports export

### Phase 9: Advanced AI
- [ ] Dynamic question generation (full AI)
- [ ] Personalized learning paths
- [ ] Adaptive difficulty curves
- [ ] AI-powered explanations

### Phase 10: Platform Expansion
- [ ] PWA/mobile app wrapper (Capacitor/Expo)
- [ ] iOS App Store submission
- [ ] Android Play Store submission
- [ ] All 5 themed worlds completion

### Phase 11: Social & Competition
- [ ] Leaderboards (opt-in)
- [ ] Friend challenges
- [ ] Classroom competitions
- [ ] Achievement sharing

### Phase 12: Monetization & Scale
- [ ] Premium cosmetics
- [ ] Subscription features
- [ ] School/classroom licensing
- [ ] Analytics and reporting tier

---

## Metrics

| Metric | Value |
|--------|-------|
| Codebase | ~32,800 lines |
| Components | 25 React |
| Stores | 11 Zustand |
| Questions | 447 |
| Badges | 21 |
| Cosmetics | 18 |
| Test files | 7 suites |

---

## Technical Debt

### High Priority
- [ ] Increase test coverage for components
- [ ] Add E2E tests (Playwright)
- [ ] Performance profiling and optimization

### Medium Priority
- [ ] Refactor large Game.ts scene
- [ ] Add error boundaries
- [ ] Improve loading states

### Low Priority
- [ ] Code splitting optimization
- [ ] Bundle size reduction
- [ ] Documentation improvements

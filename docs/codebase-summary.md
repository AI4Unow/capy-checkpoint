# Codebase Summary

## Quick Stats
- **Total Lines:** ~32,800
- **Components:** 25 React components
- **Stores:** 11 Zustand stores
- **Questions:** 447 Cambridge math questions
- **Badges:** 21 achievements
- **Boutique Items:** 18 cosmetics
- **Test Files:** 7 test suites

## Directory Structure

```
capy-checkpoint-next/src/
├── app/                        # Next.js App Router
│   ├── api/hint/route.ts       # AI hints API (Gemini)
│   ├── api/admin/upload-questions/route.ts  # Question upload
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   ├── sw.ts                   # Service worker source
│   └── globals.css             # Global styles
├── components/                 # React UI (25 components)
│   ├── StatsModal.tsx          # Player statistics dashboard
│   ├── MenuOverlay.tsx         # Main menu (Stats, Daily, Badges)
│   ├── GameHUD.tsx             # In-game heads-up display
│   ├── DailyChallenge.tsx      # Daily challenge mode
│   ├── BadgeCollection.tsx     # Achievement display
│   ├── Boutique.tsx            # Cosmetic shop
│   ├── SessionSummary.tsx      # End-of-session stats
│   ├── SpinWheel.tsx           # Prize wheel
│   ├── MysteryBox.tsx          # Mystery box rewards
│   ├── CapyMood.tsx            # Capy emotional state display
│   ├── CapyReactions.tsx       # Capy reaction animations
│   ├── WelcomeBack.tsx         # Returning user greeting
│   ├── AIHint.tsx              # AI hints display
│   ├── OnscreenCalculator.tsx  # In-game calculator
│   ├── CalibrationIndicator.tsx # Onboarding progress
│   ├── DifficultyIndicator.tsx # Current difficulty level
│   ├── StreakDisplay.tsx       # Answer streak counter
│   ├── StreakCalendar.tsx      # 14-day activity heatmap
│   ├── MasteryCelebration.tsx  # Mastery confetti animation
│   ├── BadgeUnlock.tsx         # Badge celebration animation
│   ├── BadgeChecker.tsx        # Event-driven badge checks
│   ├── ModeSelector.tsx        # Session mode selection
│   ├── QuestionReasonBadge.tsx # Question selection reason
│   ├── PauseOverlay.tsx        # Pause menu
│   ├── SettingsModal.tsx       # Settings (a11y, audio)
│   ├── AuthProvider.tsx        # Firebase auth wrapper
│   ├── SyncManager.tsx         # Firebase sync manager
│   ├── ServiceWorkerRegistration.tsx # SW registration
│   └── OnlineIndicator.tsx     # Network status
├── engine/                     # Adaptive Learning Engine
│   ├── elo.ts                  # Elo rating (400-1600)
│   ├── elo.test.ts
│   ├── sm2.ts                  # SM-2 spaced repetition
│   ├── sm2.test.ts
│   ├── mastery.ts              # Topic mastery tracking
│   ├── mastery.test.ts
│   ├── questionSelector.ts     # Adaptive question selection
│   └── questionSelector.test.ts
├── game/                       # Phaser 3 Integration
│   ├── config.ts               # Phaser configuration
│   ├── PhaserGame.tsx          # React wrapper
│   ├── EventBus.ts             # Phaser-React bridge
│   ├── scenes/
│   │   ├── Boot.ts             # Asset loading
│   │   ├── Menu.ts             # Main menu scene
│   │   └── Game.ts             # Core gameplay scene
│   └── audio/
│       ├── SynthSounds.ts      # Web Audio synthesizer
│       └── AudioManager.ts     # Audio management
├── stores/                     # Zustand State (11 stores)
│   ├── learningStore.ts        # Elo, mastery, SM2, eloHistory
│   ├── gameStore.ts            # Score, coins, hearts
│   ├── gameStore.test.ts
│   ├── badgeStore.ts           # 21 achievement badges
│   ├── dailyChallengeStore.ts  # Daily streaks
│   ├── boutiqueStore.ts        # Cosmetic purchases
│   ├── spinStore.ts            # Spin wheel state
│   ├── mysteryBoxStore.ts      # Mystery box state
│   ├── moodStore.ts            # Capy emotional state
│   ├── settingsStore.ts        # A11y, audio preferences
│   └── authStore.ts            # Firebase auth
├── lib/                        # Utilities
│   ├── firebase.ts             # Firebase config
│   ├── firebaseSync.ts         # Cloud sync
│   ├── questionsService.ts     # Question loading + caching
│   ├── questionsService.test.ts
│   ├── hintsService.ts         # AI hints service
│   ├── offline-queue.ts        # IndexedDB offline queue
│   ├── offline-queue.test.ts
│   ├── register-sw.ts          # Service worker registration
│   └── toast.ts                # Toast notifications
├── data/                       # Static Data
│   ├── all-questions.json      # 447 questions
│   ├── badges.ts               # 21 badge definitions
│   ├── boutique.ts             # 18 cosmetic items
│   ├── spinPrizes.ts           # Wheel prizes
│   └── mysteryBoxTiers.ts      # Mystery box tiers
├── types/                      # TypeScript Definitions
│   ├── question.ts             # Question types
│   ├── badge.ts                # Badge types
│   └── dailyChallenge.ts       # Daily challenge types
├── hooks/                      # Custom React hooks (empty)
└── test/
    └── setup.ts                # Vitest setup
```

## Core Systems

### 1. Adaptive Learning Engine (`src/engine/`)

| Module | Purpose |
|--------|---------|
| `elo.ts` | Elo rating (400-1600), ~70% target success rate, K=40 for calibration |
| `sm2.ts` | SM-2 spaced repetition for long-term retention |
| `mastery.ts` | Topic mastery (80% threshold), weighted decay |
| `questionSelector.ts` | Multi-mode selection (Adventure, Practice, Review, Challenge) |

### 2. Stats Dashboard (`src/components/StatsModal.tsx`)
- **Session Stats:** Questions answered, best score, best streak
- **Learning Progress:** Elo rating with trend (↑↓), 5 topic mastery bars, weak topics
- **Gamification:** Badges, daily streak, coins, wheel spins

### 3. Phaser-React Bridge (`src/game/EventBus.ts`)

| Direction | Events |
|-----------|--------|
| Game → React | SCORE_UPDATE, ANSWER, GAME_OVER, MASTERY_ACHIEVED, STREAK_MILESTONE |
| React → Game | PAUSE, RESUME, SCENE_CHANGE, SOUND_TOGGLE, VOLUME_CHANGE |

### 4. State Management (`src/stores/`)

| Store | Persisted | Purpose |
|-------|-----------|---------|
| learningStore | ✅ | Elo, mastery, SM2, eloHistory, bestStreak, session stats |
| gameStore | ❌ | Score, coins, hearts, currentQuestion |
| badgeStore | ✅ | 21 unlocked badges |
| dailyChallengeStore | ✅ | Daily streaks, history |
| boutiqueStore | ✅ | Purchased/equipped items |
| spinStore | ✅ | Spin count, last spin |
| mysteryBoxStore | ✅ | Mystery box state |
| moodStore | ✅ | Capy emotional state |
| settingsStore | ✅ | Audio, reduced motion |
| authStore | ❌ | Current user, sync status |

## Key Files

| File | Purpose |
|------|---------|
| `src/game/PhaserGame.tsx` | Game engine entry point |
| `src/stores/learningStore.ts` | Central learning state + eloHistory |
| `src/lib/questionsService.ts` | Question fetching + caching |
| `src/components/StatsModal.tsx` | Statistics dashboard |
| `src/engine/questionSelector.ts` | Adaptive question picking |
| `src/game/scenes/Game.ts` | Core gameplay logic |
| `src/app/api/hint/route.ts` | AI hints endpoint |

## Test Coverage

| Test File | Coverage |
|-----------|----------|
| `elo.test.ts` | Elo calculations |
| `sm2.test.ts` | SM-2 algorithm |
| `mastery.test.ts` | Mastery tracking |
| `questionSelector.test.ts` | Question selection |
| `gameStore.test.ts` | Game state |
| `questionsService.test.ts` | Question loading |
| `offline-queue.test.ts` | Offline queue |

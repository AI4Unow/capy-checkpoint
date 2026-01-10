# System Architecture

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Browser                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐         ┌─────────────────────────────┐    │
│  │   React UI      │◄───────►│   Phaser 3 Game             │    │
│  │   (Next.js)     │ EventBus│   (Canvas)                  │    │
│  │                 │         │                             │    │
│  │ - MenuOverlay   │         │ - Boot Scene                │    │
│  │ - StatsModal    │         │ - Menu Scene                │    │
│  │ - GameHUD       │         │ - Game Scene                │    │
│  │ - Boutique      │         │ - SynthSounds               │    │
│  │ - DailyChallenge│         │                             │    │
│  │ - BadgeCollection│        │                             │    │
│  └────────┬────────┘         └─────────────────────────────┘    │
│           │                                                      │
│  ┌────────▼────────┐                                            │
│  │  Zustand Stores │ (11 stores)                                │
│  │  - learningStore│ ← Elo, Mastery, SM2, eloHistory            │
│  │  - gameStore    │ ← Score, Coins, Hearts                     │
│  │  - badgeStore   │ ← 21 Achievements                          │
│  │  - dailyStore   │ ← Daily Streaks                            │
│  │  - boutiqueStore│ ← Cosmetics                                │
│  │  - spinStore    │ ← Spin Wheel                               │
│  │  - moodStore    │ ← Capy Mood                                │
│  │  - settingsStore│ ← A11y, Audio                              │
│  └────────┬────────┘                                            │
│           │                                                      │
│  ┌────────▼────────┐         ┌─────────────────────────────┐    │
│  │   Persistence   │         │   Service Worker            │    │
│  │ - localStorage  │         │ - Serwist                   │    │
│  │ - IndexedDB     │◄───────►│ - Offline Queue             │    │
│  │ - Firebase Sync │         │ - Cache Strategy            │    │
│  └─────────────────┘         └─────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      External Services                           │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐        │
│  │ Firebase      │  │ Gemini API    │  │ Vercel        │        │
│  │ - Firestore   │  │ - AI Hints    │  │ - Hosting     │        │
│  │ - Auth        │  │               │  │ - Edge        │        │
│  └───────────────┘  └───────────────┘  └───────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Phaser-React Integration

### PhaserGame Component (`src/game/PhaserGame.tsx`)
1. **Mounts Phaser:** Initializes `Phaser.Game` in React ref-linked div
2. **Lifecycle:** Handles destruction on unmount
3. **Dependency Injection:** Passes React callbacks to Phaser scenes

### EventBus (`src/game/EventBus.ts`)

| Event | Direction | Purpose |
|-------|-----------|---------|
| SCORE_UPDATE | Game→React | Update HUD score |
| ANSWER | Game→React | Record answer in learningStore |
| GAME_OVER | Game→React | Trigger SessionSummary |
| MASTERY_ACHIEVED | Game→React | Show MasteryCelebration |
| STREAK_MILESTONE | Game→React | Show streak bonus |
| DIFFICULTY_CHANGE | Game→React | Update DifficultyIndicator |
| QUESTION_SELECTED | Game→React | Show QuestionReasonBadge |
| PAUSE/RESUME | React→Game | Control game physics |
| SOUND_TOGGLE | React→Game | Control audio |
| VOLUME_CHANGE | React→Game | Adjust volume |
| MUSIC_TOGGLE | React→Game | Control background music |

---

## 3. Adaptive Learning Engine

### Data Flow
```
Question → Answer → learningStore.recordAnswer()
                          │
         ┌────────────────┼────────────────┐
         ▼                ▼                ▼
    Elo Update      Mastery Update    SM2 Update
    (rating)        (subtopic)        (nextReview)
         │                │                │
         └────────────────┼────────────────┘
                          ▼
              eloHistory (last 20)
              streakCount
              sessionStats
```

### Engine Modules

| Module | Algorithm | Purpose |
|--------|-----------|---------|
| `elo.ts` | Elo rating | Match question difficulty to student ability |
| `sm2.ts` | SuperMemo-2 | Schedule optimal review intervals |
| `mastery.ts` | Weighted decay | Track subtopic proficiency (80% = mastered) |
| `questionSelector.ts` | Multi-factor | Pick next question by mode, due reviews, weakness |

### Question Selection Flow
```
selectQuestion(mode, learningState, allQuestions)
         │
         ├── Mode: Adventure → Balance new + review
         ├── Mode: Practice  → Focus on weak topics
         ├── Mode: Review    → Due SM-2 reviews first
         └── Mode: Challenge → Above-Elo difficulty
                    │
                    ▼
             Filter by Elo range
                    │
                    ▼
             Prioritize due reviews
                    │
                    ▼
             Apply weakness boost
                    │
                    ▼
             Return question + reason
```

---

## 4. State Management

### Store Architecture

| Store | Persisted | Key Data |
|-------|-----------|----------|
| learningStore | ✅ | Elo, mastery, SM2, eloHistory, bestStreak, questionsAnswered |
| gameStore | ❌ | Session score, coins, hearts |
| badgeStore | ✅ | Unlocked badges |
| dailyChallengeStore | ✅ | Daily streak, history, lastCompleted |
| boutiqueStore | ✅ | Purchased items, equipped items |
| spinStore | ✅ | Spin count, last spin time |
| mysteryBoxStore | ✅ | Box tier progress |
| moodStore | ✅ | Capy emotional state |
| settingsStore | ✅ | Audio on/off, reduced motion, volume |
| authStore | ❌ | Current user, sync status |

### Persistence Strategy
- **Primary:** Zustand `persist` middleware → localStorage
- **Secondary:** Firebase Firestore sync for authenticated users
- **Offline:** IndexedDB queue for pending operations

---

## 5. Data Flow & Persistence

### Offline-First Architecture
```
┌─────────────────┐
│   User Action   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Zustand Store  │──────► localStorage (immediate)
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│  Online Check   │─No─►│  IndexedDB      │
└────────┬────────┘     │  Offline Queue  │
         │Yes           └────────┬────────┘
         ▼                       │
┌─────────────────┐              │
│ Firebase Sync   │◄─────────────┘
│ (Firestore)     │     (When online)
└─────────────────┘
```

### Question Pipeline
1. **Local JSON:** 447 questions in `all-questions.json`
2. **Caching:** questionsService caches fetched questions
3. **Fallback:** Firestore for additional/updated questions

---

## 6. API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/hint` | POST | Get AI hint from Gemini for wrong answers |
| `/api/admin/upload-questions` | POST | Batch upload questions to Firestore |

### AI Hints Flow
```
Wrong Answer → AIHint Component → /api/hint → Gemini API
                                      │
                                      ▼
                              Hint Response → Display
```

---

## 7. PWA Architecture

### Service Worker (Serwist)
- **Caching:** Static assets, fonts, questions JSON
- **Strategy:** Cache-first for assets, network-first for API
- **Offline:** Full game playable offline

### Sync Flow
```
┌─────────────────┐
│   Offline Mode  │
│   (detected)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Queue Actions  │
│  in IndexedDB   │
└────────┬────────┘
         │
         ▼ (online detected)
┌─────────────────┐
│  Process Queue  │
│  → Firebase     │
└─────────────────┘
```

---

## 8. Component Hierarchy

```
App (layout.tsx)
├── AuthProvider
├── ServiceWorkerRegistration
├── SyncManager
├── OnlineIndicator
└── PhaserGame
    ├── MenuOverlay
    │   ├── StatsModal
    │   ├── BadgeCollection
    │   ├── Boutique
    │   └── DailyChallenge
    ├── GameHUD
    │   ├── DifficultyIndicator
    │   ├── CalibrationIndicator
    │   ├── StreakDisplay
    │   └── QuestionReasonBadge
    ├── PauseOverlay
    │   └── SettingsModal
    ├── SessionSummary
    ├── MasteryCelebration
    ├── BadgeUnlock
    ├── BadgeChecker
    ├── AIHint
    ├── SpinWheel
    ├── MysteryBox
    ├── CapyMood
    └── WelcomeBack
```

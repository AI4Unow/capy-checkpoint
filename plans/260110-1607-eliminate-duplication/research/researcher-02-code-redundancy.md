# Code Redundancy Analysis

**Date:** 2026-01-10
**Scope:** capy-checkpoint-next/src/
**Focus:** Code-level duplication, not folder structure

## 1. Duplicate Store State

### gameStore vs learningStore Overlap
**Files:**
- `src/stores/gameStore.ts`
- `src/stores/learningStore.ts`

**Redundancies:**
- Both track `streakCount` / `bestStreak`
- Both track `sessionCorrect` / `sessionTotal` / `answeredCount` / `correctCount`
- Both persist to localStorage with Zustand

**Recommendation:**
- Consolidate session stats into single store
- Option A: Move all to `learningStore` (owns adaptive logic)
- Option B: Make `gameStore` ephemeral (no session stats)

## 2. Duplicate Type Imports

### Question Type Imports
**Pattern:** `import type { Question } from "@/types/question"` in 12+ files
- gameStore.ts, learningStore.ts, questionSelector.ts, PhaserGame.tsx, Game.ts
- AIHint.tsx, page.tsx, DailyChallenge.tsx, questionsService.ts, useQuestionBank.ts

**Status:** Not redundant - appropriate modular usage

### QuestionReason Type Duplication
**Files:**
- `src/game/EventBus.ts:83` - `export type QuestionReason = "review" | "weak" | "world" | "random" | "onboarding"`
- `src/game/scenes/Game.ts:2` - Re-imports as type
- `src/components/QuestionReasonBadge.tsx:4` - Re-imports as type

**Status:** No duplication - single source of truth in EventBus

## 3. Cosmetics Implementation Pattern

### Overlay Functions
**Files:**
- `src/game/cosmetics/hat-overlays.ts`
- `src/game/cosmetics/accessory-overlays.ts`
- `src/game/cosmetics/trail-effects.ts`

**Pattern Analysis:** Need to read files to confirm duplication

**Potential Issue:** Similar overlay/rendering logic across 3 files

## 4. Store Pattern Duplication

### Zustand Persist Boilerplate
**Affected Files (11 stores):**
- gameStore, learningStore, boutiqueStore, settingsStore, dailyChallengeStore
- badgeStore, spinStore, moodStore, mysteryBoxStore, authStore

**Redundant Pattern:**
```ts
export const useXStore = create<State>()(
  persist(
    (set, get) => ({ /* logic */ }),
    { name: "storage-key", partialize: (state) => ({ /* select */ }) }
  )
)
```

**Recommendation:**
- Extract `createPersistedStore<T>()` helper
- DRY violation: 11 instances of same boilerplate

## 5. Audio System Duplication

### Audio Managers
**Files:**
- `src/game/audio/AudioManager.ts`
- `src/game/audio/SynthSounds.ts`

**Need Investigation:** Check if SynthSounds duplicates AudioManager or extends it

## 6. Test Setup

### Test Configuration
**File:** `src/test/setup.ts`

**Status:** Single setup file - no duplication found

## 7. Service Worker Duplication

### SW Registration
**Files:**
- `src/lib/register-sw.ts`
- `src/components/ServiceWorkerRegistration.tsx`
- `src/app/sw.ts`

**Potential Issue:** Registration logic split across 3 files - check for redundant patterns

## 8. Offline Queue Pattern

### Queue Implementation
**Files:**
- `src/lib/offline-queue.ts`
- `src/lib/offline-queue.test.ts`

**Status:** Isolated implementation - need to check if duplicated in other services

## 9. CSS Configuration

### Styling Setup
**Found:** Only 1 CSS file: `src/app/globals.css`

**Missing Check:** Need to verify:
- `tailwind.config.js` duplication with base config
- `postcss.config.js` duplication

**Note:** Hook blocked broad glob - specific check needed

## 10. Dead/Unused Code Candidates

**High-Risk Areas:**
- `src/hooks/useQuestionBank.ts` - May be superseded by questionsService
- Multiple celebration components - check usage:
  - MasteryCelebration.tsx
  - BadgeUnlock.tsx
  - WelcomeBack.tsx

## Summary

### Critical Redundancies
1. **Session stats duplication** - gameStore vs learningStore (HIGH PRIORITY)
2. **Zustand boilerplate** - 11 stores repeat same pattern (MEDIUM)
3. **Cosmetics overlays** - Similar patterns across 3 files (NEEDS REVIEW)

### Consolidation Strategy
1. Merge session tracking into single store (learningStore)
2. Create `createPersistedStore<T>()` factory helper
3. Extract common overlay logic if confirmed

### Unresolved Questions
1. Are cosmetics overlays actually duplicated or just similar APIs?
2. Is SynthSounds extending AudioManager or duplicating logic?
3. Is useQuestionBank hook still used or replaced by questionsService?
4. Are SW registration files redundant or serving different purposes?
5. What's in tailwind.config + postcss.config - any duplication with base configs?

**Lines:** 145

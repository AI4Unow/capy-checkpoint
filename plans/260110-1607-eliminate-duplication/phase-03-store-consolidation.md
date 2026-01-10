# Phase 03: Store Consolidation

## Context

- [Plan](./plan.md)
- [Research: Code Redundancy](./research/researcher-02-code-redundancy.md)
- [Codebase Summary](/Users/nad/My Drive (duc.a.nguyen@gmail.com)/Preliminary math checkpoint/docs/codebase-summary.md)

## Overview

| Field | Value |
|-------|-------|
| Priority | P2 |
| Status | pending |
| Effort | 1.5h |
| Description | Consolidate session stats, optionally extract Zustand helper |

## Key Insights

1. gameStore + learningStore both track: streakCount, bestStreak, sessionCorrect/Total
2. 11 Zustand stores repeat same persist boilerplate pattern
3. gameStore marked non-persisted but contains session stats
4. learningStore owns adaptive logic - natural home for all learning data

## Related Files

### Primary Targets
| File | Purpose |
|------|---------|
| `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/Preliminary math checkpoint/capy-checkpoint-next/src/stores/gameStore.ts` | Session score, coins, hearts, streaks |
| `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/Preliminary math checkpoint/capy-checkpoint-next/src/stores/learningStore.ts` | Elo, mastery, SM2, eloHistory, bestStreak |

### All Stores (for boilerplate extraction)
- gameStore.ts, learningStore.ts, boutiqueStore.ts, settingsStore.ts
- dailyChallengeStore.ts, badgeStore.ts, spinStore.ts, moodStore.ts
- mysteryBoxStore.ts, authStore.ts

### Consumers (need updates after merge)
- `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/Preliminary math checkpoint/capy-checkpoint-next/src/components/StatsModal.tsx`
- `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/Preliminary math checkpoint/capy-checkpoint-next/src/components/SessionSummary.tsx`
- `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/Preliminary math checkpoint/capy-checkpoint-next/src/game/scenes/Game.ts`

## Implementation Steps

### Part A: Session Stats Consolidation (1h)

#### Step 1: Audit Current State

```bash
# Find all streak/session references
grep -rn "streakCount\|bestStreak\|sessionCorrect\|sessionTotal" \
  "/Users/nad/My Drive (duc.a.nguyen@gmail.com)/Preliminary math checkpoint/capy-checkpoint-next/src/"
```

#### Step 2: Design Consolidated State

Choose one approach:
- **Option A:** Move all stats to learningStore (recommended - owns adaptive logic)
- **Option B:** Keep gameStore ephemeral (score/hearts only), move streaks to learningStore

Proposed learningStore additions:
```ts
interface LearningState {
  // ... existing elo, mastery, sm2 ...

  // Session stats (NEW - from gameStore)
  sessionCorrect: number
  sessionTotal: number
  currentStreak: number
  bestStreak: number  // already exists?

  // Actions
  recordAnswer: (correct: boolean) => void
  resetSession: () => void
}
```

#### Step 3: Migrate State

1. Add session state to learningStore
2. Add recordAnswer/resetSession actions
3. Update persist partialize to include session stats

#### Step 4: Update Consumers

Replace gameStore session calls with learningStore:
- StatsModal.tsx
- SessionSummary.tsx
- Game.ts (Phaser scene)
- Any EventBus listeners

#### Step 5: Clean Up gameStore

Remove duplicated fields:
- streakCount, bestStreak
- sessionCorrect, sessionTotal
- Related actions

Keep in gameStore:
- score (current game score)
- coins (currency)
- hearts (lives)
- currentQuestion

### Part B: Zustand Helper (Optional - 30m)

#### Step 6: Extract Persist Helper

Create `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/Preliminary math checkpoint/capy-checkpoint-next/src/stores/createPersistedStore.ts`:

```ts
import { create, StateCreator } from 'zustand'
import { persist, PersistOptions } from 'zustand/middleware'

export function createPersistedStore<T extends object>(
  initializer: StateCreator<T>,
  options: PersistOptions<T, Partial<T>>
) {
  return create<T>()(persist(initializer, options))
}
```

#### Step 7: Refactor One Store (Pilot)

Convert settingsStore to use helper as proof of concept.

## Todo List

### Part A: Stats Consolidation
- [ ] Audit streak/session usage across codebase
- [ ] Design consolidated state shape
- [ ] Add session state to learningStore
- [ ] Add recordAnswer/resetSession actions
- [ ] Update StatsModal.tsx imports
- [ ] Update SessionSummary.tsx imports
- [ ] Update Game.ts scene calls
- [ ] Remove duplicates from gameStore
- [ ] Run tests: `npm test`
- [ ] Manual test: verify stats display

### Part B: Zustand Helper (Optional)
- [ ] Create createPersistedStore.ts helper
- [ ] Refactor settingsStore as pilot
- [ ] Document pattern in code-standards.md
- [ ] (Future) Refactor remaining 9 stores

## Success Criteria

1. Session stats only in learningStore
2. gameStore only contains: score, coins, hearts, currentQuestion
3. All tests pass
4. Stats modal shows correct data
5. Session summary works correctly
6. No duplicate streak tracking

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Break stats display | Medium | High | Full test suite before/after |
| Miss a consumer | Medium | Medium | Grep all usages first |
| localStorage migration | Low | Medium | Version key or clear storage |
| Type errors cascade | Medium | Medium | Fix types in order: store → consumers |

## Testing Strategy

```bash
cd "/Users/nad/My Drive (duc.a.nguyen@gmail.com)/Preliminary math checkpoint/capy-checkpoint-next"

# Run all tests
npm test

# Run specific store test
npm test -- gameStore.test.ts

# Manual verification
npm run dev
# Test: answer questions, check stats modal, check session summary
```

## Rollback

```bash
git checkout HEAD -- src/stores/gameStore.ts src/stores/learningStore.ts
git checkout HEAD -- src/components/StatsModal.tsx src/components/SessionSummary.tsx
```

# Phase 3: Daily Challenge

## Context

- **Parent Plan:** [plan.md](plan.md)
- **Dependencies:** Phase 1 (settings), Phase 2 (sounds)
- **Docs:** N/A

## Overview

| Field | Value |
|-------|-------|
| Date | 2025-12-19 |
| Description | Daily challenge system with streak calendar |
| Priority | P1 - High |
| Implementation Status | Pending |
| Review Status | Pending |

## Key Insights

- Start with easy "gimme" question for dopamine hit
- Streak protection prevents "quit-momentum"
- Local timezone for reset creates "fresh start" feeling
- Calendar heatmap shifts focus to consistency over perfection

## Requirements

1. 3-question daily challenge (quick play)
2. Daily streak counter with protection
3. Visual streak calendar (last 30 days)
4. Bonus coins for completing challenge
5. Reset at midnight local time

## Architecture

### New Files

```
src/stores/dailyChallengeStore.ts   # Challenge state & history
src/components/DailyChallenge.tsx   # Challenge modal/screen
src/components/StreakCalendar.tsx   # Visual calendar heatmap
src/types/dailyChallenge.ts         # Type definitions
```

### Modified Files

```
src/app/page.tsx                    # Add DailyChallenge button
src/game/scenes/Menu.ts             # Daily challenge button
src/components/MenuOverlay.tsx      # Show streak badge
```

## Related Code Files

- `src/stores/learningStore.ts:1-80` - Existing learning state pattern
- `src/components/MenuOverlay.tsx:1-70` - Menu overlay pattern
- `src/engine/questionSelector.ts:1-150` - Question selection

## Implementation Steps

### 3.1 Type Definitions (15 min)

```typescript
// src/types/dailyChallenge.ts
interface DailyChallengeState {
  lastCompletedDate: string | null;  // ISO date
  currentStreak: number;
  longestStreak: number;
  streakProtectionUsed: boolean;
  history: { date: string; completed: boolean }[];
}

interface DailyChallengeResult {
  correct: number;
  total: number;
  coinsEarned: number;
  streakMaintained: boolean;
}
```

### 3.2 Daily Challenge Store (45 min)

```typescript
// src/stores/dailyChallengeStore.ts
export const useDailyChallengeStore = create<DailyChallengeState>()(
  persist(
    (set, get) => ({
      lastCompletedDate: null,
      currentStreak: 0,
      longestStreak: 0,
      streakProtectionUsed: false,
      history: [],

      isAvailable: () => {
        const today = new Date().toISOString().split('T')[0];
        return get().lastCompletedDate !== today;
      },

      completeChallenge: (correct: number) => {
        const today = new Date().toISOString().split('T')[0];
        const wasYesterday = /* check if last was yesterday */;

        set((state) => {
          const newStreak = wasYesterday ? state.currentStreak + 1 : 1;
          return {
            lastCompletedDate: today,
            currentStreak: newStreak,
            longestStreak: Math.max(newStreak, state.longestStreak),
            history: [...state.history, { date: today, completed: true }].slice(-30),
          };
        });
      },

      useStreakProtection: () => {
        set({ streakProtectionUsed: true });
      },
    }),
    { name: 'capy-daily-challenge' }
  )
);
```

### 3.3 Question Selection for Challenge (30 min)

```typescript
// In questionSelector.ts or new file
export function selectDailyChallengeQuestions(
  questions: Question[],
  studentRating: number
): Question[] {
  // 1st: Easy (warmup)
  // 2nd: At level
  // 3rd: Slightly harder (challenge)
  return [
    selectByDifficulty(questions, studentRating - 100),
    selectByDifficulty(questions, studentRating),
    selectByDifficulty(questions, studentRating + 50),
  ];
}
```

### 3.4 DailyChallenge Component (60 min)

```tsx
// src/components/DailyChallenge.tsx
export function DailyChallenge({ onClose }: { onClose: () => void }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const { completeChallenge, currentStreak } = useDailyChallengeStore();

  // 3-question flow
  // Show question, record answer, advance
  // On complete: show results, award coins, update streak

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
      {/* Question display */}
      {/* Answer buttons */}
      {/* Progress indicator (1/3, 2/3, 3/3) */}
    </div>
  );
}
```

### 3.5 Streak Calendar (45 min)

```tsx
// src/components/StreakCalendar.tsx
export function StreakCalendar() {
  const { history } = useDailyChallengeStore();

  // Render 30-day grid
  // Green for completed, gray for missed, empty for future
  return (
    <div className="grid grid-cols-7 gap-1">
      {last30Days.map((day) => (
        <div
          key={day}
          className={getColorClass(day, history)}
          title={day}
        />
      ))}
    </div>
  );
}
```

### 3.6 Menu Integration (30 min)

```tsx
// src/components/MenuOverlay.tsx - add
{dailyChallengeAvailable && (
  <button className="animate-pulse bg-yellow rounded-full">
    🌟 Daily Challenge
  </button>
)}

// Show current streak badge
<div className="streak-badge">🔥 {currentStreak} day streak</div>
```

### 3.7 Coin Rewards (15 min)

```typescript
// Award coins based on performance
const DAILY_REWARDS = {
  perfect: 50,   // 3/3
  great: 30,     // 2/3
  good: 10,      // 1/3
};
```

## Todo List

- [ ] Create dailyChallengeStore.ts
- [ ] Add type definitions
- [ ] Implement isAvailable() with timezone handling
- [ ] Create question selection for challenge
- [ ] Build DailyChallenge component
- [ ] Build StreakCalendar component
- [ ] Add streak protection logic
- [ ] Integrate with Menu
- [ ] Add coin rewards
- [ ] Test timezone edge cases

## Success Criteria

- [ ] Daily challenge appears once per day
- [ ] 3 questions with increasing difficulty
- [ ] Streak increments on consecutive days
- [ ] Streak protection works (1 miss grace)
- [ ] Calendar shows last 30 days
- [ ] Coins awarded based on performance

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Timezone bugs | High | Medium | Use local date only, not UTC |
| Streak manipulation | Low | Low | Client-side only, acceptable |
| Overwhelming for kids | Medium | Medium | Keep it short (3 questions) |

## Security Considerations

- All state is client-side localStorage
- No server validation (acceptable for casual game)

## Next Steps

After Phase 3 completion:
1. Test across timezones
2. Monitor streak retention
3. Proceed to Phase 4 (Achievement Badges)

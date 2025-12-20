# Phase 4: Achievement Badges

## Context

- **Parent Plan:** [plan.md](plan.md)
- **Dependencies:** Phase 1-3 (all previous systems)
- **Docs:** N/A

## Overview

| Field | Value |
|-------|-------|
| Date | 2025-12-19 |
| Description | Badge collection and achievement system |
| Priority | P1 - High |
| Implementation Status | Pending |
| Review Status | Pending |

## Key Insights

- Tiered badges (Bronze → Silver → Gold) encourage replayability
- Collection grids with empty slots trigger Zeigarnik Effect
- Secret achievements maintain mystery
- 10-11 year olds respond to competence signaling

## Requirements

1. Badge definitions (20-30 badges across categories)
2. Badge collection page with grid view
3. Badge unlock notifications
4. Progress tracking for tiered badges
5. Secret achievements revealed at 50% progress

## Architecture

### New Files

```
src/data/badges.ts                  # Badge definitions
src/stores/badgeStore.ts            # Unlocked badges state
src/components/BadgeCollection.tsx  # Collection grid page
src/components/BadgeUnlock.tsx      # Unlock celebration overlay
src/types/badge.ts                  # Type definitions
```

### Modified Files

```
src/stores/learningStore.ts         # Emit events for badge triggers
src/app/page.tsx                    # Add BadgeUnlock overlay
src/components/Boutique.tsx         # Add "Badges" tab
```

## Related Code Files

- `src/data/boutique.ts:1-100` - Boutique item pattern
- `src/stores/learningStore.ts:1-200` - Learning events
- `src/components/MasteryCelebration.tsx:1-80` - Celebration pattern

## Implementation Steps

### 4.1 Type Definitions (15 min)

```typescript
// src/types/badge.ts
interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  category: 'accuracy' | 'streak' | 'mastery' | 'daily' | 'special';
  tier: 'bronze' | 'silver' | 'gold' | null;
  secret: boolean;
  requirement: BadgeRequirement;
}

interface BadgeRequirement {
  type: 'count' | 'streak' | 'mastery' | 'time' | 'special';
  target: number;
  progress?: (state: LearningState) => number;
}

interface UnlockedBadge {
  id: string;
  unlockedAt: string;
  tier: 'bronze' | 'silver' | 'gold';
}
```

### 4.2 Badge Definitions (30 min)

```typescript
// src/data/badges.ts
export const BADGES: Badge[] = [
  // Accuracy
  { id: 'first-flight', name: 'First Flight', emoji: '🐣',
    description: 'Complete your first game', category: 'accuracy',
    tier: null, secret: false,
    requirement: { type: 'count', target: 1 } },

  { id: 'sharpshooter-bronze', name: 'Sharpshooter', emoji: '🎯',
    description: 'Answer 10 questions correctly', category: 'accuracy',
    tier: 'bronze', secret: false,
    requirement: { type: 'count', target: 10 } },

  // Streak
  { id: 'streak-5', name: 'On Fire', emoji: '🔥',
    description: '5 correct in a row', category: 'streak',
    tier: 'bronze', secret: false,
    requirement: { type: 'streak', target: 5 } },

  { id: 'streak-10', name: 'Unstoppable', emoji: '💫',
    description: '10 correct in a row', category: 'streak',
    tier: 'silver', secret: false,
    requirement: { type: 'streak', target: 10 } },

  // Mastery
  { id: 'master-1', name: 'Topic Master', emoji: '🏆',
    description: 'Master 1 subtopic', category: 'mastery',
    tier: 'bronze', secret: false,
    requirement: { type: 'mastery', target: 1 } },

  // Daily
  { id: 'daily-3', name: 'Dedicated', emoji: '📅',
    description: '3-day daily challenge streak', category: 'daily',
    tier: 'bronze', secret: false,
    requirement: { type: 'streak', target: 3 } },

  // Special (Secret)
  { id: 'night-owl', name: 'Night Owl', emoji: '🦉',
    description: 'Play after 10pm', category: 'special',
    tier: null, secret: true,
    requirement: { type: 'time', target: 22 } },

  { id: 'speed-demon', name: 'Speed Demon', emoji: '⚡',
    description: 'Answer correctly in under 3 seconds', category: 'special',
    tier: null, secret: true,
    requirement: { type: 'special', target: 3000 } },
];
```

### 4.3 Badge Store (45 min)

```typescript
// src/stores/badgeStore.ts
export const useBadgeStore = create<BadgeState>()(
  persist(
    (set, get) => ({
      unlockedBadges: [],
      pendingUnlock: null,

      checkBadges: (state: LearningState) => {
        const unlocked = get().unlockedBadges;
        const newBadges: UnlockedBadge[] = [];

        for (const badge of BADGES) {
          if (unlocked.find(u => u.id === badge.id)) continue;
          if (meetsRequirement(badge, state)) {
            newBadges.push({
              id: badge.id,
              unlockedAt: new Date().toISOString(),
              tier: badge.tier || 'bronze',
            });
          }
        }

        if (newBadges.length > 0) {
          set({
            unlockedBadges: [...unlocked, ...newBadges],
            pendingUnlock: newBadges[0], // Show first unlock
          });
        }
      },

      dismissUnlock: () => set({ pendingUnlock: null }),

      getProgress: (badgeId: string, state: LearningState): number => {
        const badge = BADGES.find(b => b.id === badgeId);
        if (!badge) return 0;
        return calculateProgress(badge, state);
      },
    }),
    { name: 'capy-badges' }
  )
);
```

### 4.4 Badge Collection Page (60 min)

```tsx
// src/components/BadgeCollection.tsx
export function BadgeCollection({ onClose }: { onClose: () => void }) {
  const { unlockedBadges, getProgress } = useBadgeStore();
  const learningState = useLearningStore();

  const categories = ['accuracy', 'streak', 'mastery', 'daily', 'special'];

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-cream rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        <header className="bg-pink p-4 sticky top-0">
          <h2>Badge Collection</h2>
          <p>{unlockedBadges.length}/{BADGES.length} unlocked</p>
        </header>

        {categories.map(cat => (
          <section key={cat}>
            <h3>{cat}</h3>
            <div className="grid grid-cols-4 gap-3">
              {BADGES.filter(b => b.category === cat).map(badge => {
                const unlocked = unlockedBadges.find(u => u.id === badge.id);
                const progress = getProgress(badge.id, learningState);
                const showSecret = badge.secret && progress < 50;

                return (
                  <div key={badge.id} className={unlocked ? 'opacity-100' : 'opacity-50'}>
                    {showSecret ? '❓' : badge.emoji}
                    <p>{showSecret ? '???' : badge.name}</p>
                    {!unlocked && <ProgressBar value={progress} />}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
```

### 4.5 Badge Unlock Celebration (30 min)

```tsx
// src/components/BadgeUnlock.tsx
export function BadgeUnlock() {
  const { pendingUnlock, dismissUnlock } = useBadgeStore();

  if (!pendingUnlock) return null;

  const badge = BADGES.find(b => b.id === pendingUnlock.id);
  if (!badge) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-60 flex items-center justify-center animate-fade-in">
      <div className="bg-yellow rounded-3xl p-8 text-center animate-bounce-in">
        <div className="text-8xl mb-4">{badge.emoji}</div>
        <h2 className="text-2xl font-bold">Badge Unlocked!</h2>
        <p className="text-xl">{badge.name}</p>
        <p className="text-sm opacity-70">{badge.description}</p>
        <button onClick={dismissUnlock} className="mt-4">
          Awesome!
        </button>
      </div>
    </div>
  );
}
```

### 4.6 Integration with Learning Events (30 min)

```typescript
// In learningStore.ts recordAnswer()
// After recording answer, trigger badge check
badgeStore.getState().checkBadges(get());
```

## Todo List

- [ ] Create badge type definitions
- [ ] Define 20-30 badges across categories
- [ ] Implement badgeStore with persistence
- [ ] Create requirement checking logic
- [ ] Build BadgeCollection component
- [ ] Build BadgeUnlock celebration
- [ ] Integrate badge checks with learning events
- [ ] Add "Badges" button to menu
- [ ] Test all badge triggers
- [ ] Polish animations

## Success Criteria

- [ ] All badges display in collection grid
- [ ] Unlocked badges show with full opacity
- [ ] Locked badges show grayed with progress
- [ ] Secret badges show ??? until 50% progress
- [ ] Unlock celebration plays on new badge
- [ ] Badge count persists across sessions

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Too many notifications | Medium | Medium | Queue unlocks, show one at a time |
| Badge requirements too hard | Medium | High | Playtest, adjust targets |
| Progress calculation expensive | Low | Low | Cache progress values |

## Security Considerations

- All state is client-side localStorage
- No anti-cheat needed (casual game)

## Next Steps

After Phase 4 completion:
1. Gather player feedback on badge balance
2. Add more badges based on engagement data
3. Consider leaderboard for badge count

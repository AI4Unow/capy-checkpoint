# Phase 3: Personalization (2-3 days)

## Objective
Give students agency over their learning mode. Improve first-time experience.

---

## Task 3.1: Gentle Onboarding (First 10 Questions)

**Goal:** Smoother calibration for new players.

### Behavior Changes for New Users (totalResponses < 10)

1. **Start easier:** Initial rating 600 (vs 800 default)
2. **Faster adaptation:** K-factor 40 (vs 32)
3. **Visual cue:** "Calibrating your level..."
4. **Softer feedback:** No harsh wrong sounds

### Implementation

**Modify `src/engine/elo.ts`:**
```typescript
export function getKFactor(totalResponses: number): number {
  if (totalResponses < 10) return 40;  // Faster calibration
  if (totalResponses < 30) return 32;
  return 24;
}

export const INITIAL_RATING_NEW_USER = 600;  // Export for use
```

**Modify `learningStore.ts`:**
```typescript
// Add flag
onboardingComplete: boolean;  // Set true after 10 responses

// In recordAnswer
if (state.totalResponses === 10 && !state.onboardingComplete) {
  set({ onboardingComplete: true });
  EventBus.emit('onboarding-complete');
}
```

**File:** `src/components/CalibrationIndicator.tsx` (new)
```tsx
// Show during first 10 questions
// Progress: "Calibrating... 3/10"
// Disappears after 10 answers
```

**Files to modify:**
- `src/engine/elo.ts` - adjust K-factor, initial rating
- `src/stores/learningStore.ts` - add onboardingComplete flag
- `src/game/EventBus.ts` - add `ONBOARDING_COMPLETE` event
- `src/components/CalibrationIndicator.tsx` - new component

---

## Task 3.2: Pre-Session Mode Selection

**Goal:** Let student choose learning focus before playing.

### Modes

| Mode | Description | Algorithm Adjustment |
|------|-------------|---------------------|
| Adventure | Balanced (default) | Current weights |
| Practice | Focus weak areas | 70% weak, 20% due, 10% random |
| Review | Focus due items | 70% due, 20% weak, 10% random |
| Challenge | Only hard questions | +100 difficulty offset |

### Implementation

**Add to `learningStore.ts`:**
```typescript
sessionMode: 'adventure' | 'practice' | 'review' | 'challenge';
setSessionMode: (mode) => void;
```

**Modify `questionSelector.ts`:**
```typescript
const SELECTION_WEIGHTS_BY_MODE = {
  adventure: { dueForReview: 0.4, weakSubtopic: 0.3, currentWorld: 0.2, random: 0.1 },
  practice:  { dueForReview: 0.2, weakSubtopic: 0.7, currentWorld: 0.0, random: 0.1 },
  review:    { dueForReview: 0.7, weakSubtopic: 0.2, currentWorld: 0.0, random: 0.1 },
  challenge: { dueForReview: 0.4, weakSubtopic: 0.3, currentWorld: 0.2, random: 0.1 },
};

// For challenge mode, add +100 to difficulty matching
```

**File:** `src/components/ModeSelector.tsx` (new)
```tsx
// Pre-game modal or menu section
// 4 buttons with icons and descriptions
// Stores selection in learningStore
```

**Integration:**
- Show ModeSelector before game starts
- Pass mode to questionSelector via context

**Files to modify:**
- `src/stores/learningStore.ts` - add sessionMode state
- `src/engine/questionSelector.ts` - mode-aware weights
- `src/components/ModeSelector.tsx` - new component
- Game flow to show selector before starting

---

## Testing Checklist

- [ ] New users start at rating 600
- [ ] Calibration indicator shows 1-10 progress
- [ ] K-factor is 40 for first 10 responses
- [ ] Mode selector appears before game
- [ ] Practice mode heavily weights weak subtopics
- [ ] Review mode heavily weights due items
- [ ] Challenge mode increases question difficulty

---

## Rollback Plan

- Revert elo.ts changes
- Remove mode-related state
- Remove new UI components

# Phase 1: Quick Wins (1-2 days)

## Objective
Make adaptive learning visible with minimal code changes. High impact, low effort.

---

## Task 1.1: Difficulty Indicator

**Goal:** Show current difficulty level in-game so students understand adaptation.

### Implementation

**File:** `src/components/DifficultyIndicator.tsx` (new)
```tsx
// Display: "Warm-up" | "Practice" | "Challenge" | "Boss Level"
// Based on question.difficulty relative to studentRating
// Colors: green -> yellow -> orange -> purple
```

**Logic (add to questionSelector.ts or new util):**
```typescript
export function getDifficultyLabel(questionDiff: number, studentRating: number): string {
  const delta = questionDiff - studentRating;
  if (delta < -100) return 'warm-up';
  if (delta < 50) return 'practice';
  if (delta < 150) return 'challenge';
  return 'boss';
}
```

**Integration:**
- Emit `DIFFICULTY_CHANGE` event when question selected in `Game.ts`
- React component listens via `EventBus.on()`
- Position: top-right corner, semi-transparent badge

**Files to modify:**
- `src/game/EventBus.ts` - add `DIFFICULTY_CHANGE` event
- `src/game/scenes/Game.ts` - emit event in `selectNextQuestion()`
- `src/components/DifficultyIndicator.tsx` - new file
- `src/components/GameUI.tsx` (or wrapper) - mount indicator

---

## Task 1.2: Mastery Celebration

**Goal:** Celebrate when subtopic reaches "mastered" (80%+ after 5+ attempts).

### Implementation

**Detect mastery change in `learningStore.ts`:**
```typescript
// In recordAnswer, check before/after status
const prevStatus = mastery?.status;
const newStatus = updatedMastery.status;
if (prevStatus !== 'mastered' && newStatus === 'mastered') {
  set({ lastMasteredSubtopic: question.subtopic });
  EventBus.emit('mastery-achieved', { subtopic: question.subtopic });
}
```

**File:** `src/components/MasteryCelebration.tsx` (new)
```tsx
// Modal/toast with confetti animation
// Display: "Fractions Mastered!" + 50 bonus coins
// Auto-dismiss after 2.5s
```

**Files to modify:**
- `src/stores/learningStore.ts` - track mastery transitions, emit event
- `src/game/EventBus.ts` - add `MASTERY_ACHIEVED` event
- `src/components/MasteryCelebration.tsx` - new celebration component

---

## Task 1.3: Enhanced Session Summary

**Goal:** Add learning insights section to SessionSummary.

### Implementation

**Add to `learningStore.ts`:**
```typescript
// Track during session
sessionMasteries: string[];         // newly mastered this session
sessionImproved: { subtopic: string; delta: number }[];
sessionWeakest: { subtopic: string; wrongCount: number }[];
```

**Modify `SessionSummary.tsx`:**
```tsx
// New section: "Learning Insights"
// - Improved: Fractions (+15%)
// - Needs Work: Decimals (3/5 wrong)
// - Mastered Today: Place Value
// - Due Tomorrow: [count] topics
```

**Files to modify:**
- `src/stores/learningStore.ts` - add session tracking fields
- `src/components/SessionSummary.tsx` - add LearningInsights section

---

## Testing Checklist

- [ ] Difficulty badge updates on each question
- [ ] Mastery celebration triggers at 80%+ with 5+ attempts
- [ ] Session summary shows correct improvement data
- [ ] No performance regression (animations 60fps)

---

## Rollback Plan

All changes additive. Remove new components to revert.

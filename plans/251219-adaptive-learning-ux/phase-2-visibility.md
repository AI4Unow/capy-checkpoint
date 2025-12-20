# Phase 2: Visibility (2-3 days)

## Objective
Make the "why" of question selection transparent. Build metacognition.

---

## Task 2.1: "Why This Question?" Indicator

**Goal:** Brief tooltip showing why each question was selected.

### Question Selection Reasons
From `questionSelector.ts` weights:
- 40% `review` - "Due for review"
- 30% `weak` - "Needs practice"
- 20% `world` - "World topic"
- 10% `random` - "Mix it up!"

### Implementation

**Modify `questionSelector.ts`:**
```typescript
interface QuestionSelection {
  question: Question;
  reason: 'review' | 'weak' | 'world' | 'random';
}

export function selectNextQuestion(...): QuestionSelection {
  // Return both question AND reason
}
```

**Emit reason via EventBus:**
```typescript
// In Game.ts selectNextQuestion()
EventBus.emit('question-reason', { reason, subtopic: question.subtopic });
```

**File:** `src/components/QuestionReasonBadge.tsx` (new)
```tsx
// Icons + short text
// review: "Due today"
// weak: "Needs work"
// world: "Forest topic"
// random: "Surprise!"
// Fade in, visible 1.5s, fade out
```

**Files to modify:**
- `src/engine/questionSelector.ts` - return reason with question
- `src/stores/learningStore.ts` - update `selectQuestion` to use new return type
- `src/game/EventBus.ts` - add `QUESTION_REASON` event
- `src/game/scenes/Game.ts` - emit reason event
- `src/components/QuestionReasonBadge.tsx` - new file

---

## Task 2.2: Visible Streak Bonuses

**Goal:** Make streak system visible with escalating rewards.

### Streak Milestones
- 3-streak: "Nice!" + visual flair (no bonus)
- 5-streak: +20 bonus coins
- 10-streak: +100 coins + cosmetic unlock hint

### Implementation

**Modify `learningStore.ts`:**
```typescript
// In recordAnswer, check streak milestones
if (newStreak === 5 || newStreak === 10) {
  EventBus.emit('streak-milestone', {
    count: newStreak,
    bonus: newStreak === 5 ? 20 : 100
  });
}
```

**In-game visual (Game.ts):**
```typescript
// Listen for streak-milestone event
// Show floating text: "5-streak! +20"
// Fire animation evolves: small -> medium -> large flame
```

**File:** `src/components/StreakDisplay.tsx` (new or enhance existing)
```tsx
// Animated fire icon that grows with streak
// Pulse animation on milestone
```

**Files to modify:**
- `src/stores/learningStore.ts` - emit streak events
- `src/game/EventBus.ts` - add `STREAK_MILESTONE` event
- `src/game/scenes/Game.ts` - handle visual feedback
- `src/components/StreakDisplay.tsx` - streak UI component

---

## Task 2.3: Daily Review Reminder (Menu)

**Goal:** Show pending reviews on menu screen.

### Implementation

**Add to `learningStore.ts`:**
```typescript
getDueReviewCount: () => number;
// Count sm2Entries where isDueForReview(state) === true
```

**Modify `Menu.ts` (Phaser scene):**
- Not ideal for dynamic React state
- **Alternative:** Create React `MenuOverlay` component

**File:** `src/components/MenuOverlay.tsx` (new)
```tsx
// Positioned over Phaser menu
// Shows: "5 topics due for review today"
// If 0 due: "All caught up!"
```

**Files to modify:**
- `src/stores/learningStore.ts` - add `getDueReviewCount()`
- `src/components/MenuOverlay.tsx` - new component
- App wrapper to conditionally show overlay on menu

---

## Testing Checklist

- [ ] Question reason shows briefly, not disruptive
- [ ] Streak milestones trigger at correct counts
- [ ] Streak bonuses add to coin total
- [ ] Due count accurate on menu

---

## Rollback Plan

Remove new components and event emissions.

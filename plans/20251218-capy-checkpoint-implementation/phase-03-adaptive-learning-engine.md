# Phase 3: Adaptive Learning Engine

## Context Links

- **Parent Plan:** [plan.md](./plan.md)
- **Depends On:** [Phase 2 - Question System](./phase-02-question-system-gates.md)
- **Research:** [Adaptive Learning Research](./research/researcher-02-adaptive-learning.md)

---

## Overview

| Field | Value |
|-------|-------|
| Date | 2025-12-18 |
| Priority | P0 - Critical |
| Status | pending |
| Description | Elo rating, question selection, mastery tracking, spaced repetition |

---

## Key Insights

From research:
- **Elo:** K=32 initially (first 30 responses), then K=16 for stability
- **Target:** ~70% success rate for optimal learning
- **Mastery:** 80% threshold with decaying average (65% recent, 35% history)
- **SM-2:** Simplified intervals [1, 6, interval×EF], reset to 1 on fail
- **Selection:** Weighted priority (40% due, 30% weak, 20% theme, 10% random)

---

## Requirements

### Functional
- F1: Track student Elo rating (start at 1000)
- F2: Track question difficulty ratings
- F3: Select questions matching student ability (±200 Elo)
- F4: Update ratings after each answer
- F5: Track mastery per subtopic (rolling window)
- F6: Spaced repetition for weak topics
- F7: Display current rating in UI (optional: hide exact number, show level)

### Non-Functional
- NF1: Rating updates < 50ms (all local computation)
- NF2: Question selection < 100ms
- NF3: Ratings persist across sessions (localStorage initially)

---

## Architecture

### Elo System
```typescript
interface EloState {
  studentRating: number; // default 1000
  kFactor: number; // 32 initially, 16 after 30 responses
  responsesCount: number;
}

function calculateExpected(studentRating: number, questionDifficulty: number): number {
  return 1 / (1 + Math.pow(10, (questionDifficulty - studentRating) / 400));
}

function updateRating(current: number, expected: number, actual: 0 | 1, k: number): number {
  return Math.round(current + k * (actual - expected));
}
```

### Question Selection Algorithm
```typescript
function selectNextQuestion(
  questions: Question[],
  studentRating: number,
  mastery: SubtopicMastery[],
  dueForReview: Question[],
  currentWorld: string
): Question {
  // Priority weights
  const weights = { due: 0.4, weak: 0.3, theme: 0.2, random: 0.1 };

  // Roll weighted random
  const roll = Math.random();

  if (roll < weights.due && dueForReview.length > 0) {
    return pickFromDue(dueForReview);
  } else if (roll < weights.due + weights.weak) {
    return pickFromWeakest(questions, mastery, studentRating);
  } else if (roll < weights.due + weights.weak + weights.theme) {
    return pickFromTheme(questions, currentWorld, studentRating);
  }
  return pickRandom(questions, studentRating);
}

function pickFromWeakest(questions, mastery, rating): Question {
  // Find subtopic with lowest mastery, select question ±200 of rating
  const weakest = mastery.sort((a, b) => a.score - b.score)[0];
  const candidates = questions.filter(q =>
    q.subtopic === weakest.subtopic &&
    Math.abs(q.difficulty - rating) <= 200
  );
  return pickRandom(candidates);
}
```

### Mastery Tracking
```typescript
interface SubtopicMastery {
  subtopic: string;
  topic: string;
  score: number; // 0.0 - 1.0
  status: 'not_started' | 'learning' | 'mastered';
  attempts: number;
  lastAttempt: Date;
}

function updateMastery(
  current: SubtopicMastery,
  isCorrect: boolean
): SubtopicMastery {
  const currentScore = isCorrect ? 1 : 0;
  // Decaying average: 65% recent, 35% history
  const newScore = (currentScore * 0.65) + (current.score * 0.35);

  return {
    ...current,
    score: newScore,
    attempts: current.attempts + 1,
    status: getStatus(newScore, current.attempts + 1),
    lastAttempt: new Date()
  };
}

function getStatus(score: number, attempts: number): string {
  if (attempts < 5) return 'learning';
  if (score >= 0.8) return 'mastered';
  return 'learning';
}
```

### Spaced Repetition (Simplified SM-2)
```typescript
interface SM2State {
  interval: number; // days until next review
  easeFactor: number; // default 2.5
  repetitions: number;
  nextReview: Date;
}

function updateSM2(state: SM2State, quality: number): SM2State {
  // quality: 0-5 (0=fail, 3=hard pass, 5=easy)
  let { interval, easeFactor, repetitions } = state;

  if (quality >= 3) {
    // Correct
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);
    repetitions++;
  } else {
    // Wrong - reset
    repetitions = 0;
    interval = 1;
  }

  // Update ease factor
  easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * 0.08));

  return {
    interval,
    easeFactor,
    repetitions,
    nextReview: addDays(new Date(), interval)
  };
}
```

### Component Structure
```
src/
├── engine/
│   ├── elo.ts              # Elo calculations
│   ├── mastery.ts          # Mastery tracking
│   ├── sm2.ts              # Spaced repetition
│   └── questionSelector.ts # Selection algorithm
├── stores/
│   └── learningStore.ts    # Zustand for adaptive state
└── components/
    └── RatingDisplay.tsx   # Show rating/level in HUD
```

---

## Related Code Files

| File | Purpose |
|------|---------|
| `src/engine/elo.ts` | Elo rating calculations |
| `src/engine/mastery.ts` | Subtopic mastery logic |
| `src/engine/sm2.ts` | Spaced repetition algorithm |
| `src/engine/questionSelector.ts` | Weighted question selection |
| `src/stores/learningStore.ts` | Adaptive state management |
| `src/components/RatingDisplay.tsx` | Rating/level UI |
| `src/types/learning.ts` | Interfaces for Elo, Mastery, SM2 |

---

## Implementation Steps

1. **Create learning types** in `src/types/learning.ts`
   - EloState, SubtopicMastery, SM2State interfaces

2. **Implement Elo module** `src/engine/elo.ts`
   ```typescript
   export const calculateExpected = (sr: number, qd: number) =>
     1 / (1 + Math.pow(10, (qd - sr) / 400));

   export const updateRating = (curr: number, exp: number, actual: 0|1, k: number) =>
     Math.round(curr + k * (actual - exp));

   export const getKFactor = (responses: number) =>
     responses < 30 ? 32 : 16;
   ```

3. **Implement mastery module** `src/engine/mastery.ts`
   - `updateMastery()` with decaying average
   - `getWeakestSubtopics()` for selection
   - `getMasteryStatus()` for UI display

4. **Implement SM2 module** `src/engine/sm2.ts`
   - `updateSM2()` algorithm
   - `getDueItems()` for review queue
   - Helper: `addDays()` date utility

5. **Implement question selector** `src/engine/questionSelector.ts`
   - `selectNextQuestion()` with weighted priority
   - Filter by rating range (±200)
   - Avoid recent questions (last 5)

6. **Create learningStore** with Zustand
   ```typescript
   interface LearningState {
     studentRating: number;
     responsesCount: number;
     subtopicMastery: Map<string, SubtopicMastery>;
     sm2States: Map<string, SM2State>;

     // Actions
     recordAnswer: (questionId: string, isCorrect: boolean, difficulty: number) => void;
     getNextQuestion: (questions: Question[], currentWorld: string) => Question;
   }
   ```

7. **Integrate with gameStore**
   - On answer: call `learningStore.recordAnswer()`
   - Before gate: call `learningStore.getNextQuestion()`

8. **Create RatingDisplay component**
   - Show level name based on rating range:
     - 600-800: "Apprentice"
     - 800-1000: "Scholar"
     - 1000-1200: "Expert"
     - 1200+: "Master"
   - Optional: show actual rating number
   - Progress bar to next level

9. **Persist to localStorage**
   ```typescript
   // In learningStore
   persist: {
     name: 'capy-learning',
     storage: createJSONStorage(() => localStorage)
   }
   ```

10. **Add mastery progress UI**
    - Per-topic progress bars (5 topics)
    - Color-coded: red (<50%), yellow (50-80%), green (80%+)

11. **Test adaptive behavior**
    - Verify rating increases on correct streak
    - Verify weaker topics get more questions
    - Verify due items surface appropriately

---

## Rating Display Levels

| Rating | Level | Icon |
|--------|-------|------|
| < 700 | Seedling | 🌱 |
| 700-850 | Sprout | 🌿 |
| 850-1000 | Bloom | 🌸 |
| 1000-1150 | Tree | 🌳 |
| 1150-1300 | Star | ⭐ |
| > 1300 | Rainbow | 🌈 |

---

## Todo List

- [ ] Create learning TypeScript interfaces
- [ ] Implement Elo calculation module
- [ ] Implement mastery tracking module
- [ ] Implement SM-2 spaced repetition
- [ ] Implement question selection algorithm
- [ ] Create learningStore with Zustand
- [ ] Integrate with game answer flow
- [ ] Add localStorage persistence
- [ ] Create RatingDisplay component
- [ ] Add mastery progress bars
- [ ] Test rating convergence
- [ ] Test weak topic prioritization

---

## Success Criteria

- [ ] Student rating adjusts correctly after answers
- [ ] Questions selected within ±200 rating range
- [ ] Weak subtopics appear more frequently
- [ ] Rating persists across browser sessions
- [ ] ~70% success rate achieved over 50+ questions
- [ ] UI shows meaningful progress feedback

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Rating converges too slowly | Medium | Medium | Use K=32 for longer (50 responses) |
| Rating oscillates wildly | Low | Medium | Floor/ceiling at 400/1600 |
| Not enough questions per subtopic | Medium | High | Widen selection to ±300 rating |
| SM2 intervals too long | Low | Low | Cap at 14 days for initial phase |

---

## Security Considerations

- Rating stored locally, no server validation
- User can manipulate localStorage (acceptable for personal use)
- Future: Supabase will be source of truth

---

## Next Steps

After Phase 3 complete:
1. Proceed to **Phase 4: Supabase Integration**
2. Move adaptive data to database
3. Enable cross-device sync

---

## Unresolved Questions

1. **Cold Start:** Should we add a 5-question diagnostic at first launch to better estimate initial rating?
2. **Question Recalibration:** Should question difficulty adjust based on aggregate answers? (deferred to later phase)
3. **Per-Topic Rating:** Should each topic have its own Elo, or single global rating? (starting with global for simplicity)

# Root Cause Analysis: Easy Questions Not Appearing First for New Students

**Date:** 2025-12-24
**Investigator:** Debugger Agent
**Issue:** New students getting hard questions instead of easy ones on first play

---

## Executive Summary

**Root Cause:** Initial student rating (800) mismatched with question difficulty distribution (650-950, mean 792.7). New students start at rating 800, causing selector to serve mid-to-hard difficulty questions (800-1000 range) which contain 60% of all questions.

**Impact:** Poor onboarding experience, frustration, early dropout risk

**Solution Priority:** HIGH - affects first impressions and retention

---

## Technical Analysis

### 1. Question Difficulty Distribution

**Data File:** `capy-checkpoint-next/src/data/all-questions.json`

```
Total questions: 560
Valid difficulties: 483 (77 missing difficulty values)
Min difficulty: 650
Max difficulty: 950
Mean difficulty: 792.7

Distribution:
  650-800: 194 questions (40%)
  800-1000: 289 questions (60%)
```

**Problem:** No questions exist below 650 difficulty. New students need 600-700 range for gentle onboarding.

### 2. Student Rating Initialization

**File:** `capy-checkpoint-next/src/stores/learningStore.ts`
**Line:** 91

```typescript
const INITIAL_RATING = 800;
```

**Problem:** Starting at 800 means selector immediately serves 800-1000 difficulty questions (60% of pool).

**Note:** Comment in `elo.ts` line 46 mentions `INITIAL_RATING_NEW_USER = 600` but it's **not used** anywhere. Current code uses 800 from `learningStore.ts`.

### 3. Question Selection Algorithm

**File:** `capy-checkpoint-next/src/engine/questionSelector.ts`
**Function:** `selectNextQuestion()` (lines 71-169)

**Selection Logic:**
1. Filters recent questions (last 5)
2. Weighted random selection:
   - 40% - Due for review (SM2)
   - 30% - Weak subtopic (mastery)
   - 20% - Current world theme
   - 10% - Random fallback
3. All paths use `isInRatingRange()` with ±200 range (line 220-226)

**Problem Analysis:**

```typescript
// Line 220-226
function isInRatingRange(
  questionDifficulty: number,
  studentRating: number,
  range: number = 200
): boolean {
  return Math.abs(questionDifficulty - studentRating) <= 200;
}
```

**For new student at rating 800:**
- Range: 600-1000
- Questions available: ALL 483 questions (650-950 all within range)
- Questions served: Random selection weighted toward 800-1000 (60% of pool)

### 4. Onboarding Calibration Period

**File:** `capy-checkpoint-next/src/stores/learningStore.ts`
**Lines:** 203-209

```typescript
// Onboarding completes after 10 questions
if (!onboardingComplete && newTotalResponses >= 10) {
  onboardingComplete = true;
  EventBus.emit(GameEvents.ONBOARDING_COMPLETE);
}
```

**File:** `capy-checkpoint-next/src/engine/elo.ts`
**Lines:** 36-41

```typescript
// K-factor during onboarding (fast calibration)
export function getKFactor(responsesCount: number): number {
  if (responsesCount < 10) return 40; // Fast calibration during onboarding
  if (responsesCount < 30) return 32;
  // ...
}
```

**Problem:** High K-factor (40) enables fast rating adjustment, BUT selector doesn't enforce "easy first" during onboarding. New student at 800 gets random difficulty 600-1000, likely 800-950 due to distribution skew.

### 5. Evidence Chain

**Timeline for New Student (totalResponses = 0, rating = 800):**

1. **First question request:**
   - studentRating: 800
   - masteryMap: empty
   - sm2Map: empty
   - Selection falls to "random" path (line 153-163)
   - Filters for rating range 600-1000
   - Result: Random from entire pool, 60% likely 800-1000 difficulty

2. **If student gets wrong answer (difficult question):**
   - Expected success: ~50% (question at 800 vs student at 800)
   - Actual: 0 (wrong)
   - K-factor: 40
   - New rating: 800 + 40*(0 - 0.5) = 780
   - Still serves 580-980 range

3. **Calibration drift:**
   - Takes 3-5 wrong answers to drop below 700
   - By then, student frustrated

---

## Root Cause Summary

**Three-factor failure:**

1. **Initialization mismatch:** `INITIAL_RATING = 800` vs question pool min 650, mean 792.7
2. **No onboarding override:** `selectNextQuestion()` treats new students same as experienced
3. **Distribution skew:** 60% questions in 800-1000 range, random selection biased toward harder questions

**Why it fails:**

New students start at 800, selector serves random questions in 600-1000 range, distribution skew means 60% chance of getting 800-950 difficulty questions. No "easy first" logic exists for onboarding period (first 10 questions).

---

## Solution Design

### Option 1: Lower Initial Rating (Quick Fix)
**File:** `capy-checkpoint-next/src/stores/learningStore.ts:91`

```typescript
const INITIAL_RATING = 600; // Was 800
```

**Impact:**
- Questions served: 400-800 range
- Available: 194 questions (650-800)
- Effect: Gentle start, but still random within range

**Pros:** One-line fix, immediate effect
**Cons:** Doesn't guarantee easy questions first, just shifts distribution

### Option 2: Onboarding-Specific Selector (Recommended)
**File:** `capy-checkpoint-next/src/engine/questionSelector.ts`

Add onboarding logic to `selectNextQuestion()`:

```typescript
export function selectNextQuestion(
  questions: Question[],
  context: SelectionContext
): QuestionSelection {
  const { studentRating, totalResponses } = context;

  // ONBOARDING MODE: First 10 questions progressive difficulty
  if (totalResponses < 10) {
    const targetDifficulty = 600 + (totalResponses * 20); // 600, 620, 640...780
    return selectByClosestDifficulty(questions, targetDifficulty, 'onboarding');
  }

  // Regular selection logic...
}
```

**Files to modify:**
1. `src/engine/questionSelector.ts` - Add onboarding path (lines 71-83)
2. `src/stores/learningStore.ts` - Pass `totalResponses` to selector (line 249)

**Pros:** Guaranteed easy→medium progression, smooth UX
**Cons:** Requires passing `totalResponses` to selector

### Option 3: Hybrid Approach (Best)
**Combine both solutions:**

1. Lower initial rating to 600 (align with elo.ts comment intent)
2. Add onboarding progression for first 5 questions:
   - Q1-3: Force 650-700 difficulty
   - Q4-6: Force 700-750 difficulty
   - Q7-10: Normal selection with rating 600-700

**Implementation:**

**File 1:** `capy-checkpoint-next/src/stores/learningStore.ts`
```typescript
// Line 91
const INITIAL_RATING = 600; // Changed from 800
```

**File 2:** `capy-checkpoint-next/src/engine/questionSelector.ts`
```typescript
// Add after line 82 (before weighted selection)
// Onboarding: Progressive difficulty for first 10 questions
if (context.totalResponses !== undefined && context.totalResponses < 10) {
  const targetDifficulty = 650 + (Math.floor(context.totalResponses / 3) * 50);
  // Q0-2: 650, Q3-5: 700, Q6-8: 750, Q9: 800
  const candidates = available
    .filter(q => Math.abs(q.difficulty - targetDifficulty) <= 50)
    .sort((a, b) => Math.abs(a.difficulty - targetDifficulty) - Math.abs(b.difficulty - targetDifficulty));

  if (candidates.length > 0) {
    return {
      question: pickRandomFromArray(candidates.slice(0, 5)), // Top 5 closest
      reason: 'onboarding',
    };
  }
}
```

**File 3:** Update `SelectionContext` interface (line 58-65)
```typescript
interface SelectionContext {
  studentRating: number;
  currentWorld: number;
  masteryMap: Map<string, SubtopicMastery>;
  sm2Map: Map<string, SM2State>;
  recentQuestionIds: string[];
  sessionMode?: SessionMode;
  totalResponses?: number; // ADD THIS
}
```

**File 4:** `capy-checkpoint-next/src/stores/learningStore.ts` (line 249)
```typescript
selectQuestion: (questions) => {
  const state = get();
  return selectNextQuestion(questions, {
    studentRating: state.studentRating,
    currentWorld: state.currentWorld,
    masteryMap: get().getMasteryMap(),
    sm2Map: get().getSM2Map(),
    recentQuestionIds: state.recentQuestionIds,
    sessionMode: state.sessionMode,
    totalResponses: state.totalResponses, // ADD THIS
  });
},
```

---

## Files to Modify (Hybrid Solution)

| File | Lines | Change |
|------|-------|--------|
| `src/stores/learningStore.ts` | 91 | `INITIAL_RATING = 600` |
| `src/stores/learningStore.ts` | 255 | Add `totalResponses` to context |
| `src/engine/questionSelector.ts` | 58-65 | Add `totalResponses?` to interface |
| `src/engine/questionSelector.ts` | 83-99 | Add onboarding logic block |
| `src/game/EventBus.ts` | N/A | Add `'onboarding'` to `QuestionReason` type if needed |

---

## Testing Requirements

### Unit Tests
**File:** `src/engine/questionSelector.test.ts`

Add test cases:
```typescript
describe('Onboarding selection', () => {
  it('serves 650-700 questions for first 3 responses', () => {
    const context = { studentRating: 600, totalResponses: 0, ... };
    const selected = selectNextQuestion(mockQuestions, context);
    expect(selected.question.difficulty).toBeGreaterThanOrEqual(650);
    expect(selected.question.difficulty).toBeLessThanOrEqual(700);
    expect(selected.reason).toBe('onboarding');
  });

  it('serves 700-750 questions for responses 3-5', () => {
    const context = { studentRating: 620, totalResponses: 4, ... };
    // Assert 700-750 range
  });

  it('exits onboarding after 10 responses', () => {
    const context = { studentRating: 680, totalResponses: 10, ... };
    const selected = selectNextQuestion(mockQuestions, context);
    expect(selected.reason).not.toBe('onboarding');
  });
});
```

### Integration Tests
1. Reset learningStore
2. Play 10 questions as new student
3. Assert first 3 questions difficulty 650-700
4. Assert questions 4-6 difficulty 700-750
5. Assert rating after 10 questions reflects performance, not arbitrary 800

---

## Preventive Measures

1. **Data validation:** Add CI check for question difficulty distribution
   - Ensure 20%+ questions in each 200-point range
   - Alert if 600-800 range drops below 100 questions

2. **Onboarding monitoring:** Track first-session metrics
   - Average difficulty of first 10 questions
   - Success rate by question number
   - Drop-off rate vs question difficulty

3. **Default value documentation:** Document why `INITIAL_RATING = 600`
   - Add comment referencing Cambridge Primary Grade 5 baseline
   - Link to question difficulty design doc

---

## Unresolved Questions

1. **Question pool gap:** Why no questions below 650 difficulty?
   - Is this Cambridge Primary Checkpoint standard minimum?
   - Should we generate 400-650 questions for younger students (Grade 3-4)?

2. **77 missing difficulties:** 560 total questions, only 483 have `difficulty` values
   - Which questions lack difficulty ratings?
   - Should these be excluded from selection until rated?

3. **World progression:** `WORLDS_UNLOCK_RATING` starts at 750 for World 2
   - With new 600 initial rating, how does this affect progression?
   - Should World 2 unlock threshold drop to 650?

4. **Daily Challenge:** Uses `selectDailyChallengeQuestions()` with student rating
   - Does this also need onboarding override?
   - Should first daily challenge be easier?

---

## References

**Code Files Analyzed:**
- `src/engine/questionSelector.ts` (lines 1-304)
- `src/engine/elo.ts` (lines 1-85)
- `src/stores/learningStore.ts` (lines 1-452)
- `src/data/all-questions.json` (560 questions)

**Design Documents:**
- `docs/codebase-summary.md` - Adaptive learning engine overview
- `CLAUDE.md` - Capy-Checkpoint project architecture

**Test Coverage:**
- `src/engine/questionSelector.test.ts` - Current tests don't cover onboarding
- `src/engine/elo.test.ts` - K-factor tests confirm fast calibration intent

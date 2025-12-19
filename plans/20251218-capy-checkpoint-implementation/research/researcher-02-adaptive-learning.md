# Research Report: Adaptive Learning System Implementation
Date: 2025-12-18
Topic: Elo Rating, Spaced Repetition, Mastery-Based Learning, and Supabase Schema

## 1. Elo Rating System for Education
Adapts student ability ($R_s$) and question difficulty ($R_q$) simultaneously.

### Formulas
- **Expected Score ($E$):** $E_s = \frac{1}{1 + 10^{(R_q - R_s) / 400}}$
- **Rating Update:** $R_{new} = R_{old} + K(S - E)$
  - $S$: 1 (correct), 0 (incorrect)

### Strategy
- **K-Factor:** Use $K=32$ or $K=40$ for the first 20-30 interactions (provisional) to allow fast convergence. Transition to $K=16$ for stability once the rating stabilizes.
- **Initial Ratings:** Set both new students and new questions to 1200 or 1500.
- **Bi-directional update:** When a student answers, update both $R_s$ and $R_q$. If a student fails an "easy" question, $R_s$ drops and $R_q$ decreases (becomes "harder" in rating terms, though traditionally Elo uses higher numbers for higher skill; in education, $R_q$ often represents difficulty where higher = harder).

## 2. Spaced Repetition (SM-2)
Optimizes retention by expanding intervals between reviews.

### Algorithm (Simplified)
```typescript
interface SM2State {
  repetitions: number; // n
  easeFactor: number;  // EF, default 2.5
  interval: number;    // I, in days
}

function calculateNextReview(state: SM2State, quality: number): SM2State {
  // quality: 0 (blackout) to 5 (perfect)
  let { repetitions, easeFactor, interval } = state;

  if (quality >= 3) { // Correct
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);

    repetitions++;
  } else { // Incorrect
    repetitions = 0;
    interval = 1;
  }

  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  easeFactor = Math.max(1.3, easeFactor);

  return { repetitions, easeFactor, interval };
}
```

## 3. Mastery-Based Learning
### Mastery Thresholds
- **The 80% Rule:** Proficiency is reached when a student maintains ≥80% accuracy over a rolling window.
- **Rolling Window Calculation:** Use a **Decaying Average** to prioritize recent performance.
  - $M_{new} = (S_{current} \times 0.65) + (M_{old} \times 0.35)$
  - This allows "redemption" while preventing one-off lucky guesses from triggering mastery.

### Progress Tracking
- Map questions to **Learning Objectives (LOs)**.
- Mastery is achieved per LO, not per course.

## 4. Supabase Schema Design
Recommended relational structure with JSONB for flexibility.

```typescript
// Core Tables
interface Profile {
  id: string; // references auth.users
  elo_rating: number; // default 1200
}

interface Question {
  id: bigint;
  topic_id: bigint;
  difficulty_elo: number; // current question difficulty
  content: any; // JSONB for text, images, options
}

interface StudentResponse {
  id: bigint;
  student_id: string;
  question_id: bigint;
  is_correct: boolean;
  quality_score: number; // 0-5 for SM-2
  timestamp: string;
}

interface StudentMastery {
  student_id: string;
  topic_id: bigint;
  mastery_score: number; // 0.0 to 1.0
  status: 'not_started' | 'learning' | 'mastered';
  sm2_data: {
    next_review: string; // ISO date
    ease_factor: number;
    interval: number;
    reps: number;
  }; // Combined for topic-level spacing
}
```

## Unresolved Questions
1. **Cold Start:** How to accurately place a student's initial Elo if they are not a "beginner"? (Consider a short diagnostic test).
2. **K-Factor for Questions:** Should the K-factor for questions decrease over time as more data is collected (e.g., $K_q = 32 / \sqrt{n}$)?
3. **Cross-Topic Spacing:** How to handle SM-2 intervals when a student is working on multiple interdependent topics? (Prerequisite chaining logic).

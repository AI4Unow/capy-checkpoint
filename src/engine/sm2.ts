/**
 * SM-2 Spaced Repetition Algorithm (Simplified)
 */

export interface SM2State {
  interval: number; // Days until next review
  easeFactor: number; // Default 2.5, min 1.3
  repetitions: number; // Successful reps in a row
  nextReview: Date;
}

/**
 * Quality score mapping
 * 0 = complete blackout
 * 3 = correct with difficulty
 * 5 = perfect, easy recall
 */
export type QualityScore = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * Create initial SM2 state
 */
export function createSM2State(): SM2State {
  return {
    interval: 1,
    easeFactor: 2.5,
    repetitions: 0,
    nextReview: new Date(),
  };
}

/**
 * Update SM2 state after a review
 */
export function updateSM2(
  state: SM2State,
  quality: QualityScore
): SM2State {
  let { interval, easeFactor, repetitions } = state;

  if (quality >= 3) {
    // Correct response
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions++;
  } else {
    // Incorrect - reset
    repetitions = 0;
    interval = 1;
  }

  // Update ease factor
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  easeFactor =
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  easeFactor = Math.max(1.3, easeFactor);

  // Cap interval at 30 days for this use case
  interval = Math.min(interval, 30);

  return {
    interval,
    easeFactor,
    repetitions,
    nextReview: addDays(new Date(), interval),
  };
}

/**
 * Convert boolean correct/incorrect to quality score
 * Simplified: correct = 4, incorrect = 1
 */
export function boolToQuality(
  isCorrect: boolean,
  responseTimeMs?: number
): QualityScore {
  if (!isCorrect) return 1;

  // If we have response time, adjust quality
  if (responseTimeMs !== undefined) {
    if (responseTimeMs < 3000) return 5; // Fast = easy
    if (responseTimeMs < 8000) return 4; // Normal
    return 3; // Slow = difficult but correct
  }

  return 4; // Default correct
}

/**
 * Check if item is due for review
 */
export function isDueForReview(state: SM2State): boolean {
  return new Date() >= state.nextReview;
}

/**
 * Get days until next review (negative if overdue)
 */
export function getDaysUntilReview(state: SM2State): number {
  const now = new Date();
  const diff = state.nextReview.getTime() - now.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

/**
 * Helper: Add days to date
 */
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Elo rating system for adaptive difficulty
 */

/**
 * Calculate expected probability of student answering correctly
 */
export function calculateExpected(
  studentRating: number,
  questionDifficulty: number
): number {
  return 1 / (1 + Math.pow(10, (questionDifficulty - studentRating) / 400));
}

/**
 * Update student rating after answer
 * @param current Current rating
 * @param expected Expected probability (0-1)
 * @param actual Actual result (1=correct, 0=incorrect)
 * @param k K-factor (higher = more volatile)
 */
export function updateRating(
  current: number,
  expected: number,
  actual: 0 | 1,
  k: number
): number {
  return Math.round(current + k * (actual - expected));
}

/**
 * Get K-factor based on number of responses
 * Higher K for new students (faster convergence)
 * Lower K for established students (stability)
 */
export function getKFactor(responsesCount: number): number {
  if (responsesCount < 30) return 32;
  if (responsesCount < 100) return 24;
  return 16;
}

/**
 * Clamp rating within reasonable bounds
 */
export function clampRating(rating: number): number {
  return Math.max(400, Math.min(1600, rating));
}

/**
 * Get rating level name for display
 */
export function getRatingLevel(rating: number): {
  name: string;
  emoji: string;
  minRating: number;
} {
  if (rating < 700) return { name: "Seedling", emoji: "🌱", minRating: 0 };
  if (rating < 850) return { name: "Sprout", emoji: "🌿", minRating: 700 };
  if (rating < 1000) return { name: "Bloom", emoji: "🌸", minRating: 850 };
  if (rating < 1150) return { name: "Tree", emoji: "🌳", minRating: 1000 };
  if (rating < 1300) return { name: "Star", emoji: "⭐", minRating: 1150 };
  return { name: "Rainbow", emoji: "🌈", minRating: 1300 };
}

/**
 * Calculate progress to next level (0-100)
 */
export function getLevelProgress(rating: number): number {
  const levels = [0, 700, 850, 1000, 1150, 1300, 1600];
  for (let i = 0; i < levels.length - 1; i++) {
    if (rating < levels[i + 1]) {
      const range = levels[i + 1] - levels[i];
      const progress = rating - levels[i];
      return Math.round((progress / range) * 100);
    }
  }
  return 100;
}

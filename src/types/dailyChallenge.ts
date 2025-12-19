/**
 * Daily Challenge type definitions
 */

export interface DailyChallengeHistory {
  date: string; // YYYY-MM-DD format
  completed: boolean;
  correct: number;
  total: number;
}

export interface DailyChallengeState {
  lastCompletedDate: string | null; // YYYY-MM-DD format
  currentStreak: number;
  longestStreak: number;
  streakProtectionAvailable: boolean; // One free miss per week
  history: DailyChallengeHistory[];
}

export interface DailyChallengeResult {
  correct: number;
  total: number;
  coinsEarned: number;
  streakMaintained: boolean;
  newStreak: number;
}

/**
 * Coin rewards based on performance
 */
export const DAILY_REWARDS = {
  perfect: 50, // 3/3
  great: 30, // 2/3
  good: 10, // 1/3
  none: 0, // 0/3
} as const;

/**
 * Calculate coin reward based on correct answers
 */
export function calculateReward(correct: number, total: number = 3): number {
  if (correct === total) return DAILY_REWARDS.perfect;
  if (correct >= total - 1) return DAILY_REWARDS.great;
  if (correct >= 1) return DAILY_REWARDS.good;
  return DAILY_REWARDS.none;
}

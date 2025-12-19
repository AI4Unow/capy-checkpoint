/**
 * Badge type definitions
 */

export type BadgeCategory =
  | "accuracy"
  | "streak"
  | "mastery"
  | "daily"
  | "special";
export type BadgeTier = "bronze" | "silver" | "gold" | null;

export interface BadgeRequirement {
  type: "count" | "streak" | "mastery" | "daily_streak" | "time" | "speed";
  target: number;
}

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  category: BadgeCategory;
  tier: BadgeTier;
  secret: boolean;
  requirement: BadgeRequirement;
}

export interface UnlockedBadge {
  id: string;
  unlockedAt: string; // ISO date string
}

/**
 * Badge check context - passed to requirement checkers
 */
export interface BadgeCheckContext {
  totalCorrect: number;
  totalAnswered: number;
  maxStreak: number;
  currentStreak: number;
  masteredTopics: number;
  dailyStreak: number;
  currentHour: number;
  lastAnswerTimeMs: number;
}

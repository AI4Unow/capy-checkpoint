import type { Badge } from "@/types/badge";

/**
 * All badges available in the game
 * Organized by category with progressive tiers
 */
export const BADGES: Badge[] = [
  // === ACCURACY BADGES ===
  {
    id: "first-flight",
    name: "First Flight",
    emoji: "🐣",
    description: "Complete your first game",
    category: "accuracy",
    tier: null,
    secret: false,
    requirement: { type: "count", target: 1 },
  },
  {
    id: "sharpshooter-bronze",
    name: "Sharpshooter",
    emoji: "🎯",
    description: "Answer 10 questions correctly",
    category: "accuracy",
    tier: "bronze",
    secret: false,
    requirement: { type: "count", target: 10 },
  },
  {
    id: "sharpshooter-silver",
    name: "Sharpshooter Pro",
    emoji: "🎯",
    description: "Answer 50 questions correctly",
    category: "accuracy",
    tier: "silver",
    secret: false,
    requirement: { type: "count", target: 50 },
  },
  {
    id: "sharpshooter-gold",
    name: "Sharpshooter Master",
    emoji: "🎯",
    description: "Answer 100 questions correctly",
    category: "accuracy",
    tier: "gold",
    secret: false,
    requirement: { type: "count", target: 100 },
  },
  {
    id: "math-explorer",
    name: "Math Explorer",
    emoji: "🧭",
    description: "Answer 25 questions",
    category: "accuracy",
    tier: null,
    secret: false,
    requirement: { type: "count", target: 25 },
  },

  // === STREAK BADGES ===
  {
    id: "streak-3",
    name: "Warming Up",
    emoji: "✨",
    description: "3 correct answers in a row",
    category: "streak",
    tier: null,
    secret: false,
    requirement: { type: "streak", target: 3 },
  },
  {
    id: "streak-5",
    name: "On Fire",
    emoji: "🔥",
    description: "5 correct answers in a row",
    category: "streak",
    tier: "bronze",
    secret: false,
    requirement: { type: "streak", target: 5 },
  },
  {
    id: "streak-10",
    name: "Unstoppable",
    emoji: "💫",
    description: "10 correct answers in a row",
    category: "streak",
    tier: "silver",
    secret: false,
    requirement: { type: "streak", target: 10 },
  },
  {
    id: "streak-15",
    name: "Legendary",
    emoji: "👑",
    description: "15 correct answers in a row",
    category: "streak",
    tier: "gold",
    secret: false,
    requirement: { type: "streak", target: 15 },
  },

  // === MASTERY BADGES ===
  {
    id: "master-1",
    name: "Topic Master",
    emoji: "🏆",
    description: "Master 1 subtopic",
    category: "mastery",
    tier: "bronze",
    secret: false,
    requirement: { type: "mastery", target: 1 },
  },
  {
    id: "master-3",
    name: "Knowledge Seeker",
    emoji: "📚",
    description: "Master 3 subtopics",
    category: "mastery",
    tier: "silver",
    secret: false,
    requirement: { type: "mastery", target: 3 },
  },
  {
    id: "master-5",
    name: "Wisdom Keeper",
    emoji: "🧙",
    description: "Master 5 subtopics",
    category: "mastery",
    tier: "gold",
    secret: false,
    requirement: { type: "mastery", target: 5 },
  },

  // === DAILY CHALLENGE BADGES ===
  {
    id: "daily-first",
    name: "Challenge Accepted",
    emoji: "🌟",
    description: "Complete your first daily challenge",
    category: "daily",
    tier: null,
    secret: false,
    requirement: { type: "daily_streak", target: 1 },
  },
  {
    id: "daily-3",
    name: "Dedicated",
    emoji: "📅",
    description: "3-day daily challenge streak",
    category: "daily",
    tier: "bronze",
    secret: false,
    requirement: { type: "daily_streak", target: 3 },
  },
  {
    id: "daily-7",
    name: "Committed",
    emoji: "🗓️",
    description: "7-day daily challenge streak",
    category: "daily",
    tier: "silver",
    secret: false,
    requirement: { type: "daily_streak", target: 7 },
  },
  {
    id: "daily-14",
    name: "Unstoppable Learner",
    emoji: "🌈",
    description: "14-day daily challenge streak",
    category: "daily",
    tier: "gold",
    secret: false,
    requirement: { type: "daily_streak", target: 14 },
  },

  // === SPECIAL (SECRET) BADGES ===
  {
    id: "night-owl",
    name: "Night Owl",
    emoji: "🦉",
    description: "Play after 10pm",
    category: "special",
    tier: null,
    secret: true,
    requirement: { type: "time", target: 22 },
  },
  {
    id: "early-bird",
    name: "Early Bird",
    emoji: "🐦",
    description: "Play before 7am",
    category: "special",
    tier: null,
    secret: true,
    requirement: { type: "time", target: 7 },
  },
  {
    id: "speed-demon",
    name: "Speed Demon",
    emoji: "⚡",
    description: "Answer correctly in under 3 seconds",
    category: "special",
    tier: null,
    secret: true,
    requirement: { type: "speed", target: 3000 },
  },
  {
    id: "perfect-daily",
    name: "Perfect Day",
    emoji: "💎",
    description: "Get 3/3 on a daily challenge",
    category: "special",
    tier: null,
    secret: true,
    requirement: { type: "count", target: 1 }, // Special check in code
  },
];

/**
 * Get badge by ID
 */
export function getBadgeById(id: string): Badge | undefined {
  return BADGES.find((b) => b.id === id);
}

/**
 * Get badges by category
 */
export function getBadgesByCategory(category: string): Badge[] {
  return BADGES.filter((b) => b.category === category);
}

/**
 * Badge categories for display
 */
export const BADGE_CATEGORIES = [
  { id: "accuracy", name: "Accuracy", emoji: "🎯" },
  { id: "streak", name: "Streaks", emoji: "🔥" },
  { id: "mastery", name: "Mastery", emoji: "🏆" },
  { id: "daily", name: "Daily", emoji: "📅" },
  { id: "special", name: "Special", emoji: "✨" },
];

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BADGES, getBadgeById } from "@/data/badges";
import type { Badge, BadgeCheckContext, UnlockedBadge } from "@/types/badge";

interface BadgeState {
  unlockedBadges: UnlockedBadge[];
  pendingUnlock: Badge | null;
}

interface BadgeActions {
  checkBadges: (context: BadgeCheckContext) => Badge[];
  dismissUnlock: () => void;
  getProgress: (badgeId: string, context: BadgeCheckContext) => number;
  isUnlocked: (badgeId: string) => boolean;
  getUnlockedCount: () => number;
  resetAll: () => void;
}

/**
 * Check if a badge requirement is met
 */
function checkRequirement(badge: Badge, context: BadgeCheckContext): boolean {
  const { requirement } = badge;

  switch (requirement.type) {
    case "count":
      // Different badges use count differently
      if (badge.id === "first-flight") {
        return context.totalAnswered >= requirement.target;
      }
      if (badge.id === "math-explorer") {
        return context.totalAnswered >= requirement.target;
      }
      if (badge.id.startsWith("sharpshooter")) {
        return context.totalCorrect >= requirement.target;
      }
      // perfect-daily is special - checked manually
      return false;

    case "streak":
      return context.maxStreak >= requirement.target;

    case "mastery":
      return context.masteredTopics >= requirement.target;

    case "daily_streak":
      return context.dailyStreak >= requirement.target;

    case "time":
      // night-owl: after 10pm (target: 22)
      if (badge.id === "night-owl") {
        return context.currentHour >= requirement.target;
      }
      // early-bird: before 7am (target: 7)
      if (badge.id === "early-bird") {
        return context.currentHour < requirement.target;
      }
      return false;

    case "speed":
      return (
        context.lastAnswerTimeMs > 0 &&
        context.lastAnswerTimeMs <= requirement.target
      );

    default:
      return false;
  }
}

/**
 * Calculate progress towards a badge (0-100)
 */
function calculateProgress(
  badge: Badge,
  context: BadgeCheckContext
): number {
  const { requirement } = badge;

  switch (requirement.type) {
    case "count":
      if (badge.id === "first-flight" || badge.id === "math-explorer") {
        return Math.min(100, (context.totalAnswered / requirement.target) * 100);
      }
      if (badge.id.startsWith("sharpshooter")) {
        return Math.min(100, (context.totalCorrect / requirement.target) * 100);
      }
      return 0;

    case "streak":
      return Math.min(100, (context.maxStreak / requirement.target) * 100);

    case "mastery":
      return Math.min(100, (context.masteredTopics / requirement.target) * 100);

    case "daily_streak":
      return Math.min(100, (context.dailyStreak / requirement.target) * 100);

    case "time":
    case "speed":
      // Binary - either you have it or not
      return checkRequirement(badge, context) ? 100 : 0;

    default:
      return 0;
  }
}

export const useBadgeStore = create<BadgeState & BadgeActions>()(
  persist(
    (set, get) => ({
      unlockedBadges: [],
      pendingUnlock: null,

      /**
       * Check all badges and return newly unlocked ones
       */
      checkBadges: (context) => {
        const { unlockedBadges } = get();
        const unlockedIds = new Set(unlockedBadges.map((b) => b.id));
        const newlyUnlocked: Badge[] = [];

        for (const badge of BADGES) {
          // Skip if already unlocked
          if (unlockedIds.has(badge.id)) continue;

          // Check if requirement is met
          if (checkRequirement(badge, context)) {
            newlyUnlocked.push(badge);
          }
        }

        // If any new badges unlocked, update state
        if (newlyUnlocked.length > 0) {
          const now = new Date().toISOString();
          const newUnlocked: UnlockedBadge[] = newlyUnlocked.map((b) => ({
            id: b.id,
            unlockedAt: now,
          }));

          set({
            unlockedBadges: [...unlockedBadges, ...newUnlocked],
            // Show the first new badge as pending unlock
            pendingUnlock: newlyUnlocked[0],
          });
        }

        return newlyUnlocked;
      },

      /**
       * Dismiss the pending unlock modal
       */
      dismissUnlock: () => set({ pendingUnlock: null }),

      /**
       * Get progress towards a badge (0-100)
       */
      getProgress: (badgeId, context) => {
        const badge = getBadgeById(badgeId);
        if (!badge) return 0;

        // If unlocked, always 100
        if (get().isUnlocked(badgeId)) return 100;

        return calculateProgress(badge, context);
      },

      /**
       * Check if a badge is unlocked
       */
      isUnlocked: (badgeId) => {
        return get().unlockedBadges.some((b) => b.id === badgeId);
      },

      /**
       * Get total count of unlocked badges
       */
      getUnlockedCount: () => {
        return get().unlockedBadges.length;
      },

      /**
       * Reset all badges
       */
      resetAll: () => {
        set({
          unlockedBadges: [],
          pendingUnlock: null,
        });
      },
    }),
    {
      name: "mathie-badges",
    }
  )
);

/**
 * Special unlock for perfect daily challenge
 * Called directly from DailyChallenge component
 */
export function unlockPerfectDaily(): Badge | null {
  const store = useBadgeStore.getState();
  const badge = getBadgeById("perfect-daily");

  if (!badge || store.isUnlocked("perfect-daily")) {
    return null;
  }

  const now = new Date().toISOString();
  useBadgeStore.setState({
    unlockedBadges: [
      ...store.unlockedBadges,
      { id: "perfect-daily", unlockedAt: now },
    ],
    pendingUnlock: badge,
  });

  return badge;
}

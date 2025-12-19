import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  DailyChallengeHistory,
  DailyChallengeResult,
} from "@/types/dailyChallenge";
import { calculateReward } from "@/types/dailyChallenge";

/**
 * Get today's date in YYYY-MM-DD format (local timezone)
 */
function getLocalDateString(date: Date = new Date()): string {
  return date.toLocaleDateString("en-CA"); // en-CA uses YYYY-MM-DD format
}

/**
 * Check if date1 is exactly one day before date2
 */
function isYesterday(date1: string, date2: string): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = d2.getTime() - d1.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  return diffDays === 1;
}

/**
 * Check if date1 is within 2 days of date2 (for streak protection)
 */
function isWithinTwoDays(date1: string, date2: string): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = d2.getTime() - d1.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  return diffDays >= 1 && diffDays <= 2;
}

interface DailyChallengeStoreState {
  lastCompletedDate: string | null;
  currentStreak: number;
  longestStreak: number;
  streakProtectionAvailable: boolean;
  history: DailyChallengeHistory[];

  // Computed
  isAvailable: () => boolean;
  getTodayProgress: () => DailyChallengeHistory | null;

  // Actions
  completeChallenge: (correct: number, total?: number) => DailyChallengeResult;
  useStreakProtection: () => boolean;
  resetStreak: () => void;
}

export const useDailyChallengeStore = create<DailyChallengeStoreState>()(
  persist(
    (set, get) => ({
      lastCompletedDate: null,
      currentStreak: 0,
      longestStreak: 0,
      streakProtectionAvailable: true,
      history: [],

      /**
       * Check if daily challenge is available today
       */
      isAvailable: () => {
        const today = getLocalDateString();
        return get().lastCompletedDate !== today;
      },

      /**
       * Get today's challenge progress (if completed)
       */
      getTodayProgress: () => {
        const today = getLocalDateString();
        return get().history.find((h) => h.date === today) || null;
      },

      /**
       * Complete today's challenge
       */
      completeChallenge: (correct: number, total: number = 3) => {
        const today = getLocalDateString();
        const state = get();

        // Already completed today
        if (state.lastCompletedDate === today) {
          return {
            correct,
            total,
            coinsEarned: 0,
            streakMaintained: true,
            newStreak: state.currentStreak,
          };
        }

        // Calculate streak
        let newStreak = 1;
        let streakMaintained = false;

        if (state.lastCompletedDate) {
          if (isYesterday(state.lastCompletedDate, today)) {
            // Consecutive day - increment streak
            newStreak = state.currentStreak + 1;
            streakMaintained = true;
          } else if (
            isWithinTwoDays(state.lastCompletedDate, today) &&
            state.streakProtectionAvailable
          ) {
            // Missed one day but have protection
            newStreak = state.currentStreak + 1;
            streakMaintained = true;
            // Protection will be consumed via useStreakProtection
          }
          // Otherwise streak resets to 1
        }

        const coinsEarned = calculateReward(correct, total);
        const newHistory: DailyChallengeHistory = {
          date: today,
          completed: true,
          correct,
          total,
        };

        set({
          lastCompletedDate: today,
          currentStreak: newStreak,
          longestStreak: Math.max(newStreak, state.longestStreak),
          history: [...state.history, newHistory].slice(-30), // Keep last 30 days
        });

        return {
          correct,
          total,
          coinsEarned,
          streakMaintained,
          newStreak,
        };
      },

      /**
       * Use streak protection (one-time per week)
       */
      useStreakProtection: () => {
        const state = get();
        if (!state.streakProtectionAvailable) return false;

        set({ streakProtectionAvailable: false });

        // Reset protection after 7 days (simplified)
        setTimeout(
          () => {
            set({ streakProtectionAvailable: true });
          },
          7 * 24 * 60 * 60 * 1000
        );

        return true;
      },

      /**
       * Reset streak (for testing)
       */
      resetStreak: () => {
        set({
          currentStreak: 0,
          lastCompletedDate: null,
        });
      },
    }),
    {
      name: "capy-daily-challenge",
    }
  )
);

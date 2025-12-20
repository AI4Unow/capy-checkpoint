import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Get today's date as YYYY-MM-DD string in local timezone
 */
function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

interface SpinState {
  lastFreeSpinDate: string | null; // ISO date string (YYYY-MM-DD)
  totalSpins: number;
  totalWon: number;

  // Getters
  canFreeSpin: () => boolean;

  // Actions
  recordFreeSpin: () => void;
  recordPaidSpin: () => void;
  recordWin: (amount: number) => void;
}

/**
 * Spin wheel state store with daily free spin tracking
 * Persisted to localStorage
 */
export const useSpinStore = create<SpinState>()(
  persist(
    (set, get) => ({
      lastFreeSpinDate: null,
      totalSpins: 0,
      totalWon: 0,

      canFreeSpin: () => {
        const { lastFreeSpinDate } = get();
        return lastFreeSpinDate !== getToday();
      },

      recordFreeSpin: () =>
        set((s) => ({
          lastFreeSpinDate: getToday(),
          totalSpins: s.totalSpins + 1,
        })),

      recordPaidSpin: () =>
        set((s) => ({
          totalSpins: s.totalSpins + 1,
        })),

      recordWin: (amount) =>
        set((s) => ({
          totalWon: s.totalWon + amount,
        })),
    }),
    { name: "mathie-spin" }
  )
);

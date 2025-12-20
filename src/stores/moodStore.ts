import { create } from "zustand";
import { persist } from "zustand/middleware";

export type MoodLevel = "ecstatic" | "happy" | "neutral" | "sad" | "depressed";

interface MoodState {
  happiness: number; // 0-100
  lastPlayedAt: string | null; // ISO timestamp
  lastFedAt: string | null;
  lastPetAt: string | null;
  consecutiveDays: number;
  sessionHappinessGain: number; // Track gains this session (max +50)

  // Getters
  getMoodLevel: () => MoodLevel;
  canPet: () => boolean; // 10 min cooldown
  getHoursAway: () => number;

  // Actions
  recordPlay: () => void;
  addHappiness: (amount: number) => void;
  feedCapy: () => void;
  petCapy: () => void;
  calculateDecay: () => { hoursAway: number; decayed: number };
  resetSessionGain: () => void;
}

const PET_COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes
const DECAY_PER_8_HOURS = 10;
const MAX_SESSION_GAIN = 50;

export const FEED_COST = 10; // coins
export const FEED_HAPPINESS = 30;
export const PET_HAPPINESS = 5;

/**
 * Capy mood system with Tamagotchi-style happiness decay
 */
export const useMoodStore = create<MoodState>()(
  persist(
    (set, get) => ({
      happiness: 70, // Start happy
      lastPlayedAt: null,
      lastFedAt: null,
      lastPetAt: null,
      consecutiveDays: 0,
      sessionHappinessGain: 0,

      getMoodLevel: (): MoodLevel => {
        const h = get().happiness;
        if (h >= 80) return "ecstatic";
        if (h >= 60) return "happy";
        if (h >= 40) return "neutral";
        if (h >= 20) return "sad";
        return "depressed";
      },

      canPet: () => {
        const { lastPetAt } = get();
        if (!lastPetAt) return true;
        return Date.now() - new Date(lastPetAt).getTime() > PET_COOLDOWN_MS;
      },

      getHoursAway: () => {
        const { lastPlayedAt } = get();
        if (!lastPlayedAt) return 0;
        return (Date.now() - new Date(lastPlayedAt).getTime()) / (1000 * 60 * 60);
      },

      recordPlay: () => {
        const now = new Date();
        const today = now.toISOString().split("T")[0];
        const { lastPlayedAt, consecutiveDays } = get();

        let newStreak = 1;
        if (lastPlayedAt) {
          const lastDate = lastPlayedAt.split("T")[0];
          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split("T")[0];

          if (lastDate === today) {
            newStreak = consecutiveDays; // Same day, keep streak
          } else if (lastDate === yesterdayStr) {
            newStreak = consecutiveDays + 1; // Consecutive day
          }
          // Else streak resets to 1
        }

        set((s) => ({
          lastPlayedAt: now.toISOString(),
          consecutiveDays: newStreak,
          happiness: Math.min(100, s.happiness + 10), // +10 for daily login
          sessionHappinessGain: 0, // Reset session gain
        }));
      },

      addHappiness: (amount) => {
        const { sessionHappinessGain } = get();

        // Cap session gains at MAX_SESSION_GAIN for positive amounts
        if (amount > 0) {
          const remainingGain = MAX_SESSION_GAIN - sessionHappinessGain;
          const actualGain = Math.min(amount, remainingGain);
          if (actualGain <= 0) return; // Already at max for this session

          set((s) => ({
            happiness: Math.max(0, Math.min(100, s.happiness + actualGain)),
            sessionHappinessGain: s.sessionHappinessGain + actualGain,
          }));
        } else {
          // Negative amounts (from wrong answers) not capped
          set((s) => ({
            happiness: Math.max(0, Math.min(100, s.happiness + amount)),
          }));
        }
      },

      feedCapy: () => {
        set((s) => ({
          lastFedAt: new Date().toISOString(),
          happiness: Math.min(100, s.happiness + FEED_HAPPINESS),
        }));
      },

      petCapy: () => {
        if (!get().canPet()) return;
        set((s) => ({
          lastPetAt: new Date().toISOString(),
          happiness: Math.min(100, s.happiness + PET_HAPPINESS),
        }));
      },

      calculateDecay: () => {
        const { lastPlayedAt, happiness } = get();
        if (!lastPlayedAt) return { hoursAway: 0, decayed: 0 };

        const hoursAway =
          (Date.now() - new Date(lastPlayedAt).getTime()) / (1000 * 60 * 60);
        const decayPeriods = Math.floor(hoursAway / 8);
        const decayed = decayPeriods * DECAY_PER_8_HOURS;

        if (decayed > 0) {
          set({ happiness: Math.max(0, happiness - decayed) });
        }

        return { hoursAway, decayed };
      },

      resetSessionGain: () => set({ sessionHappinessGain: 0 }),
    }),
    { name: "mathie-mood" }
  )
);

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type BoxTier, type BoxLoot, selectLoot } from "@/data/mysteryBoxTiers";

interface EarnedBox {
  tier: BoxTier;
  earnedAt: string;
  source: string; // What earned it (badge name, daily, etc.)
}

interface MysteryBoxState {
  boxes: EarnedBox[];
  isOpening: boolean;
  pendingReward: (BoxLoot & { tier: BoxTier }) | null;

  // Getters
  getBoxCount: (tier: BoxTier) => number;
  getTotalBoxes: () => number;

  // Actions
  addBox: (tier: BoxTier, source: string) => void;
  openBox: (tier: BoxTier) => BoxLoot | null;
  dismissReward: () => void;
}

/**
 * Mystery box inventory store with persistence
 */
export const useMysteryBoxStore = create<MysteryBoxState>()(
  persist(
    (set, get) => ({
      boxes: [],
      isOpening: false,
      pendingReward: null,

      getBoxCount: (tier) => get().boxes.filter((b) => b.tier === tier).length,

      getTotalBoxes: () => get().boxes.length,

      addBox: (tier, source) =>
        set((s) => ({
          boxes: [
            ...s.boxes,
            {
              tier,
              earnedAt: new Date().toISOString(),
              source,
            },
          ],
        })),

      openBox: (tier) => {
        const { boxes } = get();
        const boxIndex = boxes.findIndex((b) => b.tier === tier);
        if (boxIndex === -1) return null;

        // Remove box from inventory
        const newBoxes = [...boxes];
        newBoxes.splice(boxIndex, 1);

        // Select loot
        const loot = selectLoot(tier);

        set({
          boxes: newBoxes,
          isOpening: true,
          pendingReward: { ...loot, tier },
        });

        return loot;
      },

      dismissReward: () => set({ isOpening: false, pendingReward: null }),
    }),
    { name: "mathie-mystery-boxes" }
  )
);

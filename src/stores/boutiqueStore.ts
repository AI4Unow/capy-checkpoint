import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useGameStore } from "./gameStore";
import { useLearningStore } from "./learningStore";
import {
  BoutiqueItem,
  getItemById,
  isItemUnlocked,
} from "@/data/boutique";

interface BoutiqueState {
  // Owned items (by ID)
  ownedItems: string[];

  // Equipped items by category
  equipped: {
    hat: string;
    accessory: string | null;
    trail: string | null;
    background: string;
  };
}

interface BoutiqueActions {
  purchaseItem: (itemId: string) => boolean;
  unlockItem: (itemId: string) => boolean;
  equipItem: (itemId: string) => void;
  unequipItem: (category: BoutiqueItem["category"]) => void;
  isOwned: (itemId: string) => boolean;
  canPurchase: (itemId: string) => boolean;
  getEquippedItem: (category: BoutiqueItem["category"]) => BoutiqueItem | null;
  getMasteredCount: () => number;
}

export const useBoutiqueStore = create<BoutiqueState & BoutiqueActions>()(
  persist(
    (set, get) => ({
      // Default owned items (free items)
      ownedItems: ["hat_yuzu", "bg_forest"],

      // Default equipped
      equipped: {
        hat: "hat_yuzu",
        accessory: null,
        trail: null,
        background: "bg_forest",
      },

      /**
       * Purchase an item
       */
      purchaseItem: (itemId) => {
        const item = getItemById(itemId);
        if (!item) return false;

        // Check if already owned
        if (get().ownedItems.includes(itemId)) return false;

        // Check if can purchase
        if (!get().canPurchase(itemId)) return false;

        // Get coins from game store
        const gameStore = useGameStore.getState();
        if (gameStore.coins < item.price) return false;

        // Deduct coins
        useGameStore.setState({ coins: gameStore.coins - item.price });

        // Add to owned
        set({ ownedItems: [...get().ownedItems, itemId] });

        return true;
      },

      /**
       * Unlock an item directly (e.g. mystery box rewards)
       */
      unlockItem: (itemId) => {
        const item = getItemById(itemId);
        if (!item) return false;

        // Already owned
        if (get().ownedItems.includes(itemId)) return false;

        set({ ownedItems: [...get().ownedItems, itemId] });
        return true;
      },

      /**
       * Equip an item
       */
      equipItem: (itemId) => {
        const item = getItemById(itemId);
        if (!item) return;

        // Must own the item
        if (!get().ownedItems.includes(itemId)) return;

        set({
          equipped: {
            ...get().equipped,
            [item.category]: itemId,
          },
        });
      },

      /**
       * Unequip an item (set to null or default)
       */
      unequipItem: (category) => {
        const defaults: Record<BoutiqueItem["category"], string | null> = {
          hat: "hat_yuzu",
          accessory: null,
          trail: null,
          background: "bg_forest",
        };

        set({
          equipped: {
            ...get().equipped,
            [category]: defaults[category],
          },
        });
      },

      /**
       * Check if item is owned
       */
      isOwned: (itemId) => {
        return get().ownedItems.includes(itemId);
      },

      /**
       * Check if item can be purchased (unlocked + affordable)
       */
      canPurchase: (itemId) => {
        const item = getItemById(itemId);
        if (!item) return false;

        // Already owned
        if (get().ownedItems.includes(itemId)) return false;

        // Check unlock condition
        const learningStore = useLearningStore.getState();
        const masteredCount = get().getMasteredCount();

        if (
          !isItemUnlocked(
            item,
            learningStore.studentRating,
            learningStore.bestStreak,
            masteredCount
          )
        ) {
          return false;
        }

        // Check affordability
        const gameStore = useGameStore.getState();
        return gameStore.coins >= item.price;
      },

      /**
       * Get equipped item for category
       */
      getEquippedItem: (category) => {
        const itemId = get().equipped[category];
        if (!itemId) return null;
        return getItemById(itemId) || null;
      },

      /**
       * Get count of mastered subtopics
       */
      getMasteredCount: () => {
        const learningStore = useLearningStore.getState();
        return learningStore.masteryEntries.filter(
          (m) => m.status === "mastered"
        ).length;
      },
    }),
    {
      name: "capy-boutique-storage",
    }
  )
);

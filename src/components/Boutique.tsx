"use client";

import { useState } from "react";
import { useGameStore } from "@/stores/gameStore";
import { useLearningStore } from "@/stores/learningStore";
import { useBoutiqueStore } from "@/stores/boutiqueStore";
import {
  BoutiqueItem,
  getItemsByCategory,
  getRarityColor,
  isItemUnlocked,
} from "@/data/boutique";

interface BoutiqueProps {
  onClose: () => void;
}

const CATEGORIES: { id: BoutiqueItem["category"]; label: string; emoji: string }[] = [
  { id: "hat", label: "Hats", emoji: "🎩" },
  { id: "accessory", label: "Accessories", emoji: "🎀" },
  { id: "trail", label: "Trails", emoji: "✨" },
  { id: "background", label: "Worlds", emoji: "🌍" },
];

export function Boutique({ onClose }: BoutiqueProps) {
  const [activeCategory, setActiveCategory] = useState<BoutiqueItem["category"]>("hat");
  const { coins } = useGameStore();
  const { studentRating, bestStreak } = useLearningStore();
  const {
    purchaseItem,
    equipItem,
    isOwned,
    canPurchase,
    equipped,
    getMasteredCount,
  } = useBoutiqueStore();

  const masteredCount = getMasteredCount();
  const items = getItemsByCategory(activeCategory);

  const handlePurchase = (itemId: string) => {
    const success = purchaseItem(itemId);
    if (success) {
      equipItem(itemId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-cream rounded-3xl border-4 border-text max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-pink p-4 flex items-center justify-between border-b-4 border-text">
          <h2 className="text-2xl font-[family-name:var(--font-fredoka)] text-text">
            Capy Boutique
          </h2>
          <div className="flex items-center gap-4">
            <div className="bg-yellow px-3 py-1 rounded-full border-2 border-amber-500 flex items-center gap-1">
              <span className="text-xl">🪙</span>
              <span className="font-[family-name:var(--font-baloo)] text-text">
                {coins}
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white rounded-full border-2 border-text flex items-center justify-center text-lg hover:bg-gray-100"
            >
              ×
            </button>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex border-b-2 border-text/20 bg-white">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-1 py-3 px-2 text-sm font-[family-name:var(--font-nunito)] transition-colors ${
                activeCategory === cat.id
                  ? "bg-sage text-text border-b-4 border-sage"
                  : "text-text/60 hover:bg-sage/20"
              }`}
            >
              <span className="text-lg mr-1">{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Items grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-3">
          {items.map((item) => {
            const owned = isOwned(item.id);
            const canBuy = canPurchase(item.id);
            const unlocked = isItemUnlocked(
              item,
              studentRating,
              bestStreak,
              masteredCount
            );
            const isEquipped = equipped[item.category] === item.id;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-xl border-2 p-3 relative ${
                  unlocked ? "border-text/30" : "border-text/10 opacity-60"
                } ${isEquipped ? "ring-2 ring-sage ring-offset-2" : ""}`}
              >
                {/* Rarity indicator */}
                <div
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white"
                  style={{ backgroundColor: getRarityColor(item.rarity) }}
                />

                {/* Item display */}
                <div className="text-center mb-2">
                  <span className="text-4xl">{item.emoji}</span>
                </div>
                <h3 className="font-[family-name:var(--font-fredoka)] text-sm text-text text-center">
                  {item.name}
                </h3>
                <p className="text-xs text-text/60 text-center mt-1 line-clamp-2">
                  {item.description}
                </p>

                {/* Action button */}
                <div className="mt-3">
                  {owned ? (
                    <button
                      onClick={() => equipItem(item.id)}
                      disabled={isEquipped}
                      className={`w-full py-2 rounded-lg text-sm font-[family-name:var(--font-baloo)] ${
                        isEquipped
                          ? "bg-sage text-text"
                          : "bg-sky text-text hover:bg-sky/80"
                      }`}
                    >
                      {isEquipped ? "Equipped" : "Equip"}
                    </button>
                  ) : unlocked ? (
                    <button
                      onClick={() => handlePurchase(item.id)}
                      disabled={!canBuy}
                      className={`w-full py-2 rounded-lg text-sm font-[family-name:var(--font-baloo)] flex items-center justify-center gap-1 ${
                        canBuy
                          ? "bg-yellow text-text hover:bg-yellow/80"
                          : "bg-gray-200 text-text/40 cursor-not-allowed"
                      }`}
                    >
                      <span>🪙</span>
                      <span>{item.price}</span>
                    </button>
                  ) : (
                    <div className="w-full py-2 text-center text-xs text-text/40">
                      🔒{" "}
                      {item.unlockCondition?.type === "rating" &&
                        `Rating ${item.unlockCondition.value}`}
                      {item.unlockCondition?.type === "streak" &&
                        `${item.unlockCondition.value} streak`}
                      {item.unlockCondition?.type === "mastered" &&
                        `${item.unlockCondition.value} mastered`}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useMysteryBoxStore } from "@/stores/mysteryBoxStore";
import { useGameStore } from "@/stores/gameStore";
import { useBoutiqueStore } from "@/stores/boutiqueStore";
import { MYSTERY_BOX_TIERS, type BoxTier } from "@/data/mysteryBoxTiers";
import { synthSounds } from "@/game/audio/SynthSounds";

interface MysteryBoxProps {
  onClose: () => void;
}

/**
 * MysteryBox - Modal for viewing and opening mystery boxes
 */
export function MysteryBox({ onClose }: MysteryBoxProps) {
  const { boxes, getBoxCount, openBox, pendingReward, dismissReward } =
    useMysteryBoxStore();
  const { addCoins } = useGameStore();
  const { unlockItem, equipItem } = useBoutiqueStore();
  const [openingTier, setOpeningTier] = useState<BoxTier | null>(null);
  const [showReveal, setShowReveal] = useState(false);

  const handleOpenBox = (tier: BoxTier) => {
    if (getBoxCount(tier) === 0) return;

    setOpeningTier(tier);
    synthSounds.playBoxOpen?.();

    // Animate for 2 seconds, then reveal
    setTimeout(() => {
      const loot = openBox(tier);
      if (loot) {
        if (loot.type === "coins") {
          addCoins(loot.value as number);
        } else if (loot.type === "item") {
          const itemId = loot.value as string;
          const unlocked = unlockItem(itemId);
          // Auto-equip new rewards so players immediately see the cosmetic effect.
          if (unlocked) {
            equipItem(itemId);
          }
        }
        synthSounds.playCorrect();
        setShowReveal(true);
      }
      setOpeningTier(null);
    }, 2000);
  };

  const handleDismiss = () => {
    setShowReveal(false);
    dismissReward();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[90] p-4">
      <div className="bg-cream rounded-3xl border-4 border-text max-w-md w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-purple-400 p-4 border-b-4 border-text flex justify-between items-center">
          <h2 className="text-2xl font-[family-name:var(--font-baloo)] text-text">
            📦 Mystery Boxes
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center hover:bg-white/80 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Box inventory */}
        <div className="p-4 grid grid-cols-2 gap-4">
          {MYSTERY_BOX_TIERS.map((tier) => {
            const count = getBoxCount(tier.id);
            const isThisOpening = openingTier === tier.id;

            return (
              <button
                key={tier.id}
                onClick={() => handleOpenBox(tier.id)}
                disabled={count === 0 || openingTier !== null}
                className={`p-4 rounded-xl border-4 transition-all ${
                  count > 0 && openingTier === null
                    ? "border-text hover:scale-105 cursor-pointer"
                    : "border-gray-300 opacity-50 cursor-not-allowed"
                } ${isThisOpening ? "animate-shake" : ""}`}
                style={{ backgroundColor: tier.color + "40" }}
              >
                <div className="text-4xl mb-2">{tier.emoji}</div>
                <div className="font-[family-name:var(--font-fredoka)] text-text">
                  {tier.name}
                </div>
                <div
                  className={`text-sm ${count > 0 ? "text-text" : "text-text/50"}`}
                >
                  {count > 0 ? `×${count}` : "None"}
                </div>
              </button>
            );
          })}
        </div>

        {/* Empty state */}
        {boxes.length === 0 && (
          <div className="px-6 pb-6 text-center text-text/70 font-[family-name:var(--font-nunito)]">
            Earn boxes from badges, daily challenges, and perfect sessions!
          </div>
        )}
      </div>

      {/* Reward reveal modal */}
      {showReveal && pendingReward && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100]">
          <div className="bg-cream rounded-3xl border-4 border-text p-8 text-center animate-bounce-in max-w-sm">
            <div className="text-6xl mb-4">{pendingReward.emoji}</div>
            <h3 className="text-xl font-[family-name:var(--font-baloo)] text-text mb-2">
              You got:
            </h3>
            <p className="text-2xl font-[family-name:var(--font-fredoka)] text-text mb-6">
              {pendingReward.name}
            </p>
            <button
              onClick={handleDismiss}
              className="w-full py-3 bg-sage rounded-xl border-4 border-text font-[family-name:var(--font-baloo)] text-xl text-text hover:scale-105 transition-transform"
            >
              Awesome!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

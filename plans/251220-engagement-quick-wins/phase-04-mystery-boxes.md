# Phase 4: Mystery Boxes

**Priority:** MEDIUM
**Estimated Tasks:** 6
**Depends On:** Phase 1 (Spin Wheel for common loot), Badge System

## Objective
Create tiered mystery boxes that players earn through achievements. Provides surprise/delight moments and another reward layer beyond coins.

## Mechanics Overview

### Box Tiers
| Tier | Color | Sources | Avg Value |
|------|-------|---------|-----------|
| Common | Gray | Daily 3/3, spin, perfect session | ~25 coins |
| Rare | Blue | Mastery milestones, bronze badges | ~75 coins |
| Epic | Purple | Silver badges, rating milestones | ~150 coins |
| Legendary | Gold | Gold badges, special achievements | ~300 coins |

### Loot Types
- Coins (most common)
- Boutique items (hats, accessories, trails)
- Exclusive items (box-only unlocks)

## Tasks

### 4.1 Create Box Tier Definitions
File: `src/data/mysteryBoxTiers.ts`

```typescript
export type BoxTier = "common" | "rare" | "epic" | "legendary";

export interface BoxLoot {
  type: "coins" | "item";
  value: number | string; // coins amount or item ID
  weight: number; // Higher = more common
  name?: string;
  emoji?: string;
}

export interface MysteryBoxTier {
  id: BoxTier;
  name: string;
  emoji: string;
  color: string;
  glowColor: string;
  lootTable: BoxLoot[];
}

export const MYSTERY_BOX_TIERS: MysteryBoxTier[] = [
  {
    id: "common",
    name: "Mystery Box",
    emoji: "📦",
    color: "#9CA3AF",
    glowColor: "rgba(156, 163, 175, 0.5)",
    lootTable: [
      { type: "coins", value: 15, weight: 40, name: "+15 Coins", emoji: "🪙" },
      { type: "coins", value: 25, weight: 35, name: "+25 Coins", emoji: "💰" },
      { type: "coins", value: 40, weight: 20, name: "+40 Coins", emoji: "💎" },
      { type: "item", value: "hat_strawberry", weight: 5, name: "Strawberry Hat", emoji: "🍓" },
    ],
  },
  {
    id: "rare",
    name: "Rare Box",
    emoji: "🎁",
    color: "#60A5FA",
    glowColor: "rgba(96, 165, 250, 0.5)",
    lootTable: [
      { type: "coins", value: 50, weight: 35, name: "+50 Coins", emoji: "💎" },
      { type: "coins", value: 75, weight: 30, name: "+75 Coins", emoji: "👑" },
      { type: "coins", value: 100, weight: 15, name: "+100 Coins", emoji: "💰" },
      { type: "item", value: "hat_flower_crown", weight: 10, name: "Flower Crown", emoji: "🌸" },
      { type: "item", value: "acc_scarf", weight: 10, name: "Cozy Scarf", emoji: "🧣" },
    ],
  },
  {
    id: "epic",
    name: "Epic Box",
    emoji: "✨",
    color: "#A78BFA",
    glowColor: "rgba(167, 139, 250, 0.5)",
    lootTable: [
      { type: "coins", value: 100, weight: 30, name: "+100 Coins", emoji: "💎" },
      { type: "coins", value: 150, weight: 25, name: "+150 Coins", emoji: "👑" },
      { type: "coins", value: 200, weight: 15, name: "+200 Coins", emoji: "💰" },
      { type: "item", value: "trail_sparkle", weight: 15, name: "Sparkle Trail", emoji: "✨" },
      { type: "item", value: "acc_cape", weight: 10, name: "Hero Cape", emoji: "🦸" },
      { type: "item", value: "bg_ocean", weight: 5, name: "Ocean Breeze", emoji: "🌊" },
    ],
  },
  {
    id: "legendary",
    name: "Legendary Box",
    emoji: "🌟",
    color: "#FBBF24",
    glowColor: "rgba(251, 191, 36, 0.5)",
    lootTable: [
      { type: "coins", value: 200, weight: 25, name: "+200 Coins", emoji: "💎" },
      { type: "coins", value: 300, weight: 20, name: "+300 Coins", emoji: "👑" },
      { type: "coins", value: 500, weight: 10, name: "+500 Coins", emoji: "🎰" },
      { type: "item", value: "hat_rainbow", weight: 15, name: "Rainbow Crown", emoji: "🌈" },
      { type: "item", value: "trail_rainbow", weight: 15, name: "Rainbow Trail", emoji: "🌈" },
      { type: "item", value: "bg_sky_castle", weight: 10, name: "Sky Castle", emoji: "🏰" },
      { type: "item", value: "hat_wizard", weight: 5, name: "Math Wizard Hat", emoji: "🧙" },
    ],
  },
];

export function getBoxTier(tier: BoxTier): MysteryBoxTier {
  return MYSTERY_BOX_TIERS.find((t) => t.id === tier) || MYSTERY_BOX_TIERS[0];
}

export function selectLoot(tier: BoxTier): BoxLoot {
  const box = getBoxTier(tier);
  const totalWeight = box.lootTable.reduce((sum, l) => sum + l.weight, 0);
  let random = Math.random() * totalWeight;

  for (const loot of box.lootTable) {
    random -= loot.weight;
    if (random <= 0) return loot;
  }
  return box.lootTable[0];
}
```

### 4.2 Create Mystery Box Store
File: `src/stores/mysteryBoxStore.ts`

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BoxTier, BoxLoot } from "@/data/mysteryBoxTiers";

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
          boxes: [...s.boxes, {
            tier,
            earnedAt: new Date().toISOString(),
            source,
          }],
        })),

      openBox: (tier) => {
        const { boxes } = get();
        const boxIndex = boxes.findIndex((b) => b.tier === tier);
        if (boxIndex === -1) return null;

        // Remove box from inventory
        const newBoxes = [...boxes];
        newBoxes.splice(boxIndex, 1);

        // Select loot
        const { selectLoot } = require("@/data/mysteryBoxTiers");
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
```

### 4.3 Create MysteryBox Component
File: `src/components/MysteryBox.tsx`

```typescript
"use client";

import { useState, useEffect } from "react";
import { useMysteryBoxStore } from "@/stores/mysteryBoxStore";
import { useGameStore } from "@/stores/gameStore";
import { useBoutiqueStore } from "@/stores/boutiqueStore";
import { MYSTERY_BOX_TIERS, type BoxTier } from "@/data/mysteryBoxTiers";
import { synthSounds } from "@/game/audio/SynthSounds";

interface MysteryBoxProps {
  onClose: () => void;
}

export function MysteryBox({ onClose }: MysteryBoxProps) {
  const {
    boxes,
    getBoxCount,
    openBox,
    isOpening,
    pendingReward,
    dismissReward,
  } = useMysteryBoxStore();
  const { addCoins } = useGameStore();
  const { unlockItem } = useBoutiqueStore();
  const [openingTier, setOpeningTier] = useState<BoxTier | null>(null);
  const [showReveal, setShowReveal] = useState(false);

  const handleOpenBox = (tier: BoxTier) => {
    setOpeningTier(tier);
    synthSounds.playSpinTick?.(); // Reuse spin tick sound

    // Animate for 2 seconds, then reveal
    setTimeout(() => {
      const loot = openBox(tier);
      if (loot) {
        if (loot.type === "coins") {
          addCoins(loot.value as number);
        } else {
          unlockItem(loot.value as string);
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
            className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center hover:bg-white/80"
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
                onClick={() => count > 0 && handleOpenBox(tier.id)}
                disabled={count === 0 || isOpening}
                className={`p-4 rounded-xl border-4 transition-all ${
                  count > 0
                    ? "border-text hover:scale-105 cursor-pointer"
                    : "border-gray-300 opacity-50 cursor-not-allowed"
                } ${isThisOpening ? "animate-shake" : ""}`}
                style={{ backgroundColor: tier.color + "40" }}
              >
                <div className="text-4xl mb-2">{tier.emoji}</div>
                <div className="font-[family-name:var(--font-fredoka)] text-text">
                  {tier.name}
                </div>
                <div className="text-sm text-text/70">
                  {count > 0 ? `×${count}` : "None"}
                </div>
              </button>
            );
          })}
        </div>

        {/* Empty state */}
        {boxes.length === 0 && (
          <div className="p-6 text-center text-text/70 font-[family-name:var(--font-nunito)]">
            Earn boxes from badges, daily challenges, and perfect sessions!
          </div>
        )}
      </div>

      {/* Reward reveal modal */}
      {showReveal && pendingReward && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100]">
          <div className="bg-cream rounded-3xl border-4 border-text p-8 text-center animate-bounce-in">
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
```

### 4.4 Add Box Earning Events
File: `src/game/EventBus.ts`

```typescript
export const GameEvents = {
  // ... existing events
  BOX_EARNED: "box-earned",
} as const;
```

### 4.5 Integrate Box Earning
File: `src/components/BadgeChecker.tsx`

Add box earning when badges unlock:
```typescript
// When badge unlocks
const boxTier = badge.tier || "common"; // bronze→common, silver→rare, gold→epic
useMysteryBoxStore.getState().addBox(boxTier, `Badge: ${badge.name}`);
EventBus.emit(GameEvents.BOX_EARNED, { tier: boxTier });
```

File: `src/components/DailyChallenge.tsx`

Add box for perfect daily:
```typescript
// On 3/3 correct
if (correctAnswers === 3) {
  useMysteryBoxStore.getState().addBox("common", "Daily Challenge 3/3");
}
```

File: `src/components/SessionSummary.tsx` (or similar)

Add box for perfect session:
```typescript
// If 5+ correct and 0 wrong
if (correctCount >= 5 && wrongCount === 0) {
  useMysteryBoxStore.getState().addBox("common", "Perfect Session");
}
```

### 4.6 Add Box Sounds & UI Integration
File: `src/game/audio/SynthSounds.ts`

```typescript
/**
 * Box opening build-up
 */
playBoxOpen(): void {
  if (!this.enabled || !this.audioContext) return;
  // Rising tension: 200Hz → 600Hz sweep over 1.5s
  const osc = this.audioContext.createOscillator();
  const gain = this.audioContext.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(200, this.audioContext.currentTime);
  osc.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 1.5);

  gain.gain.setValueAtTime(0.2 * this.volume, this.audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 2);

  osc.connect(gain);
  gain.connect(this.audioContext.destination);

  osc.start();
  osc.stop(this.audioContext.currentTime + 2);
}
```

File: `src/components/MenuOverlay.tsx`

Add boxes button:
```typescript
const { getTotalBoxes } = useMysteryBoxStore();
const totalBoxes = getTotalBoxes();

<button onClick={() => setShowBoxes(true)}>
  📦 Boxes {totalBoxes > 0 && <span className="badge">{totalBoxes}</span>}
</button>
```

## Acceptance Criteria
- [ ] 4 box tiers with distinct colors and loot tables
- [ ] Boxes earned from badges (tier matches badge tier)
- [ ] Boxes earned from daily challenge (3/3 = common box)
- [ ] Boxes earned from perfect sessions (5+ correct, 0 wrong)
- [ ] Box opening animation (2 seconds shake)
- [ ] Reward reveal with appropriate sound
- [ ] Coins added or items unlocked from loot
- [ ] Box count shown in menu with indicator badge

# Phase 1: Lucky Spin Wheel

**Priority:** HIGHEST
**Estimated Tasks:** 6

## Objective
Create a Vegas-style spin wheel that provides dopamine through variable rewards, creates an economy sink for coins, and drives daily engagement through free daily spins.

## Tasks

### 1.1 Create Prize Definitions
File: `src/data/spinPrizes.ts`

```typescript
export interface SpinPrize {
  id: string;
  name: string;
  emoji: string;
  type: "coins" | "item" | "mystery_box" | "nothing";
  value: number | string;
  weight: number; // 1-100, higher = more common
  rarity: "common" | "rare" | "epic" | "legendary";
}

export const SPIN_PRIZES: SpinPrize[] = [
  // Common (total weight: 120)
  { id: "coins_10", name: "+10 Coins", emoji: "🪙", type: "coins", value: 10, weight: 50, rarity: "common" },
  { id: "coins_25", name: "+25 Coins", emoji: "💰", type: "coins", value: 25, weight: 40, rarity: "common" },
  { id: "nothing", name: "Try Again!", emoji: "💨", type: "nothing", value: 0, weight: 30, rarity: "common" },

  // Rare (total weight: 35)
  { id: "coins_50", name: "+50 Coins", emoji: "💎", type: "coins", value: 50, weight: 20, rarity: "rare" },
  { id: "mystery_common", name: "Mystery Box", emoji: "📦", type: "mystery_box", value: "common", weight: 15, rarity: "rare" },

  // Epic (total weight: 13)
  { id: "coins_100", name: "+100 Coins", emoji: "👑", type: "coins", value: 100, weight: 8, rarity: "epic" },
  { id: "mystery_rare", name: "Rare Box", emoji: "🎁", type: "mystery_box", value: "rare", weight: 5, rarity: "epic" },

  // Legendary (weight: 2)
  { id: "coins_250", name: "JACKPOT!", emoji: "🎰", type: "coins", value: 250, weight: 2, rarity: "legendary" },
];

export function selectRandomPrize(): SpinPrize {
  const totalWeight = SPIN_PRIZES.reduce((sum, p) => sum + p.weight, 0);
  let random = Math.random() * totalWeight;

  for (const prize of SPIN_PRIZES) {
    random -= prize.weight;
    if (random <= 0) return prize;
  }
  return SPIN_PRIZES[0];
}

export function getPrizeColor(rarity: SpinPrize["rarity"]): string {
  switch (rarity) {
    case "common": return "#9CA3AF";
    case "rare": return "#60A5FA";
    case "epic": return "#A78BFA";
    case "legendary": return "#FBBF24";
  }
}
```

### 1.2 Create Spin Store
File: `src/stores/spinStore.ts`

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SpinState {
  lastFreeSpinDate: string | null;
  totalSpins: number;
  totalWon: number;

  canFreeSpin: () => boolean;
  recordFreeSpin: () => void;
  recordWin: (amount: number) => void;
}

const getToday = () => new Date().toISOString().split("T")[0];

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

      recordFreeSpin: () => set({
        lastFreeSpinDate: getToday(),
        totalSpins: get().totalSpins + 1
      }),

      recordWin: (amount) => set((s) => ({
        totalWon: s.totalWon + amount
      })),
    }),
    { name: "mathie-spin" }
  )
);

export const SPIN_COST = 30; // coins for paid spin
```

### 1.3 Create SpinWheel Component
File: `src/components/SpinWheel.tsx`

Key Features:
- Modal with 8-segment wheel
- CSS transform rotation animation (3-5 full rotations)
- Prize selected BEFORE animation starts (determines final rotation)
- Confetti on rare+ wins
- Sound effects: tick during spin, fanfare on win

```typescript
interface SpinWheelProps {
  onClose: () => void;
}

// Animation: rotate to (360 * rotations + prizeAngle)
// Duration: 4000ms with cubic-bezier(0.2, 0.8, 0.3, 1)

// States:
// - idle: show wheel, spin button enabled
// - spinning: wheel rotating, button disabled
// - result: prize reveal modal overlay
```

### 1.4 Add Spin Sounds
File: `src/game/audio/SynthSounds.ts`

Add methods:
```typescript
playSpinTick(): void {
  // Quick click sound: 800Hz, 0.02s, sine
}

playJackpot(): void {
  // Triumphant fanfare: C5→E5→G5→C6 ascending, 0.3s each
}
```

### 1.5 Add Spin Button to Menu
File: `src/components/MenuOverlay.tsx`

Add "🎰 Spin!" button:
- Show "FREE!" badge if free spin available
- Positioned in menu overlay buttons area
- Opens SpinWheel modal on click

### 1.6 Integrate with GameStore
File: `src/stores/gameStore.ts`

No changes needed - already has `addCoins()` method.

Integration in SpinWheel:
- Check `coins >= SPIN_COST` for paid spins
- Deduct coins before spin
- Add won coins after reveal

## Acceptance Criteria
- [ ] Free spin available once per calendar day
- [ ] Paid spins cost 30 coins
- [ ] Wheel animation runs 4 seconds
- [ ] Sound effects play during spin
- [ ] Coins added to balance on win
- [ ] Confetti on rare+ prizes

/**
 * Spin wheel prize definitions with weighted random selection
 * Higher weight = more common prize
 */

export interface SpinPrize {
  id: string;
  name: string;
  emoji: string;
  type: "coins" | "mystery_box" | "nothing";
  value: number | string; // coins amount or box tier
  weight: number; // 1-100, higher = more common
  rarity: "common" | "rare" | "epic" | "legendary";
}

export const SPIN_PRIZES: SpinPrize[] = [
  // Common (total weight: 120) - ~70% chance
  {
    id: "coins_10",
    name: "+10 Coins",
    emoji: "🪙",
    type: "coins",
    value: 10,
    weight: 50,
    rarity: "common",
  },
  {
    id: "coins_25",
    name: "+25 Coins",
    emoji: "💰",
    type: "coins",
    value: 25,
    weight: 40,
    rarity: "common",
  },
  {
    id: "nothing",
    name: "Try Again!",
    emoji: "💨",
    type: "nothing",
    value: 0,
    weight: 30,
    rarity: "common",
  },

  // Rare (total weight: 35) - ~20% chance
  {
    id: "coins_50",
    name: "+50 Coins",
    emoji: "💎",
    type: "coins",
    value: 50,
    weight: 20,
    rarity: "rare",
  },
  {
    id: "mystery_common",
    name: "Mystery Box",
    emoji: "📦",
    type: "mystery_box",
    value: "common",
    weight: 15,
    rarity: "rare",
  },

  // Epic (total weight: 13) - ~7% chance
  {
    id: "coins_100",
    name: "+100 Coins",
    emoji: "👑",
    type: "coins",
    value: 100,
    weight: 8,
    rarity: "epic",
  },
  {
    id: "mystery_rare",
    name: "Rare Box",
    emoji: "🎁",
    type: "mystery_box",
    value: "rare",
    weight: 5,
    rarity: "epic",
  },

  // Legendary (weight: 2) - ~1% chance
  {
    id: "coins_250",
    name: "JACKPOT!",
    emoji: "🎰",
    type: "coins",
    value: 250,
    weight: 2,
    rarity: "legendary",
  },
];

/**
 * Select a random prize using weighted probability
 * Called BEFORE animation starts to determine final position
 */
export function selectRandomPrize(): SpinPrize {
  const totalWeight = SPIN_PRIZES.reduce((sum, p) => sum + p.weight, 0);
  let random = Math.random() * totalWeight;

  for (const prize of SPIN_PRIZES) {
    random -= prize.weight;
    if (random <= 0) return prize;
  }
  return SPIN_PRIZES[0];
}

/**
 * Get color for prize rarity display
 */
export function getPrizeColor(rarity: SpinPrize["rarity"]): string {
  switch (rarity) {
    case "common":
      return "#9CA3AF";
    case "rare":
      return "#60A5FA";
    case "epic":
      return "#A78BFA";
    case "legendary":
      return "#FBBF24";
  }
}

/**
 * Get background gradient for prize rarity
 */
export function getPrizeGradient(rarity: SpinPrize["rarity"]): string {
  switch (rarity) {
    case "common":
      return "from-gray-200 to-gray-300";
    case "rare":
      return "from-blue-200 to-blue-400";
    case "epic":
      return "from-purple-200 to-purple-400";
    case "legendary":
      return "from-yellow-200 to-yellow-400";
  }
}

// Cost for paid spins
export const SPIN_COST = 30;

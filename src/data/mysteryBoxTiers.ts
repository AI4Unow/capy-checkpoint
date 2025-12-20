/**
 * Mystery box tier definitions with loot tables
 */

export type BoxTier = "common" | "rare" | "epic" | "legendary";

export interface BoxLoot {
  type: "coins" | "item";
  value: number | string; // coins amount or item ID
  weight: number; // Higher = more common
  name: string;
  emoji: string;
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
      { type: "coins", value: 15, weight: 45, name: "+15 Coins", emoji: "🪙" },
      { type: "coins", value: 25, weight: 35, name: "+25 Coins", emoji: "💰" },
      { type: "coins", value: 40, weight: 15, name: "+40 Coins", emoji: "💎" },
      {
        type: "item",
        value: "hat_strawberry",
        weight: 5,
        name: "Strawberry Hat",
        emoji: "🍓",
      },
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
      {
        type: "item",
        value: "hat_flower_crown",
        weight: 10,
        name: "Flower Crown",
        emoji: "🌸",
      },
      {
        type: "item",
        value: "acc_scarf",
        weight: 10,
        name: "Cozy Scarf",
        emoji: "🧣",
      },
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
      {
        type: "item",
        value: "trail_sparkle",
        weight: 15,
        name: "Sparkle Trail",
        emoji: "✨",
      },
      {
        type: "item",
        value: "acc_cape",
        weight: 10,
        name: "Hero Cape",
        emoji: "🦸",
      },
      {
        type: "item",
        value: "bg_ocean",
        weight: 5,
        name: "Ocean Breeze",
        emoji: "🌊",
      },
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
      {
        type: "item",
        value: "hat_rainbow",
        weight: 15,
        name: "Rainbow Crown",
        emoji: "🌈",
      },
      {
        type: "item",
        value: "trail_rainbow",
        weight: 15,
        name: "Rainbow Trail",
        emoji: "🌈",
      },
      {
        type: "item",
        value: "bg_sky_castle",
        weight: 10,
        name: "Sky Castle",
        emoji: "🏰",
      },
      {
        type: "item",
        value: "hat_wizard",
        weight: 5,
        name: "Math Wizard Hat",
        emoji: "🧙",
      },
    ],
  },
];

/**
 * Get box tier definition by ID
 */
export function getBoxTier(tier: BoxTier): MysteryBoxTier {
  return MYSTERY_BOX_TIERS.find((t) => t.id === tier) || MYSTERY_BOX_TIERS[0];
}

/**
 * Select random loot from box tier using weighted probability
 */
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

/**
 * Get tier color for display
 */
export function getTierColor(tier: BoxTier): string {
  return getBoxTier(tier).color;
}

/**
 * Boutique items for Capybara customization
 */

export interface BoutiqueItem {
  id: string;
  name: string;
  description: string;
  category: "hat" | "accessory" | "trail" | "background";
  price: number;
  rarity: "common" | "rare" | "epic" | "legendary";
  emoji: string;
  unlockCondition?: {
    type: "rating" | "streak" | "mastered";
    value: number;
  };
}

export const BOUTIQUE_ITEMS: BoutiqueItem[] = [
  // Hats
  {
    id: "hat_yuzu",
    name: "Yuzu Hat",
    description: "The classic! A cute yuzu fruit sits atop Capy's head.",
    category: "hat",
    price: 0,
    rarity: "common",
    emoji: "🍊",
  },
  {
    id: "hat_strawberry",
    name: "Strawberry Hat",
    description: "Sweet and stylish strawberry headpiece.",
    category: "hat",
    price: 50,
    rarity: "common",
    emoji: "🍓",
  },
  {
    id: "hat_flower_crown",
    name: "Flower Crown",
    description: "A beautiful crown of meadow flowers.",
    category: "hat",
    price: 100,
    rarity: "rare",
    emoji: "🌸",
  },
  {
    id: "hat_wizard",
    name: "Math Wizard Hat",
    description: "For true math magicians!",
    category: "hat",
    price: 200,
    rarity: "epic",
    emoji: "🧙",
    unlockCondition: { type: "rating", value: 1000 },
  },
  {
    id: "hat_rainbow",
    name: "Rainbow Crown",
    description: "A shimmering rainbow halo. Legendary!",
    category: "hat",
    price: 500,
    rarity: "legendary",
    emoji: "🌈",
    unlockCondition: { type: "rating", value: 1300 },
  },

  // Accessories
  {
    id: "acc_glasses",
    name: "Smart Glasses",
    description: "Capy looks extra studious!",
    category: "accessory",
    price: 30,
    rarity: "common",
    emoji: "👓",
  },
  {
    id: "acc_bowtie",
    name: "Fancy Bowtie",
    description: "Looking dapper for math class.",
    category: "accessory",
    price: 50,
    rarity: "common",
    emoji: "🎀",
  },
  {
    id: "acc_scarf",
    name: "Cozy Scarf",
    description: "A warm, fluffy scarf for chilly days.",
    category: "accessory",
    price: 80,
    rarity: "rare",
    emoji: "🧣",
  },
  {
    id: "acc_cape",
    name: "Hero Cape",
    description: "Every math hero needs a cape!",
    category: "accessory",
    price: 150,
    rarity: "epic",
    emoji: "🦸",
    unlockCondition: { type: "streak", value: 10 },
  },

  // Trails
  {
    id: "trail_sparkle",
    name: "Sparkle Trail",
    description: "Leave a trail of sparkles as you fly!",
    category: "trail",
    price: 100,
    rarity: "rare",
    emoji: "✨",
  },
  {
    id: "trail_hearts",
    name: "Heart Trail",
    description: "Spread love with every flap.",
    category: "trail",
    price: 120,
    rarity: "rare",
    emoji: "💕",
  },
  {
    id: "trail_stars",
    name: "Star Trail",
    description: "Leave stardust in your wake.",
    category: "trail",
    price: 200,
    rarity: "epic",
    emoji: "⭐",
    unlockCondition: { type: "mastered", value: 5 },
  },
  {
    id: "trail_rainbow",
    name: "Rainbow Trail",
    description: "The most magical trail of all!",
    category: "trail",
    price: 400,
    rarity: "legendary",
    emoji: "🌈",
    unlockCondition: { type: "mastered", value: 15 },
  },

  // Backgrounds
  {
    id: "bg_forest",
    name: "Forest World",
    description: "The peaceful starting forest.",
    category: "background",
    price: 0,
    rarity: "common",
    emoji: "🌲",
  },
  {
    id: "bg_garden",
    name: "Flower Garden",
    description: "A beautiful flower garden path.",
    category: "background",
    price: 150,
    rarity: "rare",
    emoji: "🌷",
  },
  {
    id: "bg_ocean",
    name: "Ocean Breeze",
    description: "Fly over sparkling ocean waves.",
    category: "background",
    price: 200,
    rarity: "epic",
    emoji: "🌊",
  },
  {
    id: "bg_sky_castle",
    name: "Sky Castle",
    description: "Soar through the clouds to a magical castle.",
    category: "background",
    price: 300,
    rarity: "legendary",
    emoji: "🏰",
    unlockCondition: { type: "rating", value: 1150 },
  },
];

/**
 * Get items by category
 */
export function getItemsByCategory(category: BoutiqueItem["category"]): BoutiqueItem[] {
  return BOUTIQUE_ITEMS.filter((item) => item.category === category);
}

/**
 * Get item by ID
 */
export function getItemById(id: string): BoutiqueItem | undefined {
  return BOUTIQUE_ITEMS.find((item) => item.id === id);
}

/**
 * Check if item is unlocked
 */
export function isItemUnlocked(
  item: BoutiqueItem,
  studentRating: number,
  bestStreak: number,
  masteredCount: number
): boolean {
  if (!item.unlockCondition) return true;

  switch (item.unlockCondition.type) {
    case "rating":
      return studentRating >= item.unlockCondition.value;
    case "streak":
      return bestStreak >= item.unlockCondition.value;
    case "mastered":
      return masteredCount >= item.unlockCondition.value;
    default:
      return true;
  }
}

/**
 * Get rarity color
 */
export function getRarityColor(rarity: BoutiqueItem["rarity"]): string {
  switch (rarity) {
    case "common":
      return "#9CA3AF"; // gray
    case "rare":
      return "#60A5FA"; // blue
    case "epic":
      return "#A78BFA"; // purple
    case "legendary":
      return "#FBBF24"; // gold
  }
}

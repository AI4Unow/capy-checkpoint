import { getItemById } from "@/data/boutique";

export interface EquippedCosmetics {
  hat: string;
  accessory: string | null;
  trail: string | null;
  background: string;
}

export interface BackgroundCosmetic {
  tint: number;
  effect: "none" | "petals" | "bubbles" | "sparkles";
}

export interface TrailCosmetic {
  emojis: string[];
}

export function getHatEmoji(hatId: string): string | null {
  // Base sprite already includes the default yuzu hat.
  if (hatId === "hat_yuzu") return null;
  return getItemById(hatId)?.emoji ?? null;
}

export function getAccessoryEmoji(accessoryId: string | null): string | null {
  if (!accessoryId) return null;
  return getItemById(accessoryId)?.emoji ?? null;
}

export function getBackgroundCosmetic(backgroundId: string): BackgroundCosmetic {
  switch (backgroundId) {
    case "bg_garden":
      return { tint: 0xfff2f8, effect: "petals" };
    case "bg_ocean":
      return { tint: 0xd6ecff, effect: "bubbles" };
    case "bg_sky_castle":
      return { tint: 0xf1ebff, effect: "sparkles" };
    case "bg_forest":
    default:
      return { tint: 0xffffff, effect: "none" };
  }
}

export function getTrailCosmetic(trailId: string | null): TrailCosmetic | null {
  switch (trailId) {
    case "trail_sparkle":
      return { emojis: ["✨", "✦"] };
    case "trail_hearts":
      return { emojis: ["💕", "💖"] };
    case "trail_stars":
      return { emojis: ["⭐", "🌟"] };
    case "trail_rainbow":
      return { emojis: ["🌈", "✨", "⭐"] };
    default:
      return null;
  }
}

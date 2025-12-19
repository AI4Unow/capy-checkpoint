import Phaser from "phaser";
import { Boot } from "./scenes/Boot";
import { Menu } from "./scenes/Menu";
import { Game } from "./scenes/Game";

/**
 * Phaser game configuration
 */
export const createGameConfig = (
  parent: string
): Phaser.Types.Core.GameConfig => ({
  type: Phaser.AUTO,
  parent,
  width: 800,
  height: 600,
  backgroundColor: "#A2D2FF",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 1000 },
      debug: false,
    },
  },
  scene: [Boot, Menu, Game],
});

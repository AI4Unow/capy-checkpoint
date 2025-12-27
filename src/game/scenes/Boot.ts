import Phaser from "phaser";
import { EventBus, GameEvents } from "../EventBus";

/**
 * Boot scene - preloads all assets
 */
export class Boot extends Phaser.Scene {
  constructor() {
    super("Boot");
  }

  preload(): void {
    // Loading text
    const loadingText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      "Loading...",
      { fontFamily: "Fredoka", fontSize: "32px", color: "#5E503F" }
    );
    loadingText.setOrigin(0.5);

    this.createCapybaraGraphics();
    this.createBackgroundGraphics();
    this.createGateGraphics();
  }

  private createCapybaraGraphics(): void {
    // Create spritesheet with 3 frames for wing animation
    // Increased width to accommodate bigger wings
    const frameWidth = 120;
    const frameHeight = 90;
    const g = this.make.graphics({ x: 0, y: 0 });

    // Draw 3 frames side by side (wings up, middle, down)
    for (let frame = 0; frame < 3; frame++) {
      const offsetX = frame * frameWidth;

      // Wing positions for each frame - bigger movement range
      const wingOffsets = [
        { y: -15, spread: 1.4 },  // Frame 0: wings up high
        { y: 0, spread: 1.0 },    // Frame 1: wings middle
        { y: 12, spread: 0.6 },   // Frame 2: wings down low
      ];
      const wing = wingOffsets[frame];

      // LEFT Wings (behind body) - soft pink feathered wings
      g.fillStyle(0xffd6e0);
      // Large outer feathers
      g.fillTriangle(
        offsetX + 0, 45 + wing.y,
        offsetX + 15, 5 + wing.y * wing.spread,
        offsetX + 40, 50 + wing.y
      );
      g.fillTriangle(
        offsetX + 5, 50 + wing.y,
        offsetX + 25, 10 + wing.y * wing.spread,
        offsetX + 50, 55 + wing.y
      );
      g.fillTriangle(
        offsetX + 10, 55 + wing.y,
        offsetX + 35, 15 + wing.y * wing.spread,
        offsetX + 55, 60 + wing.y
      );
      g.fillTriangle(
        offsetX + 15, 60 + wing.y,
        offsetX + 40, 25 + wing.y * wing.spread,
        offsetX + 60, 65 + wing.y
      );

      // Left wing feather details - darker pink
      g.fillStyle(0xffb3c6);
      g.fillTriangle(
        offsetX + 3, 48 + wing.y,
        offsetX + 18, 12 + wing.y * wing.spread,
        offsetX + 38, 52 + wing.y
      );
      g.fillTriangle(
        offsetX + 8, 53 + wing.y,
        offsetX + 28, 18 + wing.y * wing.spread,
        offsetX + 48, 57 + wing.y
      );
      g.fillTriangle(
        offsetX + 13, 58 + wing.y,
        offsetX + 33, 23 + wing.y * wing.spread,
        offsetX + 53, 62 + wing.y
      );

      // RIGHT Wings (mirrored, behind body) - smaller since facing away
      // Body center is around x=60, so mirror around that axis
      g.fillStyle(0xffd6e0);
      g.fillTriangle(
        offsetX + 120, 45 + wing.y,
        offsetX + 105, 5 + wing.y * wing.spread,
        offsetX + 80, 50 + wing.y
      );
      g.fillTriangle(
        offsetX + 115, 50 + wing.y,
        offsetX + 95, 10 + wing.y * wing.spread,
        offsetX + 70, 55 + wing.y
      );
      g.fillTriangle(
        offsetX + 110, 55 + wing.y,
        offsetX + 85, 15 + wing.y * wing.spread,
        offsetX + 65, 60 + wing.y
      );
      g.fillTriangle(
        offsetX + 105, 60 + wing.y,
        offsetX + 80, 25 + wing.y * wing.spread,
        offsetX + 60, 65 + wing.y
      );

      // Right wing feather details - darker pink
      g.fillStyle(0xffb3c6);
      g.fillTriangle(
        offsetX + 117, 48 + wing.y,
        offsetX + 102, 12 + wing.y * wing.spread,
        offsetX + 82, 52 + wing.y
      );
      g.fillTriangle(
        offsetX + 112, 53 + wing.y,
        offsetX + 92, 18 + wing.y * wing.spread,
        offsetX + 72, 57 + wing.y
      );
      g.fillTriangle(
        offsetX + 107, 58 + wing.y,
        offsetX + 87, 23 + wing.y * wing.spread,
        offsetX + 67, 62 + wing.y
      );

      // Body (shifted right to make room for wings)
      g.fillStyle(0xa67c52);
      g.fillRoundedRect(offsetX + 20, 30, 80, 50, 20);

      // Head
      g.fillStyle(0xb8926a);
      g.fillCircle(offsetX + 90, 35, 25);

      // Eye
      g.fillStyle(0x5e503f);
      g.fillCircle(offsetX + 98, 30, 5);
      g.fillStyle(0xffffff);
      g.fillCircle(offsetX + 100, 28, 2);

      // Nose
      g.fillStyle(0x5e503f);
      g.fillCircle(offsetX + 108, 38, 4);

      // Ear
      g.fillStyle(0xa67c52);
      g.fillCircle(offsetX + 75, 15, 8);

      // Yuzu hat
      g.fillStyle(0xffd60a);
      g.fillCircle(offsetX + 85, 10, 15);
      g.fillStyle(0x4caf50);
      g.fillTriangle(offsetX + 75, 0, offsetX + 85, -5, offsetX + 80, 10);
    }

    // Generate spritesheet texture
    g.generateTexture("capybara", frameWidth * 3, frameHeight);

    // Add individual frames to the texture for animation
    const texture = this.textures.get("capybara");
    for (let i = 0; i < 3; i++) {
      texture.add(i, 0, i * frameWidth, 0, frameWidth, frameHeight);
    }

    g.destroy();
  }

  private createBackgroundGraphics(): void {
    const g = this.make.graphics({ x: 0, y: 0 });

    // Sky
    g.fillStyle(0xa2d2ff);
    g.fillRect(0, 0, 800, 600);

    // Clouds
    g.fillStyle(0xffffff);
    g.fillCircle(100, 80, 30);
    g.fillCircle(130, 70, 40);
    g.fillCircle(160, 80, 30);
    g.fillCircle(500, 120, 25);
    g.fillCircle(525, 110, 35);
    g.fillCircle(555, 120, 25);

    // Ground
    g.fillStyle(0xdde5b6);
    g.fillRect(0, 520, 800, 80);

    // Grass
    g.fillStyle(0xadc178);
    for (let x = 0; x < 800; x += 20) {
      g.fillTriangle(x, 520, x + 10, 500, x + 20, 520);
    }

    // Trees
    g.fillTriangle(50, 520, 90, 380, 130, 520);
    g.fillTriangle(600, 520, 650, 350, 700, 520);

    g.generateTexture("background", 800, 600);
    g.destroy();
  }

  private createGateGraphics(): void {
    const g = this.make.graphics({ x: 0, y: 0 });

    g.fillStyle(0xdde5b6);
    g.fillRoundedRect(0, 0, 60, 180, 15);
    g.lineStyle(4, 0x5e503f);
    g.strokeRoundedRect(0, 0, 60, 180, 15);

    // Flowers
    g.fillStyle(0xffd6e0);
    g.fillCircle(30, 20, 12);
    g.fillCircle(30, 90, 12);
    g.fillCircle(30, 160, 12);
    g.fillStyle(0xffd60a);
    g.fillCircle(30, 20, 5);
    g.fillCircle(30, 90, 5);
    g.fillCircle(30, 160, 5);

    g.generateTexture("gate", 60, 180);
    g.destroy();
  }

  create(): void {
    EventBus.emit(GameEvents.READY);
    this.scene.start("Menu");
  }
}

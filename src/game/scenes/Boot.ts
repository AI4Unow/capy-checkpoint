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
    const frameWidth = 100;
    const frameHeight = 80;
    const g = this.make.graphics({ x: 0, y: 0 });

    // Draw 3 frames side by side (wings up, middle, down)
    for (let frame = 0; frame < 3; frame++) {
      const offsetX = frame * frameWidth;

      // Wing positions for each frame
      const wingOffsets = [
        { y: -8, spread: 1.2 },  // Frame 0: wings up
        { y: 0, spread: 1.0 },   // Frame 1: wings middle
        { y: 6, spread: 0.8 },   // Frame 2: wings down
      ];
      const wing = wingOffsets[frame];

      // Wings (behind body) - soft pink feathered wings
      g.fillStyle(0xffd6e0);
      g.fillTriangle(
        offsetX + 5, 35 + wing.y,
        offsetX + 25, 15 + wing.y * wing.spread,
        offsetX + 35, 40 + wing.y
      );
      g.fillTriangle(
        offsetX + 10, 40 + wing.y,
        offsetX + 30, 20 + wing.y * wing.spread,
        offsetX + 40, 45 + wing.y
      );
      g.fillTriangle(
        offsetX + 15, 45 + wing.y,
        offsetX + 35, 25 + wing.y * wing.spread,
        offsetX + 45, 50 + wing.y
      );
      // Wing feather details
      g.fillStyle(0xffb3c6);
      g.fillTriangle(
        offsetX + 8, 38 + wing.y,
        offsetX + 22, 22 + wing.y * wing.spread,
        offsetX + 32, 42 + wing.y
      );
      g.fillTriangle(
        offsetX + 12, 43 + wing.y,
        offsetX + 28, 28 + wing.y * wing.spread,
        offsetX + 38, 48 + wing.y
      );

      // Body
      g.fillStyle(0xa67c52);
      g.fillRoundedRect(offsetX + 0, 20, 80, 50, 20);

      // Head
      g.fillStyle(0xb8926a);
      g.fillCircle(offsetX + 70, 25, 25);

      // Eye
      g.fillStyle(0x5e503f);
      g.fillCircle(offsetX + 78, 20, 5);
      g.fillStyle(0xffffff);
      g.fillCircle(offsetX + 80, 18, 2);

      // Nose
      g.fillStyle(0x5e503f);
      g.fillCircle(offsetX + 88, 28, 4);

      // Ear
      g.fillStyle(0xa67c52);
      g.fillCircle(offsetX + 55, 5, 8);

      // Yuzu hat
      g.fillStyle(0xffd60a);
      g.fillCircle(offsetX + 65, 0, 15);
      g.fillStyle(0x4caf50);
      g.fillTriangle(offsetX + 55, -10, offsetX + 65, -15, offsetX + 60, 0);
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

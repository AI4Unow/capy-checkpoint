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
    const g = this.make.graphics({ x: 0, y: 0 });

    // Body
    g.fillStyle(0xa67c52);
    g.fillRoundedRect(0, 20, 80, 50, 20);

    // Head
    g.fillStyle(0xb8926a);
    g.fillCircle(70, 25, 25);

    // Eye
    g.fillStyle(0x5e503f);
    g.fillCircle(78, 20, 5);
    g.fillStyle(0xffffff);
    g.fillCircle(80, 18, 2);

    // Nose
    g.fillStyle(0x5e503f);
    g.fillCircle(88, 28, 4);

    // Ear
    g.fillStyle(0xa67c52);
    g.fillCircle(55, 5, 8);

    // Yuzu hat
    g.fillStyle(0xffd60a);
    g.fillCircle(65, 0, 15);
    g.fillStyle(0x4caf50);
    g.fillTriangle(55, -10, 65, -15, 60, 0);

    g.generateTexture("capybara", 100, 80);
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

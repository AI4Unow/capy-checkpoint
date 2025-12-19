import Phaser from 'phaser';
import { EventBus, GameEvents } from '../EventBus';

/**
 * Boot scene - preloads all assets
 */
export class Boot extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload(): void {
    // Display loading text
    const loadingText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      'Loading...',
      {
        fontFamily: 'Fredoka',
        fontSize: '32px',
        color: '#5E503F',
      }
    );
    loadingText.setOrigin(0.5);

    // Create placeholder graphics for capybara
    this.createCapybaraGraphics();

    // Create placeholder background
    this.createBackgroundGraphics();

    // Create gate graphics
    this.createGateGraphics();
  }

  /**
   * Creates capybara sprite as graphics (placeholder)
   */
  private createCapybaraGraphics(): void {
    const graphics = this.make.graphics({ x: 0, y: 0 });

    // Body - warm brown rounded rectangle
    graphics.fillStyle(0xA67C52);
    graphics.fillRoundedRect(0, 20, 80, 50, 20);

    // Head - slightly lighter
    graphics.fillStyle(0xB8926A);
    graphics.fillCircle(70, 25, 25);

    // Eye
    graphics.fillStyle(0x5E503F);
    graphics.fillCircle(78, 20, 5);

    // Eye shine
    graphics.fillStyle(0xFFFFFF);
    graphics.fillCircle(80, 18, 2);

    // Nose
    graphics.fillStyle(0x5E503F);
    graphics.fillCircle(88, 28, 4);

    // Ear
    graphics.fillStyle(0xA67C52);
    graphics.fillCircle(55, 5, 8);

    // Yuzu hat (yellow citrus)
    graphics.fillStyle(0xFFD60A);
    graphics.fillCircle(65, 0, 15);

    // Yuzu leaf
    graphics.fillStyle(0x4CAF50);
    graphics.fillTriangle(55, -10, 65, -15, 60, 0);

    graphics.generateTexture('capybara', 100, 80);
    graphics.destroy();
  }

  /**
   * Creates scrolling background tile
   */
  private createBackgroundGraphics(): void {
    const graphics = this.make.graphics({ x: 0, y: 0 });

    // Sky gradient (simplified as solid)
    graphics.fillStyle(0xA2D2FF);
    graphics.fillRect(0, 0, 800, 600);

    // Clouds
    graphics.fillStyle(0xFFFFFF);
    graphics.fillCircle(100, 80, 30);
    graphics.fillCircle(130, 70, 40);
    graphics.fillCircle(160, 80, 30);

    graphics.fillCircle(500, 120, 25);
    graphics.fillCircle(525, 110, 35);
    graphics.fillCircle(555, 120, 25);

    // Ground
    graphics.fillStyle(0xDDE5B6);
    graphics.fillRect(0, 520, 800, 80);

    // Grass details
    graphics.fillStyle(0xADC178);
    for (let x = 0; x < 800; x += 20) {
      graphics.fillTriangle(x, 520, x + 10, 500, x + 20, 520);
    }

    // Trees (simple triangles)
    graphics.fillStyle(0xADC178);
    graphics.fillTriangle(50, 520, 90, 380, 130, 520);
    graphics.fillTriangle(600, 520, 650, 350, 700, 520);

    graphics.generateTexture('background', 800, 600);
    graphics.destroy();
  }

  /**
   * Creates gate graphics with 3 paths
   */
  private createGateGraphics(): void {
    const graphics = this.make.graphics({ x: 0, y: 0 });

    // Gate column (vertical bar)
    graphics.fillStyle(0xDDE5B6);
    graphics.fillRoundedRect(0, 0, 60, 180, 15);

    // Border
    graphics.lineStyle(4, 0x5E503F);
    graphics.strokeRoundedRect(0, 0, 60, 180, 15);

    // Flower decorations
    graphics.fillStyle(0xFFD6E0);
    graphics.fillCircle(30, 20, 12);
    graphics.fillCircle(30, 90, 12);
    graphics.fillCircle(30, 160, 12);

    // Flower centers
    graphics.fillStyle(0xFFD60A);
    graphics.fillCircle(30, 20, 5);
    graphics.fillCircle(30, 90, 5);
    graphics.fillCircle(30, 160, 5);

    graphics.generateTexture('gate', 60, 180);
    graphics.destroy();
  }

  create(): void {
    EventBus.emit(GameEvents.READY);
    this.scene.start('Menu');
  }
}

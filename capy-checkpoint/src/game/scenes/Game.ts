import Phaser from 'phaser';
import { EventBus, GameEvents } from '../EventBus';

// Game constants
const FLAP_VELOCITY = -350;
const SCROLL_SPEED = 200;
const GATE_SPAWN_INTERVAL = 3000;
const GROUND_Y = 520;

/**
 * Main gameplay scene - tap-to-flap with scrolling gates
 */
export class Game extends Phaser.Scene {
  private capybara!: Phaser.Physics.Arcade.Sprite;
  private gates!: Phaser.Physics.Arcade.Group;
  private background!: Phaser.GameObjects.TileSprite;
  private ground!: Phaser.GameObjects.Rectangle;
  private score: number = 0;
  private lives: number = 3;
  private isGameOver: boolean = false;
  private gateTimer!: Phaser.Time.TimerEvent;
  private passedGates: Set<Phaser.GameObjects.GameObject> = new Set();

  constructor() {
    super('Game');
  }

  create(): void {
    // Reset state
    this.score = 0;
    this.lives = 3;
    this.isGameOver = false;
    this.passedGates.clear();

    // Create scrolling background
    this.background = this.add.tileSprite(400, 300, 800, 600, 'background');

    // Create ground collision
    this.ground = this.add.rectangle(400, GROUND_Y + 40, 800, 80, 0xDDE5B6);
    this.physics.add.existing(this.ground, true);

    // Create capybara
    this.capybara = this.physics.add.sprite(150, 300, 'capybara');
    this.capybara.setCollideWorldBounds(true);
    this.capybara.setGravityY(0); // Scene gravity is already set
    (this.capybara.body as Phaser.Physics.Arcade.Body).setSize(60, 50);

    // Create gates group
    this.gates = this.physics.add.group({
      allowGravity: false,
      immovable: true,
    });

    // Ground collision
    this.physics.add.collider(this.capybara, this.ground, () => {
      if (!this.isGameOver) {
        this.gameOver();
      }
    });

    // Gate overlap detection
    this.physics.add.overlap(
      this.capybara,
      this.gates,
      (_capy, gate) => {
        if (gate && 'x' in gate) {
          this.handleGatePass(gate as Phaser.Physics.Arcade.Sprite);
        }
      },
      undefined,
      this
    );

    // Input - tap/click to flap
    this.input.on('pointerdown', () => this.flap());
    this.input.keyboard?.on('keydown-SPACE', () => this.flap());

    // Spawn gates periodically
    this.gateTimer = this.time.addEvent({
      delay: GATE_SPAWN_INTERVAL,
      callback: this.spawnGate,
      callbackScope: this,
      loop: true,
    });

    // Spawn first gate after short delay
    this.time.delayedCall(1500, () => this.spawnGate());

    // Emit initial state
    EventBus.emit(GameEvents.GAME_START);
    EventBus.emit(GameEvents.SCORE_UPDATE, this.score);
    EventBus.emit(GameEvents.LIVES_UPDATE, this.lives);

    // Fade in
    this.cameras.main.fadeIn(300);
  }

  update(): void {
    if (this.isGameOver) return;

    // Scroll background
    this.background.tilePositionX += SCROLL_SPEED * 0.016;

    // Move gates left
    this.gates.getChildren().forEach((gate) => {
      const gateSprite = gate as Phaser.Physics.Arcade.Sprite;
      gateSprite.x -= SCROLL_SPEED * 0.016;

      // Check if passed gate
      if (!this.passedGates.has(gate) && gateSprite.x < this.capybara.x - 50) {
        this.passedGates.add(gate);
        this.incrementScore();
      }

      // Remove off-screen gates
      if (gateSprite.x < -100) {
        this.passedGates.delete(gate);
        gateSprite.destroy();
      }
    });

    // Slight rotation based on velocity
    const velocityY = (this.capybara.body as Phaser.Physics.Arcade.Body).velocity.y;
    this.capybara.setAngle(Phaser.Math.Clamp(velocityY * 0.05, -30, 30));

    // Check ceiling
    if (this.capybara.y < 30) {
      this.capybara.y = 30;
      (this.capybara.body as Phaser.Physics.Arcade.Body).velocity.y = 0;
    }
  }

  /**
   * Flap action - apply upward velocity
   */
  private flap(): void {
    if (this.isGameOver) return;
    (this.capybara.body as Phaser.Physics.Arcade.Body).velocity.y = FLAP_VELOCITY;
  }

  /**
   * Spawn a gate obstacle
   */
  private spawnGate(): void {
    if (this.isGameOver) return;

    // Random gap position
    const gapY = Phaser.Math.Between(180, 400);
    const gapHeight = 180; // Size of the gap

    // Top gate
    const topGate = this.gates.create(900, gapY - gapHeight / 2 - 90, 'gate') as Phaser.Physics.Arcade.Sprite;
    topGate.setFlipY(true);
    (topGate.body as Phaser.Physics.Arcade.Body).setSize(40, 180);

    // Bottom gate
    const bottomGate = this.gates.create(900, gapY + gapHeight / 2 + 90, 'gate') as Phaser.Physics.Arcade.Sprite;
    (bottomGate.body as Phaser.Physics.Arcade.Body).setSize(40, 180);
  }

  /**
   * Handle gate pass/collision
   */
  private handleGatePass(gate: Phaser.Physics.Arcade.Sprite): void {
    if (this.isGameOver) return;

    // Gate collision = wrong answer (for now, just lose life)
    this.loseLife();

    // Destroy this gate pair
    const gateSprite = gate as Phaser.Physics.Arcade.Sprite;
    this.gates.getChildren()
      .filter(g => Math.abs((g as Phaser.Physics.Arcade.Sprite).x - gateSprite.x) < 10)
      .forEach(g => {
        this.passedGates.delete(g);
        (g as Phaser.Physics.Arcade.Sprite).destroy();
      });
  }

  /**
   * Increment score
   */
  private incrementScore(): void {
    this.score++;
    EventBus.emit(GameEvents.SCORE_UPDATE, this.score);
    EventBus.emit(GameEvents.GATE_PASSED, this.score);
  }

  /**
   * Lose a life
   */
  private loseLife(): void {
    this.lives--;
    EventBus.emit(GameEvents.LIVES_UPDATE, this.lives);

    // Screen shake
    this.cameras.main.shake(200, 0.01);

    // Flash red
    this.cameras.main.flash(200, 255, 77, 109, false);

    if (this.lives <= 0) {
      this.gameOver();
    }
  }

  /**
   * Game over
   */
  private gameOver(): void {
    this.isGameOver = true;
    this.gateTimer.destroy();

    // Stop capybara
    (this.capybara.body as Phaser.Physics.Arcade.Body).velocity.y = 0;
    (this.capybara.body as Phaser.Physics.Arcade.Body).allowGravity = false;

    EventBus.emit(GameEvents.GAME_OVER, this.score);

    // Show game over text
    const gameOverText = this.add.text(400, 250, 'Game Over!', {
      fontFamily: 'Fredoka',
      fontSize: '48px',
      color: '#5E503F',
    });
    gameOverText.setOrigin(0.5);

    const scoreText = this.add.text(400, 310, `Score: ${this.score}`, {
      fontFamily: 'Nunito',
      fontSize: '32px',
      color: '#5E503F',
    });
    scoreText.setOrigin(0.5);

    // Retry button
    const retryBtn = this.add.rectangle(400, 400, 180, 50, 0xDDE5B6);
    retryBtn.setStrokeStyle(4, 0x5E503F);
    retryBtn.setInteractive({ useHandCursor: true });

    const retryText = this.add.text(400, 400, 'Try Again', {
      fontFamily: 'Baloo 2',
      fontSize: '24px',
      color: '#5E503F',
    });
    retryText.setOrigin(0.5);

    retryBtn.on('pointerdown', () => {
      this.scene.restart();
    });

    // Menu button
    const menuBtn = this.add.rectangle(400, 470, 180, 50, 0xFFD6E0);
    menuBtn.setStrokeStyle(4, 0x5E503F);
    menuBtn.setInteractive({ useHandCursor: true });

    const menuText = this.add.text(400, 470, 'Menu', {
      fontFamily: 'Baloo 2',
      fontSize: '24px',
      color: '#5E503F',
    });
    menuText.setOrigin(0.5);

    menuBtn.on('pointerdown', () => {
      this.scene.start('Menu');
    });
  }
}

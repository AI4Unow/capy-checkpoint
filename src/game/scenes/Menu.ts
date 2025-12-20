import Phaser from "phaser";
import { synthSounds } from "../audio/SynthSounds";
import { EventBus, GameEvents } from "../EventBus";

// Game dimensions
const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;

/**
 * Menu scene - start screen
 */
export class Menu extends Phaser.Scene {
  private audioUnlocked: boolean = false;

  constructor() {
    super("Menu");
  }

  create(): void {
    // Unlock audio on first interaction (Web Audio requires user gesture)
    this.input.once("pointerdown", () => this.unlockAudio());
    this.input.keyboard?.once("keydown", () => this.unlockAudio());

    // Listen for sound settings from React
    EventBus.on(GameEvents.SOUND_TOGGLE, (...args: unknown[]) => {
      synthSounds.setEnabled(args[0] as boolean);
    });
    EventBus.on(GameEvents.VOLUME_CHANGE, (...args: unknown[]) => {
      synthSounds.setVolume(args[0] as number);
    });

    // Background (tiled for new dimensions)
    this.add.tileSprite(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, "background");

    // Title
    const title = this.add.text(GAME_WIDTH / 2, 150, "Mathie", {
      fontFamily: "Fredoka, Arial, sans-serif",
      fontSize: "80px",
      fontStyle: "bold",
      color: "#5E503F",
    });
    title.setOrigin(0.5);

    const subtitle = this.add.text(GAME_WIDTH / 2, 230, "Math Adventure!", {
      fontFamily: "Fredoka, Arial, sans-serif",
      fontSize: "36px",
      color: "#5E503F",
    });
    subtitle.setOrigin(0.5);

    // Capybara
    const capy = this.add.image(GAME_WIDTH / 2, 400, "capybara");
    capy.setScale(2);
    this.tweens.add({
      targets: capy,
      y: capy.y - 25,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Play button
    const playBtn = this.add.rectangle(GAME_WIDTH / 2, 560, 300, 80, 0xffd6e0);
    playBtn.setStrokeStyle(4, 0x5e503f);
    playBtn.setInteractive({ useHandCursor: true });

    const playText = this.add.text(GAME_WIDTH / 2, 560, "PLAY", {
      fontFamily: "Fredoka, Arial, sans-serif",
      fontSize: "52px",
      fontStyle: "bold",
      color: "#5E503F",
    });
    playText.setOrigin(0.5);

    // Instructions
    const instructions = this.add.text(GAME_WIDTH / 2, 660, "Press SPACE or TAP to flap • Guide Capy to the correct answer!", {
      fontFamily: "Fredoka, Arial, sans-serif",
      fontSize: "22px",
      color: "#5E503F",
    });
    instructions.setOrigin(0.5);
    instructions.setAlpha(0.8);

    playBtn.on("pointerover", () => {
      playBtn.setFillStyle(0xffe4ec);
      playBtn.setScale(1.05);
      playText.setScale(1.05);
    });

    playBtn.on("pointerout", () => {
      playBtn.setFillStyle(0xffd6e0);
      playBtn.setScale(1);
      playText.setScale(1);
    });

    playBtn.on("pointerdown", () => {
      this.cameras.main.fadeOut(300);
      this.time.delayedCall(300, () => this.scene.start("Game"));
    });

    this.cameras.main.fadeIn(500);
  }

  /**
   * Unlock Web Audio Context on first user interaction
   */
  private unlockAudio(): void {
    if (this.audioUnlocked) return;
    this.audioUnlocked = true;
    synthSounds.init();
  }
}

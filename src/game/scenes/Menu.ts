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
    // Check for autoplay URL parameter
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const autoPlay = urlParams.get("autoplay") === "true";
      if (autoPlay) {
        // Skip menu, start game directly with autoPlay
        synthSounds.init();
        this.scene.start("Game", { autoPlay: true });
        return;
      }
    }

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

    // Listen for start-game from React MenuOverlay
    EventBus.on(GameEvents.START_GAME, () => {
      this.unlockAudio();
      this.cameras.main.fadeOut(300);
      this.time.delayedCall(300, () => this.scene.start("Game"));
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

    // Instructions
    const instructions = this.add.text(GAME_WIDTH / 2, 680, "Press SPACE or TAP to flap • Guide Capy to the correct answer!", {
      fontFamily: "Fredoka, Arial, sans-serif",
      fontSize: "22px",
      color: "#5E503F",
    });
    instructions.setOrigin(0.5);
    instructions.setAlpha(0.8);

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

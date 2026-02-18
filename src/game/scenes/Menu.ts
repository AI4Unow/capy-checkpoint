import Phaser from "phaser";
import { synthSounds } from "../audio/SynthSounds";
import { EventBus, GameEvents } from "../EventBus";
import { useBoutiqueStore } from "@/stores/boutiqueStore";
import {
  type EquippedCosmetics,
  getAccessoryEmoji,
  getBackgroundCosmetic,
  getHatEmoji,
} from "../cosmetics";

// Game dimensions
const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;

/**
 * Menu scene - start screen
 */
export class Menu extends Phaser.Scene {
  private audioUnlocked: boolean = false;
  private background!: Phaser.GameObjects.TileSprite;
  private capyContainer!: Phaser.GameObjects.Container;
  private hatLabel: Phaser.GameObjects.Text | null = null;
  private accessoryLabel: Phaser.GameObjects.Text | null = null;
  private backgroundEffectTimer: Phaser.Time.TimerEvent | null = null;
  private unsubscribeBoutique: (() => void) | null = null;
  private equipped: EquippedCosmetics = useBoutiqueStore.getState().equipped;

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
    const handleSoundToggle = (...args: unknown[]) => {
      synthSounds.setEnabled(args[0] as boolean);
    };
    const handleVolumeChange = (...args: unknown[]) => {
      synthSounds.setVolume(args[0] as number);
    };
    EventBus.on(GameEvents.SOUND_TOGGLE, handleSoundToggle);
    EventBus.on(GameEvents.VOLUME_CHANGE, handleVolumeChange);

    // Listen for start-game from React MenuOverlay
    const handleStartGame = () => {
      this.unlockAudio();
      this.cameras.main.fadeOut(300);
      this.time.delayedCall(300, () => this.scene.start("Game"));
    };
    EventBus.on(GameEvents.START_GAME, handleStartGame);

    // Background (tiled for new dimensions)
    this.background = this.add.tileSprite(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      GAME_WIDTH,
      GAME_HEIGHT,
      "background"
    );
    this.applyBackgroundCosmetics();

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
    this.capyContainer = this.add.container(GAME_WIDTH / 2, 400);
    const capy = this.add.image(0, 0, "capybara");
    capy.setScale(2);
    this.capyContainer.add(capy);
    this.applyAvatarCosmetics();

    this.tweens.add({
      targets: this.capyContainer,
      y: this.capyContainer.y - 25,
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

    // Update cosmetics while user equips from boutique on the menu.
    this.unsubscribeBoutique = useBoutiqueStore.subscribe((state) => {
      this.equipped = state.equipped;
      this.applyBackgroundCosmetics();
      this.applyAvatarCosmetics();
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      EventBus.off(GameEvents.SOUND_TOGGLE, handleSoundToggle);
      EventBus.off(GameEvents.VOLUME_CHANGE, handleVolumeChange);
      EventBus.off(GameEvents.START_GAME, handleStartGame);
      this.backgroundEffectTimer?.destroy();
      this.backgroundEffectTimer = null;
      if (this.unsubscribeBoutique) {
        this.unsubscribeBoutique();
        this.unsubscribeBoutique = null;
      }
    });

    this.cameras.main.fadeIn(500);
  }

  private applyAvatarCosmetics(): void {
    const hatEmoji = getHatEmoji(this.equipped.hat);
    const accessoryEmoji = getAccessoryEmoji(this.equipped.accessory);

    this.hatLabel?.destroy();
    this.hatLabel = null;
    this.accessoryLabel?.destroy();
    this.accessoryLabel = null;

    if (hatEmoji) {
      this.hatLabel = this.add.text(8, -88, hatEmoji, {
        fontFamily: "Arial, sans-serif",
        fontSize: "50px",
        stroke: "#5E503F",
        strokeThickness: 8,
        shadow: { offsetX: 2, offsetY: 2, color: "#00000066", blur: 0, fill: true },
      });
      this.hatLabel.setOrigin(0.5);
      this.capyContainer.add(this.hatLabel);
    }

    if (accessoryEmoji) {
      this.accessoryLabel = this.add.text(24, -6, accessoryEmoji, {
        fontFamily: "Arial, sans-serif",
        fontSize: "44px",
        stroke: "#5E503F",
        strokeThickness: 7,
        shadow: { offsetX: 2, offsetY: 2, color: "#00000066", blur: 0, fill: true },
      });
      this.accessoryLabel.setOrigin(0.5);
      this.capyContainer.add(this.accessoryLabel);
    }
  }

  private applyBackgroundCosmetics(): void {
    const cosmetic = getBackgroundCosmetic(this.equipped.background);
    this.background.setTint(cosmetic.tint);
    this.backgroundEffectTimer?.destroy();
    this.backgroundEffectTimer = null;

    const effect = cosmetic.effect;
    if (effect === "none") return;

    const delayByEffect: Record<Exclude<typeof effect, "none">, number> = {
      petals: 900,
      bubbles: 650,
      sparkles: 1000,
    };

    this.backgroundEffectTimer = this.time.addEvent({
      delay: delayByEffect[effect],
      callback: () => this.spawnBackgroundEffect(effect),
      callbackScope: this,
      loop: true,
    });
  }

  private spawnBackgroundEffect(effect: "petals" | "bubbles" | "sparkles"): void {
    if (effect === "bubbles") {
      const x = Phaser.Math.Between(40, GAME_WIDTH - 40);
      const y = GAME_HEIGHT + 10;
      const bubble = this.add.circle(x, y, Phaser.Math.Between(5, 10), 0xffffff, 0.45);
      bubble.setDepth(1);
      this.tweens.add({
        targets: bubble,
        y: Phaser.Math.Between(80, GAME_HEIGHT - 120),
        alpha: 0,
        duration: Phaser.Math.Between(2600, 3800),
        onComplete: () => bubble.destroy(),
      });
      return;
    }

    const emoji = effect === "petals" ? "🌸" : "✨";
    const particle = this.add.text(
      Phaser.Math.Between(60, GAME_WIDTH - 60),
      -20,
      emoji,
      {
        fontFamily: "Arial, sans-serif",
        fontSize: effect === "petals" ? "20px" : "18px",
      }
    );
    particle.setDepth(1);
    this.tweens.add({
      targets: particle,
      x: particle.x + Phaser.Math.Between(-80, 80),
      y: GAME_HEIGHT + 30,
      alpha: 0.2,
      angle: Phaser.Math.Between(-20, 20),
      duration: Phaser.Math.Between(2800, 4200),
      onComplete: () => particle.destroy(),
    });
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

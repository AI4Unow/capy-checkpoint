import Phaser from "phaser";
import { EventBus, GameEvents } from "../EventBus";

export type SoundKey = "flap" | "correct" | "wrong" | "streak" | "levelup";

/**
 * Centralized audio control for game sounds
 * - Muted by default (classroom-friendly)
 * - Syncs with settings store via EventBus
 */
export class AudioManager {
  private scene: Phaser.Scene;
  private enabled: boolean = false;
  private volume: number = 0.7;
  private unlocked: boolean = false;
  private soundToggleHandler: (...args: unknown[]) => void;
  private volumeChangeHandler: (...args: unknown[]) => void;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    // Store handler references for cleanup
    this.soundToggleHandler = (...args: unknown[]) => {
      const enabled = args[0] as boolean;
      if (enabled) {
        this.unmute();
      } else {
        this.mute();
      }
    };

    this.volumeChangeHandler = (...args: unknown[]) => {
      const volume = args[0] as number;
      this.setVolume(volume);
    };

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Listen for settings changes from React
    EventBus.on(GameEvents.SOUND_TOGGLE, this.soundToggleHandler);
    EventBus.on(GameEvents.VOLUME_CHANGE, this.volumeChangeHandler);
  }

  /**
   * Unlock Web Audio Context on first user interaction
   * Must be called from a user gesture (click/tap)
   */
  unlock(): void {
    if (this.unlocked) return;

    // Phaser's sound manager handles Web Audio unlock
    if (this.scene.sound.locked) {
      this.scene.sound.unlock();
    }
    this.unlocked = true;
  }

  /**
   * Play a sound effect by key
   */
  play(key: SoundKey): void {
    if (!this.enabled || !this.unlocked) return;

    // Check if sound exists before playing
    if (this.scene.cache.audio.exists(key)) {
      this.scene.sound.play(key, { volume: this.volume });
    }
  }

  /**
   * Play correct answer sound + optional streak bonus
   */
  playCorrect(streakCount: number = 0): void {
    this.play("correct");
    if (streakCount >= 5) {
      // Delayed streak sound for emphasis
      this.scene.time.delayedCall(200, () => this.play("streak"));
    }
  }

  /**
   * Play wrong answer sound
   */
  playWrong(): void {
    this.play("wrong");
  }

  /**
   * Play flap sound (debounced to prevent spam)
   */
  private lastFlapTime: number = 0;
  playFlap(): void {
    const now = Date.now();
    if (now - this.lastFlapTime < 100) return; // 100ms debounce
    this.lastFlapTime = now;
    this.play("flap");
  }

  /**
   * Set volume (0-1)
   */
  setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  /**
   * Enable sounds
   */
  unmute(): void {
    this.enabled = true;
  }

  /**
   * Disable sounds
   */
  mute(): void {
    this.enabled = false;
  }

  /**
   * Check if audio is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Cleanup event listeners
   */
  destroy(): void {
    EventBus.off(GameEvents.SOUND_TOGGLE, this.soundToggleHandler);
    EventBus.off(GameEvents.VOLUME_CHANGE, this.volumeChangeHandler);
  }
}

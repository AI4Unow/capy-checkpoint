type EventCallback = (...args: unknown[]) => void;

/**
 * Simple EventEmitter for browser
 * Used for React <-> Phaser communication
 */
class SimpleEventEmitter {
  private listeners: Map<string, EventCallback[]> = new Map();

  on(event: string, callback: EventCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: EventCallback): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event: string, ...args: unknown[]): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(...args));
    }
  }

  removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}

/**
 * EventBus for React <-> Phaser communication
 */
export const EventBus = new SimpleEventEmitter();

export const GameEvents = {
  SCORE_UPDATE: "score-update",
  LIVES_UPDATE: "lives-update",
  GAME_OVER: "game-over",
  GAME_START: "game-start",
  GATE_PASSED: "gate-passed",
  ANSWER: "answer",
  WRONG_ANSWER: "wrong-answer",
  SHOW_HINT: "show-hint",
  READY: "ready",
  RESTART: "restart",
  GO_TO_MENU: "go-to-menu",
  // Adaptive learning UX events
  DIFFICULTY_CHANGE: "difficulty-change",
  MASTERY_ACHIEVED: "mastery-achieved",
  STREAK_MILESTONE: "streak-milestone",
  QUESTION_REASON: "question-reason",
  ONBOARDING_COMPLETE: "onboarding-complete",
  SCENE_CHANGE: "scene-change",
  // Pause/Resume events
  PAUSE: "pause",
  RESUME: "resume",
  // Sound events
  SOUND_TOGGLE: "sound-toggle",
  VOLUME_CHANGE: "volume-change",
  MUSIC_TOGGLE: "music-toggle",
  // Touch controls
  SELECT_ANSWER: "select-answer",
} as const;

// Type definitions for event payloads
export type DifficultyLevel = "warmup" | "practice" | "challenge" | "boss";
export type QuestionReason = "review" | "weak" | "world" | "random";

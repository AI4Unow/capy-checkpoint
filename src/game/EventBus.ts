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
} as const;

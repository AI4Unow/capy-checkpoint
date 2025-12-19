import { describe, it, expect, beforeEach } from "vitest";
import {
  createSM2State,
  updateSM2,
  boolToQuality,
  isDueForReview,
  getDaysUntilReview,
  type SM2State,
} from "./sm2";

describe("SM-2 Spaced Repetition", () => {
  describe("createSM2State", () => {
    it("creates initial state with default values", () => {
      const state = createSM2State();
      expect(state.interval).toBe(1);
      expect(state.easeFactor).toBe(2.5);
      expect(state.repetitions).toBe(0);
      expect(state.nextReview).toBeInstanceOf(Date);
    });

    it("sets nextReview to current date", () => {
      const before = new Date();
      const state = createSM2State();
      const after = new Date();

      expect(state.nextReview.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(state.nextReview.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe("updateSM2", () => {
    let initialState: SM2State;

    beforeEach(() => {
      initialState = createSM2State();
    });

    it("keeps interval at 1 for first correct response", () => {
      const updated = updateSM2(initialState, 4);
      expect(updated.interval).toBe(1);
      expect(updated.repetitions).toBe(1);
    });

    it("sets interval to 6 for second correct response", () => {
      const first = updateSM2(initialState, 4);
      const second = updateSM2(first, 4);
      expect(second.interval).toBe(6);
      expect(second.repetitions).toBe(2);
    });

    it("multiplies interval by ease factor after second correct", () => {
      const first = updateSM2(initialState, 4);
      const second = updateSM2(first, 4);
      const third = updateSM2(second, 4);

      // interval should be ~6 * 2.5 = 15, capped at 30
      expect(third.interval).toBeGreaterThan(6);
      expect(third.repetitions).toBe(3);
    });

    it("resets on incorrect response (quality < 3)", () => {
      const correct = updateSM2(initialState, 4);
      const correct2 = updateSM2(correct, 4);
      const incorrect = updateSM2(correct2, 2); // quality 2 = incorrect

      expect(incorrect.repetitions).toBe(0);
      expect(incorrect.interval).toBe(1);
    });

    it("caps interval at 30 days", () => {
      let state = initialState;
      // Build up to high interval
      for (let i = 0; i < 10; i++) {
        state = updateSM2(state, 5);
      }
      expect(state.interval).toBeLessThanOrEqual(30);
    });

    it("decreases ease factor for low quality scores", () => {
      const state = updateSM2(initialState, 3); // quality 3 = difficult but correct
      expect(state.easeFactor).toBeLessThan(2.5);
    });

    it("increases ease factor for high quality scores", () => {
      const state = updateSM2(initialState, 5); // quality 5 = perfect
      expect(state.easeFactor).toBeGreaterThan(2.5);
    });

    it("never drops ease factor below 1.3", () => {
      let state = initialState;
      // Many difficult responses
      for (let i = 0; i < 20; i++) {
        state = updateSM2(state, 3);
      }
      expect(state.easeFactor).toBeGreaterThanOrEqual(1.3);
    });

    it("sets nextReview to future date", () => {
      const now = new Date();
      const updated = updateSM2(initialState, 4);
      expect(updated.nextReview.getTime()).toBeGreaterThanOrEqual(now.getTime());
    });
  });

  describe("boolToQuality", () => {
    it("returns 1 for incorrect answer", () => {
      expect(boolToQuality(false)).toBe(1);
    });

    it("returns 4 for correct answer without response time", () => {
      expect(boolToQuality(true)).toBe(4);
    });

    it("returns 5 for fast correct answer (< 3s)", () => {
      expect(boolToQuality(true, 2000)).toBe(5);
      expect(boolToQuality(true, 1000)).toBe(5);
    });

    it("returns 4 for normal speed correct answer (3-8s)", () => {
      expect(boolToQuality(true, 5000)).toBe(4);
      expect(boolToQuality(true, 7999)).toBe(4);
    });

    it("returns 3 for slow correct answer (>= 8s)", () => {
      expect(boolToQuality(true, 8000)).toBe(3);
      expect(boolToQuality(true, 15000)).toBe(3);
    });
  });

  describe("isDueForReview", () => {
    it("returns true when nextReview is in the past", () => {
      const pastState: SM2State = {
        interval: 1,
        easeFactor: 2.5,
        repetitions: 1,
        nextReview: new Date(Date.now() - 1000), // 1 second ago
      };
      expect(isDueForReview(pastState)).toBe(true);
    });

    it("returns true when nextReview is now", () => {
      const nowState: SM2State = {
        interval: 1,
        easeFactor: 2.5,
        repetitions: 1,
        nextReview: new Date(),
      };
      expect(isDueForReview(nowState)).toBe(true);
    });

    it("returns false when nextReview is in the future", () => {
      const futureState: SM2State = {
        interval: 1,
        easeFactor: 2.5,
        repetitions: 1,
        nextReview: new Date(Date.now() + 86400000), // 1 day from now
      };
      expect(isDueForReview(futureState)).toBe(false);
    });
  });

  describe("getDaysUntilReview", () => {
    it("returns negative number when overdue", () => {
      const pastState: SM2State = {
        interval: 1,
        easeFactor: 2.5,
        repetitions: 1,
        nextReview: new Date(Date.now() - 2 * 86400000), // 2 days ago
      };
      expect(getDaysUntilReview(pastState)).toBeLessThan(0);
    });

    it("returns positive number when future", () => {
      const futureState: SM2State = {
        interval: 1,
        easeFactor: 2.5,
        repetitions: 1,
        nextReview: new Date(Date.now() + 5 * 86400000), // 5 days from now
      };
      const days = getDaysUntilReview(futureState);
      expect(days).toBeGreaterThan(0);
      expect(days).toBeCloseTo(5, 0);
    });

    it("returns 0 when review is today", () => {
      const todayState: SM2State = {
        interval: 1,
        easeFactor: 2.5,
        repetitions: 1,
        nextReview: new Date(),
      };
      expect(getDaysUntilReview(todayState)).toBeCloseTo(0, 0);
    });
  });
});

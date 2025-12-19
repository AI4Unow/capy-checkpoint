import { describe, it, expect } from "vitest";
import {
  calculateExpected,
  updateRating,
  getKFactor,
  clampRating,
  getRatingLevel,
  getLevelProgress,
} from "./elo";

describe("Elo Rating System", () => {
  describe("calculateExpected", () => {
    it("returns 0.5 when student and question ratings are equal", () => {
      expect(calculateExpected(800, 800)).toBeCloseTo(0.5, 2);
    });

    it("returns higher probability when student rating > question difficulty", () => {
      const expected = calculateExpected(1000, 800);
      expect(expected).toBeGreaterThan(0.5);
      expect(expected).toBeLessThan(1);
    });

    it("returns lower probability when student rating < question difficulty", () => {
      const expected = calculateExpected(800, 1000);
      expect(expected).toBeLessThan(0.5);
      expect(expected).toBeGreaterThan(0);
    });

    it("returns ~0.76 when student is 200 points higher", () => {
      // Standard Elo: 200 point difference = ~76% expected
      const expected = calculateExpected(1000, 800);
      expect(expected).toBeCloseTo(0.76, 1);
    });

    it("returns ~0.24 when student is 200 points lower", () => {
      const expected = calculateExpected(800, 1000);
      expect(expected).toBeCloseTo(0.24, 1);
    });
  });

  describe("updateRating", () => {
    it("increases rating on correct answer when expected < 1", () => {
      const newRating = updateRating(800, 0.5, 1, 32);
      expect(newRating).toBeGreaterThan(800);
    });

    it("decreases rating on incorrect answer when expected > 0", () => {
      const newRating = updateRating(800, 0.5, 0, 32);
      expect(newRating).toBeLessThan(800);
    });

    it("gains more rating beating harder questions", () => {
      const gainEasy = updateRating(800, 0.8, 1, 32) - 800; // beat easy
      const gainHard = updateRating(800, 0.3, 1, 32) - 800; // beat hard
      expect(gainHard).toBeGreaterThan(gainEasy);
    });

    it("loses more rating failing easier questions", () => {
      const lossEasy = 800 - updateRating(800, 0.8, 0, 32); // fail easy
      const lossHard = 800 - updateRating(800, 0.3, 0, 32); // fail hard
      expect(lossEasy).toBeGreaterThan(lossHard);
    });

    it("returns rounded integer", () => {
      const newRating = updateRating(800, 0.5, 1, 32);
      expect(Number.isInteger(newRating)).toBe(true);
    });
  });

  describe("getKFactor", () => {
    it("returns 32 for new students (< 30 responses)", () => {
      expect(getKFactor(0)).toBe(32);
      expect(getKFactor(15)).toBe(32);
      expect(getKFactor(29)).toBe(32);
    });

    it("returns 24 for intermediate students (30-99 responses)", () => {
      expect(getKFactor(30)).toBe(24);
      expect(getKFactor(50)).toBe(24);
      expect(getKFactor(99)).toBe(24);
    });

    it("returns 16 for established students (100+ responses)", () => {
      expect(getKFactor(100)).toBe(16);
      expect(getKFactor(500)).toBe(16);
    });
  });

  describe("clampRating", () => {
    it("returns rating unchanged within bounds", () => {
      expect(clampRating(800)).toBe(800);
      expect(clampRating(1000)).toBe(1000);
    });

    it("clamps to minimum 400", () => {
      expect(clampRating(300)).toBe(400);
      expect(clampRating(0)).toBe(400);
      expect(clampRating(-100)).toBe(400);
    });

    it("clamps to maximum 1600", () => {
      expect(clampRating(1700)).toBe(1600);
      expect(clampRating(2000)).toBe(1600);
    });
  });

  describe("getRatingLevel", () => {
    it("returns Seedling for rating < 700", () => {
      expect(getRatingLevel(600).name).toBe("Seedling");
      expect(getRatingLevel(600).emoji).toBe("🌱");
    });

    it("returns Sprout for rating 700-849", () => {
      expect(getRatingLevel(700).name).toBe("Sprout");
      expect(getRatingLevel(849).name).toBe("Sprout");
    });

    it("returns Bloom for rating 850-999", () => {
      expect(getRatingLevel(850).name).toBe("Bloom");
      expect(getRatingLevel(999).name).toBe("Bloom");
    });

    it("returns Tree for rating 1000-1149", () => {
      expect(getRatingLevel(1000).name).toBe("Tree");
    });

    it("returns Star for rating 1150-1299", () => {
      expect(getRatingLevel(1150).name).toBe("Star");
    });

    it("returns Rainbow for rating >= 1300", () => {
      expect(getRatingLevel(1300).name).toBe("Rainbow");
      expect(getRatingLevel(1500).name).toBe("Rainbow");
    });
  });

  describe("getLevelProgress", () => {
    it("returns 0 at level start", () => {
      expect(getLevelProgress(700)).toBe(0); // Start of Sprout
    });

    it("returns ~50 at level midpoint", () => {
      // Sprout is 700-850, midpoint is 775
      expect(getLevelProgress(775)).toBeCloseTo(50, 0);
    });

    it("returns 100 at max level", () => {
      expect(getLevelProgress(1600)).toBe(100);
    });

    it("returns progress within level range", () => {
      const progress = getLevelProgress(800);
      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(100);
    });
  });
});

import { describe, it, expect } from "vitest";
import {
  updateMasteryScore,
  getMasteryStatus,
  createMasteryEntry,
  updateMastery,
  getWeakestSubtopics,
  getTopicMastery,
  type SubtopicMastery,
} from "./mastery";

describe("Mastery Tracking", () => {
  describe("updateMasteryScore", () => {
    it("increases score on correct answer", () => {
      const newScore = updateMasteryScore(0.5, true);
      expect(newScore).toBeGreaterThan(0.5);
    });

    it("decreases score on incorrect answer", () => {
      const newScore = updateMasteryScore(0.5, false);
      expect(newScore).toBeLessThan(0.5);
    });

    it("uses 65/35 weighted average", () => {
      // correct: 1 * 0.65 + 0.5 * 0.35 = 0.65 + 0.175 = 0.825
      const correctScore = updateMasteryScore(0.5, true);
      expect(correctScore).toBeCloseTo(0.825, 3);

      // incorrect: 0 * 0.65 + 0.5 * 0.35 = 0 + 0.175 = 0.175
      const incorrectScore = updateMasteryScore(0.5, false);
      expect(incorrectScore).toBeCloseTo(0.175, 3);
    });

    it("approaches 1.0 with consecutive correct answers", () => {
      let score = 0;
      for (let i = 0; i < 10; i++) {
        score = updateMasteryScore(score, true);
      }
      expect(score).toBeGreaterThan(0.95);
    });

    it("approaches 0.0 with consecutive incorrect answers", () => {
      let score = 1.0;
      for (let i = 0; i < 10; i++) {
        score = updateMasteryScore(score, false);
      }
      expect(score).toBeLessThan(0.05);
    });
  });

  describe("getMasteryStatus", () => {
    it("returns not_started for 0 attempts", () => {
      expect(getMasteryStatus(0, 0)).toBe("not_started");
      expect(getMasteryStatus(0.5, 0)).toBe("not_started");
    });

    it("returns learning for < 5 attempts regardless of score", () => {
      expect(getMasteryStatus(1.0, 1)).toBe("learning");
      expect(getMasteryStatus(0.9, 4)).toBe("learning");
    });

    it("returns mastered for score >= 0.8 and >= 5 attempts", () => {
      expect(getMasteryStatus(0.8, 5)).toBe("mastered");
      expect(getMasteryStatus(0.95, 10)).toBe("mastered");
    });

    it("returns learning for score < 0.8 with >= 5 attempts", () => {
      expect(getMasteryStatus(0.79, 5)).toBe("learning");
      expect(getMasteryStatus(0.5, 10)).toBe("learning");
    });
  });

  describe("createMasteryEntry", () => {
    it("creates entry with correct initial values", () => {
      const entry = createMasteryEntry("fractions", "number");

      expect(entry.subtopic).toBe("fractions");
      expect(entry.topic).toBe("number");
      expect(entry.score).toBe(0);
      expect(entry.status).toBe("not_started");
      expect(entry.attempts).toBe(0);
      expect(entry.correctCount).toBe(0);
      expect(entry.lastAttempt).toBeNull();
    });
  });

  describe("updateMastery", () => {
    it("increments attempts on answer", () => {
      const entry = createMasteryEntry("fractions", "number");
      const updated = updateMastery(entry, true);

      expect(updated.attempts).toBe(1);
    });

    it("increments correctCount on correct answer", () => {
      const entry = createMasteryEntry("fractions", "number");
      const updated = updateMastery(entry, true);

      expect(updated.correctCount).toBe(1);
    });

    it("does not increment correctCount on incorrect answer", () => {
      const entry = createMasteryEntry("fractions", "number");
      const updated = updateMastery(entry, false);

      expect(updated.correctCount).toBe(0);
    });

    it("updates score using weighted average", () => {
      const entry = createMasteryEntry("fractions", "number");
      const updated = updateMastery(entry, true);

      // First correct: 1 * 0.65 + 0 * 0.35 = 0.65
      expect(updated.score).toBeCloseTo(0.65, 3);
    });

    it("sets lastAttempt to current date", () => {
      const before = new Date();
      const entry = createMasteryEntry("fractions", "number");
      const updated = updateMastery(entry, true);
      const after = new Date();

      expect(updated.lastAttempt).not.toBeNull();
      expect(updated.lastAttempt!.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(updated.lastAttempt!.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it("transitions from not_started to learning", () => {
      const entry = createMasteryEntry("fractions", "number");
      expect(entry.status).toBe("not_started");

      const updated = updateMastery(entry, true);
      expect(updated.status).toBe("learning");
    });

    it("transitions from learning to mastered after 5 correct", () => {
      let entry = createMasteryEntry("fractions", "number");

      for (let i = 0; i < 5; i++) {
        entry = updateMastery(entry, true);
      }

      expect(entry.status).toBe("mastered");
    });
  });

  describe("getWeakestSubtopics", () => {
    it("returns empty array for empty map", () => {
      const map = new Map<string, SubtopicMastery>();
      expect(getWeakestSubtopics(map)).toEqual([]);
    });

    it("prioritizes learning status over not_started", () => {
      const map = new Map<string, SubtopicMastery>();

      map.set("a", {
        subtopic: "a",
        topic: "number",
        score: 0.3,
        status: "learning",
        attempts: 3,
        correctCount: 1,
        lastAttempt: new Date(),
      });

      map.set("b", {
        subtopic: "b",
        topic: "number",
        score: 0,
        status: "not_started",
        attempts: 0,
        correctCount: 0,
        lastAttempt: null,
      });

      const weakest = getWeakestSubtopics(map, 2);
      expect(weakest[0].subtopic).toBe("a"); // learning first
    });

    it("prioritizes lower scores within same status", () => {
      const map = new Map<string, SubtopicMastery>();

      map.set("a", {
        subtopic: "a",
        topic: "number",
        score: 0.5,
        status: "learning",
        attempts: 3,
        correctCount: 1,
        lastAttempt: new Date(),
      });

      map.set("b", {
        subtopic: "b",
        topic: "number",
        score: 0.2,
        status: "learning",
        attempts: 3,
        correctCount: 1,
        lastAttempt: new Date(),
      });

      const weakest = getWeakestSubtopics(map, 2);
      expect(weakest[0].subtopic).toBe("b"); // lower score first
    });

    it("respects limit parameter", () => {
      const map = new Map<string, SubtopicMastery>();

      for (let i = 0; i < 10; i++) {
        map.set(`topic${i}`, {
          subtopic: `topic${i}`,
          topic: "number",
          score: i * 0.1,
          status: "learning",
          attempts: 5,
          correctCount: 2,
          lastAttempt: new Date(),
        });
      }

      expect(getWeakestSubtopics(map, 3)).toHaveLength(3);
      expect(getWeakestSubtopics(map, 5)).toHaveLength(5);
    });
  });

  describe("getTopicMastery", () => {
    it("returns 0 for empty map", () => {
      const map = new Map<string, SubtopicMastery>();
      expect(getTopicMastery(map, "number")).toBe(0);
    });

    it("returns 0 for topic with no entries", () => {
      const map = new Map<string, SubtopicMastery>();
      map.set("geometry-shapes", {
        subtopic: "geometry-shapes",
        topic: "geometry",
        score: 0.8,
        status: "mastered",
        attempts: 10,
        correctCount: 8,
        lastAttempt: new Date(),
      });

      expect(getTopicMastery(map, "number")).toBe(0);
    });

    it("returns average score for topic", () => {
      const map = new Map<string, SubtopicMastery>();

      map.set("fractions", {
        subtopic: "fractions",
        topic: "number",
        score: 0.8,
        status: "mastered",
        attempts: 10,
        correctCount: 8,
        lastAttempt: new Date(),
      });

      map.set("decimals", {
        subtopic: "decimals",
        topic: "number",
        score: 0.6,
        status: "learning",
        attempts: 5,
        correctCount: 3,
        lastAttempt: new Date(),
      });

      // Average: (0.8 + 0.6) / 2 = 0.7
      expect(getTopicMastery(map, "number")).toBeCloseTo(0.7, 3);
    });

    it("filters by topic correctly", () => {
      const map = new Map<string, SubtopicMastery>();

      map.set("fractions", {
        subtopic: "fractions",
        topic: "number",
        score: 0.8,
        status: "mastered",
        attempts: 10,
        correctCount: 8,
        lastAttempt: new Date(),
      });

      map.set("shapes", {
        subtopic: "shapes",
        topic: "geometry",
        score: 0.4,
        status: "learning",
        attempts: 5,
        correctCount: 2,
        lastAttempt: new Date(),
      });

      expect(getTopicMastery(map, "number")).toBeCloseTo(0.8, 3);
      expect(getTopicMastery(map, "geometry")).toBeCloseTo(0.4, 3);
    });
  });
});

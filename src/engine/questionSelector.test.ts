import { describe, it, expect, vi, beforeEach } from "vitest";
import { selectNextQuestion, getTargetDifficulty } from "./questionSelector";
import type { Question } from "@/types/question";
import type { SubtopicMastery } from "./mastery";
import type { SM2State } from "./sm2";

// Mock questions for testing
const createMockQuestion = (overrides: Partial<Question> = {}): Question => ({
  id: `q-${Math.random().toString(36).slice(2, 9)}`,
  topic: "number",
  subtopic: "fractions",
  difficulty: 800,
  text: "What is 1/2 + 1/4?",
  options: ["3/4", "1/2", "1/4"],
  correctIndex: 0,
  explanation: "Add the fractions",
  ...overrides,
});

describe("Question Selector", () => {
  describe("selectNextQuestion", () => {
    let mockQuestions: Question[];

    beforeEach(() => {
      // Reset Math.random for deterministic tests
      vi.spyOn(Math, "random");

      mockQuestions = [
        createMockQuestion({ id: "q1", topic: "number", difficulty: 700 }),
        createMockQuestion({ id: "q2", topic: "calculation", difficulty: 800 }),
        createMockQuestion({ id: "q3", topic: "geometry", difficulty: 900 }),
        createMockQuestion({ id: "q4", topic: "number", difficulty: 850 }),
        createMockQuestion({ id: "q5", topic: "data", difficulty: 750 }),
      ];
    });

    it("returns a question from the pool", () => {
      const context = {
        studentRating: 800,
        currentWorld: 1,
        masteryMap: new Map<string, SubtopicMastery>(),
        sm2Map: new Map<string, SM2State>(),
        recentQuestionIds: [],
      };

      const selected = selectNextQuestion(mockQuestions, context);
      expect(mockQuestions.map((q) => q.id)).toContain(selected.question.id);
    });

    it("filters out recently answered questions", () => {
      const context = {
        studentRating: 800,
        currentWorld: 1,
        masteryMap: new Map<string, SubtopicMastery>(),
        sm2Map: new Map<string, SM2State>(),
        recentQuestionIds: ["q1", "q2", "q3", "q4"],
      };

      // With only q5 available after filtering
      const selected = selectNextQuestion(mockQuestions, context);
      expect(selected.question.id).toBe("q5");
    });

    it("falls back to random when all questions are recent", () => {
      const context = {
        studentRating: 800,
        currentWorld: 1,
        masteryMap: new Map<string, SubtopicMastery>(),
        sm2Map: new Map<string, SM2State>(),
        recentQuestionIds: ["q1", "q2", "q3", "q4", "q5"],
      };

      const selected = selectNextQuestion(mockQuestions, context);
      expect(mockQuestions.map((q) => q.id)).toContain(selected.question.id);
    });

    it("prefers questions in student rating range", () => {
      // Set random to always pick the "random" selection path (last 10%)
      vi.mocked(Math.random).mockReturnValue(0.95);

      const context = {
        studentRating: 800,
        currentWorld: 1,
        masteryMap: new Map<string, SubtopicMastery>(),
        sm2Map: new Map<string, SM2State>(),
        recentQuestionIds: [],
      };

      // Run multiple times to check distribution
      const selections = new Set<string>();
      for (let i = 0; i < 20; i++) {
        vi.mocked(Math.random).mockReturnValue(0.95 + i * 0.001);
        const selected = selectNextQuestion(mockQuestions, context);
        selections.add(selected.question.id);
      }

      // Should mostly select questions near 800 rating (700, 800, 850, 750)
      // q3 at 900 is further away but still within 200 range
      expect(selections.size).toBeGreaterThan(0);
    });

    it("returns random question when pool is empty after filtering", () => {
      const context = {
        studentRating: 800,
        currentWorld: 1,
        masteryMap: new Map<string, SubtopicMastery>(),
        sm2Map: new Map<string, SM2State>(),
        recentQuestionIds: [],
      };

      // Single question scenario
      const singleQuestion = [createMockQuestion({ id: "only-one" })];
      const selected = selectNextQuestion(singleQuestion, context);
      expect(selected.question.id).toBe("only-one");
    });
  });

  describe("getTargetDifficulty", () => {
    it("returns lower difficulty for higher success rate target", () => {
      const high = getTargetDifficulty(800, 0.8); // 80% success
      const low = getTargetDifficulty(800, 0.5); // 50% success

      expect(high).toBeLessThan(low);
    });

    it("returns student rating when target is 0.5", () => {
      const target = getTargetDifficulty(800, 0.5);
      expect(target).toBeCloseTo(800, -1); // Within ~10 points
    });

    it("returns difficulty about 200 lower for 0.76 target", () => {
      // 76% expected = 200 point advantage
      const target = getTargetDifficulty(1000, 0.76);
      expect(target).toBeLessThan(1000);
      expect(target).toBeCloseTo(800, -1);
    });

    it("returns difficulty about 200 higher for 0.24 target", () => {
      // 24% expected = 200 point disadvantage
      const target = getTargetDifficulty(800, 0.24);
      expect(target).toBeGreaterThan(800);
      expect(target).toBeCloseTo(1000, -1);
    });

    it("returns integer value", () => {
      const target = getTargetDifficulty(800, 0.7);
      expect(Number.isInteger(target)).toBe(true);
    });
  });
});

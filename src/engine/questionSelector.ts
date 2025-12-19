import type { Question, Topic } from "@/types/question";
import type { SubtopicMastery } from "./mastery";
import type { SM2State } from "./sm2";
import { isDueForReview } from "./sm2";

/**
 * Question selection weights
 */
const SELECTION_WEIGHTS = {
  dueForReview: 0.4,
  weakSubtopic: 0.3,
  currentWorld: 0.2,
  random: 0.1,
};

/**
 * World to topics mapping
 */
const WORLD_TOPICS: Record<number, Topic[]> = {
  1: ["number"], // Forest
  2: ["calculation"], // Garden
  3: ["geometry"], // Rainbow
  4: ["measure"], // Ocean
  5: ["data"], // Sky Castle
};

interface SelectionContext {
  studentRating: number;
  currentWorld: number;
  masteryMap: Map<string, SubtopicMastery>;
  sm2Map: Map<string, SM2State>;
  recentQuestionIds: string[];
}

/**
 * Select next question using weighted priority
 */
export function selectNextQuestion(
  questions: Question[],
  context: SelectionContext
): Question {
  const {
    studentRating,
    currentWorld,
    masteryMap,
    sm2Map,
    recentQuestionIds,
  } = context;

  // Filter out recently answered questions (last 5)
  const available = questions.filter(
    (q) => !recentQuestionIds.slice(-5).includes(q.id)
  );

  if (available.length === 0) {
    return questions[Math.floor(Math.random() * questions.length)];
  }

  // Roll weighted random
  const roll = Math.random();
  let cumulative = 0;

  // 1. Due for review (40%)
  cumulative += SELECTION_WEIGHTS.dueForReview;
  if (roll < cumulative) {
    const dueQuestions = getDueQuestions(available, sm2Map, studentRating);
    if (dueQuestions.length > 0) {
      return pickRandomFromArray(dueQuestions);
    }
  }

  // 2. Weak subtopic (30%)
  cumulative += SELECTION_WEIGHTS.weakSubtopic;
  if (roll < cumulative) {
    const weakQuestion = getWeakSubtopicQuestion(
      available,
      masteryMap,
      studentRating
    );
    if (weakQuestion) {
      return weakQuestion;
    }
  }

  // 3. Current world theme (20%)
  cumulative += SELECTION_WEIGHTS.currentWorld;
  if (roll < cumulative) {
    const worldTopics = WORLD_TOPICS[currentWorld] || ["number"];
    const themeQuestions = available.filter(
      (q) =>
        worldTopics.includes(q.topic) &&
        isInRatingRange(q.difficulty, studentRating)
    );
    if (themeQuestions.length > 0) {
      return pickRandomFromArray(themeQuestions);
    }
  }

  // 4. Random (10%) - fallback
  const inRangeQuestions = available.filter((q) =>
    isInRatingRange(q.difficulty, studentRating)
  );

  if (inRangeQuestions.length > 0) {
    return pickRandomFromArray(inRangeQuestions);
  }

  return pickRandomFromArray(available);
}

/**
 * Get questions that are due for review
 */
function getDueQuestions(
  questions: Question[],
  sm2Map: Map<string, SM2State>,
  studentRating: number
): Question[] {
  return questions.filter((q) => {
    const sm2State = sm2Map.get(q.subtopic);
    if (!sm2State) return false;
    return (
      isDueForReview(sm2State) && isInRatingRange(q.difficulty, studentRating)
    );
  });
}

/**
 * Get a question from the weakest subtopic
 */
function getWeakSubtopicQuestion(
  questions: Question[],
  masteryMap: Map<string, SubtopicMastery>,
  studentRating: number
): Question | null {
  // Find weakest subtopic
  const entries = Array.from(masteryMap.values());
  const learning = entries
    .filter((m) => m.status !== "mastered")
    .sort((a, b) => a.score - b.score);

  if (learning.length === 0) return null;

  const weakestSubtopic = learning[0].subtopic;

  // Find matching questions
  const matches = questions.filter(
    (q) =>
      q.subtopic === weakestSubtopic &&
      isInRatingRange(q.difficulty, studentRating)
  );

  if (matches.length === 0) return null;
  return pickRandomFromArray(matches);
}

/**
 * Check if question difficulty is within student's range
 */
function isInRatingRange(
  questionDifficulty: number,
  studentRating: number,
  range: number = 200
): boolean {
  return Math.abs(questionDifficulty - studentRating) <= range;
}

/**
 * Pick random item from array
 */
function pickRandomFromArray<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Get recommended difficulty for target success rate
 */
export function getTargetDifficulty(
  studentRating: number,
  targetSuccessRate: number = 0.7
): number {
  // Inverse of expected calculation
  // E = 1 / (1 + 10^((D - R) / 400))
  // Solving for D when E = targetSuccessRate
  const exponent = Math.log10(1 / targetSuccessRate - 1);
  return Math.round(studentRating + 400 * exponent);
}

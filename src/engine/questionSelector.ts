import type { Question, Topic } from "@/types/question";
import type { SubtopicMastery } from "./mastery";
import type { SM2State } from "./sm2";
import { isDueForReview } from "./sm2";
import type { DifficultyLevel, QuestionReason } from "@/game/EventBus";

/**
 * Get difficulty label based on question vs student rating delta
 */
export function getDifficultyLabel(
  questionDiff: number,
  studentRating: number
): DifficultyLevel {
  const delta = questionDiff - studentRating;
  if (delta < -100) return "warmup";
  if (delta < 50) return "practice";
  if (delta < 150) return "challenge";
  return "boss";
}

/**
 * Question selection result with reason
 */
export interface QuestionSelection {
  question: Question;
  reason: QuestionReason;
}

/**
 * Session mode affects question selection weights
 */
export type SessionMode = "adventure" | "practice" | "review" | "challenge";

/**
 * Question selection weights by mode
 */
const SELECTION_WEIGHTS_BY_MODE: Record<
  SessionMode,
  { dueForReview: number; weakSubtopic: number; currentWorld: number; random: number }
> = {
  adventure: { dueForReview: 0.4, weakSubtopic: 0.3, currentWorld: 0.2, random: 0.1 },
  practice: { dueForReview: 0.2, weakSubtopic: 0.7, currentWorld: 0.0, random: 0.1 },
  review: { dueForReview: 0.7, weakSubtopic: 0.2, currentWorld: 0.0, random: 0.1 },
  challenge: { dueForReview: 0.4, weakSubtopic: 0.3, currentWorld: 0.2, random: 0.1 },
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
  sessionMode?: SessionMode;
}

/**
 * Select next question using weighted priority
 * Returns both the question and the reason for selection
 */
export function selectNextQuestion(
  questions: Question[],
  context: SelectionContext
): QuestionSelection {
  const {
    studentRating,
    currentWorld,
    masteryMap,
    sm2Map,
    recentQuestionIds,
    sessionMode = "adventure",
  } = context;

  // Get weights based on session mode
  const weights = SELECTION_WEIGHTS_BY_MODE[sessionMode];

  // Challenge mode applies +100 difficulty offset
  const ratingForMatching = sessionMode === "challenge"
    ? studentRating + 100
    : studentRating;

  // Filter out recently answered questions (last 5)
  const available = questions.filter(
    (q) => !recentQuestionIds.slice(-5).includes(q.id)
  );

  if (available.length === 0) {
    return {
      question: questions[Math.floor(Math.random() * questions.length)],
      reason: "random",
    };
  }

  // Roll weighted random
  const roll = Math.random();
  let cumulative = 0;

  // 1. Due for review
  cumulative += weights.dueForReview;
  if (roll < cumulative) {
    const dueQuestions = getDueQuestions(available, sm2Map, ratingForMatching);
    if (dueQuestions.length > 0) {
      return {
        question: pickRandomFromArray(dueQuestions),
        reason: "review",
      };
    }
  }

  // 2. Weak subtopic
  cumulative += weights.weakSubtopic;
  if (roll < cumulative) {
    const weakQuestion = getWeakSubtopicQuestion(
      available,
      masteryMap,
      ratingForMatching
    );
    if (weakQuestion) {
      return {
        question: weakQuestion,
        reason: "weak",
      };
    }
  }

  // 3. Current world theme
  cumulative += weights.currentWorld;
  if (roll < cumulative) {
    const worldTopics = WORLD_TOPICS[currentWorld] || ["number"];
    const themeQuestions = available.filter(
      (q) =>
        worldTopics.includes(q.topic) &&
        isInRatingRange(q.difficulty, ratingForMatching)
    );
    if (themeQuestions.length > 0) {
      return {
        question: pickRandomFromArray(themeQuestions),
        reason: "world",
      };
    }
  }

  // 4. Random - fallback
  const inRangeQuestions = available.filter((q) =>
    isInRatingRange(q.difficulty, ratingForMatching)
  );

  if (inRangeQuestions.length > 0) {
    return {
      question: pickRandomFromArray(inRangeQuestions),
      reason: "random",
    };
  }

  return {
    question: pickRandomFromArray(available),
    reason: "random",
  };
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

/**
 * Select 3 questions for daily challenge with progressive difficulty
 * 1st: Easy (warmup) - below student rating
 * 2nd: At level - match student rating
 * 3rd: Challenge - above student rating
 */
export function selectDailyChallengeQuestions(
  questions: Question[],
  studentRating: number
): Question[] {
  const result: Question[] = [];
  const usedIds = new Set<string>();

  // Helper to select question by target difficulty
  const selectByDifficulty = (targetRating: number): Question | null => {
    const candidates = questions
      .filter((q) => !usedIds.has(q.id))
      .sort(
        (a, b) =>
          Math.abs(a.difficulty - targetRating) -
          Math.abs(b.difficulty - targetRating)
      );

    if (candidates.length === 0) return null;

    // Pick from top 3 closest matches for variety
    const topMatches = candidates.slice(0, Math.min(3, candidates.length));
    const selected = topMatches[Math.floor(Math.random() * topMatches.length)];
    usedIds.add(selected.id);
    return selected;
  };

  // 1. Easy warmup (rating - 100)
  const easy = selectByDifficulty(studentRating - 100);
  if (easy) result.push(easy);

  // 2. At level (exact rating)
  const atLevel = selectByDifficulty(studentRating);
  if (atLevel) result.push(atLevel);

  // 3. Challenge (rating + 50)
  const challenge = selectByDifficulty(studentRating + 50);
  if (challenge) result.push(challenge);

  // Fill remaining slots with random questions if needed
  while (result.length < 3 && questions.length > result.length) {
    const remaining = questions.filter((q) => !usedIds.has(q.id));
    if (remaining.length === 0) break;
    const random = remaining[Math.floor(Math.random() * remaining.length)];
    usedIds.add(random.id);
    result.push(random);
  }

  return result;
}

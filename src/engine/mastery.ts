import type { Topic } from "@/types/question";

/**
 * Mastery tracking with decaying average
 */

export interface SubtopicMastery {
  subtopic: string;
  topic: Topic;
  score: number; // 0.0 - 1.0
  status: "not_started" | "learning" | "mastered";
  attempts: number;
  correctCount: number;
  lastAttempt: Date | null;
}

/**
 * Update mastery score using decaying average
 * 65% weight on current answer, 35% on history
 */
export function updateMasteryScore(
  currentMastery: number,
  isCorrect: boolean
): number {
  const currentScore = isCorrect ? 1 : 0;
  return currentScore * 0.65 + currentMastery * 0.35;
}

/**
 * Determine mastery status based on score and attempts
 */
export function getMasteryStatus(
  score: number,
  attempts: number
): "not_started" | "learning" | "mastered" {
  if (attempts === 0) return "not_started";
  if (attempts < 5) return "learning";
  if (score >= 0.8) return "mastered";
  return "learning";
}

/**
 * Create initial mastery entry for a subtopic
 */
export function createMasteryEntry(
  subtopic: string,
  topic: Topic
): SubtopicMastery {
  return {
    subtopic,
    topic,
    score: 0,
    status: "not_started",
    attempts: 0,
    correctCount: 0,
    lastAttempt: null,
  };
}

/**
 * Update mastery entry after an answer
 */
export function updateMastery(
  mastery: SubtopicMastery,
  isCorrect: boolean
): SubtopicMastery {
  const newScore = updateMasteryScore(mastery.score, isCorrect);
  const newAttempts = mastery.attempts + 1;
  const newCorrectCount = mastery.correctCount + (isCorrect ? 1 : 0);

  return {
    ...mastery,
    score: newScore,
    attempts: newAttempts,
    correctCount: newCorrectCount,
    status: getMasteryStatus(newScore, newAttempts),
    lastAttempt: new Date(),
  };
}

/**
 * Get weakest subtopics (for question selection)
 */
export function getWeakestSubtopics(
  masteryMap: Map<string, SubtopicMastery>,
  limit: number = 3
): SubtopicMastery[] {
  const entries = Array.from(masteryMap.values());

  // Sort by score ascending (weakest first)
  // Prioritize learning > not_started > mastered
  return entries
    .sort((a, b) => {
      // First by status priority
      const statusPriority = { learning: 0, not_started: 1, mastered: 2 };
      const statusDiff = statusPriority[a.status] - statusPriority[b.status];
      if (statusDiff !== 0) return statusDiff;

      // Then by score (lower is weaker)
      return a.score - b.score;
    })
    .slice(0, limit);
}

/**
 * Calculate overall topic mastery (average of subtopics)
 */
export function getTopicMastery(
  masteryMap: Map<string, SubtopicMastery>,
  topic: Topic
): number {
  const topicEntries = Array.from(masteryMap.values()).filter(
    (m) => m.topic === topic
  );

  if (topicEntries.length === 0) return 0;

  const totalScore = topicEntries.reduce((sum, m) => sum + m.score, 0);
  return totalScore / topicEntries.length;
}

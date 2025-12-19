/**
 * Firebase Questions Service
 * Fetches questions from Firestore with caching and fallback to local JSON
 */

import {
  collection,
  getDocs,
  doc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { getFirebaseDb, isFirebaseConfigured } from "./firebase";
import type { Question } from "@/types/question";

// Local fallback data
import localQuestions from "@/data/all-questions.json";

// Cache for questions
let questionsCache: Question[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch all questions from Firebase or fallback to local
 */
export async function fetchQuestions(): Promise<Question[]> {
  // Return cached if valid
  if (questionsCache && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return questionsCache;
  }

  // Try Firebase first
  if (isFirebaseConfigured()) {
    try {
      const db = getFirebaseDb();
      if (db) {
        const questionsRef = collection(db, "questions");
        const snapshot = await getDocs(questionsRef);
        const questions: Question[] = [];

        snapshot.forEach((docSnap) => {
          questions.push(docSnap.data() as Question);
        });

        if (questions.length > 0) {
          questionsCache = questions;
          cacheTimestamp = Date.now();
          console.log(`[Firebase] Loaded ${questions.length} questions from Firestore`);
          return questions;
        }
      }
    } catch (error) {
      console.warn("[Firebase] Failed to fetch questions, using local fallback:", error);
    }
  }

  // Fallback to local JSON
  console.log(`[Local] Using ${localQuestions.length} questions from local file`);
  questionsCache = localQuestions as Question[];
  cacheTimestamp = Date.now();
  return questionsCache;
}

/**
 * Fetch questions filtered by topic
 */
export async function fetchQuestionsByTopic(topic: string): Promise<Question[]> {
  const allQuestions = await fetchQuestions();
  return allQuestions.filter((q) => q.topic === topic);
}

/**
 * Fetch questions filtered by subtopic
 */
export async function fetchQuestionsBySubtopic(subtopic: string): Promise<Question[]> {
  const allQuestions = await fetchQuestions();
  return allQuestions.filter((q) => q.subtopic === subtopic);
}

/**
 * Fetch questions by difficulty range
 */
export async function fetchQuestionsByDifficulty(
  minDifficulty: number,
  maxDifficulty: number
): Promise<Question[]> {
  const allQuestions = await fetchQuestions();
  return allQuestions.filter(
    (q) => q.difficulty >= minDifficulty && q.difficulty <= maxDifficulty
  );
}

/**
 * Get a random question matching criteria
 */
export async function getRandomQuestion(
  topic?: string,
  minDifficulty?: number,
  maxDifficulty?: number
): Promise<Question | null> {
  let questions = await fetchQuestions();

  if (topic) {
    questions = questions.filter((q) => q.topic === topic);
  }
  if (minDifficulty !== undefined) {
    questions = questions.filter((q) => q.difficulty >= minDifficulty);
  }
  if (maxDifficulty !== undefined) {
    questions = questions.filter((q) => q.difficulty <= maxDifficulty);
  }

  if (questions.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * questions.length);
  return questions[randomIndex];
}

/**
 * Update question statistics after a response
 */
export async function updateQuestionStats(
  questionId: string,
  _correct: boolean
): Promise<void> {
  if (!isFirebaseConfigured()) return;

  try {
    const db = getFirebaseDb();
    if (!db) return;

    const questionRef = doc(db, "questions", questionId);
    await updateDoc(questionRef, {
      timesAnswered: increment(1),
      // Note: correctRate needs to be recalculated on the server side
      // For now, we just track timesAnswered
    });
  } catch (error) {
    console.warn("[Firebase] Failed to update question stats:", error);
  }
}

/**
 * Get question statistics summary
 */
export function getQuestionStats(questions: Question[]): {
  byTopic: Record<string, number>;
  byDifficulty: Record<string, number>;
  total: number;
} {
  const byTopic: Record<string, number> = {};
  const byDifficulty: Record<string, number> = {
    easy: 0,
    medium: 0,
    hard: 0,
    expert: 0,
  };

  for (const q of questions) {
    // Count by topic
    byTopic[q.topic] = (byTopic[q.topic] || 0) + 1;

    // Count by difficulty band
    if (q.difficulty < 750) {
      byDifficulty.easy++;
    } else if (q.difficulty < 850) {
      byDifficulty.medium++;
    } else if (q.difficulty < 950) {
      byDifficulty.hard++;
    } else {
      byDifficulty.expert++;
    }
  }

  return {
    byTopic,
    byDifficulty,
    total: questions.length,
  };
}

/**
 * Clear the questions cache (useful for forcing a refresh)
 */
export function clearQuestionsCache(): void {
  questionsCache = null;
  cacheTimestamp = 0;
}

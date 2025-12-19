import { useState, useCallback, useMemo } from "react";
import type { Question } from "@/types/question";
import questionsData from "@/data/questions.json";

/**
 * Hook for managing question bank
 */
export function useQuestionBank() {
  const [answeredIds, setAnsweredIds] = useState<Set<string>>(new Set());

  const questions = useMemo(() => questionsData as Question[], []);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const getNextQuestion = useCallback(
    (studentRating: number = 1000): Question | null => {
      // Filter out recently answered (last 5)
      const available = questions.filter((q) => !answeredIds.has(q.id));

      if (available.length === 0) {
        // Reset if all answered
        setAnsweredIds(new Set());
        return questions[Math.floor(Math.random() * questions.length)];
      }

      // Prefer questions within ±200 of student rating
      const inRange = available.filter(
        (q) => Math.abs(q.difficulty - studentRating) <= 200
      );

      const pool = inRange.length > 0 ? inRange : available;
      const shuffled = shuffleArray(pool);
      return shuffled[0];
    },
    [questions, answeredIds]
  );

  const markAnswered = useCallback((questionId: string) => {
    setAnsweredIds((prev) => {
      const next = new Set(prev);
      next.add(questionId);
      // Keep only last 10 to allow cycling
      if (next.size > 10) {
        const arr = Array.from(next);
        return new Set(arr.slice(-10));
      }
      return next;
    });
  }, []);

  const getQuestionsByTopic = useCallback(
    (topic: string): Question[] => {
      return questions.filter((q) => q.topic === topic);
    },
    [questions]
  );

  return {
    questions,
    getNextQuestion,
    markAnswered,
    getQuestionsByTopic,
    totalQuestions: questions.length,
  };
}

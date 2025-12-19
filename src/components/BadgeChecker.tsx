"use client";

import { useEffect, useRef } from "react";
import { useBadgeStore } from "@/stores/badgeStore";
import { useLearningStore } from "@/stores/learningStore";
import { useDailyChallengeStore } from "@/stores/dailyChallengeStore";
import { EventBus, GameEvents } from "@/game/EventBus";
import type { BadgeCheckContext } from "@/types/badge";

/**
 * BadgeChecker - Listens to game events and checks for badge unlocks
 * Mounts once and subscribes to EventBus events
 */
export function BadgeChecker() {
  const { checkBadges } = useBadgeStore();
  const lastAnswerTimeRef = useRef<number>(0);

  useEffect(() => {
    // Handler for any answer (correct or wrong)
    const handleAnswer = (...args: unknown[]) => {
      const data = args[0] as { isCorrect: boolean; responseTimeMs?: number };
      // Only track time for correct answers (for speed badge)
      lastAnswerTimeRef.current = data.isCorrect
        ? data?.responseTimeMs ?? 0
        : 0;
      checkBadgesNow();
    };

    // Handler for game over
    const handleGameOver = () => {
      checkBadgesNow();
    };

    // Build context and check badges
    const checkBadgesNow = () => {
      const learningState = useLearningStore.getState();
      const dailyState = useDailyChallengeStore.getState();

      const masteredCount = learningState.masteryEntries.filter(
        (m) => m.status === "mastered"
      ).length;

      const context: BadgeCheckContext = {
        totalCorrect: learningState.sessionCorrect,
        totalAnswered: learningState.totalResponses,
        maxStreak: learningState.bestStreak,
        currentStreak: learningState.streakCount,
        masteredTopics: masteredCount,
        dailyStreak: dailyState.currentStreak,
        currentHour: new Date().getHours(),
        lastAnswerTimeMs: lastAnswerTimeRef.current,
      };

      checkBadges(context);
    };

    // Subscribe to events
    EventBus.on(GameEvents.ANSWER, handleAnswer);
    EventBus.on(GameEvents.GAME_OVER, handleGameOver);

    // Check on mount (in case returning to menu with new achievements)
    checkBadgesNow();

    return () => {
      EventBus.off(GameEvents.ANSWER, handleAnswer);
      EventBus.off(GameEvents.GAME_OVER, handleGameOver);
    };
  }, [checkBadges]);

  // This component doesn't render anything visible
  return null;
}

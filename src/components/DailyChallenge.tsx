"use client";

import { useState, useMemo, useCallback } from "react";
import { useDailyChallengeStore } from "@/stores/dailyChallengeStore";
import { useLearningStore } from "@/stores/learningStore";
import { useGameStore } from "@/stores/gameStore";
import { selectDailyChallengeQuestions } from "@/engine/questionSelector";
import { StreakCalendar } from "./StreakCalendar";
import { synthSounds } from "@/game/audio/SynthSounds";
import questionsData from "@/data/all-questions.json";
import type { Question } from "@/types/question";
import type { DailyChallengeResult } from "@/types/dailyChallenge";

interface DailyChallengeProps {
  onClose: () => void;
}

type ChallengePhase = "intro" | "question" | "result";

/**
 * Daily Challenge - 3 quick questions with progressive difficulty
 */
export function DailyChallenge({ onClose }: DailyChallengeProps) {
  const [phase, setPhase] = useState<ChallengePhase>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [result, setResult] = useState<DailyChallengeResult | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const { currentStreak, completeChallenge, isAvailable } =
    useDailyChallengeStore();
  const { studentRating } = useLearningStore();
  const { addCoins } = useGameStore();

  // Select questions on mount using useMemo (pure computation, no side effects)
  const questions = useMemo(() => {
    const allQuestions = questionsData as Question[];
    return selectDailyChallengeQuestions(allQuestions, studentRating);
  }, [studentRating]);

  const currentQuestion = questions[currentIndex];

  // Handle answer selection
  const handleAnswer = useCallback(
    (answerIndex: number) => {
      if (!currentQuestion || selectedAnswer !== null) return;

      setSelectedAnswer(answerIndex);
      const isCorrect = answerIndex === currentQuestion.correctIndex;

      // Play sound
      if (isCorrect) {
        synthSounds.playCorrect();
      } else {
        synthSounds.playWrong();
      }

      // Record answer
      const newAnswers = [...answers, isCorrect];
      setAnswers(newAnswers);

      // Move to next question or show results after delay
      setTimeout(() => {
        setSelectedAnswer(null);
        if (currentIndex < questions.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          // Challenge complete
          const correct = newAnswers.filter(Boolean).length;
          const challengeResult = completeChallenge(correct, questions.length);
          setResult(challengeResult);
          addCoins(challengeResult.coinsEarned);
          setPhase("result");
        }
      }, 1000);
    },
    [
      currentQuestion,
      selectedAnswer,
      answers,
      currentIndex,
      questions.length,
      completeChallenge,
      addCoins,
    ]
  );

  // Start challenge
  const handleStart = () => {
    setPhase("question");
  };

  // Intro screen
  if (phase === "intro") {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-cream rounded-3xl border-4 border-text max-w-md w-full overflow-hidden animate-bounce-in">
          {/* Header */}
          <div className="bg-yellow p-6 border-b-4 border-text text-center">
            <div className="text-5xl mb-2">🌟</div>
            <h2 className="text-3xl font-[family-name:var(--font-fredoka)] text-text">
              Daily Challenge
            </h2>
          </div>

          {/* Content */}
          <div className="p-6 text-center">
            <p className="text-text/80 font-[family-name:var(--font-nunito)] mb-4">
              Answer 3 quick questions to earn coins and keep your streak
              going!
            </p>

            {/* Current streak */}
            <div className="bg-pink/30 rounded-2xl p-4 mb-6">
              <div className="text-4xl mb-1">🔥</div>
              <div className="text-2xl font-[family-name:var(--font-baloo)] text-text">
                {currentStreak} Day Streak
              </div>
            </div>

            {/* Rewards info */}
            <div className="flex justify-center gap-4 mb-6 text-sm text-text/70">
              <div>🥇 3/3 = 50 coins</div>
              <div>🥈 2/3 = 30 coins</div>
              <div>🥉 1/3 = 10 coins</div>
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              {isAvailable() ? (
                <button
                  onClick={handleStart}
                  className="w-full py-4 bg-sage rounded-xl border-4 border-text font-[family-name:var(--font-baloo)] text-2xl text-text hover:scale-105 transition-transform"
                >
                  Start Challenge! 🚀
                </button>
              ) : (
                <div className="py-4 bg-gray-200 rounded-xl border-4 border-text/30 text-text/50 font-[family-name:var(--font-baloo)] text-xl">
                  ✅ Completed Today!
                </div>
              )}

              <button
                onClick={onClose}
                className="w-full py-3 bg-white rounded-xl border-2 border-text font-[family-name:var(--font-nunito)] text-lg text-text hover:bg-gray-100 transition-colors"
              >
                Maybe Later
              </button>
            </div>

            {/* Calendar */}
            <div className="mt-6">
              <StreakCalendar />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Question screen
  if (phase === "question" && currentQuestion) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-cream rounded-3xl border-4 border-text max-w-lg w-full overflow-hidden">
          {/* Progress header */}
          <div className="bg-sky p-4 border-b-4 border-text flex items-center justify-between">
            <div className="flex gap-2">
              {questions.map((_, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-full border-2 border-text flex items-center justify-center text-sm font-bold ${
                    i < currentIndex
                      ? answers[i]
                        ? "bg-sage"
                        : "bg-pink"
                      : i === currentIndex
                        ? "bg-yellow"
                        : "bg-white"
                  }`}
                >
                  {i < currentIndex ? (answers[i] ? "✓" : "✗") : i + 1}
                </div>
              ))}
            </div>
            <div className="text-lg font-[family-name:var(--font-fredoka)] text-text">
              {currentIndex + 1}/{questions.length}
            </div>
          </div>

          {/* Question */}
          <div className="p-6">
            <p className="text-xl font-[family-name:var(--font-nunito)] text-text text-center mb-6 min-h-[60px]">
              {currentQuestion.text}
            </p>

            {/* Answer options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, i) => {
                const isSelected = selectedAnswer === i;
                const isCorrect = i === currentQuestion.correctIndex;
                const showFeedback = selectedAnswer !== null;

                let bgClass = "bg-white hover:bg-gray-50";
                if (showFeedback) {
                  if (isCorrect) {
                    bgClass = "bg-sage";
                  } else if (isSelected && !isCorrect) {
                    bgClass = "bg-pink";
                  }
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    disabled={selectedAnswer !== null}
                    className={`w-full py-4 px-6 rounded-xl border-3 border-text font-[family-name:var(--font-nunito)] text-lg text-text transition-all ${bgClass} ${
                      selectedAnswer === null
                        ? "hover:scale-[1.02]"
                        : "cursor-default"
                    }`}
                  >
                    <span className="font-bold mr-2">{i + 1}.</span>
                    {option}
                    {showFeedback && isCorrect && (
                      <span className="ml-2">✓</span>
                    )}
                    {showFeedback && isSelected && !isCorrect && (
                      <span className="ml-2">✗</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Result screen
  if (phase === "result" && result) {
    const correctCount = answers.filter(Boolean).length;
    const emoji =
      correctCount === 3 ? "🎉" : correctCount >= 2 ? "👏" : correctCount >= 1 ? "👍" : "💪";

    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-cream rounded-3xl border-4 border-text max-w-md w-full overflow-hidden animate-bounce-in">
          {/* Header */}
          <div
            className={`p-6 border-b-4 border-text text-center ${
              correctCount === 3 ? "bg-yellow" : correctCount >= 2 ? "bg-sage" : "bg-sky"
            }`}
          >
            <div className="text-6xl mb-2">{emoji}</div>
            <h2 className="text-3xl font-[family-name:var(--font-fredoka)] text-text">
              {correctCount === 3
                ? "Perfect!"
                : correctCount >= 2
                  ? "Great Job!"
                  : correctCount >= 1
                    ? "Nice Try!"
                    : "Keep Practicing!"}
            </h2>
          </div>

          {/* Results */}
          <div className="p-6 text-center">
            {/* Score */}
            <div className="text-5xl font-[family-name:var(--font-baloo)] text-text mb-4">
              {correctCount}/{questions.length}
            </div>

            {/* Coins earned */}
            {result.coinsEarned > 0 && (
              <div className="bg-yellow/30 rounded-2xl p-4 mb-4 inline-block">
                <span className="text-2xl font-[family-name:var(--font-baloo)] text-text">
                  +{result.coinsEarned} 🪙
                </span>
              </div>
            )}

            {/* Streak */}
            <div className="bg-pink/30 rounded-2xl p-4 mb-6">
              <div className="text-3xl mb-1">🔥</div>
              <div className="text-xl font-[family-name:var(--font-baloo)] text-text">
                {result.newStreak} Day Streak!
              </div>
            </div>

            {/* Answer summary */}
            <div className="flex justify-center gap-3 mb-6">
              {answers.map((correct, i) => (
                <div
                  key={i}
                  className={`w-12 h-12 rounded-full border-3 border-text flex items-center justify-center text-xl ${
                    correct ? "bg-sage" : "bg-pink"
                  }`}
                >
                  {correct ? "✓" : "✗"}
                </div>
              ))}
            </div>

            {/* Done button */}
            <button
              onClick={onClose}
              className="w-full py-4 bg-sage rounded-xl border-4 border-text font-[family-name:var(--font-baloo)] text-2xl text-text hover:scale-105 transition-transform"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

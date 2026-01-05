"use client";

import { useState, useEffect } from "react";
import { useLearningStore } from "@/stores/learningStore";
import { useDailyChallengeStore } from "@/stores/dailyChallengeStore";
import { useGameStore } from "@/stores/gameStore";
import { DailyChallenge } from "./DailyChallenge";
import { StatsModal } from "./StatsModal";
import { EventBus, GameEvents } from "@/game/EventBus";

export function MenuOverlay() {
  const { getDueReviewCount, totalResponses, onboardingComplete } = useLearningStore();
  const { isAvailable, currentStreak } = useDailyChallengeStore();
  const { bestScore } = useGameStore();
  const [isOnMenu, setIsOnMenu] = useState(true);
  const [showDailyChallenge, setShowDailyChallenge] = useState(false);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    const handleSceneChange = (...args: unknown[]) => {
      const data = args[0] as { scene: string };
      setIsOnMenu(data.scene === "Menu");
    };

    const handleGameStart = () => {
      setIsOnMenu(false);
    };

    const handleGoToMenu = () => {
      setIsOnMenu(true);
    };

    EventBus.on(GameEvents.SCENE_CHANGE, handleSceneChange);
    EventBus.on(GameEvents.GAME_START, handleGameStart);
    EventBus.on(GameEvents.GO_TO_MENU, handleGoToMenu);

    return () => {
      EventBus.off(GameEvents.SCENE_CHANGE, handleSceneChange);
      EventBus.off(GameEvents.GAME_START, handleGameStart);
      EventBus.off(GameEvents.GO_TO_MENU, handleGoToMenu);
    };
  }, []);

  if (!isOnMenu) return null;

  const dueCount = getDueReviewCount();
  const challengeAvailable = isAvailable();

  const handleStartGame = () => {
    EventBus.emit(GameEvents.START_GAME);
  };

  return (
    <>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
        {/* Play Button */}
        <button
          onClick={handleStartGame}
          className="px-12 py-6 rounded-full border-[6px] border-text font-[family-name:var(--font-baloo)] text-4xl text-text shadow-xl transition-all hover:scale-110 active:scale-95 bg-pink mb-4 group relative overflow-hidden animate-bounce-in"
        >
          <span className="relative z-10">PLAY</span>
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
        </button>

        {/* Best Score */}
        {bestScore > 0 && (
          <div className="bg-yellow/90 px-6 py-2 rounded-full border-4 border-amber-500 shadow-lg">
            <span className="font-[family-name:var(--font-fredoka)] text-text text-lg">
              🏆 Best: {bestScore}
            </span>
          </div>
        )}

        {/* Daily Challenge button */}
        <button
          onClick={() => setShowDailyChallenge(true)}
          className={`px-6 py-3 rounded-full border-4 border-text font-[family-name:var(--font-baloo)] text-lg text-text shadow-lg transition-transform hover:scale-105 ${
            challengeAvailable
              ? "bg-yellow animate-pulse"
              : "bg-gray-200"
          }`}
        >
          🌟 Daily Challenge
          {currentStreak > 0 && (
            <span className="ml-2 text-sm">🔥 {currentStreak}</span>
          )}
        </button>

        {/* Stats button */}
        <button
          onClick={() => setShowStats(true)}
          className="px-6 py-3 rounded-full border-4 border-text font-[family-name:var(--font-baloo)] text-lg text-text shadow-lg transition-transform hover:scale-105 bg-sky"
        >
          📊 Stats
        </button>

        {/* Due reviews badge */}
        {dueCount > 0 && (
          <div className="bg-purple-500/90 px-4 py-2 rounded-full border-2 border-purple-600 shadow-lg animate-bounce-in">
            <span className="font-[family-name:var(--font-nunito)] text-white text-sm">
              📅 {dueCount} topic{dueCount > 1 ? "s" : ""} due for review
            </span>
          </div>
        )}

        {/* All caught up */}
        {dueCount === 0 && totalResponses > 0 && (
          <div className="bg-green-500/90 px-4 py-2 rounded-full border-2 border-green-600 shadow-lg animate-bounce-in">
            <span className="font-[family-name:var(--font-nunito)] text-white text-sm">
              ✨ All caught up!
            </span>
          </div>
        )}

        {/* Onboarding message for new users */}
        {!onboardingComplete && totalResponses < 10 && (
          <div className="bg-sky/90 px-4 py-2 rounded-xl border-2 border-sky shadow-lg mt-2">
            <span className="font-[family-name:var(--font-nunito)] text-text text-sm">
              {totalResponses === 0
                ? "🎯 Let's find your level!"
                : `🎯 Calibrating... ${totalResponses}/10`}
            </span>
          </div>
        )}
      </div>

      {/* Daily Challenge modal */}
      {showDailyChallenge && (
        <DailyChallenge onClose={() => setShowDailyChallenge(false)} />
      )}

      {/* Stats modal */}
      {showStats && <StatsModal onClose={() => setShowStats(false)} />}
    </>
  );
}

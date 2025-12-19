"use client";

import { useState, useEffect } from "react";
import { useLearningStore } from "@/stores/learningStore";
import { EventBus, GameEvents } from "@/game/EventBus";

export function MenuOverlay() {
  const { getDueReviewCount, totalResponses, onboardingComplete } = useLearningStore();
  const [isOnMenu, setIsOnMenu] = useState(true);

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

  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
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
  );
}

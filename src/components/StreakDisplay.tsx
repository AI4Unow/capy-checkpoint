"use client";

import { useState, useEffect } from "react";
import { EventBus, GameEvents } from "@/game/EventBus";
import { useLearningStore } from "@/stores/learningStore";

export function StreakDisplay() {
  const { streakCount } = useLearningStore();
  const [milestone, setMilestone] = useState<{ count: number; bonus: number } | null>(null);
  const [isPulsing, setIsPulsing] = useState(false);

  useEffect(() => {
    const handleMilestone = (...args: unknown[]) => {
      const data = args[0] as { count: number; bonus: number };
      setMilestone(data);
      setIsPulsing(true);

      // Reset animation after 2s
      setTimeout(() => {
        setIsPulsing(false);
        setMilestone(null);
      }, 2000);
    };

    EventBus.on(GameEvents.STREAK_MILESTONE, handleMilestone);
    return () => {
      EventBus.off(GameEvents.STREAK_MILESTONE, handleMilestone);
    };
  }, []);

  // Don't show until streak >= 3
  if (streakCount < 3) return null;

  // Determine fire intensity
  const getFireEmoji = () => {
    if (streakCount >= 10) return "🔥🔥🔥";
    if (streakCount >= 5) return "🔥🔥";
    return "🔥";
  };

  return (
    <div
      className={`absolute top-4 left-4 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/90 border-2 border-orange-600 shadow-lg ${isPulsing ? "animate-streak-pulse" : ""}`}
    >
      <span className="text-lg">{getFireEmoji()}</span>
      <span className="font-[family-name:var(--font-baloo)] text-white text-lg">
        {streakCount}
      </span>
      {milestone && (
        <span className="font-[family-name:var(--font-nunito)] text-yellow-300 text-sm animate-bounce-in">
          +{milestone.bonus}🪙
        </span>
      )}
    </div>
  );
}

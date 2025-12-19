"use client";

import { useState, useEffect } from "react";
import { EventBus, GameEvents, type DifficultyLevel } from "@/game/EventBus";

const DIFFICULTY_CONFIG: Record<
  DifficultyLevel,
  { label: string; color: string; emoji: string }
> = {
  warmup: { label: "Warm-up", color: "bg-green-400", emoji: "🌱" },
  practice: { label: "Practice", color: "bg-yellow-400", emoji: "🌿" },
  challenge: { label: "Challenge", color: "bg-orange-400", emoji: "🔥" },
  boss: { label: "Boss Level", color: "bg-purple-500", emoji: "⚡" },
};

export function DifficultyIndicator() {
  const [difficulty, setDifficulty] = useState<DifficultyLevel | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleDifficultyChange = (...args: unknown[]) => {
      const data = args[0] as { level: DifficultyLevel };
      setDifficulty(data.level);
      setIsVisible(true);
    };

    const handleGameOver = () => {
      setIsVisible(false);
    };

    const handleSceneChange = (...args: unknown[]) => {
      const data = args[0] as { scene: string };
      if (data.scene === "Menu") {
        setIsVisible(false);
      }
    };

    EventBus.on(GameEvents.DIFFICULTY_CHANGE, handleDifficultyChange);
    EventBus.on(GameEvents.GAME_OVER, handleGameOver);
    EventBus.on(GameEvents.SCENE_CHANGE, handleSceneChange);

    return () => {
      EventBus.off(GameEvents.DIFFICULTY_CHANGE, handleDifficultyChange);
      EventBus.off(GameEvents.GAME_OVER, handleGameOver);
      EventBus.off(GameEvents.SCENE_CHANGE, handleSceneChange);
    };
  }, []);

  if (!isVisible || !difficulty) return null;

  const config = DIFFICULTY_CONFIG[difficulty];

  return (
    <div
      className={`absolute top-4 right-4 z-30 px-3 py-1.5 rounded-full border-2 border-text/30 ${config.color} shadow-lg transition-all duration-300 animate-bounce-in`}
    >
      <span className="font-[family-name:var(--font-fredoka)] text-white text-sm drop-shadow-sm">
        {config.emoji} {config.label}
      </span>
    </div>
  );
}

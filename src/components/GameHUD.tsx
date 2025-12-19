"use client";

import { useGameStore } from "@/stores/gameStore";
import { useLearningStore } from "@/stores/learningStore";

/**
 * Game HUD - displays lives, score, coins, and rating level
 */
export function GameHUD() {
  const { score, lives, coins, isPlaying } = useGameStore();
  const { streakCount, getRatingInfo } = useLearningStore();
  const ratingInfo = getRatingInfo();

  if (!isPlaying) return null;

  return (
    <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10 pointer-events-none">
      {/* Lives */}
      <div className="flex gap-2">
        {[...Array(3)].map((_, i) => (
          <svg
            key={i}
            className={`w-10 h-10 drop-shadow-md transition-opacity ${
              i < lives ? "opacity-100" : "opacity-30"
            }`}
            viewBox="0 0 32 32"
            fill={i < lives ? "#FF4D6D" : "#999"}
          >
            <path d="M16 28.5L14.1 26.6C7.2 20.4 2 15.7 2 9.9 2 5.1 5.7 1.4 10.5 1.4c2.7 0 5.3 1.3 7 3.2 1.7-1.9 4.3-3.2 7-3.2 4.8 0 8.5 3.7 8.5 8.5 0 5.8-5.2 10.5-12.1 16.7L16 28.5z" />
          </svg>
        ))}
      </div>

      {/* Rating Level */}
      <div className="bg-white/80 px-4 py-2 rounded-full border-4 border-sage flex items-center gap-2 font-[family-name:var(--font-fredoka)] text-xl text-text">
        <span className="text-2xl">{ratingInfo.emoji}</span>
        <div className="flex flex-col items-start leading-tight">
          <span className="text-sm">{ratingInfo.name}</span>
          <div className="w-16 h-2 bg-sage/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-sage transition-all duration-300"
              style={{ width: `${ratingInfo.progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Score & Streak */}
      <div className="bg-white/80 px-4 py-2 rounded-full border-4 border-sky font-[family-name:var(--font-baloo)] text-2xl text-text flex items-center gap-2">
        <span>Score: {score}</span>
        {streakCount >= 3 && (
          <span className="text-lg text-pink">
            {streakCount >= 5 ? "🔥" : "⚡"} {streakCount}
          </span>
        )}
      </div>

      {/* Coins */}
      <div className="bg-white/80 px-4 py-2 rounded-full border-4 border-yellow flex items-center gap-2 font-[family-name:var(--font-fredoka)] text-2xl text-text">
        <div className="w-7 h-7 bg-yellow rounded-full border-2 border-amber-500" />
        <span>{coins}</span>
      </div>
    </div>
  );
}

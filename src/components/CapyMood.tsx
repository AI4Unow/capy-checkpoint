"use client";

import {
  useMoodStore,
  FEED_COST,
  type MoodLevel,
} from "@/stores/moodStore";
import { useGameStore } from "@/stores/gameStore";
import { EventBus, GameEvents } from "@/game/EventBus";

const MOOD_EMOJIS: Record<MoodLevel, string> = {
  ecstatic: "😍",
  happy: "😊",
  neutral: "😐",
  sad: "😢",
  depressed: "😭",
};

const MOOD_COLORS: Record<MoodLevel, string> = {
  ecstatic: "from-pink to-yellow",
  happy: "from-sage to-sky",
  neutral: "from-gray-300 to-gray-400",
  sad: "from-blue-300 to-blue-400",
  depressed: "from-gray-400 to-gray-500",
};

/**
 * CapyMood - Shows capy happiness level and feed/pet buttons
 * Displayed on menu screen
 */
export function CapyMood() {
  const { happiness, getMoodLevel, canPet, feedCapy, petCapy, consecutiveDays } =
    useMoodStore();
  const { coins, addCoins } = useGameStore();

  const moodLevel = getMoodLevel();
  const canAffordFeed = coins >= FEED_COST;
  const petAvailable = canPet();

  const handleFeed = () => {
    if (!canAffordFeed) return;
    addCoins(-FEED_COST);
    feedCapy();
    EventBus.emit(GameEvents.CAPY_REACT, { type: "love" });
  };

  const handlePet = () => {
    if (!petAvailable) return;
    petCapy();
    EventBus.emit(GameEvents.CAPY_REACT, { type: "love" });
  };

  return (
    <div className="absolute top-24 left-4 z-20 bg-cream/95 rounded-2xl border-4 border-text p-3 w-52 shadow-lg">
      {/* Header with streak */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-[family-name:var(--font-fredoka)] text-text/70">
          Capy Mood
        </span>
        {consecutiveDays > 0 && (
          <span className="text-xs bg-yellow px-2 py-0.5 rounded-full border-2 border-text font-[family-name:var(--font-nunito)]">
            🔥 {consecutiveDays}d streak
          </span>
        )}
      </div>

      {/* Mood indicator */}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-4xl">{MOOD_EMOJIS[moodLevel]}</span>
        <div className="flex-1">
          <div className="text-sm font-[family-name:var(--font-baloo)] text-text capitalize mb-1">
            {moodLevel}
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden border-2 border-text">
            <div
              className={`h-full bg-gradient-to-r ${MOOD_COLORS[moodLevel]} transition-all duration-500`}
              style={{ width: `${happiness}%` }}
            />
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleFeed}
          disabled={!canAffordFeed}
          className={`flex-1 py-2 rounded-xl border-2 border-text text-sm font-[family-name:var(--font-baloo)] transition-all ${
            canAffordFeed
              ? "bg-yellow hover:scale-105 text-text"
              : "bg-gray-200 opacity-50 cursor-not-allowed text-gray-500"
          }`}
        >
          🍎 Feed ({FEED_COST}🪙)
        </button>
        <button
          onClick={handlePet}
          disabled={!petAvailable}
          className={`flex-1 py-2 rounded-xl border-2 border-text text-sm font-[family-name:var(--font-baloo)] transition-all ${
            petAvailable
              ? "bg-pink hover:scale-105 text-text"
              : "bg-gray-200 opacity-50 cursor-not-allowed text-gray-500"
          }`}
        >
          {petAvailable ? "🤗 Pet" : "⏳ Pet"}
        </button>
      </div>
    </div>
  );
}

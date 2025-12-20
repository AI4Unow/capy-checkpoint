"use client";

import { useGameStore } from "@/stores/gameStore";
import { EventBus, GameEvents } from "@/game/EventBus";

/**
 * Touch controls for iPad/mobile - answer selection buttons
 * Positioned at bottom-left, shows only during gameplay
 */
export function TouchControls() {
  const { isPlaying } = useGameStore();

  if (!isPlaying) return null;

  const handleSelectAnswer = (pathIndex: number) => {
    EventBus.emit(GameEvents.SELECT_ANSWER, { pathIndex });
  };

  const buttonColors = [
    "bg-pink", // Path 1 - top
    "bg-sage", // Path 2 - middle
    "bg-sky",  // Path 3 - bottom
  ];

  return (
    <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-2">
      {[1, 2, 3].map((num, index) => (
        <button
          key={num}
          onClick={() => handleSelectAnswer(index)}
          className={`w-14 h-14 ${buttonColors[index]} rounded-xl border-4 border-text font-[family-name:var(--font-baloo)] text-2xl text-text shadow-lg active:scale-95 transition-transform flex items-center justify-center`}
          aria-label={`Select answer ${num}`}
        >
          {num}
        </button>
      ))}
    </div>
  );
}

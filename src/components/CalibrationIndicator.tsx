"use client";

import { useLearningStore } from "@/stores/learningStore";
import { useGameStore } from "@/stores/gameStore";

export function CalibrationIndicator() {
  const { totalResponses, onboardingComplete } = useLearningStore();
  const { isPlaying } = useGameStore();

  // Only show during gameplay and before onboarding is complete
  if (!isPlaying || onboardingComplete || totalResponses >= 10) return null;

  const progress = Math.min(totalResponses, 10);

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-sky/90 px-4 py-2 rounded-full border-2 border-sky shadow-lg">
      <div className="flex items-center gap-3">
        <span className="font-[family-name:var(--font-nunito)] text-text text-sm">
          🎯 Calibrating...
        </span>
        <div className="flex items-center gap-1">
          <div className="w-20 h-2 bg-white/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-text/70 transition-all duration-300"
              style={{ width: `${progress * 10}%` }}
            />
          </div>
          <span className="font-[family-name:var(--font-baloo)] text-text text-sm">
            {progress}/10
          </span>
        </div>
      </div>
    </div>
  );
}

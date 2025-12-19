"use client";

import { useLearningStore } from "@/stores/learningStore";
import type { SessionMode } from "@/engine/questionSelector";

interface ModeSelectorProps {
  onClose: () => void;
  onStart: () => void;
}

const MODES: {
  id: SessionMode;
  name: string;
  emoji: string;
  description: string;
  color: string;
}[] = [
  {
    id: "adventure",
    name: "Adventure",
    emoji: "🎮",
    description: "Balanced learning",
    color: "bg-sage",
  },
  {
    id: "practice",
    name: "Practice",
    emoji: "💪",
    description: "Focus on weak areas",
    color: "bg-orange-400",
  },
  {
    id: "review",
    name: "Review",
    emoji: "📅",
    description: "Due items first",
    color: "bg-purple-400",
  },
  {
    id: "challenge",
    name: "Challenge",
    emoji: "⚡",
    description: "Harder questions",
    color: "bg-red",
  },
];

export function ModeSelector({ onClose, onStart }: ModeSelectorProps) {
  const { sessionMode, setSessionMode, getDueReviewCount } = useLearningStore();
  const dueCount = getDueReviewCount();

  const handleModeSelect = (mode: SessionMode) => {
    setSessionMode(mode);
  };

  const handleStart = () => {
    onStart();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-cream rounded-3xl border-4 border-text max-w-md w-full overflow-hidden animate-bounce-in">
        {/* Header */}
        <div className="bg-pink p-4 text-center border-b-4 border-text">
          <h2 className="text-2xl font-[family-name:var(--font-fredoka)] text-text">
            Choose Your Mode
          </h2>
          {dueCount > 0 && (
            <p className="text-sm text-text/70 mt-1 font-[family-name:var(--font-nunito)]">
              📅 {dueCount} topic{dueCount > 1 ? "s" : ""} due for review
            </p>
          )}
        </div>

        {/* Mode buttons */}
        <div className="p-4 grid grid-cols-2 gap-3">
          {MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => handleModeSelect(mode.id)}
              className={`p-4 rounded-xl border-3 transition-all ${
                sessionMode === mode.id
                  ? `${mode.color} border-text scale-105 shadow-lg`
                  : "bg-white border-text/30 hover:border-text/50"
              }`}
            >
              <div className="text-3xl mb-1">{mode.emoji}</div>
              <div
                className={`font-[family-name:var(--font-fredoka)] ${
                  sessionMode === mode.id ? "text-white" : "text-text"
                }`}
              >
                {mode.name}
              </div>
              <div
                className={`text-xs font-[family-name:var(--font-nunito)] ${
                  sessionMode === mode.id ? "text-white/80" : "text-text/60"
                }`}
              >
                {mode.description}
              </div>
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="p-4 bg-white/50 border-t-2 border-text/10 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-white rounded-xl border-2 border-text font-[family-name:var(--font-nunito)] text-text hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleStart}
            className="flex-1 py-3 bg-sage rounded-xl border-2 border-text font-[family-name:var(--font-baloo)] text-lg text-text hover:bg-sage/80 transition-colors"
          >
            Start!
          </button>
        </div>
      </div>
    </div>
  );
}

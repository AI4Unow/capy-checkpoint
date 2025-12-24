"use client";

import { useState, useEffect } from "react";
import { EventBus, GameEvents, type QuestionReason } from "@/game/EventBus";

const REASON_CONFIG: Record<
  QuestionReason,
  { label: string; emoji: string; color: string }
> = {
  review: { label: "Due today", emoji: "📅", color: "bg-purple-400" },
  weak: { label: "Needs work", emoji: "💪", color: "bg-orange-400" },
  world: { label: "World topic", emoji: "🌍", color: "bg-green-400" },
  random: { label: "Surprise!", emoji: "🎲", color: "bg-sky" },
  onboarding: { label: "Warm-up!", emoji: "🌱", color: "bg-teal-400" },
};

export function QuestionReasonBadge() {
  const [reason, setReason] = useState<QuestionReason | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleQuestionReason = (...args: unknown[]) => {
      const data = args[0] as { reason: QuestionReason };
      setReason(data.reason);
      setIsVisible(true);

      // Auto-fade after 1.5s
      setTimeout(() => {
        setIsVisible(false);
      }, 1500);
    };

    const handleGameOver = () => {
      setIsVisible(false);
    };

    EventBus.on(GameEvents.QUESTION_REASON, handleQuestionReason);
    EventBus.on(GameEvents.GAME_OVER, handleGameOver);

    return () => {
      EventBus.off(GameEvents.QUESTION_REASON, handleQuestionReason);
      EventBus.off(GameEvents.GAME_OVER, handleGameOver);
    };
  }, []);

  if (!isVisible || !reason) return null;

  const config = REASON_CONFIG[reason];

  return (
    <div
      className={`absolute top-20 left-4 z-30 px-3 py-1.5 rounded-full border-2 border-text/20 ${config.color} shadow-md animate-fade-in-out`}
    >
      <span className="font-[family-name:var(--font-nunito)] text-white text-sm drop-shadow-sm">
        {config.emoji} {config.label}
      </span>
    </div>
  );
}

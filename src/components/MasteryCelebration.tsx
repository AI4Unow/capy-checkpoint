"use client";

import { useState, useEffect, useRef } from "react";
import { EventBus, GameEvents } from "@/game/EventBus";

const CELEBRATION_DURATION = 2500;
const CONFETTI_COUNT = 20;
const CONFETTI_EMOJIS = ["🎉", "⭐", "🏆", "✨", "🌟"];

interface ConfettiItem {
  id: number;
  left: string;
  delay: string;
  duration: string;
  emoji: string;
}

function generateConfetti(): ConfettiItem[] {
  return Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 0.5}s`,
    duration: `${1 + Math.random()}s`,
    emoji: CONFETTI_EMOJIS[Math.floor(Math.random() * CONFETTI_EMOJIS.length)],
  }));
}

export function MasteryCelebration() {
  const [subtopic, setSubtopic] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [confettiItems, setConfettiItems] = useState<ConfettiItem[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleMastery = (...args: unknown[]) => {
      const data = args[0] as { subtopic: string };
      setSubtopic(data.subtopic);
      setIsVisible(true);
      // Generate new confetti each time
      setConfettiItems(generateConfetti());

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Auto-dismiss after duration
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, CELEBRATION_DURATION);
    };

    EventBus.on(GameEvents.MASTERY_ACHIEVED, handleMastery);
    return () => {
      EventBus.off(GameEvents.MASTERY_ACHIEVED, handleMastery);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!isVisible || !subtopic) return null;

  // Format subtopic for display (capitalize, replace hyphens)
  const displayName = subtopic
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      {/* Confetti effect */}
      <div className="absolute inset-0 overflow-hidden">
        {confettiItems.map((item) => (
          <div
            key={item.id}
            className="absolute animate-confetti"
            style={{
              left: item.left,
              animationDelay: item.delay,
              animationDuration: item.duration,
            }}
          >
            <span className="text-2xl">{item.emoji}</span>
          </div>
        ))}
      </div>

      {/* Celebration card */}
      <div className="bg-yellow/90 rounded-3xl border-4 border-text p-8 shadow-2xl animate-bounce-in text-center">
        <div className="text-6xl mb-4">🏆</div>
        <h2 className="text-3xl font-[family-name:var(--font-fredoka)] text-text mb-2">
          Mastered!
        </h2>
        <p className="text-xl font-[family-name:var(--font-nunito)] text-text/80 mb-4">
          {displayName}
        </p>
        <div className="flex items-center justify-center gap-2 bg-white/50 rounded-xl px-4 py-2">
          <span className="text-2xl">🪙</span>
          <span className="text-xl font-[family-name:var(--font-baloo)] text-text">
            +50 Bonus Coins!
          </span>
        </div>
      </div>
    </div>
  );
}

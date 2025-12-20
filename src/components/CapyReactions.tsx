"use client";

import { useState, useEffect } from "react";
import { EventBus, GameEvents, type CapyReactionType } from "@/game/EventBus";
import { synthSounds } from "@/game/audio/SynthSounds";

/**
 * Pre-defined particle positions for each reaction type
 * Deterministic to avoid Math.random in render
 */
const REACTION_PARTICLES: Record<
  CapyReactionType,
  { x: number; y: number; emoji: string; delay: number }[]
> = {
  happy: [
    { x: -20, y: -30, emoji: "✨", delay: 0 },
    { x: 20, y: -35, emoji: "⭐", delay: 0.1 },
    { x: 0, y: -40, emoji: "✨", delay: 0.2 },
  ],
  sad: [{ x: 0, y: -20, emoji: "💧", delay: 0 }],
  excited: [
    { x: -25, y: -20, emoji: "🎉", delay: 0 },
    { x: 25, y: -25, emoji: "⭐", delay: 0.1 },
    { x: 0, y: -30, emoji: "🎊", delay: 0.15 },
    { x: -15, y: -35, emoji: "✨", delay: 0.2 },
    { x: 15, y: -38, emoji: "💫", delay: 0.25 },
  ],
  love: [
    { x: -15, y: -25, emoji: "💕", delay: 0 },
    { x: 0, y: -35, emoji: "❤️", delay: 0.1 },
    { x: 15, y: -30, emoji: "💕", delay: 0.2 },
  ],
  sleepy: [
    { x: 10, y: -25, emoji: "💤", delay: 0 },
    { x: 20, y: -35, emoji: "💤", delay: 0.3 },
  ],
  hungry: [{ x: 0, y: -20, emoji: "🍽️", delay: 0 }],
};

/**
 * CapyReactions - Animated emoji reactions that appear above the capybara
 * Triggered via EventBus events for correct/wrong answers, streaks, etc.
 */
export function CapyReactions() {
  const [reaction, setReaction] = useState<CapyReactionType | null>(null);

  useEffect(() => {
    const handleReaction = (...args: unknown[]) => {
      const data = args[0] as { type: CapyReactionType };
      setReaction(data.type);

      // Play appropriate sound
      switch (data.type) {
        case "happy":
          synthSounds.playHappyCapy?.();
          break;
        case "sad":
          synthSounds.playSadCapy?.();
          break;
        case "excited":
        case "love":
          synthSounds.playExcitedCapy?.();
          break;
        default:
          break;
      }

      // Auto-dismiss after animation
      setTimeout(() => setReaction(null), 1500);
    };

    EventBus.on(GameEvents.CAPY_REACT, handleReaction);
    return () => EventBus.off(GameEvents.CAPY_REACT, handleReaction);
  }, []);

  if (!reaction) return null;

  const particles = REACTION_PARTICLES[reaction];

  return (
    <div className="absolute left-[150px] top-[360px] z-30 pointer-events-none">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute text-2xl animate-float-up"
          style={{
            left: p.x,
            top: p.y,
            animationDelay: `${p.delay}s`,
          }}
        >
          {p.emoji}
        </div>
      ))}
    </div>
  );
}

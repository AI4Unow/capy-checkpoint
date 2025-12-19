"use client";

import { useEffect } from "react";
import { useBadgeStore } from "@/stores/badgeStore";
import { synthSounds } from "@/game/audio/SynthSounds";

// Pre-defined confetti positions (deterministic, no Math.random)
const CONFETTI_PARTICLES = [
  { x: 10, y: 15, color: "#FFD93D", delay: 0.1 },
  { x: 25, y: 8, color: "#6BCB77", delay: 0.2 },
  { x: 40, y: 12, color: "#4D96FF", delay: 0.05 },
  { x: 55, y: 5, color: "#FF6B6B", delay: 0.15 },
  { x: 70, y: 10, color: "#C9B1FF", delay: 0.25 },
  { x: 85, y: 18, color: "#FFD93D", delay: 0.08 },
  { x: 15, y: 25, color: "#6BCB77", delay: 0.18 },
  { x: 30, y: 20, color: "#4D96FF", delay: 0.12 },
  { x: 45, y: 28, color: "#FF6B6B", delay: 0.22 },
  { x: 60, y: 22, color: "#C9B1FF", delay: 0.03 },
  { x: 75, y: 30, color: "#FFD93D", delay: 0.13 },
  { x: 90, y: 25, color: "#6BCB77", delay: 0.23 },
  { x: 5, y: 35, color: "#4D96FF", delay: 0.07 },
  { x: 20, y: 40, color: "#FF6B6B", delay: 0.17 },
  { x: 35, y: 32, color: "#C9B1FF", delay: 0.27 },
  { x: 50, y: 38, color: "#FFD93D", delay: 0.02 },
  { x: 65, y: 35, color: "#6BCB77", delay: 0.12 },
  { x: 80, y: 42, color: "#4D96FF", delay: 0.22 },
  { x: 95, y: 38, color: "#FF6B6B", delay: 0.06 },
  { x: 8, y: 45, color: "#C9B1FF", delay: 0.16 },
];

/**
 * BadgeUnlock - Celebration popup when badge is unlocked
 */
export function BadgeUnlock() {
  const { pendingUnlock, dismissUnlock } = useBadgeStore();

  // Play celebration sound when unlock appears
  useEffect(() => {
    if (pendingUnlock) {
      synthSounds.playCorrect();
    }
  }, [pendingUnlock]);

  if (!pendingUnlock) return null;

  const tierLabels: Record<string, string> = {
    bronze: "Bronze",
    silver: "Silver",
    gold: "Gold",
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
      {/* Confetti */}
      {CONFETTI_PARTICLES.map((particle, i) => (
        <div
          key={i}
          className="absolute w-3 h-3 rounded-full animate-confetti"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            backgroundColor: particle.color,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}

      {/* Modal */}
      <div className="bg-cream rounded-3xl border-4 border-text max-w-sm w-full overflow-hidden animate-bounce-in">
        {/* Header */}
        <div className="bg-yellow p-8 border-b-4 border-text text-center relative overflow-hidden">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-radial from-white/50 to-transparent" />

          <div className="relative">
            <div className="text-7xl mb-2 animate-bounce">
              {pendingUnlock.emoji}
            </div>
            <div className="text-xl font-[family-name:var(--font-fredoka)] text-text/70">
              Badge Unlocked!
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <h2 className="text-2xl font-[family-name:var(--font-baloo)] text-text mb-2">
            {pendingUnlock.name}
          </h2>

          {/* Tier badge */}
          {pendingUnlock.tier && (
            <span
              className={`inline-block px-3 py-1 rounded-full text-white text-sm font-bold mb-3 ${
                pendingUnlock.tier === "bronze"
                  ? "bg-amber-600"
                  : pendingUnlock.tier === "silver"
                    ? "bg-gray-500"
                    : "bg-yellow-500"
              }`}
            >
              {tierLabels[pendingUnlock.tier]}
            </span>
          )}

          <p className="text-text/70 font-[family-name:var(--font-nunito)] mb-6">
            {pendingUnlock.description}
          </p>

          {/* Secret badge reveal */}
          {pendingUnlock.secret && (
            <div className="bg-purple-100 rounded-xl p-3 mb-4">
              <span className="text-purple-700 font-[family-name:var(--font-nunito)] text-sm">
                ✨ Secret badge discovered!
              </span>
            </div>
          )}

          {/* Dismiss button */}
          <button
            onClick={dismissUnlock}
            className="w-full py-4 bg-sage rounded-xl border-4 border-text font-[family-name:var(--font-baloo)] text-2xl text-text hover:scale-105 transition-transform"
          >
            Awesome!
          </button>
        </div>
      </div>
    </div>
  );
}

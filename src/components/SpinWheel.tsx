"use client";

import { useState, useRef } from "react";
import { useSpinStore } from "@/stores/spinStore";
import { useGameStore } from "@/stores/gameStore";
import { useMysteryBoxStore } from "@/stores/mysteryBoxStore";
import {
  SPIN_PRIZES,
  SPIN_COST,
  selectRandomPrize,
  getPrizeGradient,
  type SpinPrize,
} from "@/data/spinPrizes";
import { synthSounds } from "@/game/audio/SynthSounds";

// Pre-defined confetti positions (deterministic, no Math.random in render)
const CONFETTI_PARTICLES = [
  { x: 10, y: 15, color: "#FFD93D", delay: 0.1 },
  { x: 25, y: 8, color: "#6BCB77", delay: 0.2 },
  { x: 40, y: 12, color: "#4D96FF", delay: 0.05 },
  { x: 55, y: 5, color: "#FF6B6B", delay: 0.15 },
  { x: 70, y: 10, color: "#C9B1FF", delay: 0.25 },
  { x: 85, y: 18, color: "#FFD93D", delay: 0.08 },
  { x: 15, y: 25, color: "#6BCB77", delay: 0.18 },
  { x: 30, y: 20, color: "#4D96FF", delay: 0.12 },
];

interface SpinWheelProps {
  onClose: () => void;
}

type SpinState = "idle" | "spinning" | "result";

/**
 * Lucky Spin Wheel modal with animated wheel and prize reveal
 */
export function SpinWheel({ onClose }: SpinWheelProps) {
  const [spinState, setSpinState] = useState<SpinState>("idle");
  const [rotation, setRotation] = useState(0);
  const [selectedPrize, setSelectedPrize] = useState<SpinPrize | null>(null);
  const wheelRef = useRef<HTMLDivElement>(null);

  const { canFreeSpin, recordFreeSpin, recordPaidSpin, recordWin } =
    useSpinStore();
  const { coins, addCoins } = useGameStore();
  const { addBox } = useMysteryBoxStore();

  const hasFreeSpinAvailable = canFreeSpin();
  const canAffordPaidSpin = coins >= SPIN_COST;
  const canSpin =
    spinState === "idle" && (hasFreeSpinAvailable || canAffordPaidSpin);
  const isSpinning = spinState === "spinning";
  const isResult = spinState === "result";

  // Handle spin
  const handleSpin = () => {
    if (!canSpin) return;

    // Deduct coins for paid spin
    const isFree = hasFreeSpinAvailable;
    if (!isFree) {
      addCoins(-SPIN_COST);
    }

    // Record spin
    if (isFree) {
      recordFreeSpin();
    } else {
      recordPaidSpin();
    }

    // Select prize BEFORE animation
    const prize = selectRandomPrize();
    setSelectedPrize(prize);

    // Calculate final rotation
    // Each segment is 360/8 = 45 degrees
    // Prize index determines where wheel stops
    const prizeIndex = SPIN_PRIZES.findIndex((p) => p.id === prize.id);
    const segmentAngle = 360 / SPIN_PRIZES.length;
    // Add 3-5 full rotations plus the prize position
    const fullRotations = 3 + Math.floor(Math.random() * 2);
    const targetAngle = fullRotations * 360 + (360 - prizeIndex * segmentAngle);

    setRotation(rotation + targetAngle);
    setSpinState("spinning");

    // Play tick sounds during spin
    let tickCount = 0;
    const tickInterval = setInterval(() => {
      synthSounds.playSpin?.();
      tickCount++;
      if (tickCount > 15) clearInterval(tickInterval);
    }, 150);

    // Reveal result after animation
    setTimeout(() => {
      clearInterval(tickInterval);
      setSpinState("result");

      // Award prize
      if (prize.type === "coins") {
        addCoins(prize.value as number);
        recordWin(prize.value as number);
      } else if (prize.type === "mystery_box") {
        // Award mystery box of specified tier
        const boxTier = prize.value as "common" | "rare" | "epic" | "legendary";
        addBox(boxTier, "Spin Wheel");
      }

      // Play appropriate sound
      if (prize.rarity === "legendary" || prize.rarity === "epic") {
        synthSounds.playJackpot?.();
      } else if (prize.type !== "nothing") {
        synthSounds.playCorrect();
      }
    }, 4000);
  };

  // Reset for another spin
  const handleSpinAgain = () => {
    setSpinState("idle");
    setSelectedPrize(null);
  };

  // Calculate segment colors for wheel
  const segmentColors = [
    "#FFD6E0", // pink
    "#DDE5B6", // sage
    "#A2D2FF", // sky
    "#FFEAA7", // yellow
    "#FFD6E0",
    "#DDE5B6",
    "#A2D2FF",
    "#FFEAA7",
  ];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[90] p-4">
      {/* Confetti for rare+ wins */}
      {spinState === "result" &&
        selectedPrize &&
        (selectedPrize.rarity === "rare" ||
          selectedPrize.rarity === "epic" ||
          selectedPrize.rarity === "legendary") &&
        CONFETTI_PARTICLES.map((particle, i) => (
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

      <div className="bg-cream rounded-3xl border-4 border-text max-w-sm w-full overflow-hidden">
        {/* Header */}
        <div className="bg-yellow p-4 border-b-4 border-text flex justify-between items-center">
          <h2 className="text-2xl font-[family-name:var(--font-baloo)] text-text">
            🎰 Lucky Spin!
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center hover:bg-white/80 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center">
          {/* Wheel */}
          <div className="relative mb-6">
            {/* Pointer (Capy Arrow) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-20 pointer-events-none drop-shadow-md">
              <img
                src="/assets/capy-arrow.svg"
                alt="Pointer"
                className="w-16 h-16 object-contain"
              />
            </div>

            {/* Wheel container */}
            <div
              ref={wheelRef}
              className="w-64 h-64 rounded-full border-8 border-text relative overflow-hidden transition-transform"
              style={{
                transform: `rotate(${rotation}deg)`,
                transitionDuration: spinState === "spinning" ? "4s" : "0s",
                transitionTimingFunction: "cubic-bezier(0.2, 0.8, 0.3, 1)",
              }}
            >
              {/* Segments */}
              {SPIN_PRIZES.map((prize, i) => {
                const angle = (360 / SPIN_PRIZES.length) * i;
                return (
                  <div
                    key={prize.id}
                    className="absolute w-1/2 h-1/2 origin-bottom-right"
                    style={{
                      transform: `rotate(${angle}deg) skewY(${90 - 360 / SPIN_PRIZES.length}deg)`,
                      backgroundColor: segmentColors[i % segmentColors.length],
                    }}
                  >
                    <div
                      className="absolute text-xl"
                      style={{
                        transform: `skewY(-${90 - 360 / SPIN_PRIZES.length}deg) rotate(${360 / SPIN_PRIZES.length / 2}deg)`,
                        top: "30%",
                        left: "50%",
                      }}
                    >
                      {prize.emoji}
                    </div>
                  </div>
                );
              })}

              {/* Center circle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white border-4 border-text flex items-center justify-center text-2xl">
                🐹
              </div>
            </div>
          </div>

          {/* Result display */}
          {spinState === "result" && selectedPrize && (
            <div
              className={`mb-4 p-4 rounded-2xl border-4 border-text text-center bg-gradient-to-b ${getPrizeGradient(selectedPrize.rarity)}`}
            >
              <div className="text-4xl mb-2">{selectedPrize.emoji}</div>
              <div className="text-xl font-[family-name:var(--font-fredoka)] text-text">
                {selectedPrize.name}
              </div>
              {selectedPrize.type === "nothing" && (
                <div className="text-sm text-text/70 mt-1">
                  Better luck next time!
                </div>
              )}
            </div>
          )}

          {/* Spin button */}
          {!isResult && (
            <button
              onClick={handleSpin}
              disabled={!canSpin || isSpinning}
              className={`w-full py-4 rounded-xl border-4 border-text font-[family-name:var(--font-baloo)] text-2xl transition-all ${
                canSpin && !isSpinning
                  ? "bg-sage hover:scale-105 text-text"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isSpinning ? (
                "Spinning..."
              ) : hasFreeSpinAvailable ? (
                <span>
                  🎁 FREE SPIN! <span className="text-sm">(Daily)</span>
                </span>
              ) : canAffordPaidSpin ? (
                <span>
                  Spin for {SPIN_COST} 🪙
                </span>
              ) : (
                <span>
                  Need {SPIN_COST} coins
                </span>
              )}
            </button>
          )}
          {isResult && (
            <div className="flex gap-3 w-full">
              <button
                onClick={handleSpinAgain}
                className="flex-1 py-3 rounded-xl border-4 border-text bg-sky font-[family-name:var(--font-baloo)] text-lg text-text hover:scale-105 transition-transform"
              >
                Spin Again
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border-4 border-text bg-pink font-[family-name:var(--font-baloo)] text-lg text-text hover:scale-105 transition-transform"
              >
                Done
              </button>
            </div>
          )}

          {/* Coin balance */}
          <div className="mt-4 text-text/70 font-[family-name:var(--font-nunito)]">
            Your coins: {coins} 🪙
          </div>
        </div>
      </div>
    </div>
  );
}

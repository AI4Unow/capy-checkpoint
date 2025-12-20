"use client";

import { useState, useEffect } from "react";
import { useMoodStore } from "@/stores/moodStore";

/**
 * WelcomeBack - Modal shown when player returns after being away
 * Shows different messages based on time away and streak
 */
export function WelcomeBack() {
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");
  const [subMessage, setSubMessage] = useState("");
  const { calculateDecay, happiness, consecutiveDays, recordPlay } =
    useMoodStore();

  useEffect(() => {
    const { hoursAway, decayed } = calculateDecay();

    // Record the play session
    recordPlay();

    if (hoursAway >= 24) {
      // Long absence
      const days = Math.floor(hoursAway / 24);
      setMessage(
        happiness < 40
          ? "Capy missed you so much! 😢"
          : "Capy is happy to see you! 💕"
      );
      setSubMessage(
        `You were away for ${days} day${days > 1 ? "s" : ""}. ${
          decayed > 0 ? `Happiness dropped by ${decayed}.` : ""
        }`
      );
      setShowModal(true);
    } else if (consecutiveDays > 1) {
      // Streak continuation
      setMessage(`${consecutiveDays} day streak! 🔥`);
      setSubMessage("Capy is so proud of you for coming back!");
      setShowModal(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 animate-fade-in">
      <div className="bg-cream rounded-3xl border-4 border-text p-6 max-w-sm text-center animate-bounce-in">
        <div className="text-6xl mb-4">{happiness < 40 ? "😢" : "😊"}</div>
        <h2 className="text-2xl font-[family-name:var(--font-baloo)] text-text mb-2">
          Welcome Back!
        </h2>
        <p className="text-xl font-[family-name:var(--font-fredoka)] text-text mb-2">
          {message}
        </p>
        <p className="text-sm text-text/70 font-[family-name:var(--font-nunito)] mb-4">
          {subMessage}
        </p>
        <button
          onClick={() => setShowModal(false)}
          className="w-full py-3 bg-sage rounded-xl border-4 border-text font-[family-name:var(--font-baloo)] text-xl text-text hover:scale-105 transition-transform"
        >
          Let&apos;s Play! 🎮
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { EventBus, GameEvents } from "@/game/EventBus";
import { SettingsModal } from "./SettingsModal";

/**
 * Pause overlay - displays when game is paused
 * Shows resume button and settings access
 */
export function PauseOverlay() {
  const [isPaused, setIsPaused] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const handlePause = () => setIsPaused(true);
    const handleResume = () => setIsPaused(false);

    EventBus.on(GameEvents.PAUSE, handlePause);
    EventBus.on(GameEvents.RESUME, handleResume);

    return () => {
      EventBus.off(GameEvents.PAUSE, handlePause);
      EventBus.off(GameEvents.RESUME, handleResume);
    };
  }, []);

  const handleResume = () => {
    EventBus.emit(GameEvents.RESUME);
  };

  const handleOpenSettings = () => {
    setShowSettings(true);
  };

  const handleCloseSettings = () => {
    setShowSettings(false);
  };

  if (!isPaused) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in">
        <div className="bg-cream rounded-3xl border-4 border-text p-8 max-w-sm w-full mx-4 text-center animate-bounce-in">
          {/* Pause icon */}
          <div className="text-6xl mb-4">⏸️</div>

          <h2 className="text-3xl font-[family-name:var(--font-fredoka)] text-text mb-6">
            Game Paused
          </h2>

          <p className="text-text/70 font-[family-name:var(--font-nunito)] mb-8">
            Take a break! Press ESC or click Resume to continue.
          </p>

          {/* Resume button */}
          <button
            onClick={handleResume}
            className="w-full py-4 bg-sage rounded-xl border-4 border-text font-[family-name:var(--font-baloo)] text-2xl text-text hover:scale-105 transition-transform mb-4"
          >
            ▶️ Resume
          </button>

          {/* Settings button */}
          <button
            onClick={handleOpenSettings}
            className="w-full py-3 bg-white rounded-xl border-2 border-text font-[family-name:var(--font-nunito)] text-lg text-text hover:bg-gray-100 transition-colors"
          >
            ⚙️ Settings
          </button>
        </div>
      </div>

      {/* Settings modal */}
      {showSettings && <SettingsModal onClose={handleCloseSettings} />}
    </>
  );
}

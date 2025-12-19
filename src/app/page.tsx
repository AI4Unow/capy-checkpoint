"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { GameHUD } from "@/components/GameHUD";
import { Boutique } from "@/components/Boutique";
import { SessionSummary } from "@/components/SessionSummary";
import { AIHint } from "@/components/AIHint";
import { DifficultyIndicator } from "@/components/DifficultyIndicator";
import { MasteryCelebration } from "@/components/MasteryCelebration";
import { QuestionReasonBadge } from "@/components/QuestionReasonBadge";
import { StreakDisplay } from "@/components/StreakDisplay";
import { MenuOverlay } from "@/components/MenuOverlay";
import { CalibrationIndicator } from "@/components/CalibrationIndicator";
import { PauseOverlay } from "@/components/PauseOverlay";
import { BadgeCollection } from "@/components/BadgeCollection";
import { BadgeUnlock } from "@/components/BadgeUnlock";
import { BadgeChecker } from "@/components/BadgeChecker";
import { useGameStore } from "@/stores/gameStore";
import { useLearningStore } from "@/stores/learningStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { EventBus, GameEvents } from "@/game/EventBus";
import type { Question } from "@/types/question";

// Dynamic import Phaser component (client-side only, no SSR)
const PhaserGame = dynamic(() => import("@/game/PhaserGame"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-sky">
      <p className="font-fredoka text-2xl text-text">Loading game...</p>
    </div>
  ),
});

export default function Home() {
  const [showBoutique, setShowBoutique] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const [wrongAnswer, setWrongAnswer] = useState<{
    question: Question;
    studentAnswerIndex: number;
  } | null>(null);
  const { isGameOver, isPlaying } = useGameStore();
  const { resetSession } = useLearningStore();
  const { reducedMotion } = useSettingsStore();

  // Listen for wrong answers to show AI hint
  useEffect(() => {
    const handleWrongAnswer = (...args: unknown[]) => {
      const data = args[0] as {
        question: Question;
        studentAnswerIndex: number;
      };
      setWrongAnswer(data);
    };

    EventBus.on(GameEvents.WRONG_ANSWER, handleWrongAnswer);
    return () => {
      EventBus.off(GameEvents.WRONG_ANSWER, handleWrongAnswer);
    };
  }, []);

  const handlePlayAgain = () => {
    setShowSummary(false);
    resetSession();
    // Restart game scene via EventBus
    EventBus.emit(GameEvents.RESTART);
  };

  const handleMenu = () => {
    setShowSummary(false);
    resetSession();
    // Go to menu via EventBus
    EventBus.emit(GameEvents.GO_TO_MENU);
  };

  return (
    <div
      className="w-screen h-screen flex items-center justify-center bg-cream p-4"
      data-reduced-motion={reducedMotion ? "true" : "false"}
    >
      <div className="relative w-full h-full max-w-[1280px] max-h-[720px] aspect-video rounded-[32px] border-[8px] border-text overflow-hidden shadow-2xl">
        <GameHUD />
        <DifficultyIndicator />
        <QuestionReasonBadge />
        <StreakDisplay />
        <MenuOverlay />
        <CalibrationIndicator />
        <PhaserGame />

        {/* Boutique and Badges buttons (visible when not playing) */}
        {!isPlaying && !showSummary && (
          <div className="absolute bottom-4 right-4 z-20 flex gap-2">
            <button
              onClick={() => setShowBadges(true)}
              className="bg-purple-400 px-4 py-2 rounded-full border-4 border-text font-[family-name:var(--font-fredoka)] text-text hover:scale-105 transition-transform"
            >
              🏅 Badges
            </button>
            <button
              onClick={() => setShowBoutique(true)}
              className="bg-pink px-4 py-2 rounded-full border-4 border-text font-[family-name:var(--font-fredoka)] text-text hover:scale-105 transition-transform"
            >
              🛍️ Boutique
            </button>
          </div>
        )}
      </div>

      {/* Boutique modal */}
      {showBoutique && <Boutique onClose={() => setShowBoutique(false)} />}

      {/* Session summary (shows on game over) */}
      {isGameOver && showSummary && (
        <SessionSummary
          onPlayAgain={handlePlayAgain}
          onBoutique={() => {
            setShowSummary(false);
            setShowBoutique(true);
          }}
          onMenu={handleMenu}
        />
      )}

      {/* AI Hint popup (shows on wrong answer) */}
      {wrongAnswer && (
        <AIHint
          question={wrongAnswer.question}
          studentAnswerIndex={wrongAnswer.studentAnswerIndex}
          onClose={() => setWrongAnswer(null)}
        />
      )}

      {/* Mastery celebration overlay */}
      <MasteryCelebration />

      {/* Pause overlay (shows when paused) */}
      <PauseOverlay />

      {/* Badge collection modal */}
      {showBadges && <BadgeCollection onClose={() => setShowBadges(false)} />}

      {/* Badge unlock celebration */}
      <BadgeUnlock />

      {/* Badge checker (listens to game events) */}
      <BadgeChecker />
    </div>
  );
}

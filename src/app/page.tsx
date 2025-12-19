"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { GameHUD } from "@/components/GameHUD";
import { Boutique } from "@/components/Boutique";
import { SessionSummary } from "@/components/SessionSummary";
import { AIHint } from "@/components/AIHint";
import { useGameStore } from "@/stores/gameStore";
import { useLearningStore } from "@/stores/learningStore";
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
  const [wrongAnswer, setWrongAnswer] = useState<{
    question: Question;
    studentAnswerIndex: number;
  } | null>(null);
  const { isGameOver, isPlaying } = useGameStore();
  const { resetSession } = useLearningStore();

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
    <div className="w-screen h-screen flex items-center justify-center bg-cream">
      <div className="relative w-full max-w-[800px] aspect-[4/3] rounded-[40px] border-[12px] border-text overflow-hidden shadow-2xl">
        <GameHUD />
        <PhaserGame />

        {/* Boutique button (visible when not playing) */}
        {!isPlaying && !showSummary && (
          <button
            onClick={() => setShowBoutique(true)}
            className="absolute bottom-4 right-4 z-20 bg-pink px-4 py-2 rounded-full border-4 border-text font-[family-name:var(--font-fredoka)] text-text hover:scale-105 transition-transform"
          >
            🛍️ Boutique
          </button>
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
    </div>
  );
}

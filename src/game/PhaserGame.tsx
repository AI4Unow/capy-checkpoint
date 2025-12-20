"use client";

import { useEffect, useRef, useCallback } from "react";
import Phaser from "phaser";
import { createGameConfig } from "./config";
import { EventBus, GameEvents } from "./EventBus";
import { useGameStore } from "@/stores/gameStore";
import { useLearningStore } from "@/stores/learningStore";
import type { Question } from "@/types/question";
import { Game } from "./scenes/Game";

/**
 * React wrapper for Phaser game (client-side only)
 */
export default function PhaserGame() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gameSceneRef = useRef<Game | null>(null);

  // Game store
  const {
    setScore,
    setLives,
    setIsPlaying,
    setIsGameOver,
    addCoins,
    setCurrentQuestion,
    recordAnswer,
    updateBestScore,
  } = useGameStore();

  // Learning store
  const { selectQuestion, recordAnswer: recordLearning } = useLearningStore();

  // Memoize callbacks to pass to Phaser scene
  const questionSelector = useCallback(
    (questions: Question[]) => {
      return selectQuestion(questions);
    },
    [selectQuestion]
  );

  const answerRecorder = useCallback(
    (question: Question, isCorrect: boolean, responseTimeMs?: number) => {
      recordLearning(question, isCorrect, responseTimeMs);
    },
    [recordLearning]
  );

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const config = createGameConfig("game-container");
    gameRef.current = new Phaser.Game(config);

    // Store reference to Game scene when ready
    gameRef.current.events.on("ready", () => {
      const game = gameRef.current;
      if (game) {
        const gameScene = game.scene.getScene("Game") as Game;
        if (gameScene) {
          gameSceneRef.current = gameScene;
          gameScene.setQuestionSelector(questionSelector);
          gameScene.setAnswerRecorder(answerRecorder);
        }
      }
    });

    const handleScoreUpdate = (score: unknown) => {
      setScore(score as number);
    };

    const handleLivesUpdate = (lives: unknown) => {
      setLives(lives as number);
    };

    const handleGameStart = () => {
      setIsPlaying(true);
      setIsGameOver(false);
    };

    const handleGameOver = (score: unknown) => {
      setIsPlaying(false);
      setIsGameOver(true);
      updateBestScore(score as number);
    };

    const handleShowHint = (question: unknown) => {
      setCurrentQuestion(question as Question);
    };

    const handleAnswer = (data: unknown) => {
      const { isCorrect } = data as { isCorrect: boolean };
      recordAnswer(isCorrect);
      if (isCorrect) {
        addCoins(10);
      }
    };

    EventBus.on(GameEvents.SCORE_UPDATE, handleScoreUpdate);
    EventBus.on(GameEvents.LIVES_UPDATE, handleLivesUpdate);
    EventBus.on(GameEvents.GAME_START, handleGameStart);
    EventBus.on(GameEvents.GAME_OVER, handleGameOver);
    EventBus.on(GameEvents.SHOW_HINT, handleShowHint);
    EventBus.on(GameEvents.ANSWER, handleAnswer);

    return () => {
      EventBus.off(GameEvents.SCORE_UPDATE, handleScoreUpdate);
      EventBus.off(GameEvents.LIVES_UPDATE, handleLivesUpdate);
      EventBus.off(GameEvents.GAME_START, handleGameStart);
      EventBus.off(GameEvents.GAME_OVER, handleGameOver);
      EventBus.off(GameEvents.SHOW_HINT, handleShowHint);
      EventBus.off(GameEvents.ANSWER, handleAnswer);

      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [
    setScore,
    setLives,
    setIsPlaying,
    setIsGameOver,
    addCoins,
    setCurrentQuestion,
    recordAnswer,
    updateBestScore,
    questionSelector,
    answerRecorder,
  ]);

  // Update scene callbacks when they change
  useEffect(() => {
    if (gameSceneRef.current) {
      gameSceneRef.current.setQuestionSelector(questionSelector);
      gameSceneRef.current.setAnswerRecorder(answerRecorder);
    }
  }, [questionSelector, answerRecorder]);

  return (
    <div id="game-container" ref={containerRef} className="w-full h-full" />
  );
}

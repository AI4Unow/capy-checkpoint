import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { createGameConfig } from './config';
import { EventBus, GameEvents } from './EventBus';
import { useGameStore } from '../stores/gameStore';

interface PhaserGameProps {
  className?: string;
}

/**
 * React wrapper for Phaser game
 * Handles lifecycle and event bridging
 */
export function PhaserGame({ className }: PhaserGameProps) {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { setScore, setLives, setIsPlaying, setIsGameOver, addCoins } = useGameStore();

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    // Create Phaser game
    const config = createGameConfig('game-container');
    gameRef.current = new Phaser.Game(config);

    // Event listeners
    const handleScoreUpdate = (score: number) => {
      setScore(score);
      addCoins(10); // Base coins per gate
    };

    const handleLivesUpdate = (lives: number) => {
      setLives(lives);
    };

    const handleGameStart = () => {
      setIsPlaying(true);
      setIsGameOver(false);
    };

    const handleGameOver = () => {
      setIsPlaying(false);
      setIsGameOver(true);
    };

    // Subscribe to events
    EventBus.on(GameEvents.SCORE_UPDATE, handleScoreUpdate);
    EventBus.on(GameEvents.LIVES_UPDATE, handleLivesUpdate);
    EventBus.on(GameEvents.GAME_START, handleGameStart);
    EventBus.on(GameEvents.GAME_OVER, handleGameOver);

    // Cleanup
    return () => {
      EventBus.off(GameEvents.SCORE_UPDATE, handleScoreUpdate);
      EventBus.off(GameEvents.LIVES_UPDATE, handleLivesUpdate);
      EventBus.off(GameEvents.GAME_START, handleGameStart);
      EventBus.off(GameEvents.GAME_OVER, handleGameOver);

      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [setScore, setLives, setIsPlaying, setIsGameOver, addCoins]);

  return (
    <div
      id="game-container"
      ref={containerRef}
      className={className}
    />
  );
}

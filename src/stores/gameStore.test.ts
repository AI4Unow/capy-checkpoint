import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from './gameStore';

describe('gameStore', () => {
  beforeEach(() => {
    useGameStore.getState().reset();
  });

  it('should have initial state', () => {
    const state = useGameStore.getState();
    expect(state.score).toBe(0);
    expect(state.lives).toBe(3);
    expect(state.coins).toBe(0);
    expect(state.isPlaying).toBe(false);
    expect(state.isGameOver).toBe(false);
    expect(state.currentQuestion).toBeNull();
  });

  it('should update score', () => {
    useGameStore.getState().setScore(100);
    expect(useGameStore.getState().score).toBe(100);
  });

  it('should add coins', () => {
    useGameStore.getState().addCoins(50);
    expect(useGameStore.getState().coins).toBe(50);
    useGameStore.getState().addCoins(25);
    expect(useGameStore.getState().coins).toBe(75);
  });

  it('should record correct answer', () => {
    useGameStore.getState().recordAnswer(true);
    expect(useGameStore.getState().answeredCount).toBe(1);
    expect(useGameStore.getState().correctCount).toBe(1);
  });

  it('should record incorrect answer', () => {
    useGameStore.getState().recordAnswer(false);
    expect(useGameStore.getState().answeredCount).toBe(1);
    expect(useGameStore.getState().correctCount).toBe(0);
  });

  it('should reset state', () => {
    useGameStore.getState().setScore(100);
    useGameStore.getState().setLives(1);
    useGameStore.getState().reset();
    
    const state = useGameStore.getState();
    expect(state.score).toBe(0);
    expect(state.lives).toBe(3);
  });
});

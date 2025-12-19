import { create } from 'zustand';

interface GameState {
  score: number;
  lives: number;
  coins: number;
  isPlaying: boolean;
  isGameOver: boolean;

  // Actions
  setScore: (score: number) => void;
  setLives: (lives: number) => void;
  addCoins: (amount: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setIsGameOver: (isGameOver: boolean) => void;
  reset: () => void;
}

const initialState = {
  score: 0,
  lives: 3,
  coins: 0,
  isPlaying: false,
  isGameOver: false,
};

/**
 * Game state store using Zustand
 * Manages score, lives, coins for React HUD
 */
export const useGameStore = create<GameState>((set) => ({
  ...initialState,

  setScore: (score) => set({ score }),
  setLives: (lives) => set({ lives }),
  addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setIsGameOver: (isGameOver) => set({ isGameOver }),
  reset: () => set(initialState),
}));

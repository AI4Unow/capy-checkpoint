import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Question } from "@/types/question";

interface GameState {
  score: number;
  lives: number;
  coins: number;
  isPlaying: boolean;
  isGameOver: boolean;
  currentQuestion: Question | null;
  answeredCount: number;
  correctCount: number;
  bestScore: number;

  setScore: (score: number) => void;
  setLives: (lives: number) => void;
  addCoins: (amount: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setIsGameOver: (isGameOver: boolean) => void;
  setCurrentQuestion: (question: Question | null) => void;
  recordAnswer: (correct: boolean) => void;
  updateBestScore: (score: number) => void;
  reset: () => void;
}

const initialState = {
  score: 0,
  lives: 3,
  coins: 1000,
  isPlaying: false,
  isGameOver: false,
  currentQuestion: null,
  answeredCount: 0,
  correctCount: 0,
  bestScore: 0,
};

/**
 * Game state store using Zustand with persistence for best score
 */
export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      ...initialState,

      setScore: (score) => set({ score }),
      setLives: (lives) => set({ lives }),
      addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),
      setIsPlaying: (isPlaying) => set({ isPlaying }),
      setIsGameOver: (isGameOver) => set({ isGameOver }),
      setCurrentQuestion: (question) => set({ currentQuestion: question }),
      recordAnswer: (correct) =>
        set((state) => ({
          answeredCount: state.answeredCount + 1,
          correctCount: correct ? state.correctCount + 1 : state.correctCount,
        })),
      updateBestScore: (score) =>
        set((state) => ({
          bestScore: score > state.bestScore ? score : state.bestScore,
        })),
      reset: () =>
        set((state) => ({
          ...initialState,
          bestScore: state.bestScore, // Preserve best score on reset
          coins: state.coins, // Preserve coins on reset
        })),
    }),
    {
      name: "mathie-game-store",
      partialize: (state) => ({ bestScore: state.bestScore, coins: state.coins }),
      merge: (persistedState, currentState) => {
        // Ignore stale persisted runtime flags (e.g. isPlaying) from older store shapes.
        const persisted = persistedState as Partial<GameState>;
        const persistedCoins =
          typeof persisted.coins === "number"
            ? persisted.coins
            : currentState.coins;
        const persistedBestScore =
          typeof persisted.bestScore === "number"
            ? persisted.bestScore
            : currentState.bestScore;

        return {
          ...currentState,
          bestScore: persistedBestScore,
          coins: Math.max(1000, persistedCoins),
        };
      },
    }
  )
);

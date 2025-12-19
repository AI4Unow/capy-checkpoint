import { create } from "zustand";
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

  setScore: (score: number) => void;
  setLives: (lives: number) => void;
  addCoins: (amount: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setIsGameOver: (isGameOver: boolean) => void;
  setCurrentQuestion: (question: Question | null) => void;
  recordAnswer: (correct: boolean) => void;
  reset: () => void;
}

const initialState = {
  score: 0,
  lives: 3,
  coins: 0,
  isPlaying: false,
  isGameOver: false,
  currentQuestion: null,
  answeredCount: 0,
  correctCount: 0,
};

/**
 * Game state store using Zustand
 */
export const useGameStore = create<GameState>((set) => ({
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
  reset: () => set(initialState),
}));

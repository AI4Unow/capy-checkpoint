import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Question, Topic } from "@/types/question";
import type { SubtopicMastery } from "@/engine/mastery";
import type { SM2State } from "@/engine/sm2";
import {
  calculateExpected,
  updateRating,
  getKFactor,
  clampRating,
  getRatingLevel,
  getLevelProgress,
} from "@/engine/elo";
import {
  createMasteryEntry,
  updateMastery,
  getWeakestSubtopics,
  getTopicMastery,
} from "@/engine/mastery";
import { createSM2State, updateSM2, boolToQuality } from "@/engine/sm2";
import { selectNextQuestion } from "@/engine/questionSelector";

/**
 * Learning state persisted to localStorage
 */
interface LearningState {
  // Student profile
  studentRating: number;
  totalResponses: number;
  currentWorld: number;

  // Tracking maps (serialized as arrays for persistence)
  masteryEntries: SubtopicMastery[];
  sm2Entries: { subtopic: string; state: SM2State }[];

  // Recent questions (avoid repetition)
  recentQuestionIds: string[];

  // Session stats
  sessionCorrect: number;
  sessionTotal: number;
  streakCount: number;
  bestStreak: number;
}

interface LearningActions {
  // Core actions
  recordAnswer: (
    question: Question,
    isCorrect: boolean,
    responseTimeMs?: number
  ) => void;
  selectQuestion: (questions: Question[]) => Question;

  // Getters
  getMasteryMap: () => Map<string, SubtopicMastery>;
  getSM2Map: () => Map<string, SM2State>;
  getTopicProgress: (topic: Topic) => number;
  getRatingInfo: () => { name: string; emoji: string; progress: number };

  // World progression
  setWorld: (world: number) => void;
  canUnlockWorld: (world: number) => boolean;

  // Reset
  resetSession: () => void;
  resetAll: () => void;
}

const INITIAL_RATING = 800;
const WORLDS_UNLOCK_RATING: Record<number, number> = {
  1: 0, // Forest - always unlocked
  2: 750, // Garden
  3: 850, // Rainbow
  4: 950, // Ocean
  5: 1050, // Sky Castle
};

export const useLearningStore = create<LearningState & LearningActions>()(
  persist(
    (set, get) => ({
      // Initial state
      studentRating: INITIAL_RATING,
      totalResponses: 0,
      currentWorld: 1,
      masteryEntries: [],
      sm2Entries: [],
      recentQuestionIds: [],
      sessionCorrect: 0,
      sessionTotal: 0,
      streakCount: 0,
      bestStreak: 0,

      /**
       * Record answer and update all adaptive systems
       */
      recordAnswer: (question, isCorrect, responseTimeMs) => {
        const state = get();

        // 1. Update Elo rating
        const expected = calculateExpected(
          state.studentRating,
          question.difficulty
        );
        const k = getKFactor(state.totalResponses);
        const newRating = clampRating(
          updateRating(state.studentRating, expected, isCorrect ? 1 : 0, k)
        );

        // 2. Update mastery for this subtopic
        const masteryMap = get().getMasteryMap();
        let mastery = masteryMap.get(question.subtopic);
        if (!mastery) {
          mastery = createMasteryEntry(question.subtopic, question.topic);
        }
        const updatedMastery = updateMastery(mastery, isCorrect);
        masteryMap.set(question.subtopic, updatedMastery);

        // 3. Update SM2 for this subtopic
        const sm2Map = get().getSM2Map();
        let sm2State = sm2Map.get(question.subtopic);
        if (!sm2State) {
          sm2State = createSM2State();
        }
        const quality = boolToQuality(isCorrect, responseTimeMs);
        const updatedSM2 = updateSM2(sm2State, quality);
        sm2Map.set(question.subtopic, updatedSM2);

        // 4. Update recent questions
        const recentIds = [...state.recentQuestionIds, question.id].slice(-10);

        // 5. Update streak
        const newStreak = isCorrect ? state.streakCount + 1 : 0;
        const newBestStreak = Math.max(state.bestStreak, newStreak);

        // Convert maps back to arrays for persistence
        const masteryEntries = Array.from(masteryMap.values());
        const sm2Entries = Array.from(sm2Map.entries()).map(
          ([subtopic, smState]) => ({
            subtopic,
            state: smState,
          })
        );

        set({
          studentRating: newRating,
          totalResponses: state.totalResponses + 1,
          masteryEntries,
          sm2Entries,
          recentQuestionIds: recentIds,
          sessionCorrect: state.sessionCorrect + (isCorrect ? 1 : 0),
          sessionTotal: state.sessionTotal + 1,
          streakCount: newStreak,
          bestStreak: newBestStreak,
        });
      },

      /**
       * Select next question using adaptive algorithm
       */
      selectQuestion: (questions) => {
        const state = get();
        return selectNextQuestion(questions, {
          studentRating: state.studentRating,
          currentWorld: state.currentWorld,
          masteryMap: get().getMasteryMap(),
          sm2Map: get().getSM2Map(),
          recentQuestionIds: state.recentQuestionIds,
        });
      },

      /**
       * Get mastery map from entries
       */
      getMasteryMap: () => {
        const state = get();
        const map = new Map<string, SubtopicMastery>();
        state.masteryEntries.forEach((entry) => {
          map.set(entry.subtopic, entry);
        });
        return map;
      },

      /**
       * Get SM2 map from entries
       */
      getSM2Map: () => {
        const state = get();
        const map = new Map<string, SM2State>();
        state.sm2Entries.forEach(({ subtopic, state: sm2State }) => {
          // Reconstruct Date objects (lost in JSON serialization)
          map.set(subtopic, {
            ...sm2State,
            nextReview: new Date(sm2State.nextReview),
          });
        });
        return map;
      },

      /**
       * Get progress for a topic (0-100)
       */
      getTopicProgress: (topic) => {
        const masteryMap = get().getMasteryMap();
        return Math.round(getTopicMastery(masteryMap, topic) * 100);
      },

      /**
       * Get current rating level info
       */
      getRatingInfo: () => {
        const { studentRating } = get();
        const level = getRatingLevel(studentRating);
        const progress = getLevelProgress(studentRating);
        return {
          name: level.name,
          emoji: level.emoji,
          progress,
        };
      },

      /**
       * Set current world
       */
      setWorld: (world) => {
        if (get().canUnlockWorld(world)) {
          set({ currentWorld: world });
        }
      },

      /**
       * Check if world can be unlocked
       */
      canUnlockWorld: (world) => {
        const { studentRating } = get();
        const requiredRating = WORLDS_UNLOCK_RATING[world] ?? 0;
        return studentRating >= requiredRating;
      },

      /**
       * Reset session stats (keeps learning progress)
       */
      resetSession: () => {
        set({
          sessionCorrect: 0,
          sessionTotal: 0,
          streakCount: 0,
        });
      },

      /**
       * Reset all learning data
       */
      resetAll: () => {
        set({
          studentRating: INITIAL_RATING,
          totalResponses: 0,
          currentWorld: 1,
          masteryEntries: [],
          sm2Entries: [],
          recentQuestionIds: [],
          sessionCorrect: 0,
          sessionTotal: 0,
          streakCount: 0,
          bestStreak: 0,
        });
      },
    }),
    {
      name: "capy-learning-storage",
      partialize: (state) => ({
        studentRating: state.studentRating,
        totalResponses: state.totalResponses,
        currentWorld: state.currentWorld,
        masteryEntries: state.masteryEntries,
        sm2Entries: state.sm2Entries,
        recentQuestionIds: state.recentQuestionIds,
        bestStreak: state.bestStreak,
      }),
    }
  )
);

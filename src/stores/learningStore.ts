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
  getTopicMastery,
} from "@/engine/mastery";
import { createSM2State, updateSM2, boolToQuality, isDueForReview } from "@/engine/sm2";
import { selectNextQuestion, type QuestionSelection, type SessionMode } from "@/engine/questionSelector";
import { EventBus, GameEvents } from "@/game/EventBus";

/**
 * Learning state persisted to localStorage
 */
interface LearningState {
  // Student profile
  studentRating: number;
  totalResponses: number;
  currentWorld: number;

  // Elo history for trend tracking (last 20 entries)
  eloHistory: { rating: number; timestamp: number }[];

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

  // Adaptive UX state
  sessionMode: SessionMode;
  onboardingComplete: boolean;
  lastMasteredSubtopic: string | null;
  sessionMasteries: string[];
  sessionImproved: { subtopic: string; delta: number }[];
  sessionWeakest: { subtopic: string; wrongCount: number }[];
}

interface LearningActions {
  // Core actions
  recordAnswer: (
    question: Question,
    isCorrect: boolean,
    responseTimeMs?: number
  ) => void;
  selectQuestion: (questions: Question[]) => QuestionSelection;

  // Getters
  getMasteryMap: () => Map<string, SubtopicMastery>;
  getSM2Map: () => Map<string, SM2State>;
  getTopicProgress: (topic: Topic) => number;
  getRatingInfo: () => { name: string; emoji: string; progress: number };
  getDueReviewCount: () => number;

  // Stats getters
  getEloTrend: () => number;
  getAllTopicProgress: () => { topic: Topic; progress: number }[];
  getWeakTopics: () => string[];
  getQuestionsToNextLevel: () => number;

  // World progression
  setWorld: (world: number) => void;
  canUnlockWorld: (world: number) => boolean;

  // Session mode
  setSessionMode: (mode: SessionMode) => void;

  // Reset
  resetSession: () => void;
  resetAll: () => void;
}

const INITIAL_RATING = 600; // Start low so new students get easier questions first
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
      eloHistory: [],
      masteryEntries: [],
      sm2Entries: [],
      recentQuestionIds: [],
      sessionCorrect: 0,
      sessionTotal: 0,
      streakCount: 0,
      bestStreak: 0,
      // Adaptive UX state
      sessionMode: "adventure" as SessionMode,
      onboardingComplete: false,
      lastMasteredSubtopic: null,
      sessionMasteries: [],
      sessionImproved: [],
      sessionWeakest: [],

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
        const prevStatus = mastery.status;
        const prevScore = mastery.score;
        const updatedMastery = updateMastery(mastery, isCorrect);
        masteryMap.set(question.subtopic, updatedMastery);

        // Check for mastery achievement
        const newMasteries = [...state.sessionMasteries];
        if (prevStatus !== "mastered" && updatedMastery.status === "mastered") {
          newMasteries.push(question.subtopic);
          set({ lastMasteredSubtopic: question.subtopic });
          EventBus.emit(GameEvents.MASTERY_ACHIEVED, { subtopic: question.subtopic });
        }

        // Track session improvement
        const scoreDelta = updatedMastery.score - prevScore;
        const improved = [...state.sessionImproved];
        const existingImproved = improved.find(i => i.subtopic === question.subtopic);
        if (existingImproved) {
          existingImproved.delta += scoreDelta;
        } else if (scoreDelta !== 0) {
          improved.push({ subtopic: question.subtopic, delta: scoreDelta });
        }

        // Track weakest (wrong answers)
        const weakest = [...state.sessionWeakest];
        if (!isCorrect) {
          const existingWeak = weakest.find(w => w.subtopic === question.subtopic);
          if (existingWeak) {
            existingWeak.wrongCount++;
          } else {
            weakest.push({ subtopic: question.subtopic, wrongCount: 1 });
          }
        }

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

        // 5. Update streak and emit milestone events
        const newStreak = isCorrect ? state.streakCount + 1 : 0;
        const newBestStreak = Math.max(state.bestStreak, newStreak);

        // Emit streak milestone events
        if (newStreak === 5) {
          EventBus.emit(GameEvents.STREAK_MILESTONE, { count: 5, bonus: 20 });
        } else if (newStreak === 10) {
          EventBus.emit(GameEvents.STREAK_MILESTONE, { count: 10, bonus: 100 });
        }

        // 6. Check onboarding completion
        const newTotalResponses = state.totalResponses + 1;
        let onboardingComplete = state.onboardingComplete;
        if (!onboardingComplete && newTotalResponses >= 10) {
          onboardingComplete = true;
          EventBus.emit(GameEvents.ONBOARDING_COMPLETE);
        }

        // Convert maps back to arrays for persistence
        const masteryEntries = Array.from(masteryMap.values());
        const sm2Entries = Array.from(sm2Map.entries()).map(
          ([subtopic, smState]) => ({
            subtopic,
            state: smState,
          })
        );

        // Update Elo history (keep last 20 entries)
        const eloHistory = [
          ...state.eloHistory,
          { rating: newRating, timestamp: Date.now() },
        ].slice(-20);

        set({
          studentRating: newRating,
          totalResponses: newTotalResponses,
          eloHistory,
          masteryEntries,
          sm2Entries,
          recentQuestionIds: recentIds,
          sessionCorrect: state.sessionCorrect + (isCorrect ? 1 : 0),
          sessionTotal: state.sessionTotal + 1,
          streakCount: newStreak,
          bestStreak: newBestStreak,
          onboardingComplete,
          sessionMasteries: newMasteries,
          sessionImproved: improved,
          sessionWeakest: weakest,
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
          sessionMode: state.sessionMode,
          totalResponses: state.totalResponses, // For onboarding logic
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
       * Get count of topics due for review
       */
      getDueReviewCount: () => {
        const sm2Map = get().getSM2Map();
        let dueCount = 0;
        sm2Map.forEach((state) => {
          if (isDueForReview(state)) {
            dueCount++;
          }
        });
        return dueCount;
      },

      /**
       * Get Elo trend (positive = improving, negative = declining)
       */
      getEloTrend: () => {
        const { eloHistory } = get();
        if (eloHistory.length < 2) return 0;
        const recent = eloHistory[eloHistory.length - 1].rating;
        const previous = eloHistory[eloHistory.length - 2].rating;
        return recent - previous;
      },

      /**
       * Get all topic progress for stats display
       */
      getAllTopicProgress: () => {
        const topics: Topic[] = ["number", "calculation", "geometry", "measure", "data"];
        const masteryMap = get().getMasteryMap();
        return topics.map((topic) => ({
          topic,
          progress: Math.round(getTopicMastery(masteryMap, topic) * 100),
        }));
      },

      /**
       * Get weak topics (subtopics with low mastery that need practice)
       */
      getWeakTopics: () => {
        const { masteryEntries } = get();
        return masteryEntries
          .filter((m) => m.status !== "mastered" && m.attempts > 0)
          .sort((a, b) => a.score - b.score)
          .slice(0, 3)
          .map((m) => m.subtopic);
      },

      /**
       * Estimate questions needed to reach next Elo level
       */
      getQuestionsToNextLevel: () => {
        const { studentRating } = get();
        const levels = [700, 850, 1000, 1150, 1300];
        const nextLevel = levels.find((l) => l > studentRating);
        if (!nextLevel) return 0; // At max level
        const diff = nextLevel - studentRating;
        // Rough estimate: ~2 points per correct answer on average
        return Math.ceil(diff / 2);
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
       * Set session mode
       */
      setSessionMode: (mode) => {
        set({ sessionMode: mode });
      },

      /**
       * Reset session stats (keeps learning progress)
       */
      resetSession: () => {
        set({
          sessionCorrect: 0,
          sessionTotal: 0,
          streakCount: 0,
          lastMasteredSubtopic: null,
          sessionMasteries: [],
          sessionImproved: [],
          sessionWeakest: [],
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
          eloHistory: [],
          masteryEntries: [],
          sm2Entries: [],
          recentQuestionIds: [],
          sessionCorrect: 0,
          sessionTotal: 0,
          streakCount: 0,
          bestStreak: 0,
          sessionMode: "adventure",
          onboardingComplete: false,
          lastMasteredSubtopic: null,
          sessionMasteries: [],
          sessionImproved: [],
          sessionWeakest: [],
        });
      },
    }),
    {
      name: "capy-learning-storage",
      partialize: (state) => ({
        studentRating: state.studentRating,
        totalResponses: state.totalResponses,
        currentWorld: state.currentWorld,
        eloHistory: state.eloHistory,
        masteryEntries: state.masteryEntries,
        sm2Entries: state.sm2Entries,
        recentQuestionIds: state.recentQuestionIds,
        bestStreak: state.bestStreak,
        onboardingComplete: state.onboardingComplete,
      }),
    }
  )
);

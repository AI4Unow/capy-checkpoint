"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  signInAnonymously,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  linkWithPopup,
} from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase";
import {
  saveStudentProfile,
  getStudentProfile,
  getLearningData,
  saveLearningData,
  type StudentProfile,
  type LearningData,
} from "@/lib/firebaseSync";
import { useLearningStore } from "./learningStore";
import { useGameStore } from "./gameStore";
import { useBoutiqueStore } from "./boutiqueStore";

interface AuthState {
  user: User | null;
  profile: StudentProfile | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

interface AuthActions {
  initialize: () => () => void;
  signInAnonymous: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  linkWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  syncToCloud: () => Promise<void>;
  loadFromCloud: () => Promise<void>;
  updateDisplayName: (name: string) => Promise<void>;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      isLoading: true,
      isInitialized: false,
      error: null,

      /**
       * Initialize auth state listener
       */
      initialize: () => {
        if (!isFirebaseConfigured()) {
          set({ isLoading: false, isInitialized: true });
          return () => {};
        }

        const auth = getFirebaseAuth();
        if (!auth) {
          set({ isLoading: false, isInitialized: true });
          return () => {};
        }

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            // Load profile
            const profile = await getStudentProfile(user.uid);
            set({ user, profile, isLoading: false, isInitialized: true });

            // Load learning data from cloud if exists
            await get().loadFromCloud();
          } else {
            set({
              user: null,
              profile: null,
              isLoading: false,
              isInitialized: true,
            });
          }
        });

        return unsubscribe;
      },

      /**
       * Sign in anonymously (for quick start)
       */
      signInAnonymous: async () => {
        const auth = getFirebaseAuth();
        if (!auth) return;

        try {
          set({ isLoading: true, error: null });
          const { user } = await signInAnonymously(auth);
          await saveStudentProfile(user.uid, {
            displayName: "Student",
          });
          set({ isLoading: false });
        } catch (err) {
          set({
            isLoading: false,
            error: err instanceof Error ? err.message : "Sign in failed",
          });
        }
      },

      /**
       * Sign in with Google
       */
      signInWithGoogle: async () => {
        const auth = getFirebaseAuth();
        if (!auth) return;

        try {
          set({ isLoading: true, error: null });
          const provider = new GoogleAuthProvider();
          const { user } = await signInWithPopup(auth, provider);
          await saveStudentProfile(user.uid, {
            displayName: user.displayName || "Student",
            avatarUrl: user.photoURL || undefined,
          });
          set({ isLoading: false });
        } catch (err) {
          set({
            isLoading: false,
            error: err instanceof Error ? err.message : "Sign in failed",
          });
        }
      },

      /**
       * Link anonymous account to Google
       */
      linkWithGoogle: async () => {
        const auth = getFirebaseAuth();
        if (!auth) return;

        const { user } = get();
        if (!user || !user.isAnonymous) return;

        try {
          set({ isLoading: true, error: null });
          const provider = new GoogleAuthProvider();
          const result = await linkWithPopup(user, provider);
          await saveStudentProfile(result.user.uid, {
            displayName: result.user.displayName || "Student",
            avatarUrl: result.user.photoURL || undefined,
          });
          set({ isLoading: false });
        } catch (err) {
          set({
            isLoading: false,
            error: err instanceof Error ? err.message : "Linking failed",
          });
        }
      },

      /**
       * Sign out
       */
      signOut: async () => {
        const auth = getFirebaseAuth();
        if (!auth) return;

        try {
          // Save data before signing out
          await get().syncToCloud();
          await firebaseSignOut(auth);
          set({ user: null, profile: null });
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : "Sign out failed",
          });
        }
      },

      /**
       * Sync local data to cloud
       */
      syncToCloud: async () => {
        const { user } = get();
        if (!user || !isFirebaseConfigured()) return;

        const learningState = useLearningStore.getState();
        const gameState = useGameStore.getState();
        const boutiqueState = useBoutiqueStore.getState();

        const data: Omit<LearningData, "lastUpdated"> = {
          studentRating: learningState.studentRating,
          totalResponses: learningState.totalResponses,
          currentWorld: learningState.currentWorld,
          masteryEntries: learningState.masteryEntries,
          sm2Entries: learningState.sm2Entries,
          bestStreak: learningState.bestStreak,
          totalCoins: gameState.coins,
          unlockedItems: boutiqueState.ownedItems,
          equippedItems: boutiqueState.equipped,
        };

        await saveLearningData(user.uid, data);
      },

      /**
       * Load data from cloud
       */
      loadFromCloud: async () => {
        const { user } = get();
        if (!user || !isFirebaseConfigured()) return;

        const cloudData = await getLearningData(user.uid);
        if (!cloudData) return;

        // Merge with local data (cloud takes precedence if more responses)
        const learningState = useLearningStore.getState();

        if (cloudData.totalResponses > learningState.totalResponses) {
          // Cloud has more data, use it
          useLearningStore.setState({
            studentRating: cloudData.studentRating,
            totalResponses: cloudData.totalResponses,
            currentWorld: cloudData.currentWorld,
            masteryEntries: cloudData.masteryEntries,
            sm2Entries: cloudData.sm2Entries,
            bestStreak: Math.max(
              cloudData.bestStreak,
              learningState.bestStreak
            ),
          });

          // Sync coins
          if (cloudData.totalCoins > 0) {
            useGameStore.setState({
              coins: Math.max(cloudData.totalCoins, useGameStore.getState().coins),
            });
          }

          // Sync boutique items
          useBoutiqueStore.setState((state) => ({
            ownedItems: [
              ...new Set([...state.ownedItems, ...cloudData.unlockedItems]),
            ],
            equipped: cloudData.equippedItems || state.equipped,
          }));
        }
      },

      /**
       * Update display name
       */
      updateDisplayName: async (name: string) => {
        const { user, profile } = get();
        if (!user || !isFirebaseConfigured()) return;

        await saveStudentProfile(user.uid, { displayName: name });
        set({
          profile: profile ? { ...profile, displayName: name } : null,
        });
      },
    }),
    {
      name: "capy-auth-storage",
      partialize: (state) => ({
        // Only persist minimal auth state
        isInitialized: state.isInitialized,
      }),
    }
  )
);

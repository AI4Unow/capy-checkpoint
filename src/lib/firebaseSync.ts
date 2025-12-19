import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";
import { getFirebaseDb } from "./firebase";
import type { SubtopicMastery } from "@/engine/mastery";
import type { SM2State } from "@/engine/sm2";

// Re-export for convenience
export { isFirebaseConfigured } from "./firebase";

/**
 * Student profile stored in Firestore
 */
export interface StudentProfile {
  uid: string;
  displayName: string;
  avatarUrl?: string;
  createdAt: Date;
  lastPlayed: Date;
}

/**
 * Learning data stored in Firestore
 */
export interface LearningData {
  studentRating: number;
  totalResponses: number;
  currentWorld: number;
  masteryEntries: SubtopicMastery[];
  sm2Entries: { subtopic: string; state: SM2State }[];
  bestStreak: number;
  totalCoins: number;
  unlockedItems: string[];
  lastUpdated: Date;
}

/**
 * Session history entry
 */
export interface SessionEntry {
  date: Date;
  questionsAnswered: number;
  correctCount: number;
  ratingChange: number;
  coinsEarned: number;
}

const COLLECTION_STUDENTS = "students";
const COLLECTION_LEARNING = "learning";
const COLLECTION_SESSIONS = "sessions";

/**
 * Create or update student profile
 */
export async function saveStudentProfile(
  uid: string,
  profile: Partial<StudentProfile>
): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;

  const ref = doc(db, COLLECTION_STUDENTS, uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    await updateDoc(ref, {
      ...profile,
      lastPlayed: serverTimestamp(),
    });
  } else {
    await setDoc(ref, {
      uid,
      displayName: profile.displayName || "Student",
      createdAt: serverTimestamp(),
      lastPlayed: serverTimestamp(),
      ...profile,
    });
  }
}

/**
 * Get student profile
 */
export async function getStudentProfile(
  uid: string
): Promise<StudentProfile | null> {
  const db = getFirebaseDb();
  if (!db) return null;

  const ref = doc(db, COLLECTION_STUDENTS, uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  const data = snap.data();
  return {
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
    lastPlayed: data.lastPlayed?.toDate() || new Date(),
  } as StudentProfile;
}

/**
 * Save learning data to Firestore
 */
export async function saveLearningData(
  uid: string,
  data: Omit<LearningData, "lastUpdated">
): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;

  const ref = doc(db, COLLECTION_LEARNING, uid);
  await setDoc(ref, {
    ...data,
    lastUpdated: serverTimestamp(),
  });
}

/**
 * Get learning data from Firestore
 */
export async function getLearningData(
  uid: string
): Promise<LearningData | null> {
  const db = getFirebaseDb();
  if (!db) return null;

  const ref = doc(db, COLLECTION_LEARNING, uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  const data = snap.data();

  // Convert SM2 nextReview strings back to Date objects
  const sm2Entries = (data.sm2Entries || []).map(
    (entry: { subtopic: string; state: SM2State }) => ({
      ...entry,
      state: {
        ...entry.state,
        nextReview: entry.state.nextReview
          ? new Date(entry.state.nextReview as unknown as string)
          : new Date(),
      },
    })
  );

  return {
    ...data,
    sm2Entries,
    lastUpdated: data.lastUpdated?.toDate() || new Date(),
  } as LearningData;
}

/**
 * Subscribe to learning data changes (real-time sync)
 */
export function subscribeLearningData(
  uid: string,
  callback: (data: LearningData | null) => void
): Unsubscribe {
  const db = getFirebaseDb();
  if (!db) {
    return () => {};
  }

  const ref = doc(db, COLLECTION_LEARNING, uid);

  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) {
      callback(null);
      return;
    }

    const data = snap.data();
    const sm2Entries = (data.sm2Entries || []).map(
      (entry: { subtopic: string; state: SM2State }) => ({
        ...entry,
        state: {
          ...entry.state,
          nextReview: entry.state.nextReview
            ? new Date(entry.state.nextReview as unknown as string)
            : new Date(),
        },
      })
    );

    callback({
      ...data,
      sm2Entries,
      lastUpdated: data.lastUpdated?.toDate() || new Date(),
    } as LearningData);
  });
}

/**
 * Save session history entry
 */
export async function saveSessionEntry(
  uid: string,
  session: Omit<SessionEntry, "date">
): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;

  const sessionId = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const ref = doc(db, COLLECTION_STUDENTS, uid, COLLECTION_SESSIONS, sessionId);

  const snap = await getDoc(ref);

  if (snap.exists()) {
    // Merge with existing session data for today
    const existing = snap.data() as SessionEntry;
    await updateDoc(ref, {
      questionsAnswered:
        (existing.questionsAnswered || 0) + session.questionsAnswered,
      correctCount: (existing.correctCount || 0) + session.correctCount,
      ratingChange: session.ratingChange, // Use latest rating change
      coinsEarned: (existing.coinsEarned || 0) + session.coinsEarned,
    });
  } else {
    await setDoc(ref, {
      ...session,
      date: serverTimestamp(),
    });
  }
}

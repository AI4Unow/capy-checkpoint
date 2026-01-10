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
import { addToQueue } from "./offline-queue";
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
  equippedItems?: {
    hat: string;
    accessory: string | null;
    trail: string | null;
    background: string;
  };
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
 * Request Background Sync registration (Chrome/Edge)
 */
async function requestSync(tag: string = "firebase-sync"): Promise<void> {
  if (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "SyncManager" in window
  ) {
    try {
      const reg = await navigator.serviceWorker.ready;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (reg as any).sync.register(tag);
      console.log("[Sync] Background sync registered:", tag);
    } catch {
      console.warn("[Sync] Background Sync registration failed");
    }
  }
}

/**
 * Check if we're online and Firebase is available
 */
function isOnlineAndConfigured(): boolean {
  const db = getFirebaseDb();
  return (
    typeof navigator !== "undefined" && navigator.onLine && db !== undefined
  );
}

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
 * Save learning data to Firestore with offline queue fallback
 */
export async function saveLearningData(
  uid: string,
  data: Omit<LearningData, "lastUpdated">
): Promise<void> {
  // Queue immediately if offline
  if (!isOnlineAndConfigured()) {
    await addToQueue({ type: "learning", uid, data });
    await requestSync();
    console.log("[Firebase] Offline, queued learning data");
    return;
  }

  const db = getFirebaseDb();
  if (!db) return;

  try {
    const ref = doc(db, COLLECTION_LEARNING, uid);
    await setDoc(ref, {
      ...data,
      lastUpdated: serverTimestamp(),
    });
  } catch (error) {
    // Network error - queue for retry
    console.warn("[Firebase] Save failed, queuing:", error);
    await addToQueue({ type: "learning", uid, data });
    await requestSync();
  }
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
 * Save session history entry with offline queue fallback
 */
export async function saveSessionEntry(
  uid: string,
  session: Omit<SessionEntry, "date">
): Promise<void> {
  // Queue immediately if offline
  if (!isOnlineAndConfigured()) {
    await addToQueue({ type: "session", uid, data: session });
    await requestSync();
    console.log("[Firebase] Offline, queued session entry");
    return;
  }

  const db = getFirebaseDb();
  if (!db) return;

  try {
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
  } catch (error) {
    // Network error - queue for retry
    console.warn("[Firebase] Session save failed, queuing:", error);
    await addToQueue({ type: "session", uid, data: session });
    await requestSync();
  }
}

// ============================================================================
// Conflict Resolution (for merging offline and online data)
// ============================================================================

interface LearningDataWithMeta extends Omit<LearningData, "lastUpdated"> {
  lastUpdated: { seconds: number } | Date;
}

/**
 * Merge local and remote learning data using conflict resolution
 * - Last-write-wins for rating and current world
 * - Max-value for cumulative stats (to never lose progress)
 * - Union for arrays
 */
export function mergeLearningData(
  local: LearningDataWithMeta,
  remote: LearningDataWithMeta
): LearningData {
  const localTime =
    local.lastUpdated instanceof Date
      ? local.lastUpdated.getTime()
      : (local.lastUpdated as { seconds: number }).seconds * 1000;
  const remoteTime =
    remote.lastUpdated instanceof Date
      ? remote.lastUpdated.getTime()
      : (remote.lastUpdated as { seconds: number }).seconds * 1000;

  const newerIsLocal = localTime > remoteTime;

  return {
    // Last-write-wins for rating/world
    studentRating: newerIsLocal ? local.studentRating : remote.studentRating,
    currentWorld: newerIsLocal ? local.currentWorld : remote.currentWorld,
    // Max-value for cumulative stats (never lose progress)
    totalResponses: Math.max(local.totalResponses, remote.totalResponses),
    bestStreak: Math.max(local.bestStreak, remote.bestStreak),
    totalCoins: Math.max(local.totalCoins, remote.totalCoins),
    // Merge arrays
    masteryEntries: mergeMasteryEntries(
      local.masteryEntries,
      remote.masteryEntries
    ),
    sm2Entries: mergeSM2Entries(local.sm2Entries, remote.sm2Entries),
    unlockedItems: [
      ...new Set([...local.unlockedItems, ...remote.unlockedItems]),
    ],
    // Last-write-wins for equipped items
    equippedItems: newerIsLocal ? local.equippedItems : remote.equippedItems,
    lastUpdated: new Date(),
  };
}

/**
 * Merge mastery entries - keep highest mastery score per subtopic
 */
function mergeMasteryEntries(
  local: SubtopicMastery[],
  remote: SubtopicMastery[]
): SubtopicMastery[] {
  const merged = new Map<string, SubtopicMastery>();

  // Add all remote entries first
  for (const entry of remote) {
    merged.set(entry.subtopic, entry);
  }

  // Override with local if higher mastery
  for (const entry of local) {
    const existing = merged.get(entry.subtopic);
    if (!existing || entry.score > existing.score) {
      merged.set(entry.subtopic, entry);
    }
  }

  return Array.from(merged.values());
}

/**
 * Merge SM2 entries - keep latest nextReview per subtopic
 */
function mergeSM2Entries(
  local: { subtopic: string; state: SM2State }[],
  remote: { subtopic: string; state: SM2State }[]
): { subtopic: string; state: SM2State }[] {
  const merged = new Map<string, { subtopic: string; state: SM2State }>();

  // Add all remote entries first
  for (const entry of remote) {
    merged.set(entry.subtopic, entry);
  }

  // Override with local if more recent review
  for (const entry of local) {
    const existing = merged.get(entry.subtopic);
    if (!existing) {
      merged.set(entry.subtopic, entry);
    } else {
      // Keep the one with higher repetitions (more practiced)
      if (entry.state.repetitions > existing.state.repetitions) {
        merged.set(entry.subtopic, entry);
      }
    }
  }

  return Array.from(merged.values());
}

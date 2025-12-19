import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";

/**
 * Firebase configuration
 * Replace with your own Firebase project config
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

// Lazy initialization to avoid SSR issues
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

/**
 * Check if Firebase is configured with valid credentials
 */
export function isFirebaseConfigured(): boolean {
  return Boolean(
    typeof window !== "undefined" &&
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  );
}

/**
 * Get Firebase app instance (lazy init)
 */
export function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === "undefined") return null;
  if (!isFirebaseConfigured()) return null;

  if (!app) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  }
  return app;
}

/**
 * Get Firebase Auth instance (lazy init)
 */
export function getFirebaseAuth(): Auth | null {
  if (!getFirebaseApp()) return null;

  if (!auth) {
    auth = getAuth(app!);
  }
  return auth;
}

/**
 * Get Firestore instance (lazy init)
 */
export function getFirebaseDb(): Firestore | null {
  if (!getFirebaseApp()) return null;

  if (!db) {
    db = getFirestore(app!);
  }
  return db;
}

// Export getters for backward compatibility
export { getFirebaseAuth as auth, getFirebaseDb as db };
export default getFirebaseApp;

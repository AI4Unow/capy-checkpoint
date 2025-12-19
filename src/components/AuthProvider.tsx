"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/stores/authStore";
import { isFirebaseConfigured } from "@/lib/firebaseSync";

/**
 * Auth provider that initializes Firebase auth
 * and handles auto-sync on visibility change
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { initialize, syncToCloud, isInitialized } = useAuthStore();
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize auth on mount
  useEffect(() => {
    const unsubscribe = initialize();
    return () => unsubscribe();
  }, [initialize]);

  // Auto-sync on visibility change (when user leaves tab)
  useEffect(() => {
    if (!isFirebaseConfigured()) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        // Debounce sync
        if (syncTimeoutRef.current) {
          clearTimeout(syncTimeoutRef.current);
        }
        syncTimeoutRef.current = setTimeout(() => {
          syncToCloud();
        }, 500);
      }
    };

    const handleBeforeUnload = () => {
      syncToCloud();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [syncToCloud]);

  // Show loading state while initializing
  if (!isInitialized && isFirebaseConfigured()) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sage border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text font-[family-name:var(--font-nunito)]">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

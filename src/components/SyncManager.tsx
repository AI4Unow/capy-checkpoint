"use client";

import { useEffect, useCallback } from "react";
import {
  getQueue,
  removeFromQueue,
  updateRetryCount,
} from "@/lib/offline-queue";
import { saveLearningData, saveSessionEntry } from "@/lib/firebaseSync";

/**
 * SyncManager - Handles offline queue sync when coming back online
 *
 * Two sync mechanisms:
 * 1. Background Sync (Chrome/Edge): SW broadcasts message, we process
 * 2. Online event fallback (Firefox/Safari): Direct processing
 *
 * Also handles initial sync check on mount.
 */
export function SyncManager() {
  const processQueue = useCallback(async () => {
    console.log("[SyncManager] Processing offline queue");
    const queue = await getQueue();

    if (queue.length === 0) {
      console.log("[SyncManager] Queue empty");
      return;
    }

    console.log(`[SyncManager] Processing ${queue.length} queued operations`);

    for (const op of queue) {
      try {
        if (op.type === "learning") {
          await saveLearningData(
            op.uid,
            op.data as Parameters<typeof saveLearningData>[1]
          );
        } else if (op.type === "session") {
          await saveSessionEntry(
            op.uid,
            op.data as Parameters<typeof saveSessionEntry>[1]
          );
        }
        await removeFromQueue(op.id);
        console.log(`[SyncManager] Synced operation ${op.id}`);
      } catch (error) {
        console.warn(`[SyncManager] Failed to sync ${op.id}:`, error);
        const shouldRetry = await updateRetryCount(op.id);
        if (!shouldRetry) {
          console.warn(`[SyncManager] Max retries exceeded for ${op.id}`);
        }
      }
    }
  }, []);

  useEffect(() => {
    // Handle online event (fallback for browsers without Background Sync)
    const handleOnline = () => {
      console.log("[SyncManager] Online event detected");
      // Only use fallback if Background Sync is not available
      if (!("SyncManager" in window)) {
        processQueue();
      }
    };

    // Handle messages from Service Worker (Background Sync)
    const handleSWMessage = (event: MessageEvent) => {
      if (event.data?.type === "SYNC_QUEUE") {
        console.log("[SyncManager] Received sync message from SW");
        processQueue();
      }
    };

    // Process queue on mount if online (catch any pending ops)
    if (navigator.onLine) {
      processQueue();
    }

    // Listen for online events
    window.addEventListener("online", handleOnline);

    // Listen for SW messages
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", handleSWMessage);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.removeEventListener("message", handleSWMessage);
      }
    };
  }, [processQueue]);

  return null;
}

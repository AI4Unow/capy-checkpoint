import { openDB, DBSchema, IDBPDatabase } from "idb";

// Types
export type OperationType = "learning" | "session" | "profile";

export interface PendingOperation {
  id: string;
  type: OperationType;
  uid: string;
  data: Record<string, unknown>;
  timestamp: number;
  retries: number;
}

// DB Schema
interface OfflineDB extends DBSchema {
  "sync-queue": {
    key: string;
    value: PendingOperation;
    indexes: { "by-timestamp": number };
  };
}

// Constants
const DB_NAME = "mathie-offline";
const DB_VERSION = 1;
const STORE_NAME = "sync-queue";
const MAX_QUEUE_SIZE = 100;
const MAX_RETRIES = 5;

// Singleton DB instance
let dbPromise: Promise<IDBPDatabase<OfflineDB>> | null = null;

// High-resolution sequence counter (resets each ms, wraps at 10000)
let lastTimestamp = 0;
let sequenceCounter = 0;

function getOrderedTimestamp(): number {
  const now = Date.now();
  if (now === lastTimestamp) {
    sequenceCounter = (sequenceCounter + 1) % 10000;
  } else {
    lastTimestamp = now;
    sequenceCounter = 0;
  }
  // timestamp * 10000 + sequence gives unique ordering
  return now * 10000 + sequenceCounter;
}

function getDB(): Promise<IDBPDatabase<OfflineDB>> {
  if (!dbPromise) {
    dbPromise = openDB<OfflineDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("by-timestamp", "timestamp");
      },
    });
  }
  return dbPromise;
}

/**
 * Add operation to queue with LRU eviction (atomic transaction)
 */
export async function addToQueue(
  op: Omit<PendingOperation, "id" | "timestamp" | "retries">
): Promise<string> {
  try {
    const db = await getDB();

    const operation: PendingOperation = {
      ...op,
      id: crypto.randomUUID(),
      timestamp: getOrderedTimestamp(),
      retries: 0,
    };

    // Use single transaction for atomicity (prevents race condition)
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.store;

    // Check count and evict oldest if needed
    const count = await store.count();
    if (count >= MAX_QUEUE_SIZE) {
      const index = store.index("by-timestamp");
      const cursor = await index.openCursor();
      if (cursor) {
        await cursor.delete(); // Delete oldest
      }
    }

    // Add new operation
    await store.add(operation);
    await tx.done;

    return operation.id;
  } catch (error) {
    console.error("[OfflineQueue] Failed to add operation:", error);
    throw error;
  }
}

/**
 * Get all pending operations (oldest first)
 */
export async function getQueue(): Promise<PendingOperation[]> {
  try {
    const db = await getDB();
    return db.getAllFromIndex(STORE_NAME, "by-timestamp");
  } catch (error) {
    console.error("[OfflineQueue] Failed to get queue:", error);
    return [];
  }
}

/**
 * Remove operation by ID
 */
export async function removeFromQueue(id: string): Promise<void> {
  try {
    const db = await getDB();
    await db.delete(STORE_NAME, id);
  } catch (error) {
    console.error("[OfflineQueue] Failed to remove operation:", error);
  }
}

/**
 * Clear entire queue
 */
export async function clearQueue(): Promise<void> {
  try {
    const db = await getDB();
    await db.clear(STORE_NAME);
  } catch (error) {
    console.error("[OfflineQueue] Failed to clear queue:", error);
  }
}

/**
 * Get queue size
 */
export async function getQueueCount(): Promise<number> {
  try {
    const db = await getDB();
    return db.count(STORE_NAME);
  } catch (error) {
    console.error("[OfflineQueue] Failed to get count:", error);
    return 0;
  }
}

/**
 * Increment retry count for failed operation.
 * Returns true if under max retries, false if should be discarded.
 */
export async function updateRetryCount(id: string): Promise<boolean> {
  try {
    const db = await getDB();
    const op = await db.get(STORE_NAME, id);
    if (op) {
      op.retries += 1;
      if (op.retries > MAX_RETRIES) {
        // Max retries exceeded, remove from queue
        await db.delete(STORE_NAME, id);
        console.warn(
          `[OfflineQueue] Operation ${id} exceeded max retries, discarded`
        );
        return false;
      }
      await db.put(STORE_NAME, op);
      return true;
    }
    return false;
  } catch (error) {
    console.error("[OfflineQueue] Failed to update retry count:", error);
    return false;
  }
}

/**
 * Check if queue has pending items
 */
export async function hasQueuedOperations(): Promise<boolean> {
  const count = await getQueueCount();
  return count > 0;
}

/**
 * Reset DB promise and delete database (for testing)
 */
export async function resetDBForTesting(): Promise<void> {
  if (dbPromise) {
    const db = await dbPromise;
    db.close();
  }
  dbPromise = null;
  lastTimestamp = 0;
  sequenceCounter = 0;
  // Delete the database to ensure clean state
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => resolve(); // Proceed anyway if blocked
  });
}

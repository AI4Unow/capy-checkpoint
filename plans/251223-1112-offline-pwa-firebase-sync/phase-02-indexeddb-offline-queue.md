# Phase 2: IndexedDB Offline Queue

## Context Links

- [Main Plan](./plan.md)
- [Background Sync Research](./research/researcher-02-background-sync-idb.md)
- [Phase 1: Service Worker](./phase-01-service-worker-setup.md)

## Overview

Create IndexedDB-based queue for storing Firebase operations when offline. Use `idb` library for Promise-based API. Implement LRU eviction to prevent quota overflow.

## Key Insights

- `idb` by Jake Archibald = industry standard wrapper
- IndexedDB survives browser restart (unlike localStorage for large data)
- LRU eviction needed: cap at 100 pending operations
- Queue operations: add, getAll, remove, clear, count

## Requirements

1. Install `idb` package
2. Create `src/lib/offline-queue.ts` with typed operations
3. Define `PendingOperation` interface
4. Implement LRU eviction when queue exceeds 100
5. Add timestamp and retry count tracking
6. Export async queue management functions

## Architecture

```
offline-queue.ts
├── openDB('mathie-offline', 1)
│   └── objectStore: 'sync-queue' (keyPath: 'id')
│       └── index: 'timestamp' (for LRU)
├── Operations
│   ├── addToQueue(op) → LRU eviction if >100
│   ├── getQueue() → all pending ops
│   ├── removeFromQueue(id)
│   ├── clearQueue()
│   ├── getQueueCount()
│   └── updateRetryCount(id)
└── Types
    └── PendingOperation { id, type, uid, data, timestamp, retries }
```

## Related Code Files

| File | Action | Purpose |
|------|--------|---------|
| `src/lib/offline-queue.ts` | Create | Queue management |
| `package.json` | Modify | Add idb dependency |
| `src/lib/firebaseSync.ts` | - | Will use queue in Phase 3 |

## Implementation Steps

### 1. Install idb

```bash
npm install idb
```

### 2. Create src/lib/offline-queue.ts

```typescript
import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Types
export type OperationType = 'learning' | 'session' | 'profile';

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
  'sync-queue': {
    key: string;
    value: PendingOperation;
    indexes: { 'by-timestamp': number };
  };
}

// Constants
const DB_NAME = 'mathie-offline';
const DB_VERSION = 1;
const STORE_NAME = 'sync-queue';
const MAX_QUEUE_SIZE = 100;

// Singleton DB instance
let dbPromise: Promise<IDBPDatabase<OfflineDB>> | null = null;

function getDB(): Promise<IDBPDatabase<OfflineDB>> {
  if (!dbPromise) {
    dbPromise = openDB<OfflineDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('by-timestamp', 'timestamp');
      },
    });
  }
  return dbPromise;
}

/**
 * Add operation to queue with LRU eviction
 */
export async function addToQueue(
  op: Omit<PendingOperation, 'id' | 'timestamp' | 'retries'>
): Promise<string> {
  const db = await getDB();

  // LRU eviction if queue full
  const count = await db.count(STORE_NAME);
  if (count >= MAX_QUEUE_SIZE) {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const index = tx.store.index('by-timestamp');
    const cursor = await index.openCursor();
    if (cursor) {
      await cursor.delete(); // Delete oldest
    }
    await tx.done;
  }

  const operation: PendingOperation = {
    ...op,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    retries: 0,
  };

  await db.add(STORE_NAME, operation);
  return operation.id;
}

/**
 * Get all pending operations (oldest first)
 */
export async function getQueue(): Promise<PendingOperation[]> {
  const db = await getDB();
  return db.getAllFromIndex(STORE_NAME, 'by-timestamp');
}

/**
 * Remove operation by ID
 */
export async function removeFromQueue(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}

/**
 * Clear entire queue
 */
export async function clearQueue(): Promise<void> {
  const db = await getDB();
  await db.clear(STORE_NAME);
}

/**
 * Get queue size
 */
export async function getQueueCount(): Promise<number> {
  const db = await getDB();
  return db.count(STORE_NAME);
}

/**
 * Increment retry count for failed operation
 */
export async function updateRetryCount(id: string): Promise<void> {
  const db = await getDB();
  const op = await db.get(STORE_NAME, id);
  if (op) {
    op.retries += 1;
    await db.put(STORE_NAME, op);
  }
}

/**
 * Check if queue has pending items
 */
export async function hasQueuedOperations(): Promise<boolean> {
  const count = await getQueueCount();
  return count > 0;
}
```

### 3. Add Unit Tests (optional but recommended)

```typescript
// src/lib/offline-queue.test.ts
import { addToQueue, getQueue, removeFromQueue, clearQueue } from './offline-queue';

describe('offline-queue', () => {
  beforeEach(async () => {
    await clearQueue();
  });

  it('adds and retrieves operations', async () => {
    await addToQueue({ type: 'learning', uid: 'test', data: { foo: 1 } });
    const queue = await getQueue();
    expect(queue).toHaveLength(1);
    expect(queue[0].type).toBe('learning');
  });

  it('removes operation by ID', async () => {
    const id = await addToQueue({ type: 'session', uid: 'test', data: {} });
    await removeFromQueue(id);
    const queue = await getQueue();
    expect(queue).toHaveLength(0);
  });
});
```

## Todo List

- [ ] Install idb package
- [ ] Create src/lib/offline-queue.ts
- [ ] Implement PendingOperation interface
- [ ] Implement addToQueue with LRU eviction
- [ ] Implement getQueue (oldest first)
- [ ] Implement removeFromQueue
- [ ] Implement clearQueue
- [ ] Implement getQueueCount
- [ ] Implement updateRetryCount
- [ ] Add hasQueuedOperations helper
- [ ] Test: Add 105 items, verify oldest 5 evicted
- [ ] Test: Queue persists after page reload

## Success Criteria

1. Queue stores operations in IndexedDB
2. LRU eviction removes oldest when >100 items
3. Queue persists across browser sessions
4. All operations have id, timestamp, retries

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| IndexedDB not available | Very Low | High | All modern browsers support |
| Quota exceeded | Low | Medium | LRU eviction prevents |
| Data corruption | Very Low | High | Use transactions properly |

## Security Considerations

- No sensitive data stored (uid is Firebase-provided)
- Data auto-expires via LRU
- IndexedDB same-origin policy applies

## Next Steps

After Phase 2 complete:
1. Proceed to [Phase 3: Firebase Sync Integration](./phase-03-firebase-sync-integration.md)
2. Wire queue into firebaseSync.ts functions

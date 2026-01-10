# Phase 3: Firebase Sync Integration

## Context Links

- [Main Plan](./plan.md)
- [Background Sync Research](./research/researcher-02-background-sync-idb.md)
- [Phase 2: IndexedDB Queue](./phase-02-indexeddb-offline-queue.md)
- [Current firebaseSync.ts](../../../capy-checkpoint-next/src/lib/firebaseSync.ts)

## Overview

Modify existing `firebaseSync.ts` to queue operations when offline. Implement Background Sync handler in service worker. Add conflict resolution using last-write-wins with max-value merge.

## Key Insights

- Background Sync API: Chrome/Edge only, fallback needed for Firefox/Safari
- Fallback: `window.addEventListener('online', processQueue)`
- Conflict resolution: last-write-wins for rating, max() for cumulative stats
- Retry limit: 3 attempts before dropping operation

## Requirements

1. Modify `saveLearningData` to check `navigator.onLine`
2. Queue to IndexedDB when offline
3. Request Background Sync registration
4. Add sync handler in service worker
5. Implement conflict merge for learning data
6. Add fallback online listener for unsupported browsers

## Architecture

```
firebaseSync.ts (enhanced)
├── saveLearningData(uid, data)
│   ├── IF online → try Firestore
│   │   ├── success → return
│   │   └── fail → queueOperation() + requestSync()
│   └── IF offline → queueOperation() + requestSync()
├── saveSessionEntry(uid, data) [same pattern]
└── queueOperation(op) → offline-queue.ts

sw.ts (sync handler)
├── self.addEventListener('sync', ...)
│   └── tag === 'firebase-sync' → processQueue()
└── processQueue()
    ├── getQueue()
    ├── for each op:
    │   ├── syncLearningData() / syncSessionEntry()
    │   ├── success → removeFromQueue(id)
    │   └── fail → updateRetryCount() or remove if >3
    └── mergeConflict() for learning data

layout.tsx (fallback)
└── window.addEventListener('online', processQueue)
```

## Related Code Files

| File | Action | Purpose |
|------|--------|---------|
| `src/lib/firebaseSync.ts` | Modify | Add queue integration |
| `src/app/sw.ts` | Modify | Add sync event handler |
| `src/lib/offline-queue.ts` | Import | Queue operations |
| `src/app/layout.tsx` | Modify | Add online fallback |

## Implementation Steps

### 1. Modify firebaseSync.ts

```typescript
// Add imports
import { addToQueue, getQueue, removeFromQueue, updateRetryCount } from './offline-queue';

// Add Background Sync request helper
async function requestSync(tag: string = 'firebase-sync'): Promise<void> {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    try {
      const reg = await navigator.serviceWorker.ready;
      await reg.sync.register(tag);
    } catch {
      console.warn('[Sync] Background Sync registration failed');
    }
  }
}

// Modify saveLearningData
export async function saveLearningData(
  uid: string,
  data: Omit<LearningData, 'lastUpdated'>
): Promise<void> {
  const db = getFirebaseDb();

  // Offline or no DB → queue
  if (!navigator.onLine || !db) {
    await addToQueue({ type: 'learning', uid, data });
    await requestSync();
    return;
  }

  try {
    const ref = doc(db, COLLECTION_LEARNING, uid);
    await setDoc(ref, { ...data, lastUpdated: serverTimestamp() });
  } catch (error) {
    // Network error → queue for retry
    console.warn('[Firebase] Offline, queuing learning data');
    await addToQueue({ type: 'learning', uid, data });
    await requestSync();
  }
}

// Same pattern for saveSessionEntry
export async function saveSessionEntry(
  uid: string,
  session: Omit<SessionEntry, 'date'>
): Promise<void> {
  const db = getFirebaseDb();

  if (!navigator.onLine || !db) {
    await addToQueue({ type: 'session', uid, data: session });
    await requestSync();
    return;
  }

  // ... existing logic with try/catch fallback to queue
}
```

### 2. Add Conflict Merge Function

```typescript
// In firebaseSync.ts
interface LearningDataWithMeta extends LearningData {
  lastUpdated: { seconds: number } | Date;
}

function mergeLearningData(
  local: LearningDataWithMeta,
  remote: LearningDataWithMeta
): LearningData {
  const localTime = local.lastUpdated instanceof Date
    ? local.lastUpdated.getTime()
    : local.lastUpdated.seconds * 1000;
  const remoteTime = remote.lastUpdated instanceof Date
    ? remote.lastUpdated.getTime()
    : remote.lastUpdated.seconds * 1000;

  return {
    // Last-write-wins for rating/world
    studentRating: localTime > remoteTime ? local.studentRating : remote.studentRating,
    currentWorld: localTime > remoteTime ? local.currentWorld : remote.currentWorld,
    // Max-value for cumulative stats
    totalResponses: Math.max(local.totalResponses, remote.totalResponses),
    bestStreak: Math.max(local.bestStreak, remote.bestStreak),
    totalCoins: Math.max(local.totalCoins, remote.totalCoins),
    // Merge arrays
    masteryEntries: mergeMasteryEntries(local.masteryEntries, remote.masteryEntries),
    sm2Entries: mergeSM2Entries(local.sm2Entries, remote.sm2Entries),
    unlockedItems: [...new Set([...local.unlockedItems, ...remote.unlockedItems])],
    lastUpdated: new Date(),
  };
}

function mergeMasteryEntries(local: SubtopicMastery[], remote: SubtopicMastery[]): SubtopicMastery[] {
  const merged = new Map<string, SubtopicMastery>();
  for (const entry of remote) {
    merged.set(entry.subtopic, entry);
  }
  for (const entry of local) {
    const existing = merged.get(entry.subtopic);
    if (!existing || entry.masteryScore > existing.masteryScore) {
      merged.set(entry.subtopic, entry);
    }
  }
  return Array.from(merged.values());
}
```

### 3. Add Sync Handler in sw.ts

```typescript
// In sw.ts - add sync event listener
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

// Note: SW has separate Firebase instance
const firebaseConfig = { /* config from env */ };

self.addEventListener('sync', (event: SyncEvent) => {
  if (event.tag === 'firebase-sync') {
    event.waitUntil(processQueue());
  }
});

async function processQueue(): Promise<void> {
  const queue = await getQueue();
  const MAX_RETRIES = 3;

  for (const op of queue) {
    try {
      switch (op.type) {
        case 'learning':
          await syncLearningToFirebase(op.uid, op.data);
          break;
        case 'session':
          await syncSessionToFirebase(op.uid, op.data);
          break;
      }
      await removeFromQueue(op.id);
    } catch (error) {
      if (op.retries >= MAX_RETRIES) {
        console.warn('[Sync] Max retries, dropping operation:', op.id);
        await removeFromQueue(op.id);
      } else {
        await updateRetryCount(op.id);
      }
    }
  }
}
```

### 4. Add Online Fallback in Layout

```typescript
// src/components/SyncManager.tsx (new file)
'use client';

import { useEffect } from 'react';
import { getQueue, removeFromQueue } from '@/lib/offline-queue';
import { saveLearningData, saveSessionEntry } from '@/lib/firebaseSync';

export function SyncManager() {
  useEffect(() => {
    const handleOnline = async () => {
      // Fallback sync for browsers without Background Sync
      if (!('SyncManager' in window)) {
        const queue = await getQueue();
        for (const op of queue) {
          try {
            if (op.type === 'learning') {
              await saveLearningData(op.uid, op.data);
            } else if (op.type === 'session') {
              await saveSessionEntry(op.uid, op.data);
            }
            await removeFromQueue(op.id);
          } catch {
            // Will retry on next online event
          }
        }
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  return null;
}
```

## Todo List

- [ ] Add offline-queue imports to firebaseSync.ts
- [ ] Add requestSync helper function
- [ ] Modify saveLearningData with offline check
- [ ] Modify saveSessionEntry with offline check
- [ ] Implement mergeLearningData conflict resolution
- [ ] Implement mergeMasteryEntries helper
- [ ] Implement mergeSM2Entries helper
- [ ] Add sync event listener in sw.ts
- [ ] Create processQueue function in sw.ts
- [ ] Create SyncManager.tsx component
- [ ] Add SyncManager to layout.tsx
- [ ] Test: Play offline, reconnect, verify Firestore updated
- [ ] Test: Conflict scenario with 2 devices

## Success Criteria

1. Offline operations queue to IndexedDB
2. Background Sync triggers on reconnect (Chrome/Edge)
3. Online event fallback works (Firefox/Safari)
4. Conflict merge preserves highest progress values
5. Failed operations retry up to 3 times

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Background Sync unsupported | Medium | Medium | Online event fallback |
| Firebase auth expired | Medium | Medium | Silent refresh on reconnect |
| Merge loses data | Low | High | Max-value merge for stats |
| SW can't access Firebase | Medium | High | Test thoroughly, may need API route |

## Security Considerations

- Firebase config in SW: consider env injection at build time
- Queue contains uid (Firebase-provided, not PII)
- Auth token refresh handled by Firebase SDK

## Next Steps

After Phase 3 complete:
1. Proceed to [Phase 4: AI Hints Offline](./phase-04-ai-hints-offline.md)
2. May need API route for SW sync if direct Firestore fails

# Brainstorm: Offline PWA with Firebase Sync

**Date:** 2025-12-23
**Approach:** Hybrid with Background Sync (Approach 3)
**Status:** Decision Made

---

## Problem Statement

Make Mathie fully playable offline while maintaining Firebase sync for authenticated users. The game should:
1. Work without internet after initial load
2. Queue learning progress when offline
3. Sync to Firestore when connection restored
4. Cache AI hints for offline use

---

## Current Architecture Analysis

### Already Offline-Friendly
| Component | Status | Notes |
|-----------|--------|-------|
| Question bank | ✅ | 447 questions in `all-questions.json` |
| State persistence | ✅ | Zustand → localStorage |
| PWA manifest | ✅ | Exists with icons, standalone mode |
| Game engine | ✅ | Phaser 3 client-side |
| Audio | ✅ | SynthSounds (Web Audio API) |

### Online Dependencies
| Dependency | Current Usage | Offline Strategy |
|------------|---------------|------------------|
| `/api/hint` | Gemini AI hints | Pre-generate + cache |
| Firebase Auth | User login | Persist auth state |
| Firestore | Cloud sync | Queue + Background Sync |
| Next.js SSR | Initial load | Service Worker cache |

---

## Recommended Solution Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Service Worker (Serwist)                  │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │ Cache Strategies │  │ Offline Queue   │  │ Background  │ │
│  │ - App Shell      │  │ (IndexedDB)     │  │ Sync API    │ │
│  │ - Static Assets  │  │ - saveLearning  │  │             │ │
│  │ - Questions JSON │  │ - saveSession   │  │ Process on  │ │
│  │ - AI Hints       │  │ - saveProfile   │  │ reconnect   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │ learningStore   │  │ offlineSync.ts  │  │ Online      │ │
│  │ (Zustand)       │──▶│ Queue writes    │──▶│ Indicator   │ │
│  │ localStorage    │  │ Check navigator │  │ Component   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
│                              │                               │
│                              ▼                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ firebaseSync.ts (Modified)                              │ │
│  │ - Try Firestore first                                   │ │
│  │ - On failure → Queue to IndexedDB                       │ │
│  │ - Register 'firebase-sync' event                        │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Components

### 1. Service Worker Setup (Serwist)

**Why Serwist over next-pwa:**
- Active maintenance (next-pwa deprecated)
- Better Next.js 14+ App Router support
- TypeScript-first

**Package:** `@serwist/next` + `serwist`

**Cache Strategies:**
```typescript
// sw.ts (Service Worker)
const strategies = {
  // App shell - cache first, update in background
  appShell: new StaleWhileRevalidate({
    cacheName: 'app-shell',
    plugins: [new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 7 * 24 * 60 * 60 })]
  }),

  // Questions - cache first (rarely changes)
  questions: new CacheFirst({
    cacheName: 'questions-v1',
    plugins: [new ExpirationPlugin({ maxAgeSeconds: 30 * 24 * 60 * 60 })]
  }),

  // API hints - network first, cache fallback
  hints: new NetworkFirst({
    cacheName: 'ai-hints',
    plugins: [new ExpirationPlugin({ maxEntries: 500 })]
  })
};
```

### 2. IndexedDB Offline Queue

**Database Schema:**
```typescript
// lib/offlineQueue.ts
interface PendingOperation {
  id: string;           // Auto-generated UUID
  type: 'learning' | 'session' | 'profile';
  uid: string;          // Firebase user ID
  data: object;         // Payload to sync
  timestamp: number;    // Queue time
  retries: number;      // Retry count
}

// Operations
- addToQueue(operation: PendingOperation)
- getQueue(): PendingOperation[]
- removeFromQueue(id: string)
- clearQueue()
```

### 3. Modified Firebase Sync

```typescript
// lib/firebaseSync.ts (Enhanced)
export async function saveLearningData(uid: string, data: LearningData): Promise<void> {
  if (!navigator.onLine) {
    await queueOperation({ type: 'learning', uid, data });
    await requestBackgroundSync('firebase-sync');
    return;
  }

  try {
    // Existing Firestore write
    await setDoc(ref, { ...data, lastUpdated: serverTimestamp() });
  } catch (error) {
    // Network error - queue for later
    await queueOperation({ type: 'learning', uid, data });
    await requestBackgroundSync('firebase-sync');
  }
}
```

### 4. Background Sync Handler

```typescript
// sw.ts (Service Worker)
self.addEventListener('sync', async (event) => {
  if (event.tag === 'firebase-sync') {
    event.waitUntil(processQueue());
  }
});

async function processQueue() {
  const queue = await getQueue();

  for (const op of queue) {
    try {
      switch (op.type) {
        case 'learning':
          await syncLearningData(op.uid, op.data);
          break;
        case 'session':
          await syncSessionEntry(op.uid, op.data);
          break;
      }
      await removeFromQueue(op.id);
    } catch (error) {
      // Increment retry, will try again on next sync
      if (op.retries < 3) {
        await updateRetryCount(op.id);
      } else {
        await removeFromQueue(op.id); // Give up after 3 retries
      }
    }
  }
}
```

### 5. AI Hints Caching Strategy

**Option A: Pre-generate (Recommended)**
- Run Gemini batch to generate hints for all 447 questions
- Store in `hints.json` (~50-100KB)
- Load with questions, no network needed

**Option B: Progressive caching**
- Cache API responses per question ID
- First encounter = network request
- Subsequent = cached response

**Recommendation:** Option A for reliability + Option B for new questions

### 6. Online Status Indicator

```typescript
// components/OnlineIndicator.tsx
export function OnlineIndicator() {
  const [online, setOnline] = useState(navigator.onLine);
  const [pending, setPending] = useState(0);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  if (online && pending === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 px-3 py-1 rounded-full text-sm">
      {online ? `Syncing ${pending} items...` : '📴 Offline mode'}
    </div>
  );
}
```

---

## Implementation Phases

### Phase 1: Service Worker + Asset Caching (~2 days)
1. Install `@serwist/next` + `serwist`
2. Configure Serwist in `next.config.js`
3. Create `sw.ts` with cache strategies
4. Cache app shell, static assets, questions JSON
5. Test: Disable network in DevTools, game loads

### Phase 2: IndexedDB Queue (~1 day)
1. Create `lib/offlineQueue.ts`
2. Implement queue operations (add, get, remove)
3. Add navigator.onLine checks
4. Test: Queue operations when offline

### Phase 3: Firebase Sync Integration (~2 days)
1. Modify `firebaseSync.ts` to use queue
2. Implement Background Sync handler in SW
3. Add conflict resolution (last-write-wins)
4. Test: Offline play → reconnect → verify Firestore

### Phase 4: AI Hints Offline (~1 day)
1. Generate hints for all questions via Gemini batch
2. Create `hints.json` with question ID mapping
3. Update hint service to check local first
4. Fallback to network for uncached questions

### Phase 5: UX Polish (~1 day)
1. Add OnlineIndicator component
2. Show sync status in menu
3. Toast on sync complete
4. Handle auth expiry gracefully

---

## Browser Support Considerations

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Service Worker | ✅ | ✅ | ✅ | ✅ |
| IndexedDB | ✅ | ✅ | ✅ | ✅ |
| Background Sync | ✅ | ❌ | ❌ | ✅ |
| Cache API | ✅ | ✅ | ✅ | ✅ |

**Fallback for Firefox/Safari:**
- Use `navigator.onLine` event listener
- Process queue when online event fires
- Less reliable but functional

---

## Conflict Resolution Strategy

**Scenario:** User plays on Device A (offline) and Device B (online)

**Strategy: Last-Write-Wins with Merge**
```typescript
interface SyncMeta {
  lastUpdated: Timestamp;
  deviceId: string;
}

function mergeConflict(local: LearningData, remote: LearningData): LearningData {
  // Take higher values for cumulative stats
  return {
    studentRating: local.lastUpdated > remote.lastUpdated
      ? local.studentRating
      : remote.studentRating,
    totalResponses: Math.max(local.totalResponses, remote.totalResponses),
    bestStreak: Math.max(local.bestStreak, remote.bestStreak),
    // Merge mastery entries by taking best score per subtopic
    masteryEntries: mergeMasteryEntries(local.masteryEntries, remote.masteryEntries),
    // ...
  };
}
```

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Background Sync not supported | Medium | Fallback to online event listener |
| IndexedDB quota exceeded | Low | Limit queue to 100 operations |
| Auth token expires offline | Medium | Cache refresh token, show login prompt |
| Questions update while offline | Low | Show "new questions available" on reconnect |
| Hint generation cost | Low | One-time batch generation (~$0.50 for 447 questions) |

---

## Success Metrics

1. **Offline playability:** Game loads and functions without network after first visit
2. **Sync reliability:** >99% of queued operations sync successfully
3. **UX clarity:** User always knows online/offline status
4. **No data loss:** All offline progress eventually syncs

---

## Files to Create/Modify

**New Files:**
- `src/lib/offlineQueue.ts` - IndexedDB queue management
- `src/lib/registerSW.ts` - Service worker registration
- `src/sw.ts` - Service worker implementation
- `src/components/OnlineIndicator.tsx` - Status indicator
- `public/data/hints.json` - Pre-generated hints

**Modified Files:**
- `next.config.ts` - Serwist configuration
- `src/lib/firebaseSync.ts` - Add offline queue integration
- `src/app/layout.tsx` - Register service worker
- `package.json` - Add serwist dependencies

---

## Dependencies to Add

```json
{
  "dependencies": {
    "@serwist/next": "^9.0.0",
    "serwist": "^9.0.0",
    "idb": "^8.0.0"
  }
}
```

---

## Confirmed Decisions

| Question | Decision |
|----------|----------|
| Conflict resolution | **Last-write-wins** with max-value merge for cumulative stats |
| IndexedDB quota | **LRU eviction** - remove oldest operations when quota exceeded |
| Hint generation | **Generate now** - batch Gemini call for all 447 questions |
| Auth handling | **Silent refresh** - auto-refresh token on reconnect |

---

## Next Steps

1. ✅ Brainstorm complete
2. Create implementation plan in `plans/251223-1110-offline-pwa-firebase-sync/`
3. Generate hints batch (447 questions → ~$0.50 Gemini cost)
4. Begin Phase 1 (Service Worker setup)

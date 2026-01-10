# Background Sync + IndexedDB Research

## Background Sync API
- Defers actions until stable connection
- Fires `sync` event when connectivity restored (even if app closed)
- Browser support: Chrome ✅, Edge ✅, Firefox ❌, Safari ❌

### Fallback Pattern
```typescript
// For Firefox/Safari
window.addEventListener('online', () => processQueue());
```

## `idb` Library
Industry standard wrapper for IndexedDB with Promise-based API.

```typescript
import { openDB } from 'idb';

const db = await openDB('my-db', 1, {
  upgrade(db) {
    db.createObjectStore('sync-queue', { keyPath: 'id' });
  },
});

// Add to queue
await db.add('sync-queue', { id: crypto.randomUUID(), ...data });

// Get all
const queue = await db.getAll('sync-queue');

// Delete
await db.delete('sync-queue', id);
```

## Offline Queue Pattern
1. **Capture**: Attempt network request
2. **Queue**: On failure, store in IndexedDB
3. **Sync**: Background Sync event processes queue

### With Serwist/Workbox
```typescript
import { BackgroundSyncQueue } from 'serwist';

const queue = new BackgroundSyncQueue('firebase-sync');

// In fetch handler
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/sync')) {
    const bgSyncLogic = async () => {
      try {
        return await fetch(event.request.clone());
      } catch (error) {
        await queue.pushRequest({ request: event.request });
        throw error;
      }
    };
    event.respondWith(bgSyncLogic());
  }
});
```

## LRU Eviction Pattern
```typescript
async function addWithEviction(db, data, maxSize = 100) {
  const count = await db.count('sync-queue');
  if (count >= maxSize) {
    // Delete oldest (by timestamp)
    const oldest = await db.getAllKeys('sync-queue');
    await db.delete('sync-queue', oldest[0]);
  }
  await db.add('sync-queue', data);
}
```

## Conflict Resolution
- **Last-Write-Wins**: Compare timestamps
- **Max-Value Merge**: For cumulative stats (totalResponses, bestStreak)

## Sources
- https://developer.mozilla.org/en-US/docs/Web/API/Background_Sync_API
- https://github.com/jakearchibald/idb
- https://developer.chrome.com/docs/workbox/modules/workbox-background-sync/

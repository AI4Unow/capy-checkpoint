# Phase 5: UX Polish

## Context Links

- [Main Plan](./plan.md)
- [Phase 3: Firebase Sync](./phase-03-firebase-sync-integration.md)
- [Brainstorm](../reports/brainstorm-251223-1103-offline-pwa-firebase-sync.md)

## Overview

Add visual feedback for offline/online status and sync progress. Implement toast notifications for sync events. Handle auth expiry gracefully.

## Key Insights

- Users need clear awareness of offline status
- Pending sync count reduces anxiety
- Toast on sync complete provides closure
- Auth refresh should be silent when possible

## Requirements

1. Create OnlineIndicator component (bottom-right corner)
2. Show pending operation count
3. Add toast notification on sync complete
4. Handle auth token expiry with prompt
5. Show "new questions available" on reconnect (if applicable)

## Architecture

```
OnlineIndicator.tsx
├── Listen: navigator.onLine
├── Listen: online/offline events
├── Poll: getQueueCount() every 5s when offline
└── Render
    ├── Hidden when online + 0 pending
    ├── "Offline mode" badge when offline
    └── "Syncing X items..." when online + pending > 0

Toast System
├── Use existing toast (sonner or custom)
├── On sync complete: "Progress saved!"
└── On sync error: "Sync failed, will retry"

Auth Handler
├── On reconnect: check Firebase auth state
├── If token expired: silent refresh
└── If refresh fails: show login modal
```

## Related Code Files

| File | Action | Purpose |
|------|--------|---------|
| `src/components/OnlineIndicator.tsx` | Create | Status indicator |
| `src/app/layout.tsx` | Modify | Add OnlineIndicator |
| `src/lib/offline-queue.ts` | Import | getQueueCount |
| `src/components/AuthProvider.tsx` | Modify | Handle auth refresh |

## Implementation Steps

### 1. Create OnlineIndicator Component

```typescript
// src/components/OnlineIndicator.tsx
'use client';

import { useState, useEffect } from 'react';
import { getQueueCount } from '@/lib/offline-queue';

export function OnlineIndicator() {
  const [online, setOnline] = useState(true);
  const [pending, setPending] = useState(0);

  useEffect(() => {
    // Initial state
    setOnline(navigator.onLine);

    // Online/offline listeners
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    // Poll queue count
    const checkQueue = async () => {
      const count = await getQueueCount();
      setPending(count);
    };

    checkQueue();
    const interval = setInterval(checkQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  // Hidden when online with nothing pending
  if (online && pending === 0) return null;

  return (
    <div
      className={`
        fixed bottom-4 right-4 px-4 py-2 rounded-full
        text-sm font-medium shadow-lg z-50
        ${online
          ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
          : 'bg-gray-100 text-gray-800 border border-gray-200'
        }
      `}
    >
      {online ? (
        <span className="flex items-center gap-2">
          <span className="animate-spin h-4 w-4 border-2 border-yellow-500 border-t-transparent rounded-full" />
          Syncing {pending} item{pending !== 1 ? 's' : ''}...
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <span className="text-lg">&#128244;</span>
          Offline mode
          {pending > 0 && <span className="text-xs">({pending} pending)</span>}
        </span>
      )}
    </div>
  );
}
```

### 2. Add Toast Notifications

```typescript
// src/lib/toast.ts (simple implementation if not using library)
export function showToast(message: string, type: 'success' | 'error' = 'success') {
  const toast = document.createElement('div');
  toast.className = `
    fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50
    transform transition-all duration-300 ease-out
    ${type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}
  `;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// In SyncManager.tsx, after successful sync:
import { showToast } from '@/lib/toast';

// After processing queue
if (syncedCount > 0) {
  showToast('Progress saved!');
}
```

### 3. Update SyncManager with Toasts

```typescript
// src/components/SyncManager.tsx (enhanced)
'use client';

import { useEffect } from 'react';
import { getQueue, removeFromQueue, getQueueCount } from '@/lib/offline-queue';
import { saveLearningData, saveSessionEntry } from '@/lib/firebaseSync';
import { showToast } from '@/lib/toast';

export function SyncManager() {
  useEffect(() => {
    const handleOnline = async () => {
      const initialCount = await getQueueCount();
      if (initialCount === 0) return;

      // Process queue (for browsers without Background Sync)
      if (!('SyncManager' in window)) {
        let syncedCount = 0;
        const queue = await getQueue();

        for (const op of queue) {
          try {
            if (op.type === 'learning') {
              await saveLearningData(op.uid, op.data);
            } else if (op.type === 'session') {
              await saveSessionEntry(op.uid, op.data);
            }
            await removeFromQueue(op.id);
            syncedCount++;
          } catch {
            // Will retry on next online event
          }
        }

        if (syncedCount > 0) {
          showToast(`Synced ${syncedCount} item${syncedCount !== 1 ? 's' : ''}!`);
        }
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  return null;
}
```

### 4. Handle Auth Refresh

```typescript
// In AuthProvider.tsx, add reconnect handler
useEffect(() => {
  const handleOnline = async () => {
    // Check if auth token is still valid
    const user = auth.currentUser;
    if (user) {
      try {
        // Force token refresh
        await user.getIdToken(true);
      } catch (error) {
        // Token refresh failed, prompt re-login
        console.warn('[Auth] Token refresh failed, user needs to re-login');
        // Could trigger a modal here
      }
    }
  };

  window.addEventListener('online', handleOnline);
  return () => window.removeEventListener('online', handleOnline);
}, []);
```

### 5. Add Components to Layout

```typescript
// src/app/layout.tsx
import { OnlineIndicator } from '@/components/OnlineIndicator';
import { SyncManager } from '@/components/SyncManager';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={...}>
        <AuthProvider>
          {children}
          <OnlineIndicator />
          <SyncManager />
        </AuthProvider>
      </body>
    </html>
  );
}
```

## Todo List

- [ ] Create src/components/OnlineIndicator.tsx
- [ ] Create src/lib/toast.ts (or use sonner)
- [ ] Create src/components/SyncManager.tsx
- [ ] Add OnlineIndicator to layout.tsx
- [ ] Add SyncManager to layout.tsx
- [ ] Add auth token refresh on reconnect
- [ ] Style indicator to match Kawaii theme
- [ ] Test: Offline indicator appears when offline
- [ ] Test: Sync progress shows during reconnect
- [ ] Test: Toast shows after sync complete

## Success Criteria

1. Offline badge visible when disconnected
2. Pending count updates as queue changes
3. Syncing indicator shows during upload
4. Toast confirms sync completion
5. Auth silently refreshes on reconnect

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Indicator overlaps game UI | Medium | Low | Position bottom-right, small |
| Too many toasts | Low | Low | Batch sync notifications |
| Auth refresh fails often | Low | Medium | Show re-login modal |

## Security Considerations

- No sensitive data in UI indicators
- Auth refresh uses Firebase SDK (secure)
- Toast messages generic (no PII)

## Next Steps

After Phase 5 complete:
1. Full E2E testing of offline flow
2. Monitor analytics for sync success rate
3. Consider adding "Install App" prompt

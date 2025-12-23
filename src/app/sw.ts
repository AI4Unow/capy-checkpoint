import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist, CacheFirst, ExpirationPlugin } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

/**
 * Service Worker for Mathie PWA
 * - Precaches app shell and static assets
 * - CacheFirst for questions and hints (rarely change)
 * - Uses defaultCache for Next.js App Router compatibility
 * - Handles Background Sync for offline operations
 */
const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  runtimeCaching: [
    ...defaultCache,
    // Cache questions JSON for 30 days (rarely changes)
    {
      matcher: /\/data\/all-questions\.json$/,
      handler: new CacheFirst({
        cacheName: "questions-v1",
        plugins: [
          new ExpirationPlugin({
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          }),
        ],
      }),
    },
    // Cache hints JSON for 30 days
    {
      matcher: /\/data\/hints\.json$/,
      handler: new CacheFirst({
        cacheName: "hints-v1",
        plugins: [
          new ExpirationPlugin({
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          }),
        ],
      }),
    },
  ],
  skipWaiting: true,
  clientsClaim: true,
});

serwist.addEventListeners();

// ============================================================================
// Background Sync Handler
// ============================================================================

/**
 * Handle Background Sync events (Chrome/Edge only)
 * Broadcasts a message to all clients to trigger sync processing.
 * The SyncManager component in the client handles the actual sync.
 */
self.addEventListener("sync", (event: ExtendableEvent) => {
  const syncEvent = event as ExtendableEvent & { tag: string };

  if (syncEvent.tag === "firebase-sync") {
    console.log("[SW] Background sync triggered");

    event.waitUntil(
      (async () => {
        // Broadcast to all clients to process the queue
        const clients = await self.clients.matchAll({ type: "window" });

        for (const client of clients) {
          client.postMessage({
            type: "SYNC_QUEUE",
            timestamp: Date.now(),
          });
        }

        console.log(`[SW] Notified ${clients.length} clients to sync`);
      })()
    );
  }
});

// ============================================================================
// Message Handler
// ============================================================================

/**
 * Handle messages from clients
 */
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

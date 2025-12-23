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

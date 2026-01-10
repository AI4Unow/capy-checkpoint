---
title: "Offline PWA with Firebase Sync"
description: "Make Mathie fully playable offline with IndexedDB queue and Firebase Background Sync"
status: complete
priority: P1
effort: 7d
branch: master
tags: [pwa, offline, firebase, serwist, indexeddb]
created: 2025-12-23
---

# Offline PWA with Firebase Sync

## Overview

Enable full offline gameplay for Mathie with automatic Firebase sync on reconnect. Uses Serwist for service worker, idb for IndexedDB queue, and Background Sync API.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Service Worker (Serwist)                   │
│  ┌─────────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │ Cache Strategies │  │ Offline Q   │  │ Background  │ │
│  │ StaleWhileReval  │  │ (IndexedDB) │  │ Sync API    │ │
│  └─────────────────┘  └─────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────┐
│              Application Layer                           │
│  learningStore → offline-queue.ts → firebaseSync.ts     │
│               ↳ OnlineIndicator (UI)                    │
└─────────────────────────────────────────────────────────┘
```

## Implementation Phases

| Phase | Description | Effort | Status |
|-------|-------------|--------|--------|
| 1 | [Service Worker Setup](./phase-01-service-worker-setup.md) | 2d | ✅ Done |
| 2 | [IndexedDB Offline Queue](./phase-02-indexeddb-offline-queue.md) | 1d | ✅ Done |
| 3 | [Firebase Sync Integration](./phase-03-firebase-sync-integration.md) | 2d | ✅ Done |
| 4 | [AI Hints Offline](./phase-04-ai-hints-offline.md) | 1d | ✅ Done |
| 5 | [UX Polish](./phase-05-ux-polish.md) | 1d | ✅ Done |

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| SW Library | Serwist | Active, Next.js 14+ native, TS-first |
| IDB Library | idb | Jake Archibald's standard, Promise-based |
| Conflict Resolution | Last-write-wins + max-value merge | Simple, preserves progress |
| Quota Management | LRU eviction (100 ops max) | Prevent storage overflow |
| Hints Strategy | Pre-generate all 447 | Reliability, ~$0.50 one-time |

## Files to Create

- `src/app/sw.ts` - Service worker
- `src/lib/offline-queue.ts` - IndexedDB queue
- `src/components/OnlineIndicator.tsx` - Status UI
- `public/data/hints.json` - Pre-generated hints

## Files to Modify

- `next.config.ts` - Serwist wrapper
- `src/lib/firebaseSync.ts` - Queue integration
- `src/app/layout.tsx` - SW registration
- `package.json` - Dependencies

## Success Criteria

1. Game loads and plays offline after first visit
2. >99% queued operations sync successfully
3. User sees clear online/offline status
4. Zero data loss from offline sessions

## Related Resources

- [Brainstorm Report](../reports/brainstorm-251223-1103-offline-pwa-firebase-sync.md)
- [Serwist Research](./research/researcher-01-serwist-nextjs.md)
- [Background Sync Research](./research/researcher-02-background-sync-idb.md)

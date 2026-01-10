# Phase 1: Service Worker Setup with Serwist

## Context Links

- [Main Plan](./plan.md)
- [Serwist Research](./research/researcher-01-serwist-nextjs.md)
- [Brainstorm](../reports/brainstorm-251223-1103-offline-pwa-firebase-sync.md)

## Overview

Install and configure Serwist for Next.js 14 App Router. Set up service worker with cache strategies for app shell, static assets, and question data.

## Key Insights

- Serwist = successor to next-pwa, active maintenance
- Must disable in dev mode to avoid cache issues
- App Router requires special handling for streaming/RSC
- `defaultCache` provides sensible defaults

## Requirements

1. Install `@serwist/next` and `serwist` packages
2. Configure Serwist wrapper in `next.config.ts`
3. Create service worker at `src/app/sw.ts`
4. Register SW in client layout
5. Cache app shell, static assets, questions JSON
6. Add SW output files to `.gitignore`

## Architecture

```
next.config.ts (withSerwist wrapper)
        ↓
src/app/sw.ts (Service Worker)
    ├── precacheEntries (auto-generated manifest)
    ├── runtimeCaching
    │   ├── app-shell (StaleWhileRevalidate)
    │   ├── questions-v1 (CacheFirst, 30d)
    │   └── ai-hints (NetworkFirst)
    └── skipWaiting + clientsClaim
        ↓
public/sw.js (generated output)
```

## Related Code Files

| File | Action | Purpose |
|------|--------|---------|
| `next.config.ts` | Modify | Wrap with Serwist |
| `src/app/sw.ts` | Create | Service worker impl |
| `src/app/layout.tsx` | Modify | Register SW |
| `tsconfig.json` | Modify | Add webworker lib |
| `.gitignore` | Modify | Exclude sw.js* |
| `public/manifest.json` | Verify | Already exists |

## Implementation Steps

### 1. Install Dependencies

```bash
npm install @serwist/next serwist
```

### 2. Configure next.config.ts

```typescript
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

export default withSerwist({
  // existing config
});
```

### 3. Create src/app/sw.ts

```typescript
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist, CacheFirst, StaleWhileRevalidate, ExpirationPlugin } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  runtimeCaching: [
    ...defaultCache,
    {
      urlPattern: /\/data\/all-questions\.json$/,
      handler: new CacheFirst({
        cacheName: "questions-v1",
        plugins: [new ExpirationPlugin({ maxAgeSeconds: 30 * 24 * 60 * 60 })],
      }),
    },
    {
      urlPattern: /\/data\/hints\.json$/,
      handler: new CacheFirst({
        cacheName: "hints-v1",
        plugins: [new ExpirationPlugin({ maxAgeSeconds: 30 * 24 * 60 * 60 })],
      }),
    },
  ],
  skipWaiting: true,
  clientsClaim: true,
});

serwist.addEventListeners();
```

### 4. Update tsconfig.json

Add to `compilerOptions.lib`:
```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext", "webworker"]
  }
}
```

### 5. Register SW in layout.tsx

```typescript
// In src/app/layout.tsx, add client-side registration
// Create src/lib/registerSW.ts for the logic
```

### 6. Update .gitignore

```
# Service Worker output
public/sw.js
public/sw.js.map
public/workbox-*.js
public/workbox-*.js.map
```

## Todo List

- [ ] Install @serwist/next and serwist packages
- [ ] Wrap next.config.ts with withSerwist
- [ ] Create src/app/sw.ts with cache strategies
- [ ] Add webworker to tsconfig.json lib array
- [ ] Create registerSW.ts for client-side registration
- [ ] Add SW registration to layout.tsx
- [ ] Add SW files to .gitignore
- [ ] Test: Build and verify sw.js generated
- [ ] Test: Disable network in DevTools, game loads

## Success Criteria

1. `npm run build` generates `public/sw.js`
2. Service worker registers on page load (check DevTools > Application)
3. Network tab shows requests served from SW cache
4. Offline mode: game shell loads without network

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Build fails with TS errors | Medium | High | Add webworker lib, check types |
| SW caches stale content | Low | Medium | Use skipWaiting + clientsClaim |
| Dev mode confusion | Medium | Low | Disable SW in development |

## Security Considerations

- SW only intercepts same-origin requests
- No sensitive data in precache manifest
- HTTPS required for SW (Vercel default)

## Next Steps

After Phase 1 complete:
1. Proceed to [Phase 2: IndexedDB Queue](./phase-02-indexeddb-offline-queue.md)
2. Test offline asset loading before adding sync logic

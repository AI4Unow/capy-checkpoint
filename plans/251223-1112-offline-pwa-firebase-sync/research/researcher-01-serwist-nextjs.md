# Serwist + Next.js 14 PWA Research

## Summary
Serwist is the recommended successor to next-pwa for Next.js 14+ App Router.

## Installation
```bash
npm install @serwist/next serwist
```

## Configuration (`next.config.mjs`)
```javascript
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

export default withSerwist({});
```

## Service Worker (`app/sw.ts`)
```typescript
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  runtimeCaching: defaultCache,
  skipWaiting: true,
  clientsClaim: true,
});

serwist.addEventListeners();
```

## TypeScript Setup
Add to `tsconfig.json`:
- `"webworker"` to `lib` array
- `@serwist/next/typings` to `types`

## Key Features
- App Router native (handles streaming)
- Offline fallback pages
- Modular cache strategies (NetworkFirst, CacheFirst, StaleWhileRevalidate)

## Common Pitfalls
1. Disable in development (`disable: true`)
2. Add `public/sw.js*` to `.gitignore`
3. Manifest/icons must be in `public/`

## Sources
- https://serwist.pages.dev/
- https://github.com/serwist/serwist

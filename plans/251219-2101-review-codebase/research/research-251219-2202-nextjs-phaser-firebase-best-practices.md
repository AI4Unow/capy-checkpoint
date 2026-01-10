# Research Brief: Next.js App Router + Phaser 3 + Firebase (Client/Admin)

Timestamp: 2025-12-19 22:02 (local)

## Executive Summary
- For Phaser-in-Next.js: isolate Phaser in a Client Component, load via `next/dynamic` with `ssr: false`, instantiate/destroy Phaser in React lifecycle, and communicate via an event bus or explicit callbacks.
- For Firebase: use Client SDK only in client code (guard SSR), use Admin SDK only in server-only modules/route handlers, and protect privileged endpoints with server-side auth (token verification or strong API key + rate limiting).

## Phaser 3 + Next.js App Router (React 19)
- Put Phaser wrapper in a Client Component (`"use client"`).
- Prefer `dynamic(() => import(...), { ssr: false })` from a parent Client Component to avoid SSR/`window` issues.
- Create `new Phaser.Game(...)` inside `useEffect` and `destroy(true)` in cleanup.
- Keep game loop state inside Phaser; only emit discrete events to React/UI (score/lives/question events).
- Avoid tying 60fps updates to React state; use refs/event bus.

## Firebase Client SDK (Next.js)
- Initialize client SDK lazily in a browser-only path (check `typeof window !== 'undefined'`).
- Use `NEXT_PUBLIC_*` env vars for client config; never include secrets.
- Prefer server-side fetching for privileged operations; client-side reads must be protected by Firestore Security Rules.

## Firebase Admin SDK (Route Handlers)
- Keep Admin initialization in a dedicated server-only module and ensure singleton init.
- Route handlers using Admin should explicitly set `export const runtime = 'nodejs'` if any chance of edge runtime.
- Store service account via server env vars; handle private key newlines with `replace(/\\n/g, '\n')`.

## Authoritative Sources
- https://nextjs.org/docs/app
- https://nextjs.org/docs/app/building-your-application/rendering/client-components
- https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- https://firebase.google.com/docs/web/setup
- https://firebase.google.com/docs/admin/setup
- https://newdocs.phaser.io/
- https://react.dev/reference/react/useEffect

## Unresolved Questions
- None

# Research Report: Phaser + React/Next Educational Games (State, Events, Determinism, Testing, Org)

Timestamp: 2025-12-20 19:47 UTC

## Executive Summary
Phaser with React/Next works best via a thin bridge component and shared event bus; keep game logic pure/decoupled and UI reactive. Use deterministic fixed-step loops for gameplay consistency; isolate state in external store (Zustand/Redux) and emit events both ways. Testing: unit pure systems with Vitest (no DOM), mock canvas for minimal scene tests, and rely on Playwright for canvas/WebGL E2E. Organize code by layers (systems, scenes, ui, assets) and keep scenes lean; preload atlases and handle resize/visibility via ScaleManager events.

## Research Methodology
- Sources consulted: 5
- Date range: 2014–2025 (prioritizing 2024–2025)
- Key terms: "Phaser React Next template", "Phaser event bus React", "Phaser fixed timestep", "Phaser resize visibility", "Phaser Vitest Playwright testing"

## Key Findings
### Technology Overview
Phaser 3 as imperative renderer/game loop; React/Next as declarative UI. Bridge via client-only component; communicate through event bus and external store.

### Current State & Trends
- Official Phaser templates now ship React/Vite and Next variants with EventBus and client-only init.
- Fixed-step accumulator remains canonical for determinism (per Gaffer reference).
- Playwright favored for canvas/WebGL E2E; Vitest for fast unit tests.

### Best Practices
- Bridge: Client-only `PhaserGame` using `useEffect`/`useLayoutEffect`; destroy on unmount; expose ref for tests.
- State: External store (Zustand/Redux) accessible outside React; scenes write via `store.getState()`; UI subscribes via hook. Use EventBus for discrete triggers (start/pause/gameover).
- Event bus: Singleton `EventEmitter`/mitt; always `on`+`off` in React effects; avoid attaching in render; namespaced events.
- Determinism: Fixed timestep accumulator inside scene update; optionally interpolate render; cap accumulator to avoid spiral.
- Delta use: Prefer fixedStep for gameplay; still pass `delta` to particles/tweens needing frame-time awareness.
- Resize/visibility: `scale.mode=RESIZE`; listen `scale.on('resize')`; handle `game.events.on('hidden'|'visible')` to pause/resume audio/timers.
- Assets: Texture atlases + WebP; preload per scene; lazy load world-specific packs.
- Code org: `systems/` (pure logic), `scenes/` (thin view), `ui/` (React), `state/`, `assets/`, `events/`; keep files <200 LOC.
- Supabase/backend: Keep client in React; pass session/user to game via config/registry; send game-complete events through bus -> React -> API; use channels for realtime when needed.

### Security Considerations
- Never expose Supabase keys in client; use RLS; validate score submissions server-side.
- Throttle/validate event bus inputs to avoid UI spamming game actions.

### Performance Insights
- Texture atlases reduce draw calls; WebP shrinks bundle.
- Avoid re-creating game instance on rerender; guard with ref.
- Fixed-step stabilizes physics; keep interpolation light.

## Comparative Analysis
- Event bus vs direct props: bus keeps React/Phaser decoupled and reusable; props require tight coupling and rerenders.
- Zustand vs Redux: Zustand lighter and callable outside React without hooks; Redux offers tooling but more boilerplate.
- Playwright vs Cypress: Playwright better for canvas/WebGL stability and multi-page; Cypress fine but slower with heavy canvas.

## Implementation Recommendations
### Quick Start
1) Create client-only `PhaserGame` component (Next `dynamic(..., { ssr:false })`).
2) Init singleton `EventBus` and `state` store (Zustand/Redux). Scenes write to store; UI subscribes; triggers via bus.
3) Implement fixed timestep in `update` with accumulator.
4) Use `scale.mode=RESIZE`; hook resize + visibility events.
5) Testing: Vitest for systems (Node env); Vitest+happy-dom+jest-canvas-mock for minimal scene logic; Playwright for canvas E2E and screenshots.

### Code Examples
- Event bus
```ts
// events/bus.ts
import { Events } from 'phaser';
export const EventBus = new Events.EventEmitter();
```
- Fixed timestep
```ts
let acc = 0; const step = 1000/60;
update(t, delta) { acc += delta; while (acc >= step) { this.fixedUpdate(step); acc -= step; } }
```
- Resize
```ts
this.scale.on('resize', ({ width, height }) => this.uiLayout(width, height));
```

### Common Pitfalls
- Memory leaks from missing `off` in React `useEffect`.
- Recreating `Phaser.Game` on React rerender; guard with ref.
- Relying on variable `delta` for game logic; leads to nondeterminism.
- Loading many standalone images; use atlases.

## Resources & References
- Phaser React template (official): https://github.com/phaserjs/phaser-template-react
- Phaser + Next.js guidance (Phaser site): https://phaser.io/news/2024/04/phaser-and-nextjs-template
- Phaser Scale Manager docs (resize/visibility): https://newdocs.phaser.io/docs/3.80.0/Phaser.Scale.ScaleManager
- Fixed timestep (Gaffer): https://gafferongames.com/post/fix_your_timestep/
- React-Phaser UI comms (Ourcade): https://ourcade.co/blog/phaser3-react-ui-communication

## Unresolved Questions
- Need concrete target for min supported Phaser version (3.60+?) to lock API usage.
- Decide store choice (Zustand vs Redux) for this codebase conventions.
- Choose E2E runner (Playwright vs Cypress) based on existing tooling in repo.

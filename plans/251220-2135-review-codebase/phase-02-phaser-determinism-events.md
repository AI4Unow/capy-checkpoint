# Phase 02: Phaser Determinism + Events

## Context Links
- Research: `plans/reports/researcher-251220-phaser-react-edu-games.md`
- Code review: `capy-checkpoint/src/game/scenes/Game.ts`
- Code: `capy-checkpoint/src/game/EventBus.ts`

## Overview
- Date: 251220
- Priority: Medium
- Status: pending

## Key Insights
- `capy-checkpoint` scene update uses hardcoded `0.016` timestep; gameplay speed depends on FPS.
- Event bus is untyped; payload misuse easy; React handlers currently guard with runtime checks.

## Requirements
- Make movement and scrolling time-based/deterministic.
- Define event contracts to reduce runtime checks and bugs.

## Architecture
- Option A (minimal): Use `update(_time, delta)` and scale movement by `delta/1000`.
- Option B (deterministic): Fixed timestep accumulator with `fixedUpdate(stepMs)`.
- EventBus: typed event map + generic `on/off/emit`.

## Related Code Files
- `capy-checkpoint/src/game/scenes/Game.ts`
- `capy-checkpoint/src/game/EventBus.ts`
- `capy-checkpoint/src/game/PhaserGame.tsx`

## Implementation Steps
1) Replace fixed `0.016` multipliers with dt (`delta/1000`).
2) Optionally add fixed-step accumulator if physics/logic needs determinism.
3) Add typed event map and generic methods.
4) Ensure React handlers subscribe/unsubscribe correctly.

## Todo
- Decide between dt-scaling vs fixed-step accumulator.
- Decide if GAME_OVER payload should be consumed by React UI.

## Success Criteria
- Gameplay speed stable across machines.
- Event payload types enforced at compile time.

## Risk Assessment
- Fixed-step loop might require tuning scroll speed constants.

## Security Considerations
- N/A

## Next Steps
- Implement dt-based movement first (KISS).

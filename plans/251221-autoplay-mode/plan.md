# Auto-Play Mode for Testing

## Overview
Add self-playing (auto-play) mode for automated game testing. Bot picks random paths to test all scenarios.

## Status
- **Created:** 2025-12-21
- **Status:** Planned

## Phases

| # | Phase | Status | File |
|---|-------|--------|------|
| 1 | Add autoPlay flag and logic to Game.ts | Pending | [phase-01-game-autoplay-logic.md](./phase-01-game-autoplay-logic.md) |

## Requirements Summary
1. Add `autoPlay` boolean flag to Game.ts scene
2. When enabled, game auto-flaps at random intervals to navigate to random paths
3. Enable via URL parameter `?autoplay=true`
4. Bot picks random paths (not always correct) to test all scenarios
5. Auto-restart on game over in autoPlay mode

## Architecture
- Single-phase implementation in Game.ts
- URL param detection in Menu.ts or page.tsx
- No new files needed - just modifications to existing scenes

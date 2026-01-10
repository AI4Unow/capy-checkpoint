# Debugger Report: Play Button Overlap

**Date:** 2026-01-05
**Issue:** Play button covered by stats/buttons at game start.

## Analysis
The "PLAY" button is a Phaser object at `y = 560`. The `MenuOverlay` React component is a centered column at `bottom-20` (approx `y = 640`).

As the `MenuOverlay` grows upwards with badges (Best Score, Stats, Daily Challenge), it overlaps the `y = 560` coordinate. Because the React layer has a higher z-index (`z-20`), it captures pointer events and visually obscures the Phaser button.

## Evidence
- `Menu.ts`: `playBtn` at `y = 560`.
- `MenuOverlay.tsx`: `absolute bottom-20 left-1/2 -translate-x-1/2 z-20`.
- `page.tsx`: `MenuOverlay` is rendered after `PhaserGame` in the DOM.

## Recommendations
1. Move Phaser "PLAY" button to `y = 450`.
2. Reduce `MenuOverlay` gap or move it to `bottom-4`.
3. Preferred: Move the Play button into `MenuOverlay.tsx` to manage all menu UI in React.

## Unresolved Questions
- Is there a specific design reason for the Play button being in Phaser?
- Should the stats be moved to a side-bar instead of a central stack?

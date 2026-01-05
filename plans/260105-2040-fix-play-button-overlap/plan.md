---
title: "Fix Play Button Overlap"
description: "Move Play button from Phaser to React to resolve overlap and improve UI architecture"
status: pending
priority: P2
effort: 1h
branch: master
tags: [ui, phaser, react, refactor]
created: 2026-01-05
---

# Fix Play Button Overlap

## Context
The "PLAY" button is currently rendered inside the Phaser `Menu` scene, which causes layout and interaction issues (overlap) and makes it harder to style consistent with the rest of the UI. We want to move this control to a React overlay.

## Objectives
1.  Remove legacy Play button from Phaser `Menu.ts`.
2.  Implement `MenuOverlay.tsx` in React with a "PLAY" button.
3.  Establish communication between React UI and Phaser scene to start the game.
4.  Ensure the new UI does not overlap with other elements and matches the design system.

## Implementation Plan

### Phase 1: Preparation
- [ ] Create `MenuOverlay.tsx` component structure.
- [ ] Update `EventBus.ts` to include `START_GAME` event (distinct from `GAME_START` if needed, or clarify usage).

### Phase 2: Implementation
- [ ] **Step 1: Create React Menu Overlay**
    - Create `src/components/MenuOverlay.tsx`.
    - Implement layout with "PLAY" button, "Best Score", "Daily Challenge", "Stats".
    - Use Tailwind classes for styling (Pink/Sage palette, rounded corners).
    - Wire "PLAY" button to emit event.

- [ ] **Step 2: Update Phaser Menu Scene**
    - Modify `src/game/scenes/Menu.ts`.
    - Remove the code that creates the Phaser "PLAY" button (rectangle, text, events).
    - Add listener for the start event to transition to `Game` scene.

- [ ] **Step 3: Integrate into App**
    - Update `src/App.tsx`.
    - Render `MenuOverlay` when appropriate (e.g., `!isPlaying`).

### Phase 3: Verification
- [ ] Verify game starts correctly when clicking React button.
- [ ] Verify layout on different screen sizes (within the container).
- [ ] Check for z-index issues (React overlay must be above Canvas).

## Technical Details

### Event Flow
1.  User clicks "PLAY" in `MenuOverlay` (React).
2.  `MenuOverlay` calls `EventBus.emit('start-game')`.
3.  `Menu.ts` (Phaser) listens for `'start-game'`.
4.  `Menu.ts` calls `this.scene.start('Game')`.
5.  `Game.ts` starts, emits `GAME_START`.
6.  `App.tsx` / `GameStore` updates `isPlaying = true`, hiding the `MenuOverlay`.

### Components
- **MenuOverlay**: Absolute positioned div over the game canvas.
    - `z-index`: 20 (higher than GameHUD which is 10).
    - `pointer-events`: `auto` (unlike HUD which might be none for parts).

## Definition of Done
- No "PLAY" button in Phaser scene.
- "PLAY" button visible in React overlay.
- Clicking "PLAY" starts the game.
- UI elements do not overlap in an ugly way.

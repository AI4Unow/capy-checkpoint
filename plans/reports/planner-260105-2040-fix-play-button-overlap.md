# Fix Play Button Overlap

## Problem Analysis
The "PLAY" button is currently rendered inside the Phaser scene (`Menu.ts`). However, we want to move the UI control to React for better styling and layout management, specifically to integrate with a new `MenuOverlay` component that will handle the main menu UI (Best Score, Daily Challenge, Stats).

Currently:
- `Menu.ts` (Phaser) renders the Play button.
- `GameHUD.tsx` (React) renders the in-game HUD.
- There is no `MenuOverlay.tsx` yet, or it's not being used.

The goal is to:
1.  Remove the Play button from `Menu.ts`.
2.  Create (or update) `MenuOverlay.tsx` to include the Play button and other menu items.
3.  Coordinate the game start between React and Phaser using `EventBus`.

## Proposed Solution

1.  **Phaser (`Menu.ts`) Changes:**
    *   Remove the "PLAY" button creation code (rectangle, text, tweens/events).
    *   Keep the background, title, and capybara mascot.
    *   Listen for a `START_GAME` event from `EventBus` to transition to the `Game` scene.

2.  **React (`MenuOverlay.tsx`) Creation/Update:**
    *   Create a new component `MenuOverlay` if it doesn't exist.
    *   Add a "PLAY" button styled with Tailwind CSS (matching the existing design: rounded, pink/sage colors, playful fonts).
    *   Add placeholders/implementations for "Best Score", "Daily Challenge", and "Stats".
    *   On "PLAY" click, emit `GameEvents.START_GAME` (or a specific `REQUEST_START_GAME` event if needed, but we can reuse `GAME_START` or add a new one like `START_GAME_REQUEST`).
    *   Actually, `Menu.ts` needs to listen for an event to transition. Let's call it `START_GAME`.

3.  **Event Bus (`EventBus.ts`) Updates:**
    *   Ensure `START_GAME` event type exists if we want a specific trigger from UI -> Phaser.
    *   Currently `GAME_START` seems to be used when the game *actually* starts (in `Game.ts`).
    *   We might need a `START_REQUEST` event from React -> Phaser(Menu) -> Phaser(Game).
    *   Wait, if we emit `START_GAME` from React, `Game.ts` isn't active yet. `Menu.ts` is active. So `Menu.ts` should listen for `START_GAME` and then do `this.scene.start('Game')`.

4.  **Integration (`App.tsx` / `PhaserGame.tsx`):**
    *   Update `App.tsx` or `PhaserGame.tsx` to render `MenuOverlay` when the game state is not "playing".
    *   We can use `useGameStore` to track `isPlaying`.
    *   If `!isPlaying` and `!isGameOver`, show `MenuOverlay`.
    *   If `isGameOver`, show the Game Over screen (which currently is in Phaser `Game.ts` `gameOver` method, but maybe that should also move to React later? For now, let's stick to the request which is just the Play button).
    *   Wait, the user said "Fix Play Button Overlap". This implies there might already be a button or overlapping elements.
    *   The user says "Remove the 'PLAY' button from Phaser Menu.ts" and "Add the 'PLAY' button to the React MenuOverlay.tsx".

## Implementation Steps

1.  **Modify `Menu.ts`:**
    *   Remove lines 45-76 (Play button logic).
    *   Add listener: `EventBus.on('start-game', () => this.scene.start('Game'));` inside `create()`.
    *   Clean up listener in `shutdown` or `destroy` if necessary, but `EventBus` is global. Better to handle it carefully.
    *   Actually, better to having `PhaserGame` wrapper handle the bridging?
    *   Let's just have `Menu.ts` listen to `EventBus`.

2.  **Create `MenuOverlay.tsx`:**
    *   Styles: Absolute positioning, z-index > canvas.
    *   Content: Title (optional, since Phaser has it, but maybe move title to React too? The plan says "Remove the PLAY button", implies keeping title in Phaser).
    *   Button: `onClick={() => EventBus.emit('start-game')}`.

3.  **Update `App.tsx`:**
    *   Include `MenuOverlay` conditionally.
    *   Condition: `!isPlaying`.

4.  **Refine `EventBus`:**
    *   Add `'start-game'` to `GameEvents`.

## Unresolved Questions
- Should the Title also be moved to React? (Plan says only Play button, but usually better to have all UI in one place. I will stick to the plan: only Play button).
- How to handle "Game Over" state? The current store has `isGameOver`. If `isGameOver` is true, we might want to show a "Game Over" overlay or just the Menu again?
    - Phaser `Game.ts` handles Game Over UI currently.
    - We should probably ensure `MenuOverlay` is only shown when in the Menu state (initial load).
    - Let's assume `!isPlaying && !isGameOver` = Menu state.

## Tech Stack
- React
- Phaser 3
- Tailwind CSS
- Zustand (Game Store)

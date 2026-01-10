# Debugger Report: Coins Not Saving

**ID:** debugger-260110-1422-coins-not-saving
**Date:** 2026-01-10
**Status:** Root Cause Identified

## Executive Summary
The "coins not saving" issue in `capy-checkpoint` is caused by the absence of state persistence configuration in the game store. Unlike the `capy-checkpoint-next` project, the current store is purely in-memory. Additionally, the game reset logic explicitly clears the coin balance.

## Root Cause Analysis

### 1. Missing Persistence Middleware
The `gameStore` in `capy-checkpoint/src/stores/gameStore.ts` is created without the `persist` middleware. This means all state, including accumulated coins, is lost whenever the browser refreshes or the application reloads.

**Current Code (`capy-checkpoint/src/stores/gameStore.ts`):**
```typescript
export const useGameStore = create<GameState>((set) => ({
  ...initialState,
  // ...
}));
```

### 2. Reset Logic Clears Inventory
The `reset` action in the store resets the entire state to `initialState`, which includes setting `coins` back to `0`. This means even if persistence were added, the current reset logic (called on game restart) would wipe the player's currency.

**Current Reset Logic:**
```typescript
const initialState = {
  // ...
  coins: 0, // Reset target
};

// ...
reset: () => set(initialState), // Wipes everything
```

## Comparison with Working Implementation
The `capy-checkpoint-next` project correctly implements this using `zustand/middleware`:

```typescript
// From capy-checkpoint-next/src/stores/gameStore.ts
export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      // ...
      reset: () =>
        set((state) => ({
          ...initialState,
          bestScore: state.bestScore, // Preserved
          coins: state.coins,         // Preserved
        })),
    }),
    {
      name: "mathie-game-store",
      partialize: (state) => ({ bestScore: state.bestScore, coins: state.coins }),
    }
  )
);
```

## Recommendations

### Immediate Fix
1.  **Modify `capy-checkpoint/src/stores/gameStore.ts`**:
    -   Import `persist` from `zustand/middleware`.
    -   Wrap the store definition with `persist`.
    -   Define a unique name for local storage (e.g., `capy-checkpoint-storage`).
    -   Configure `partialize` to only save `coins` (and potentially `lives` or `score` if desired, though usually just high score and currency).

2.  **Update Reset Logic**:
    -   Modify the `reset` function to preserve `coins` (and `bestScore` if added) when resetting the game state.

### Implementation Plan
-   Update `src/stores/gameStore.ts` to include persistence.
-   Verify that coins persist after page reload.
-   Verify that coins persist after "Try Again" (game reset).

## Unresolved Questions
-   Should `lives` also be persisted, or do they reset per session? (Assumption: Lives reset per game, coins persist).
-   Is there a `bestScore` that should also be tracked and persisted? (Not currently in `capy-checkpoint` store, but likely desired).

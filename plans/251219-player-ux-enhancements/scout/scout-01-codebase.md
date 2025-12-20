# Scout Report: Mathie Codebase

**Date:** 2025-12-19
**Scout:** ac233f7

## Phaser Game Structure

### Scenes
- `Boot.ts` - Asset preloading, procedural texture generation
- `Menu.ts` - Title screen with PLAY button
- `Game.ts` - Core Flappy Bird-style loop with 3-path gates

### State Management
- Local Phaser state: score, lives, activeGates
- Emits to React via EventBus

### Input
- Pointer (click/tap)
- Keyboard: SPACE (flap), 1-3 (path selection)

## React-Phaser Integration

### EventBus Pattern
```typescript
// src/game/EventBus.ts
export const EventBus = new SimpleEventEmitter();
export const GameEvents = {
  SCORE_UPDATE, LIVES_UPDATE, GAME_OVER, ANSWER, WRONG_ANSWER, ...
}
```

### PhaserGame.tsx Bridge
- Instantiates Phaser.Game
- Subscribes to EventBus → updates gameStore
- Injects `questionSelector` and `answerRecorder` into Game scene

## Sound/Audio Status

**Current State: NONE**

No audio code exists. No sound files in public folder.
Gap: Boot.ts doesn't preload audio, no audio events defined.

## Settings & Preferences

### learningStore.ts
- Zustand + persist middleware
- localStorage key: `capy-learning-storage`
- Contains: studentRating, mastery entries, SM2 entries, session stats

### authStore.ts
- Firebase integration for cloud sync
- Syncs learning data and coins if authenticated

### gameStore.ts
- Transient session data (score, lives)
- Persistent coin count

## Animation Patterns

### Phaser
- `this.tweens.add` for movements
- Examples: capybara jump, floating +10 text, button hover

### React
- Tailwind CSS animations
- Custom: `animate-bounce-in`, `animate-confetti`

### Procedural
- Background scrolling in Game.update()
- Capybara rotation based on velocity

## Key Files

| File | Purpose |
|------|---------|
| `src/game/EventBus.ts` | React-Phaser bridge |
| `src/game/PhaserGame.tsx` | Game wrapper component |
| `src/game/scenes/Game.ts` | Main game loop |
| `src/game/scenes/Menu.ts` | Menu scene |
| `src/game/scenes/Boot.ts` | Asset loading |
| `src/stores/gameStore.ts` | Game state |
| `src/stores/learningStore.ts` | Learning persistence |
| `src/stores/boutiqueStore.ts` | Cosmetics |

## Unresolved Questions

1. Sound assets source - need to create or source
2. Volume settings - global or per-category?
3. Mute persistence - via learningStore or separate?

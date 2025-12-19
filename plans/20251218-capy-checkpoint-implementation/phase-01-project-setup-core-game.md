# Phase 1: Project Setup & Core Game

## Context Links

- **Parent Plan:** [plan.md](./plan.md)
- **Depends On:** None (initial phase)
- **Design Guidelines:** [design-guidelines.md](../../docs/design-guidelines.md)
- **Brainstorm:** [brainstorm report](../reports/brainstorm-20251218-capy-checkpoint.md)

---

## Overview

| Field | Value |
|-------|-------|
| Date | 2025-12-18 |
| Priority | P0 - Critical |
| Status | pending |
| Description | Setup Vite + React + Phaser project, implement core tap-to-flap physics, scrolling background |

---

## Key Insights

From Phaser.js research:
- Use `phaser3-react-template` or manual EventBus pattern for React ↔ Phaser communication
- Arcade Physics optimal: `gravity.y: 1000`, flap velocity: `-350`
- Phaser game embedded in React component via `useEffect` + `useRef`
- Game loop independent from React render cycle

---

## Requirements

### Functional
- F1: Capybara sprite with tap/click-to-flap physics
- F2: Scrolling parallax background (Forest theme)
- F3: Ground collision detection
- F4: Basic gate spawning (obstacles only, no questions yet)
- F5: Score counter for gates passed
- F6: Game over on ground collision

### Non-Functional
- NF1: 60fps gameplay on mid-range devices
- NF2: Responsive canvas (scales to viewport)
- NF3: Touch + keyboard input support

---

## Architecture

### Component Structure
```
src/
├── main.tsx              # React entry
├── App.tsx               # Router + layout
├── game/
│   ├── PhaserGame.tsx    # React wrapper component
│   ├── EventBus.ts       # React ↔ Phaser events
│   ├── main.ts           # Phaser config + boot
│   └── scenes/
│       ├── Boot.ts       # Asset preload
│       ├── Menu.ts       # Start screen
│       └── Game.ts       # Main gameplay
├── components/
│   └── GameHUD.tsx       # React HUD overlay (hearts, coins)
└── stores/
    └── gameStore.ts      # Zustand for game state
```

### Data Flow
```
User Input (tap/click)
    ↓
Phaser Game Scene (physics update)
    ↓
EventBus.emit('score-update', score)
    ↓
React HUD (re-render)
```

### Physics Config
```typescript
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1000, x: 0 },
      debug: false
    }
  },
  scene: [Boot, Menu, Game]
};
```

---

## Related Code Files

| File | Purpose |
|------|---------|
| `src/game/PhaserGame.tsx` | React wrapper for Phaser canvas |
| `src/game/EventBus.ts` | Event emitter for cross-communication |
| `src/game/scenes/Game.ts` | Main gameplay scene |
| `src/game/scenes/Boot.ts` | Asset loading |
| `src/stores/gameStore.ts` | Zustand state (score, lives) |
| `src/components/GameHUD.tsx` | Hearts + coins overlay |
| `tailwind.config.ts` | Theme colors from design guidelines |
| `index.html` | PWA meta tags |

---

## Implementation Steps

1. **Scaffold project**
   ```bash
   npm create vite@latest capy-checkpoint -- --template react-ts
   cd capy-checkpoint
   npm install phaser zustand
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```

2. **Configure Tailwind** with design colors
   ```typescript
   // tailwind.config.ts
   theme: {
     extend: {
       colors: {
         pink: '#FFD6E0',
         sage: '#DDE5B6',
         cream: '#FEFAE0',
         sky: '#A2D2FF',
         text: '#5E503F'
       },
       fontFamily: {
         fredoka: ['Fredoka', 'sans-serif'],
         nunito: ['Nunito', 'sans-serif'],
         baloo: ['Baloo 2', 'sans-serif']
       }
     }
   }
   ```

3. **Create EventBus** for React ↔ Phaser
   ```typescript
   // src/game/EventBus.ts
   import { EventEmitter } from 'events';
   export const EventBus = new EventEmitter();
   ```

4. **Create Phaser config** in `src/game/main.ts`
   - Arcade physics with gravity 1000
   - Canvas parent: `#game-container`
   - Scale mode: `Phaser.Scale.FIT`

5. **Create Boot scene** - preload assets
   - Capybara sprite (placeholder rectangle initially)
   - Background image
   - Ground sprite

6. **Create Game scene** - core gameplay
   - Spawn Capybara at (100, 300)
   - Apply velocity.y = -350 on pointer down
   - Scroll background using tileSprite
   - Spawn basic gates (rectangles) at intervals
   - Detect gate pass → increment score
   - Ground collision → game over

7. **Create PhaserGame.tsx** React wrapper
   ```tsx
   export function PhaserGame({ onScore }: Props) {
     const gameRef = useRef<Phaser.Game>();

     useEffect(() => {
       gameRef.current = new Phaser.Game(config);
       EventBus.on('score', onScore);
       return () => gameRef.current?.destroy(true);
     }, []);

     return <div id="game-container" />;
   }
   ```

8. **Create GameHUD** React component
   - Display hearts (3 initial)
   - Display score
   - Position absolute over game canvas

9. **Create gameStore** with Zustand
   ```typescript
   interface GameState {
     score: number;
     lives: number;
     isPlaying: boolean;
   }
   ```

10. **Add placeholder assets**
    - Capybara: 64x64 colored rectangle
    - Background: Simple gradient or solid color
    - Gate: Vertical rectangles with gap

11. **Test core loop**
    - Tap to flap works smoothly
    - Gates scroll left
    - Score increments on pass
    - Game over triggers on ground hit

---

## Todo List

- [ ] Scaffold Vite + React + TypeScript project
- [ ] Install Phaser 3 + Zustand dependencies
- [ ] Configure Tailwind with design colors/fonts
- [ ] Create EventBus for React ↔ Phaser
- [ ] Create Boot scene with asset preload
- [ ] Create Game scene with physics
- [ ] Implement tap-to-flap mechanic
- [ ] Add scrolling background (tileSprite)
- [ ] Add basic gate spawning
- [ ] Add score tracking
- [ ] Create React PhaserGame wrapper
- [ ] Create GameHUD component
- [ ] Test on desktop + mobile viewport

---

## Success Criteria

- [ ] Capybara flaps smoothly at 60fps
- [ ] Background scrolls continuously
- [ ] Gates spawn and scroll off screen
- [ ] Score increments when passing gates
- [ ] Game over triggers correctly
- [ ] Works on touch devices (mobile viewport)

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| React re-renders affecting Phaser | Medium | High | EventBus pattern isolates game loop |
| Physics feels floaty/unresponsive | Medium | Medium | Tune gravity (800-1200) and flap velocity (-300 to -400) |
| Mobile touch not registering | Low | High | Use `pointerdown` event, not `click` |

---

## Security Considerations

- No sensitive data at this phase
- Local storage only for temporary state

---

## Next Steps

After Phase 1 complete:
1. Proceed to **Phase 2: Question System & Gates**
2. Replace basic gates with 3-path answer gates
3. Add question display and validation

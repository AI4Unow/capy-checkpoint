# Phase 1: Quick Wins

## Context

- **Parent Plan:** [plan.md](plan.md)
- **Dependencies:** None
- **Docs:** N/A

## Overview

| Field | Value |
|-------|-------|
| Date | 2025-12-19 |
| Description | Low-effort, high-impact UX improvements |
| Priority | P0 - Critical |
| Implementation Status | Pending |
| Review Status | Pending |

## Key Insights

- Pause/Resume essential for kids (bathroom breaks, distractions)
- Accessibility settings improve inclusivity
- Touch target expansion critical for mobile
- Reduced motion respects user preferences

## Requirements

1. Pause button visible during gameplay
2. Game freezes completely on pause (gates stop, timer stops)
3. Resume overlay with "Ready to continue?"
4. Settings store for preferences (reducedMotion, colorBlindMode)
5. Larger touch targets on mobile devices

## Architecture

### New Files

```
src/components/PauseOverlay.tsx     # React overlay for pause state
src/components/SettingsModal.tsx    # Settings panel (a11y options)
src/stores/settingsStore.ts         # Persisted user preferences
src/game/scenes/Pause.ts            # Phaser pause scene (optional)
```

### Modified Files

```
src/game/scenes/Game.ts             # Add pause/resume logic
src/game/EventBus.ts                # Add PAUSE/RESUME events
src/app/page.tsx                    # Integrate PauseOverlay
src/components/GameHUD.tsx          # Add pause button
src/app/globals.css                 # Reduced motion styles
```

## Related Code Files

- `src/game/scenes/Game.ts:1-300` - Main game loop
- `src/game/EventBus.ts:1-50` - Event definitions
- `src/stores/gameStore.ts:1-80` - Game state
- `src/components/GameHUD.tsx:1-66` - HUD display

## Implementation Steps

### 1.1 Settings Store (30 min)

```typescript
// src/stores/settingsStore.ts
interface SettingsState {
  reducedMotion: boolean;
  colorBlindMode: boolean;
  soundEnabled: boolean;
  musicEnabled: boolean;
}
```

- Create Zustand store with persist middleware
- Default `reducedMotion` from `prefers-reduced-motion`
- Export `useSettingsStore` hook

### 1.2 Pause/Resume Events (15 min)

```typescript
// src/game/EventBus.ts - add events
PAUSE: "pause",
RESUME: "resume",
```

### 1.3 Game.ts Pause Logic (45 min)

```typescript
// In Game.ts
private isPaused = false;

pauseGame() {
  this.isPaused = true;
  this.physics.pause();      // Stop physics
  this.time.paused = true;   // Stop timers
  this.scene.pause();        // Pause scene
  EventBus.emit(GameEvents.PAUSE);
}

resumeGame() {
  this.isPaused = false;
  this.physics.resume();
  this.time.paused = false;
  this.scene.resume();
  EventBus.emit(GameEvents.RESUME);
}
```

- Add keyboard listener for `ESC` key to toggle pause
- Gate movement stops when paused

### 1.4 Pause Button in HUD (30 min)

```tsx
// src/components/GameHUD.tsx
<button
  onClick={() => EventBus.emit(GameEvents.PAUSE)}
  className="absolute top-4 right-20 z-20"
  aria-label="Pause game"
>
  ⏸️
</button>
```

### 1.5 PauseOverlay Component (45 min)

```tsx
// src/components/PauseOverlay.tsx
export function PauseOverlay() {
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    EventBus.on(GameEvents.PAUSE, () => setIsPaused(true));
    EventBus.on(GameEvents.RESUME, () => setIsPaused(false));
    // cleanup...
  }, []);

  if (!isPaused) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-cream rounded-3xl p-8 text-center">
        <h2>Game Paused</h2>
        <button onClick={() => EventBus.emit(GameEvents.RESUME)}>
          ▶️ Resume
        </button>
        <button onClick={openSettings}>⚙️ Settings</button>
      </div>
    </div>
  );
}
```

### 1.6 Settings Modal (45 min)

- Toggle: Reduced Motion
- Toggle: Color Blind Mode (adds ✓/✗ icons)
- Toggle: Sound Effects (prep for Phase 2)
- Uses `settingsStore` for persistence

### 1.7 Accessibility CSS (15 min)

```css
/* src/app/globals.css */
@media (prefers-reduced-motion: reduce) {
  .animate-confetti,
  .animate-bounce-in { animation: none !important; }
}

[data-reduced-motion="true"] .animate-confetti,
[data-reduced-motion="true"] .animate-bounce-in {
  animation: none !important;
}
```

### 1.8 Touch Target Expansion (30 min)

- Increase gate answer boxes to min 60x60px
- Add invisible hit area expansion on mobile
- Test on touch devices

## Todo List

- [ ] Create settingsStore.ts with persist
- [ ] Add PAUSE/RESUME events to EventBus
- [ ] Implement pauseGame/resumeGame in Game.ts
- [ ] Add pause button to GameHUD
- [ ] Create PauseOverlay component
- [ ] Create SettingsModal component
- [ ] Add reduced motion CSS
- [ ] Expand touch targets
- [ ] Test pause/resume flow
- [ ] Test accessibility settings

## Success Criteria

- [ ] Pressing ESC or pause button freezes game completely
- [ ] Resume returns to exact game state
- [ ] Settings persist across sessions
- [ ] Reduced motion mode disables animations
- [ ] Touch targets are 48px+ on mobile

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Pause breaks gate sync | Medium | High | Test thoroughly, reset gate positions |
| Timer drift on resume | Low | Medium | Store elapsed time before pause |

## Security Considerations

- Settings stored in localStorage (no sensitive data)
- No external API calls

## Next Steps

After Phase 1 completion:
1. Test on mobile devices
2. Get user feedback
3. Proceed to Phase 2 (Sound System)

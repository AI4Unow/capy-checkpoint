# Phase 1: Add AutoPlay Logic to Game Scene

## Context
- Parent plan: [plan.md](./plan.md)
- Dependencies: None

## Overview
- **Date:** 2025-12-21
- **Description:** Add self-playing mode that auto-navigates to random answer paths
- **Priority:** Medium
- **Implementation Status:** Pending
- **Review Status:** Pending

## Key Insights
- Game uses Phaser 3 with physics-based flapping
- Capy position determines answer selection (top/middle/bottom paths)
- Path Y positions: [220, 380, 540] for 3 answer options
- Two-phase speed system: fast when gate off-screen, slow when visible
- Game already has `isPaused` and `isGameOver` flags for state management

## Requirements
1. Add `private autoPlay = false` flag to Game class
2. Add `setAutoPlay(enabled: boolean)` method
3. In update(), when autoPlay enabled:
   - Pick random target path when gate spawns
   - Auto-flap to navigate capy toward target Y position
4. Auto-restart on game over when autoPlay is enabled
5. Detect `?autoplay=true` URL param and pass to Game scene

## Architecture

```
Game.ts changes:
├── Add: private autoPlay = false
├── Add: private targetPath = 1 (0=top, 1=middle, 2=bottom)
├── Add: setAutoPlay(enabled: boolean)
├── Modify: update() - add autoFlap logic
├── Modify: gameOver() - auto restart if autoPlay
└── Modify: spawnAnswerGate() - pick random targetPath

Menu.ts changes:
├── Add: Check URL for ?autoplay=true
└── Add: Pass autoPlay flag via scene data or registry
```

## Related Code Files
- `src/game/scenes/Game.ts` - Main game logic
- `src/game/scenes/Menu.ts` - Menu scene (URL param detection)
- `src/app/page.tsx` - React wrapper (optional URL param pass-through)

## Implementation Steps

### Step 1: Add autoPlay properties to Game.ts
```typescript
// After bestScore property
private autoPlay = false;
private autoPlayTargetY = 380; // Default to middle path

// After setBestScore method
setAutoPlay(enabled: boolean): void {
  this.autoPlay = enabled;
}
```

### Step 2: Add auto-flap logic in update()
```typescript
// In update(), after isPaused check:
if (this.autoPlay && !this.isGameOver) {
  this.handleAutoPlay();
}

// New method:
private handleAutoPlay(): void {
  const capyY = this.capybara.y;
  const targetY = this.autoPlayTargetY;

  // Flap if capy is below target (need to go up)
  // Don't flap if above target (let gravity pull down)
  if (capyY > targetY + 30) {
    this.flap();
  }
}
```

### Step 3: Pick random target when gate spawns
```typescript
// In spawnAnswerGate(), after question.options.forEach:
if (this.autoPlay) {
  const pathYPositions = [220, 380, 540];
  const randomIndex = Math.floor(Math.random() * 3);
  this.autoPlayTargetY = pathYPositions[randomIndex];
}
```

### Step 4: Auto-restart on game over
```typescript
// In gameOver(), before creating overlay:
if (this.autoPlay) {
  this.time.delayedCall(2000, () => this.scene.restart());
  return; // Skip showing game over UI
}
```

### Step 5: URL param detection in Menu.ts
```typescript
// In create(), before Play button:
const urlParams = new URLSearchParams(window.location.search);
const autoPlay = urlParams.get('autoplay') === 'true';

if (autoPlay) {
  // Skip menu, start game directly with autoPlay
  this.unlockAudio();
  this.scene.start('Game', { autoPlay: true });
  return;
}
```

### Step 6: Read scene data in Game.ts
```typescript
// In init():
init(data?: { autoPlay?: boolean }): void {
  this.questions = questionsData as Question[];
  if (data?.autoPlay) {
    this.autoPlay = true;
  }
}
```

## Todo List
- [ ] Add autoPlay and autoPlayTargetY properties
- [ ] Add setAutoPlay() method
- [ ] Add handleAutoPlay() method
- [ ] Modify update() to call handleAutoPlay
- [ ] Modify spawnAnswerGate() to pick random target
- [ ] Modify gameOver() to auto-restart
- [ ] Add URL param detection in Menu.ts
- [ ] Modify init() to accept scene data
- [ ] Test with ?autoplay=true

## Success Criteria
- [ ] Game auto-plays when ?autoplay=true in URL
- [ ] Bot navigates to random paths (not always same one)
- [ ] Game auto-restarts after game over
- [ ] No console errors during auto-play
- [ ] Normal game unaffected when autoplay param not present

## Risk Assessment
- **Low:** Minimal changes to existing code
- **Low:** Feature is isolated and won't affect normal gameplay

## Security Considerations
- None - this is a testing feature with no user data exposure

## Next Steps
After implementation:
1. Test locally with `npm run dev`
2. Verify with `?autoplay=true` URL param
3. Deploy to Vercel for remote testing

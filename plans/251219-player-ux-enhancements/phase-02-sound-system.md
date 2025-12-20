# Phase 2: Sound System

## Context

- **Parent Plan:** [plan.md](plan.md)
- **Dependencies:** Phase 1 (settingsStore for sound toggle)
- **Docs:** N/A

## Overview

| Field | Value |
|-------|-------|
| Date | 2025-12-19 |
| Description | Add sound effects and background music |
| Priority | P1 - High |
| Implementation Status | Pending |
| Review Status | Pending |

## Key Insights

- Phaser native audio preferred over Howler.js for 3.60+
- Must unlock Web Audio Context on first user interaction
- AudioSprites reduce HTTP requests (one file, many clips)
- Mobile-first: preload only essential sounds

## Requirements

1. Sound effects: flap, correct, wrong, streak, level-up
2. Background music per world (optional, lower priority)
3. Master mute toggle in settings
4. Volume persists across sessions
5. Classroom-friendly: muted by default

## Architecture

### New Files

```
src/game/audio/AudioManager.ts      # Centralized audio control
public/audio/sfx.mp3                # AudioSprite (all SFX in one file)
public/audio/sfx.json               # AudioSprite markers
```

### Modified Files

```
src/game/scenes/Boot.ts             # Preload audio assets
src/game/scenes/Game.ts             # Play sounds on events
src/game/scenes/Menu.ts             # Unlock audio on first click
src/stores/settingsStore.ts         # Add volume controls
src/components/SettingsModal.tsx    # Volume sliders
```

## Related Code Files

- `src/game/scenes/Boot.ts:1-50` - Asset preloading
- `src/game/scenes/Game.ts:1-300` - Game events
- `src/stores/settingsStore.ts` - Settings (from Phase 1)

## Implementation Steps

### 2.1 AudioSprite Creation (External)

Create single MP3 with markers:
- `flap`: 0-200ms
- `correct`: 200-600ms
- `wrong`: 600-900ms
- `streak`: 900-1400ms
- `levelup`: 1400-2000ms

Use tool like Audiosprite or manual editing.

### 2.2 AudioManager Class (45 min)

```typescript
// src/game/audio/AudioManager.ts
export class AudioManager {
  private scene: Phaser.Scene;
  private enabled: boolean = false;
  private volume: number = 0.7;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  unlock() {
    // Called on first user interaction
    this.scene.sound.unlock();
    this.enabled = true;
  }

  play(key: string) {
    if (!this.enabled) return;
    this.scene.sound.play(key, { volume: this.volume });
  }

  setVolume(vol: number) {
    this.volume = vol;
  }

  mute() { this.enabled = false; }
  unmute() { this.enabled = true; }
}
```

### 2.3 Boot.ts Preload (15 min)

```typescript
// src/game/scenes/Boot.ts
preload() {
  // Load AudioSprite
  this.load.audioSprite('sfx', 'audio/sfx.json', ['audio/sfx.mp3']);
}
```

### 2.4 Menu.ts Audio Unlock (15 min)

```typescript
// src/game/scenes/Menu.ts - in create()
this.input.once('pointerdown', () => {
  this.sound.unlock();
});
```

### 2.5 Game.ts Sound Integration (30 min)

```typescript
// In handleAnswer()
if (isCorrect) {
  this.audioManager.play('correct');
  if (this.streakCount >= 5) {
    this.audioManager.play('streak');
  }
} else {
  this.audioManager.play('wrong');
}

// In handleFlap()
this.audioManager.play('flap');
```

### 2.6 Settings Integration (30 min)

```typescript
// src/stores/settingsStore.ts - extend
soundVolume: number;  // 0-1
setSoundVolume: (vol: number) => void;
```

```tsx
// src/components/SettingsModal.tsx
<input
  type="range"
  min="0" max="1" step="0.1"
  value={soundVolume}
  onChange={(e) => setSoundVolume(e.target.value)}
/>
```

### 2.7 EventBus Sound Events (15 min)

```typescript
// Alternative: emit from React, play in Phaser
EventBus.on(GameEvents.PLAY_SOUND, (key) => audioManager.play(key));
```

## Todo List

- [ ] Source/create audio assets
- [ ] Create AudioSprite JSON markers
- [ ] Implement AudioManager class
- [ ] Preload audio in Boot scene
- [ ] Unlock audio on first interaction
- [ ] Integrate sounds with game events
- [ ] Add volume slider to settings
- [ ] Test on mobile browsers
- [ ] Verify muted by default

## Success Criteria

- [ ] Sounds play on correct/wrong answers
- [ ] Flap sound on every jump
- [ ] Streak sound at 5+ streak
- [ ] Volume slider works
- [ ] Muted by default (classroom safe)
- [ ] No audio errors on mobile

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Audio blocked on mobile | High | High | Unlock on first tap |
| Large file size | Medium | Medium | Use compressed MP3, AudioSprite |
| Latency on first play | Low | Low | Preload in Boot scene |

## Security Considerations

- Audio files served from public folder
- No user-uploaded audio

## Next Steps

After Phase 2 completion:
1. Test across browsers (Safari, Chrome, Firefox)
2. Gather feedback on sound quality
3. Proceed to Phase 3 (Daily Challenge)

# Debug Report: Immediate Game Over Issue

**Date:** 2025-12-19 07:19
**Issue:** Game triggers immediate "Game Over" upon starting
**Severity:** Critical - Game unplayable

---

## Executive Summary

**Root Cause:** Ground collision triggered immediately due to capybara spawning below ground collision threshold with gravity active.

**Impact:** Game unplayable - instant game over on scene start.

**Fix Required:** Disable gravity during initialization OR delay collision check until first player input.

---

## Technical Analysis

### Initial Position vs Ground Collision

**Ground Configuration** (`Game.ts` L82-83):
```typescript
this.ground = this.add.rectangle(400, GROUND_Y + 40, 800, 80, 0xdde5b6);
// GROUND_Y = 520
// Ground positioned at y = 560, with height 80
// Collision box spans y = 520 to y = 600
```

**Capybara Initial Position** (`Game.ts` L86):
```typescript
this.capybara = this.physics.add.sprite(120, 300, "capybara");
// Spawns at y = 300
```

**Gravity Configuration** (`config.ts` L24):
```typescript
gravity: { x: 0, y: 1000 }
```

### Timeline of Events

1. **Scene Create (frame 0)**
   - Ground created at y=560 (collision box: y=520-600)
   - Capybara spawned at y=300
   - Gravity enabled (1000 px/s²)
   - Collision handler registered

2. **Frame 1+ (immediate)**
   - Gravity pulls capybara downward
   - No flap input yet (player hasn't clicked)
   - Capybara falls freely

3. **Collision Detection**
   - With 1000 gravity + no initial upward velocity
   - Capybara falls ~300px in ~0.77s
   - Reaches ground collision box (y≥520)
   - Collision handler fires

4. **Game Over Triggered** (`Game.ts` L93-95)
   ```typescript
   this.physics.add.collider(this.capybara, this.ground, () => {
     if (!this.isGameOver) this.gameOver();
   });
   ```

### Physics Calculation

Free fall distance: `d = ½gt²`
- To fall 220px (from y=300 to y=520): `220 = ½(1000)t²`
- `t² = 0.44`
- `t ≈ 0.66 seconds`

**Problem:** Player needs >0.66s reaction time from game start to first flap, which is unrealistic for auto-starting game.

### Code Evidence

**No Grace Period:** Collision active immediately on create:
```typescript
// L93-95: Collision registered with no delay
this.physics.add.collider(this.capybara, this.ground, () => {
  if (!this.isGameOver) this.gameOver();
});
```

**No Initial Velocity:** Capybara starts stationary:
```typescript
// L86: No initial upward velocity
this.capybara = this.physics.add.sprite(120, 300, "capybara");
```

**World Bounds Won't Help:** Set at L87 but doesn't prevent ground collision:
```typescript
this.capybara.setCollideWorldBounds(true);
// This only prevents leaving canvas, doesn't stop ground collider
```

---

## Solution Design

### Option 1: Delay Gravity (RECOMMENDED)

**Implementation:**
```typescript
// In create() after capybara setup
const capyBody = this.capybara.body as Phaser.Physics.Arcade.Body;
capyBody.allowGravity = false; // Start with no gravity

// Enable gravity on first input
this.input.once("pointerdown", () => {
  capyBody.allowGravity = true;
  this.flap();
});

this.input.keyboard?.once("keydown-SPACE", () => {
  capyBody.allowGravity = true;
  this.flap();
});
```

**Pros:**
- Clean solution
- Gives player control
- No arbitrary timers

**Cons:**
- Slightly changes game feel (capybara static until first input)

### Option 2: Initial Upward Velocity

**Implementation:**
```typescript
// After capybara creation
const capyBody = this.capybara.body as Phaser.Physics.Arcade.Body;
capyBody.velocity.y = FLAP_VELOCITY; // Start with upward motion
```

**Pros:**
- Game starts immediately with motion
- More dynamic feel

**Cons:**
- Player may not be ready
- Still vulnerable if player doesn't act quickly

### Option 3: Delay Collision Detection

**Implementation:**
```typescript
// Add collision with delay
this.time.delayedCall(2000, () => {
  this.physics.add.collider(this.capybara, this.ground, () => {
    if (!this.isGameOver) this.gameOver();
  });
});
```

**Pros:**
- Simple change
- Gives guaranteed grace period

**Cons:**
- Arbitrary time value
- Capybara can clip through ground during delay

---

## Recommended Fix

**Use Option 1** - Delay gravity until first input:

```typescript
// In create() method, after line 90
const capyBody = this.capybara.body as Phaser.Physics.Arcade.Body;
capyBody.setSize(60, 50);
capyBody.allowGravity = false; // ADD THIS

// Modify flap() method to enable gravity on first call
private flap(): void {
  if (this.isGameOver) return;

  const capyBody = this.capybara.body as Phaser.Physics.Arcade.Body;

  // Enable gravity on first flap
  if (!capyBody.allowGravity) {
    capyBody.allowGravity = true;
  }

  capyBody.velocity.y = FLAP_VELOCITY;
}
```

**File to modify:** `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/Preliminary math checkpoint/capy-checkpoint-next/src/game/scenes/Game.ts`

---

## Verification Steps

After fix:
1. Start game from Menu
2. Observe capybara hovering at y=300
3. Click/press space
4. Verify gravity activates
5. Verify ground collision works after first flap
6. Test multiple rounds for consistency

---

## Related Issues

None detected - this is isolated initialization issue.

## Unresolved Questions

None - root cause confirmed, fix straightforward.

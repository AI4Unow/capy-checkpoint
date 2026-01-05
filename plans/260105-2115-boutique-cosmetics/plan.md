---
title: "Integrate Boutique Cosmetics in Game"
description: "Connect boutique system to Game scene to render equipped hats, accessories, and trails"
status: pending
priority: P1
effort: 2h
branch: master
tags: [boutique, cosmetics, game, phaser]
created: 2026-01-05
---

# Integrate Boutique Cosmetics in Game

## Context

Boutique items can be purchased and equipped, but cosmetic managers (TrailEffectManager, HatOverlayManager, AccessoryOverlayManager) are never instantiated in Game.ts, so items have no visual effect.

## Objectives

1. Integrate cosmetic managers into Game.ts
2. Apply equipped items from boutiqueStore
3. Update cosmetics in game loop
4. Handle pause/resume/destroy properly

## Implementation Plan

### Phase 1: Import and Setup

**File**: `src/game/scenes/Game.ts`

- [ ] Import cosmetic managers:
  ```typescript
  import { TrailEffectManager } from "../cosmetics/trail-effects";
  import { HatOverlayManager } from "../cosmetics/hat-overlays";
  import { AccessoryOverlayManager } from "../cosmetics/accessory-overlays";
  ```

- [ ] Import boutiqueStore:
  ```typescript
  import { useBoutiqueStore } from "@/stores/boutiqueStore";
  ```

- [ ] Add private properties to Game class:
  ```typescript
  private trailManager!: TrailEffectManager;
  private hatManager!: HatOverlayManager;
  private accessoryManager!: AccessoryOverlayManager;
  ```

### Phase 2: Initialize Cosmetics in create()

- [ ] After capybara sprite creation (around line 159-177):
  ```typescript
  // Initialize cosmetic managers
  this.trailManager = new TrailEffectManager(this);
  this.hatManager = new HatOverlayManager(this);
  this.accessoryManager = new AccessoryOverlayManager(this);
  ```

- [ ] Apply equipped cosmetics from boutiqueStore:
  ```typescript
  // Apply equipped boutique items
  const boutiqueStore = useBoutiqueStore.getState();

  // Apply trail
  if (boutiqueStore.equipped.trail) {
    this.trailManager.setTrail(
      boutiqueStore.equipped.trail as any,
      this.capybara
    );
  }

  // Apply hat
  if (boutiqueStore.equipped.hat) {
    this.hatManager.setHat(
      boutiqueStore.equipped.hat,
      this.capybara
    );
  }

  // Apply accessory
  if (boutiqueStore.equipped.accessory) {
    this.accessoryManager.setAccessory(
      boutiqueStore.equipped.accessory,
      this.capybara
    );
  }
  ```

### Phase 3: Update Cosmetics in update()

- [ ] In `update()` method (around line 266), add cosmetic updates:
  ```typescript
  // Update cosmetic overlays
  this.hatManager.update();
  this.accessoryManager.update();
  ```

### Phase 4: Handle Pause/Resume

- [ ] In `pauseGame()` method (around line 112-119):
  ```typescript
  this.trailManager.pause();
  ```

- [ ] In `resumeGame()` method (around line 124-131):
  ```typescript
  this.trailManager.resume();
  ```

### Phase 5: Cleanup

- [ ] Add destroy logic (create new method or add to existing cleanup):
  ```typescript
  destroy() {
    this.trailManager.destroy();
    this.hatManager.destroy();
    this.accessoryManager.destroy();
  }
  ```

## Testing

1. Purchase trail item (e.g., Sparkle Trail)
2. Equip trail in Boutique
3. Start game - trail particles should appear behind capybara
4. Repeat for hats and accessories

## Technical Details

### Cosmetic Depths
- Background: 0
- Trail particles: 8
- Capybara: 10
- Accessories: 11
- Hats: 12

### Update Order
1. Phaser physics updates capybara position
2. Hat manager updates hat position to follow capybara
3. Accessory manager updates accessory position
4. Trail manager emits particles (automatic via Phaser)

## Definition of Done

- All boutique items (trails, hats, accessories) visually appear in-game
- Cosmetics follow capybara smoothly during flight
- Cosmetics pause/resume with game
- No performance issues or memory leaks

## Unresolved Questions
- Should cosmetics also appear in Menu scene (on the idle capybara)?
- Are backgrounds working? (Need separate investigation)

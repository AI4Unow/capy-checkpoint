# Boutique Effects Debugging Report

**Date**: 2026-01-05
**Issue**: Multiple boutique items not working (trail, accessories, hats, backgrounds)
**Status**: Root cause identified ✅

## Summary

Boutique system has UI/store layer fully implemented but **zero game integration**. All visual effects (trails, hats, accessories, backgrounds) are missing rendering logic in Phaser game scene.

## Architecture Analysis

### ✅ Working Components

1. **Data Layer** (`src/data/boutique.ts`)
   - 18 boutique items defined (4 trails, 5 hats, 4 accessories, 4 backgrounds)
   - Categories: hat, accessory, trail, background
   - Unlock conditions: rating, streak, mastered count
   - Price, rarity, emoji metadata

2. **Store Layer** (`src/stores/boutiqueStore.ts`)
   - Purchase/equip/unequip logic ✅
   - Persistence via Zustand ✅
   - Coin deduction ✅
   - Unlock condition validation ✅
   - Equipped items tracked in state:
     ```ts
     equipped: {
       hat: string;
       accessory: string | null;
       trail: string | null;
       background: string;
     }
     ```

3. **UI Layer** (`src/components/Boutique.tsx`)
   - Modal displays all items ✅
   - Purchase/equip buttons work ✅
   - Visual indicators (rarity, locked status) ✅

### ❌ Missing Components

**Game Integration Layer** - Completely absent!

Searched `src/game/` directory for:
- `useBoutiqueStore` imports → **Not found**
- `equipped.trail` references → **Not found**
- `particle` / `emitter` / `trail` rendering → **Not found**
- Hat/accessory sprite rendering → **Not found**
- Background switching → **Not found**

**Game.ts Analysis** (`src/game/scenes/Game.ts:1-200`):
- Creates capybara sprite at line 159
- No boutique store imports
- No equipped item checks
- No particle effects setup
- Background is static tileSprite (line 152)

## Root Cause

**Missing Implementation**: Boutique equipped items are stored in React state but never read by Phaser game scene. Game renders default assets regardless of boutique selections.

## Impact Assessment

| Item Category | Expected Effect | Current Status | Implementation Needed |
|--------------|----------------|----------------|----------------------|
| **Trail** | Particle emitter following capy | ❌ None | Phaser.GameObjects.Particles.ParticleEmitter |
| **Hat** | Sprite overlay on capy head | ❌ None | Phaser.GameObjects.Sprite (child) |
| **Accessory** | Sprite overlay on capy body | ❌ None | Phaser.GameObjects.Sprite (child) |
| **Background** | Change tileSprite texture | ❌ None | this.background.setTexture() |

## Code Gaps

1. **No EventBus communication** between React boutique store and Phaser game
2. **No Phaser preload** for boutique asset textures (trails, hats, accessories, backgrounds)
3. **No particle emitter** setup in Game.create()
4. **No sprite children** attached to capybara for hats/accessories
5. **No dynamic background switching** based on equipped background

## Next Steps

See implementation plan: `plans/260105-2018-boutique-effects/plan.md`

### Critical Files to Modify

1. `src/game/scenes/Game.ts` - Add boutique integration
2. `src/game/EventBus.ts` - Add BOUTIQUE_CHANGED event
3. `src/game/scenes/Preloader.ts` - Load boutique assets
4. `src/stores/boutiqueStore.ts` - Emit EventBus on equip changes

### Estimated Scope

- Particle systems: ~50 LOC
- Hat/accessory sprites: ~40 LOC
- Background switching: ~20 LOC
- EventBus wiring: ~30 LOC
- Asset loading: ~30 LOC

**Total**: ~170 LOC across 4 files

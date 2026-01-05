# Debugger Report: Boutique Effects Not Working

**Date:** 2026-01-05
**Issue:** Boutique items (trail, hat, accessory) have no visual effect in-game

## Root Cause

Cosmetic managers exist but are **never instantiated or integrated** in Game.ts/Menu.ts:
- `TrailEffectManager` - exists but not used
- `HatOverlayManager` - exists but not used
- `AccessoryOverlayManager` - exists but not used

## Evidence

1. **Boutique store tracks equipped items**: `boutiqueStore.ts` correctly stores equipped hat, accessory, trail, background
2. **Cosmetic managers implemented**: All three managers (trail, hat, accessory) have complete implementations in `src/game/cosmetics/`
3. **Missing integration**: `grep "TrailEffectManager|HatOverlayManager|AccessoryOverlayManager" Game.ts` returns no matches
4. **Result**: Players can purchase and equip items, but they never render in-game

## Affected Items

- **Trails** (4 items): sparkle, hearts, stars, rainbow - **NO EFFECT**
- **Hats** (5 items): yuzu, strawberry, flower crown, wizard, rainbow - **NO EFFECT**
- **Accessories** (4 items): glasses, bowtie, scarf, cape - **NO EFFECT**
- **Backgrounds** (4 items): forest, garden, ocean, sky castle - **UNKNOWN** (need to check)

## Required Fix

Integrate cosmetic managers in `Game.ts`:
1. Import managers and boutiqueStore
2. Instantiate managers in `create()`
3. Read equipped items from boutiqueStore
4. Apply cosmetics to capybara sprite
5. Update cosmetics in `update()` loop
6. Handle pause/resume for trail effects
7. Clean up on destroy

## Unresolved Questions
- Are backgrounds also not working?
- Should cosmetics appear in Menu scene?

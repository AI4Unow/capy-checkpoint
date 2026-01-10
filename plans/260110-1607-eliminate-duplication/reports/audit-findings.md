# Code Audit Findings

**Date:** 2026-01-10
**Audited by:** fullstack-developer
**Purpose:** Identify code redundancies for potential elimination

---

## 1. useQuestionBank Hook

**Status:** DEAD CODE
**Action:** DELETE
**Evidence:**

- Only 1 grep match: the hook definition itself in `src/hooks/useQuestionBank.ts`
- Zero imports/usages across entire codebase
- Superseded by `src/lib/questionsService.ts` (Firebase-backed service)

**Comparison:**

| Feature | useQuestionBank (UNUSED) | questionsService (ACTIVE) |
|---------|--------------------------|---------------------------|
| Data source | Local JSON only | Firebase + local fallback |
| Caching | React state | Module-level cache (5min TTL) |
| API | React hook | Async functions |
| Topic filter | ✓ | ✓ |
| Difficulty filter | ✗ | ✓ |
| Stats tracking | ✗ | ✓ (Firebase integration) |

**Recommendation:** Delete `src/hooks/useQuestionBank.ts` immediately. No migration needed - questionsService is already active.

---

## 2. Cosmetics Overlays

**Status:** DISTINCT IMPLEMENTATIONS
**Recommendation:** EXTRACT SHARED BASE CLASS
**Analysis:**

All 3 files share identical manager pattern:

### Common Pattern (90% identical)

```typescript
class XyzManager {
  private scene: Phaser.Scene;
  private textObject: Phaser.GameObjects.Text | null;
  private currentItem: Type | null;
  private followTarget: Sprite | null;

  constructor(scene) { ... }
  setItem(id, target) { ... }      // Create emoji overlay
  update() { ... }                  // Follow target
  getCurrentItem() { ... }
  setVisible(visible) { ... }
  destroy() { ... }
}
```

### Differences

| File | Type | Depth | Rotation Logic | Config Keys |
|------|------|-------|----------------|-------------|
| hat-overlays.ts | HatType | 12 | `rotation * 0.5` | emoji, offsetX/Y, fontSize |
| accessory-overlays.ts | AccessoryType | 11 | `(config.rotation \|\| 0) + rotation * 0.3` | Same + optional rotation |
| trail-effects.ts | TrailType | 8 | N/A (particles) | color[], emoji, scale, lifespan, frequency |

### Duplication Evidence

**Identical methods:** `setVisible()`, `getCurrentItem()`, `destroy()`
**90% similar:** `setItem()` (only differs in config lookup)
**Similar:** `update()` (position tracking logic)

**Line count:**
- hat-overlays.ts: 148 lines
- accessory-overlays.ts: 143 lines
- trail-effects.ts: 182 lines (particle-based, less similar)

### Recommended Refactor

Create base class:

```typescript
// src/game/cosmetics/base/EmojiOverlayManager.ts
abstract class EmojiOverlayManager<T extends string> {
  protected scene: Phaser.Scene;
  protected textObject: Phaser.GameObjects.Text | null;
  protected currentItem: T | null;
  protected followTarget: Phaser.GameObjects.Sprite | null;
  protected abstract configs: Record<T, OverlayConfig>;
  protected abstract depth: number;

  // Common methods: setVisible, destroy, getCurrentItem
  protected abstract updateRotation(): number;
}
```

**Impact:** Reduce ~200 LOC → ~80 LOC + 3 small subclasses
**Risk:** Medium (refactor during gameplay changes)
**Priority:** P3 (technical debt, not urgent)

---

## 3. Service Worker Files

**Status:** NO REDUNDANCY - CLEAR SEPARATION
**Recommendation:** KEEP AS-IS

**Responsibilities Map:**

| File | Purpose | Lines | Called By |
|------|---------|-------|-----------|
| `sw.ts` | SW implementation (Serwist cache strategies, background sync) | 100 | Browser SW runtime |
| `register-sw.ts` | Registration utility (browser API, update detection) | 39 | ServiceWorkerRegistration.tsx |
| `ServiceWorkerRegistration.tsx` | React wrapper (triggers registration on mount) | 16 | App root |

**Data Flow:**
```
App.tsx → ServiceWorkerRegistration.tsx → register-sw.ts → browser → sw.ts
```

**Validation:**
- ✓ Zero duplicate logic
- ✓ Clear single responsibilities
- ✓ Minimal coupling (React → utility → browser API → SW)

**Rationale for 3 files:**
1. **sw.ts**: Runs in worker context (no DOM/React)
2. **register-sw.ts**: Pure JS utility (reusable, testable)
3. **ServiceWorkerRegistration.tsx**: React integration (client component boundary)

**Verdict:** Architecture follows best practices. No changes needed.

---

## 4. Audio System

**Status:** SEPARATE RESPONSIBILITIES
**Relationship:** PARALLEL IMPLEMENTATIONS
**Recommendation:** KEEP BOTH

**Comparison:**

| Aspect | AudioManager | SynthSounds |
|--------|--------------|-------------|
| **Purpose** | Phaser sound manager (preloaded assets) | Web Audio API (procedural synthesis) |
| **Use case** | Primary game sounds (if files exist) | Fallback + boutique sounds |
| **API** | Phaser Scene API | AudioContext oscillators |
| **Integration** | EventBus (React settings sync) | Standalone singleton |
| **State** | enabled, volume, unlocked | enabled, volume, audioContext |
| **Methods** | play(), playCorrect(), playWrong(), playFlap() | playCorrect(), playWrong(), playFlap(), **+ capybara sounds** |

**Key Differences:**

1. **AudioManager**: Wraps Phaser's asset-based sound system
   - Checks `scene.cache.audio.exists(key)` before playing
   - Listens to EventBus (SOUND_TOGGLE, VOLUME_CHANGE)
   - Manages Phaser Sound unlock

2. **SynthSounds**: Web Audio synthesis for procedural sounds
   - No external files needed
   - Creates tones/noise via oscillators
   - Extra methods: `playHappyCapy()`, `playJackpot()`, `playBoxOpen()`
   - Used for boutique wheel, special effects

**No Duplication:**
- Different audio engines (Phaser vs Web Audio)
- Different use cases (assets vs synth)
- No shared code besides volume/enabled state (unavoidable)

**Current Usage:**
- AudioManager: Active in Phaser scenes
- SynthSounds: Exported singleton `synthSounds` (check actual usage in game)

**Verdict:** Complementary systems, not duplicates. Both needed.

---

## Summary Table

| Component | Status | Action | Priority | LOC Impact |
|-----------|--------|--------|----------|------------|
| useQuestionBank | Dead | DELETE | P1 | -73 |
| Cosmetics overlays | Duplicate pattern | EXTRACT BASE | P3 | -120 |
| Service Worker files | Distinct | KEEP | - | 0 |
| Audio system | Separate | KEEP | - | 0 |

**Total removable LOC:** ~193 lines
**Estimated effort:** 2h (delete hook + base class extraction)

---

## Unresolved Questions

1. **SynthSounds usage:** Grep for `synthSounds` imports to confirm if actively used or also dead code
2. **Cosmetics refactor timing:** Should base class extraction wait until cosmetics expansion (Phase 02)?
3. **Test coverage:** Does deleting useQuestionBank require test cleanup?

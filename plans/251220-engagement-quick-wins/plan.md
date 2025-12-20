# Engagement Quick Wins Plan

**Date:** 2025-12-20
**Target User:** 10-11 year old who loves capybaras, not math
**Focus:** Caring/nurturing (B) + Gambling/surprise (D)

## Executive Summary

Four engagement features using gamification psychology to make Mathie addictive:
1. **Lucky Spin Wheel** - Variable reward dopamine loop
2. **Capy Reactions** - Emotional connection through animations/sounds
3. **Capy Mood System** - Tamagotchi-style nurturing mechanic
4. **Mystery Boxes** - Achievement-earned tiered rewards

## Architecture Overview

```
stores/
  spinStore.ts        # Spin wheel state + daily free spin
  moodStore.ts        # Happiness, hunger, satiation timers
  mysteryBoxStore.ts  # Earned boxes, opening state

components/
  SpinWheel.tsx       # Animated wheel + modal
  CapyMood.tsx        # Mood indicator on menu
  CapyReactions.tsx   # Animated reactions overlay
  MysteryBox.tsx      # Box opening animation

game/audio/
  SynthSounds.ts      # +4 new sounds (spin, mood sounds, box open)

data/
  spinPrizes.ts       # Prize definitions + weights
  mysteryBoxTiers.ts  # Box tiers + loot tables
```

---

## Phase 1: Lucky Spin Wheel (Priority: HIGHEST)

### Why First
- Immediate dopamine hit
- Costs coins → creates economy sink
- Daily free spin → daily engagement loop

### Implementation

#### 1.1 Data: Prize Definitions
File: `src/data/spinPrizes.ts`

```typescript
export interface SpinPrize {
  id: string;
  name: string;
  emoji: string;
  type: "coins" | "item" | "xp_boost" | "mystery_box" | "nothing";
  value: number | string; // coins amount or item ID
  weight: number; // Higher = more common (1-100)
  rarity: "common" | "rare" | "epic" | "legendary";
}

export const SPIN_PRIZES: SpinPrize[] = [
  // Common (weight 30-50)
  { id: "coins_10", name: "+10 Coins", emoji: "🪙", type: "coins", value: 10, weight: 50, rarity: "common" },
  { id: "coins_25", name: "+25 Coins", emoji: "💰", type: "coins", value: 25, weight: 40, rarity: "common" },
  { id: "nothing", name: "Try Again!", emoji: "💨", type: "nothing", value: 0, weight: 30, rarity: "common" },

  // Rare (weight 10-20)
  { id: "coins_50", name: "+50 Coins", emoji: "💎", type: "coins", value: 50, weight: 20, rarity: "rare" },
  { id: "mystery_common", name: "Mystery Box", emoji: "📦", type: "mystery_box", value: "common", weight: 15, rarity: "rare" },

  // Epic (weight 3-8)
  { id: "coins_100", name: "+100 Coins", emoji: "👑", type: "coins", value: 100, weight: 8, rarity: "epic" },
  { id: "mystery_rare", name: "Rare Box", emoji: "🎁", type: "mystery_box", value: "rare", weight: 5, rarity: "epic" },

  // Legendary (weight 1-2)
  { id: "coins_250", name: "JACKPOT!", emoji: "🎰", type: "coins", value: 250, weight: 2, rarity: "legendary" },
];
```

#### 1.2 Store: Spin State
File: `src/stores/spinStore.ts`

```typescript
interface SpinState {
  lastFreeSpinDate: string | null; // ISO date string
  spinsToday: number;

  // Actions
  canFreeSpin: () => boolean;
  recordSpin: (isFree: boolean) => void;
  reset: () => void;
}
```

Logic:
- One free spin per calendar day (local timezone)
- Paid spins cost 30 coins each
- No limit on paid spins

#### 1.3 Component: SpinWheel
File: `src/components/SpinWheel.tsx`

Features:
- 8 prize segments on wheel
- CSS animation: `spin-wheel` keyframe (3-5 rotations + easing)
- Prize selection: weighted random before animation starts
- Animation duration: 3-4 seconds
- Result reveal: 1s delay after stop, then prize modal

UI States:
1. **Closed** - Button on menu "🎰 Spin!"
2. **Open** - Modal with wheel + spin button
3. **Spinning** - Wheel animation, button disabled
4. **Result** - Prize reveal with confetti if rare+

#### 1.4 Sounds
Add to `SynthSounds.ts`:
- `playSpin()` - Wheel tick sound during spin
- `playJackpot()` - Big win fanfare

### Tasks
- [ ] Create `src/data/spinPrizes.ts` with 8 prizes
- [ ] Create `src/stores/spinStore.ts` with persist
- [ ] Create `src/components/SpinWheel.tsx` with animation
- [ ] Add spin sounds to `SynthSounds.ts`
- [ ] Add "🎰 Spin!" button to menu (next to Badges/Boutique)
- [ ] Integrate with gameStore (coin deduction/addition)

---

## Phase 2: Capy Reactions

### Why
- Immediate emotional feedback
- Makes capy feel "alive"
- No persistent state needed

### Implementation

#### 2.1 Reaction Types
```typescript
type CapyReaction =
  | "happy"      // Correct answer: bouncing, sparkle eyes
  | "sad"        // Wrong answer: droopy ears, single tear
  | "excited"    // Streak milestone: jump + spin
  | "sleepy"     // Low mood: droopy eyes, yawn
  | "hungry"     // Low mood: rumbling tummy icon
  | "love"       // Pet/feed: hearts floating up
```

#### 2.2 Component: CapyReactions
File: `src/components/CapyReactions.tsx`

- Positioned overlay on capybara sprite location
- Triggered via EventBus
- Auto-dismiss after 1-2 seconds
- CSS animations for each reaction type

#### 2.3 Sounds
Add to `SynthSounds.ts`:
- `playHappyCapy()` - Cute squeak
- `playSadCapy()` - Soft whimper
- `playExcitedCapy()` - Excited chirp

#### 2.4 Integration Points
- `CORRECT_ANSWER` → happy
- `WRONG_ANSWER` → sad
- `STREAK_MILESTONE` → excited
- Low mood → sleepy/hungry

### Tasks
- [ ] Create `src/components/CapyReactions.tsx`
- [ ] Add 3 capy sounds to `SynthSounds.ts`
- [ ] Add CAPY_REACT event to EventBus
- [ ] Trigger reactions from Game.ts on answer events
- [ ] Add overlay to page.tsx

---

## Phase 3: Capy Mood System

### Why
- Tamagotchi effect = guilt-driven engagement
- Checking on capy = daily return habit
- Caring mechanic appeals to nurturing preference

### Implementation

#### 3.1 Mood Mechanics
```typescript
interface MoodState {
  happiness: number;    // 0-100, decays 10 per 8 hours
  lastPlayedAt: string; // ISO timestamp
  lastFedAt: string;    // ISO timestamp
  streak: number;       // Consecutive days played

  // Derived
  getMoodLevel: () => "ecstatic" | "happy" | "neutral" | "sad" | "depressed";
  getHungerLevel: () => "full" | "satisfied" | "hungry" | "starving";
}
```

Happiness factors:
- +10 per correct answer (max +50/session)
- +20 for daily login
- +30 for feeding (costs 10 coins)
- -10 per 8 hours not played
- -20 if haven't played in 24 hours

#### 3.2 Store: Mood State
File: `src/stores/moodStore.ts`

```typescript
interface MoodState {
  happiness: number;
  lastPlayedAt: string | null;
  lastFedAt: string | null;
  consecutiveDays: number;

  // Actions
  recordPlay: () => void;
  feedCapy: () => boolean; // Returns false if can't afford
  addHappiness: (amount: number) => void;
  calculateDecay: () => void; // Call on app load
}
```

#### 3.3 Component: CapyMood
File: `src/components/CapyMood.tsx`

Location: Menu screen, near capy character

Features:
- Mood face emoji indicator
- Progress bar showing happiness %
- "Feed Capy" button (10 coins, +30 happiness)
- "Pet Capy" button (free, +5 happiness, 10 min cooldown)

Mood Levels:
- 80-100: 😍 Ecstatic (sparkles)
- 60-79: 😊 Happy
- 40-59: 😐 Neutral
- 20-39: 😢 Sad
- 0-19: 😭 Depressed

#### 3.4 Decay Calculation
On app load:
1. Get time since lastPlayedAt
2. Calculate decay: floor(hours / 8) * 10
3. Apply decay (minimum 0)
4. If >24h, show "Capy missed you!" message

### Tasks
- [ ] Create `src/stores/moodStore.ts` with persist
- [ ] Create `src/components/CapyMood.tsx`
- [ ] Add decay calculation on app load (in page.tsx useEffect)
- [ ] Connect happiness gains to correct answers
- [ ] Add "Capy missed you!" welcome back modal
- [ ] Connect mood level to CapyReactions (sleepy/hungry when low)

---

## Phase 4: Mystery Boxes

### Why
- Surprise mechanics = high dopamine
- Earned through achievements = rewards skill
- Tiered system = anticipation/excitement

### Implementation

#### 4.1 Box Tiers
File: `src/data/mysteryBoxTiers.ts`

```typescript
export interface MysteryBoxTier {
  id: "common" | "rare" | "epic" | "legendary";
  name: string;
  emoji: string;
  color: string;
  lootTable: BoxLoot[];
}

export interface BoxLoot {
  type: "coins" | "item" | "hat" | "accessory" | "trail";
  value: number | string;
  weight: number;
}

export const MYSTERY_BOX_TIERS: MysteryBoxTier[] = [
  {
    id: "common",
    name: "Mystery Box",
    emoji: "📦",
    color: "#9CA3AF",
    lootTable: [
      { type: "coins", value: 15, weight: 50 },
      { type: "coins", value: 25, weight: 30 },
      { type: "coins", value: 40, weight: 15 },
      { type: "item", value: "hat_strawberry", weight: 5 },
    ],
  },
  // ... rare, epic, legendary with better loot
];
```

#### 4.2 Store: Mystery Box State
File: `src/stores/mysteryBoxStore.ts`

```typescript
interface MysteryBoxState {
  boxes: { tier: string; earnedAt: string }[];
  isOpening: boolean;
  lastOpenedReward: BoxLoot | null;

  // Actions
  addBox: (tier: string) => void;
  openBox: (index: number) => BoxLoot;
  dismissReward: () => void;
}
```

#### 4.3 Earning Boxes
Integration with existing systems:
- Badge unlock → earn box matching badge tier
- Spin wheel → can win boxes
- Daily challenge 3/3 → earn common box
- Perfect session (5+ correct, 0 wrong) → earn common box
- 10 questions mastered → earn rare box

#### 4.4 Component: MysteryBox
File: `src/components/MysteryBox.tsx`

Features:
- Box inventory display (show count per tier)
- Open animation: box shakes → opens → reveal
- Reward modal with item/coins display

### Tasks
- [ ] Create `src/data/mysteryBoxTiers.ts` with 4 tiers
- [ ] Create `src/stores/mysteryBoxStore.ts` with persist
- [ ] Create `src/components/MysteryBox.tsx`
- [ ] Add box earning triggers to BadgeChecker
- [ ] Add box inventory to menu screen
- [ ] Add box opening sounds to SynthSounds

---

## Implementation Order

| # | Feature | Est. Size | Deps |
|---|---------|-----------|------|
| 1 | Spin Wheel | Medium | gameStore (coins) |
| 2 | Capy Reactions | Small | EventBus |
| 3 | Capy Mood | Medium | gameStore, CapyReactions |
| 4 | Mystery Boxes | Medium | badgeStore, Spin Wheel |

**Recommended:** Implement in order 1→2→3→4. Each builds on previous.

---

## File Summary

### New Files
1. `src/data/spinPrizes.ts`
2. `src/data/mysteryBoxTiers.ts`
3. `src/stores/spinStore.ts`
4. `src/stores/moodStore.ts`
5. `src/stores/mysteryBoxStore.ts`
6. `src/components/SpinWheel.tsx`
7. `src/components/CapyReactions.tsx`
8. `src/components/CapyMood.tsx`
9. `src/components/MysteryBox.tsx`

### Modified Files
1. `src/game/audio/SynthSounds.ts` - Add 6 new sounds
2. `src/game/EventBus.ts` - Add CAPY_REACT, BOX_EARNED events
3. `src/app/page.tsx` - Add new components
4. `src/components/MenuOverlay.tsx` - Add Spin/Mood/Boxes buttons
5. `src/components/BadgeChecker.tsx` - Add box earning triggers
6. `src/components/DailyChallenge.tsx` - Add box reward for 3/3

---

## Success Metrics

After implementation, measure:
- Daily active users (return rate)
- Session duration
- Spin wheel usage
- Feed/pet frequency
- Box opening rate

Target: 3+ sessions per week, 10+ minutes per session

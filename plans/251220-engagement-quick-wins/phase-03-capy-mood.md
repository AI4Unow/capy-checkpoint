# Phase 3: Capy Mood System

**Priority:** MEDIUM
**Estimated Tasks:** 6
**Depends On:** Phase 2 (CapyReactions)

## Objective
Create a Tamagotchi-style happiness system where the capybara's mood reflects player engagement. Drives daily returns through guilt/nurturing mechanics.

## Mechanics Overview

### Happiness (0-100)
- Decays over time when not playing
- Increases with correct answers, feeding, petting
- Affects capy's visual expression and reactions

### Mood Levels
| Range | Level | Emoji | Effect |
|-------|-------|-------|--------|
| 80-100 | Ecstatic | 😍 | Sparkle eyes, extra bouncy |
| 60-79 | Happy | 😊 | Normal, content |
| 40-59 | Neutral | 😐 | Slightly droopy |
| 20-39 | Sad | 😢 | Triggers sad reactions |
| 0-19 | Depressed | 😭 | Triggers sleepy/hungry reactions |

## Tasks

### 3.1 Create Mood Store
File: `src/stores/moodStore.ts`

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface MoodState {
  happiness: number; // 0-100
  lastPlayedAt: string | null; // ISO timestamp
  lastFedAt: string | null;
  lastPetAt: string | null;
  consecutiveDays: number;

  // Getters
  getMoodLevel: () => "ecstatic" | "happy" | "neutral" | "sad" | "depressed";
  canPet: () => boolean; // 10 min cooldown
  canFeed: () => boolean; // Has coins

  // Actions
  recordPlay: () => void;
  addHappiness: (amount: number) => void;
  feedCapy: () => void;
  petCapy: () => void;
  calculateDecay: () => { hoursAway: number; decayed: number };
}

export const useMoodStore = create<MoodState>()(
  persist(
    (set, get) => ({
      happiness: 70, // Start happy
      lastPlayedAt: null,
      lastFedAt: null,
      lastPetAt: null,
      consecutiveDays: 0,

      getMoodLevel: () => {
        const h = get().happiness;
        if (h >= 80) return "ecstatic";
        if (h >= 60) return "happy";
        if (h >= 40) return "neutral";
        if (h >= 20) return "sad";
        return "depressed";
      },

      canPet: () => {
        const { lastPetAt } = get();
        if (!lastPetAt) return true;
        const tenMinutes = 10 * 60 * 1000;
        return Date.now() - new Date(lastPetAt).getTime() > tenMinutes;
      },

      canFeed: () => {
        // Will check coins in component
        return true;
      },

      recordPlay: () => {
        const now = new Date();
        const today = now.toISOString().split("T")[0];
        const { lastPlayedAt, consecutiveDays } = get();

        let newStreak = 1;
        if (lastPlayedAt) {
          const lastDate = lastPlayedAt.split("T")[0];
          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split("T")[0];

          if (lastDate === today) {
            newStreak = consecutiveDays; // Same day
          } else if (lastDate === yesterdayStr) {
            newStreak = consecutiveDays + 1; // Consecutive
          }
          // Else streak resets to 1
        }

        set({
          lastPlayedAt: now.toISOString(),
          consecutiveDays: newStreak,
          happiness: Math.min(100, get().happiness + 10), // +10 for daily login
        });
      },

      addHappiness: (amount) => set((s) => ({
        happiness: Math.max(0, Math.min(100, s.happiness + amount))
      })),

      feedCapy: () => {
        set((s) => ({
          lastFedAt: new Date().toISOString(),
          happiness: Math.min(100, s.happiness + 30),
        }));
      },

      petCapy: () => {
        set((s) => ({
          lastPetAt: new Date().toISOString(),
          happiness: Math.min(100, s.happiness + 5),
        }));
      },

      calculateDecay: () => {
        const { lastPlayedAt, happiness } = get();
        if (!lastPlayedAt) return { hoursAway: 0, decayed: 0 };

        const hoursAway = (Date.now() - new Date(lastPlayedAt).getTime()) / (1000 * 60 * 60);
        const decayPeriods = Math.floor(hoursAway / 8); // -10 per 8 hours
        const decayed = decayPeriods * 10;

        if (decayed > 0) {
          set({ happiness: Math.max(0, happiness - decayed) });
        }

        return { hoursAway, decayed };
      },
    }),
    { name: "mathie-mood" }
  )
);

export const FEED_COST = 10; // coins
export const PET_COOLDOWN = 10 * 60 * 1000; // 10 minutes
```

### 3.2 Create CapyMood Component
File: `src/components/CapyMood.tsx`

```typescript
"use client";

import { useMoodStore, FEED_COST } from "@/stores/moodStore";
import { useGameStore } from "@/stores/gameStore";
import { EventBus, GameEvents } from "@/game/EventBus";

const MOOD_EMOJIS = {
  ecstatic: "😍",
  happy: "😊",
  neutral: "😐",
  sad: "😢",
  depressed: "😭",
};

export function CapyMood() {
  const { happiness, getMoodLevel, canPet, feedCapy, petCapy } = useMoodStore();
  const { coins, addCoins } = useGameStore();

  const moodLevel = getMoodLevel();
  const canAffordFeed = coins >= FEED_COST;
  const petAvailable = canPet();

  const handleFeed = () => {
    if (!canAffordFeed) return;
    addCoins(-FEED_COST);
    feedCapy();
    EventBus.emit(GameEvents.CAPY_REACT, { type: "love" });
  };

  const handlePet = () => {
    if (!petAvailable) return;
    petCapy();
    EventBus.emit(GameEvents.CAPY_REACT, { type: "love" });
  };

  return (
    <div className="absolute top-24 left-4 z-20 bg-cream/90 rounded-2xl border-4 border-text p-3 w-48">
      {/* Mood indicator */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-3xl">{MOOD_EMOJIS[moodLevel]}</span>
        <div className="flex-1">
          <div className="text-sm font-[family-name:var(--font-nunito)] text-text/70 capitalize">
            {moodLevel}
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink to-sage transition-all duration-500"
              style={{ width: `${happiness}%` }}
            />
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleFeed}
          disabled={!canAffordFeed}
          className={`flex-1 py-2 rounded-xl border-2 border-text text-sm font-[family-name:var(--font-baloo)] transition-transform ${
            canAffordFeed
              ? "bg-yellow hover:scale-105"
              : "bg-gray-200 opacity-50 cursor-not-allowed"
          }`}
        >
          🍎 Feed ({FEED_COST})
        </button>
        <button
          onClick={handlePet}
          disabled={!petAvailable}
          className={`flex-1 py-2 rounded-xl border-2 border-text text-sm font-[family-name:var(--font-baloo)] transition-transform ${
            petAvailable
              ? "bg-pink hover:scale-105"
              : "bg-gray-200 opacity-50 cursor-not-allowed"
          }`}
        >
          {petAvailable ? "🤗 Pet" : "⏳"}
        </button>
      </div>
    </div>
  );
}
```

### 3.3 Create Welcome Back Modal
File: `src/components/WelcomeBack.tsx`

Shows when player returns after 24+ hours:

```typescript
"use client";

import { useState, useEffect } from "react";
import { useMoodStore } from "@/stores/moodStore";

export function WelcomeBack() {
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");
  const { calculateDecay, happiness, consecutiveDays } = useMoodStore();

  useEffect(() => {
    const { hoursAway, decayed } = calculateDecay();

    if (hoursAway >= 24) {
      setMessage(`Capy missed you! (${Math.floor(hoursAway)} hours away)`);
      setShowModal(true);
    } else if (consecutiveDays > 1) {
      setMessage(`${consecutiveDays} day streak! Capy is so happy!`);
      setShowModal(true);
    }
  }, []);

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-cream rounded-3xl border-4 border-text p-6 max-w-sm text-center">
        <div className="text-6xl mb-4">
          {happiness < 40 ? "😢" : "😊"}
        </div>
        <h2 className="text-xl font-[family-name:var(--font-baloo)] text-text mb-2">
          Welcome Back!
        </h2>
        <p className="text-text/70 font-[family-name:var(--font-nunito)] mb-4">
          {message}
        </p>
        <button
          onClick={() => setShowModal(false)}
          className="w-full py-3 bg-sage rounded-xl border-4 border-text font-[family-name:var(--font-baloo)] text-xl text-text hover:scale-105 transition-transform"
        >
          Let's Play!
        </button>
      </div>
    </div>
  );
}
```

### 3.4 Connect Happiness to Game Events
File: Update in multiple places

In `src/game/scenes/Game.ts` or via EventBus listener in page.tsx:
- Correct answer: +3 happiness (max +30 per session)
- Wrong answer: -2 happiness (max -10 per session)

Track session happiness delta to enforce caps.

### 3.5 Trigger Mood-Based Reactions
When mood is low, periodically trigger reactions:

```typescript
// In page.tsx or a MoodWatcher component
useEffect(() => {
  const checkMood = setInterval(() => {
    const moodLevel = useMoodStore.getState().getMoodLevel();
    if (moodLevel === "sad" || moodLevel === "depressed") {
      const type = Math.random() > 0.5 ? "sleepy" : "hungry";
      EventBus.emit(GameEvents.CAPY_REACT, { type });
    }
  }, 30000); // Every 30 seconds

  return () => clearInterval(checkMood);
}, []);
```

### 3.6 Add to Page
File: `src/app/page.tsx`

```typescript
import { CapyMood } from "@/components/CapyMood";
import { WelcomeBack } from "@/components/WelcomeBack";

// Show CapyMood when not playing
{!isPlaying && <CapyMood />}

// Welcome back modal
<WelcomeBack />
```

## Acceptance Criteria
- [ ] Happiness bar shows current mood level (0-100)
- [ ] Mood emoji reflects happiness level
- [ ] Feed button costs 10 coins, gives +30 happiness
- [ ] Pet button free with 10 min cooldown, gives +5 happiness
- [ ] Happiness decays -10 per 8 hours away
- [ ] Welcome back modal shows after 24+ hours
- [ ] Consecutive day streak tracked and displayed
- [ ] Low mood triggers sleepy/hungry reactions

# Phase 2: Capy Reactions

**Priority:** HIGH
**Estimated Tasks:** 5

## Objective
Make the capybara feel alive through animated reactions and sounds triggered by game events. Creates emotional connection without complex state management.

## Tasks

### 2.1 Add Reaction Events to EventBus
File: `src/game/EventBus.ts`

Add new event:
```typescript
export const GameEvents = {
  // ... existing events
  CAPY_REACT: "capy-react",
} as const;

export type CapyReactionType =
  | "happy"      // Correct answer
  | "sad"        // Wrong answer
  | "excited"    // Streak milestone
  | "love"       // Feed/pet
  | "sleepy"     // Low mood
  | "hungry";    // Very low mood
```

### 2.2 Create CapyReactions Component
File: `src/components/CapyReactions.tsx`

```typescript
"use client";

import { useState, useEffect } from "react";
import { EventBus, GameEvents, type CapyReactionType } from "@/game/EventBus";
import { synthSounds } from "@/game/audio/SynthSounds";

// Pre-defined animation positions (no Math.random in render)
const REACTION_PARTICLES = {
  happy: [
    { x: -20, y: -30, emoji: "✨", delay: 0 },
    { x: 20, y: -35, emoji: "⭐", delay: 0.1 },
    { x: 0, y: -40, emoji: "✨", delay: 0.2 },
  ],
  sad: [
    { x: 0, y: -20, emoji: "💧", delay: 0 },
  ],
  excited: [
    { x: -25, y: -20, emoji: "🎉", delay: 0 },
    { x: 25, y: -25, emoji: "⭐", delay: 0.1 },
    { x: 0, y: -30, emoji: "🎊", delay: 0.15 },
    { x: -15, y: -35, emoji: "✨", delay: 0.2 },
    { x: 15, y: -38, emoji: "💫", delay: 0.25 },
  ],
  love: [
    { x: -15, y: -25, emoji: "💕", delay: 0 },
    { x: 0, y: -35, emoji: "❤️", delay: 0.1 },
    { x: 15, y: -30, emoji: "💕", delay: 0.2 },
  ],
  sleepy: [
    { x: 10, y: -25, emoji: "💤", delay: 0 },
    { x: 20, y: -35, emoji: "💤", delay: 0.3 },
  ],
  hungry: [
    { x: 0, y: -20, emoji: "🍽️", delay: 0 },
  ],
};

export function CapyReactions() {
  const [reaction, setReaction] = useState<CapyReactionType | null>(null);

  useEffect(() => {
    const handleReaction = (...args: unknown[]) => {
      const data = args[0] as { type: CapyReactionType };
      setReaction(data.type);

      // Play appropriate sound
      switch (data.type) {
        case "happy":
        case "excited":
          synthSounds.playHappyCapy();
          break;
        case "sad":
          synthSounds.playSadCapy();
          break;
        case "love":
          synthSounds.playExcitedCapy();
          break;
      }

      // Auto-dismiss after animation
      setTimeout(() => setReaction(null), 1500);
    };

    EventBus.on(GameEvents.CAPY_REACT, handleReaction);
    return () => EventBus.off(GameEvents.CAPY_REACT, handleReaction);
  }, []);

  if (!reaction) return null;

  const particles = REACTION_PARTICLES[reaction];

  return (
    <div className="absolute left-[150px] top-[360px] z-30 pointer-events-none">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute text-2xl animate-float-up"
          style={{
            left: p.x,
            top: p.y,
            animationDelay: `${p.delay}s`,
          }}
        >
          {p.emoji}
        </div>
      ))}
    </div>
  );
}
```

### 2.3 Add CSS Animations
File: `tailwind.config.ts` or `globals.css`

```css
@keyframes float-up {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-50px) scale(1.2);
  }
}

.animate-float-up {
  animation: float-up 1.2s ease-out forwards;
}
```

### 2.4 Add Capy Sounds
File: `src/game/audio/SynthSounds.ts`

```typescript
/**
 * Cute happy squeak
 */
playHappyCapy(): void {
  if (!this.enabled || !this.audioContext) return;
  // High-pitched "squee": 600Hz→800Hz sweep
  this.playTone(600, 0.08, "sine", 0.4);
  setTimeout(() => this.playTone(800, 0.1, "sine", 0.4), 80);
}

/**
 * Soft sad whimper
 */
playSadCapy(): void {
  if (!this.enabled || !this.audioContext) return;
  // Descending tone: 400Hz→250Hz
  this.playTone(400, 0.15, "sine", 0.3);
  setTimeout(() => this.playTone(300, 0.15, "sine", 0.2), 150);
  setTimeout(() => this.playTone(250, 0.2, "sine", 0.15), 300);
}

/**
 * Excited chirp
 */
playExcitedCapy(): void {
  if (!this.enabled || !this.audioContext) return;
  // Quick ascending chirps
  const notes = [500, 600, 700, 800];
  notes.forEach((freq, i) => {
    setTimeout(() => this.playTone(freq, 0.06, "sine", 0.4), i * 50);
  });
}
```

### 2.5 Trigger Reactions from Game
File: `src/game/scenes/Game.ts`

Update answer handlers:
```typescript
private handleCorrect(): void {
  // ... existing code
  EventBus.emit(GameEvents.CAPY_REACT, { type: "happy" });
}

private handleWrong(): void {
  // ... existing code
  EventBus.emit(GameEvents.CAPY_REACT, { type: "sad" });
}
```

For streak milestones (in checkAnswer or where streak is tracked):
```typescript
if (currentStreak % 5 === 0 && currentStreak > 0) {
  EventBus.emit(GameEvents.CAPY_REACT, { type: "excited" });
}
```

### 2.6 Add to Page
File: `src/app/page.tsx`

```typescript
import { CapyReactions } from "@/components/CapyReactions";

// Inside the game container div:
<CapyReactions />
```

## Acceptance Criteria
- [ ] Happy reaction shows on correct answer (sparkles float up)
- [ ] Sad reaction shows on wrong answer (teardrop)
- [ ] Excited reaction shows on streak milestones (confetti burst)
- [ ] Each reaction has unique sound
- [ ] Reactions auto-dismiss after 1.5s
- [ ] No Math.random in render (deterministic particle positions)

# Phase 3: Menu Integration

## Objective
Add Stats button to MenuOverlay and wire up modal toggle.

## Changes to MenuOverlay.tsx

### 1. Add Import
```typescript
import { StatsModal } from "./StatsModal";
```

### 2. Add State
```typescript
const [showStats, setShowStats] = useState(false);
```

### 3. Add Stats Button (after Daily Challenge button)
```tsx
{/* Stats button */}
<button
  onClick={() => setShowStats(true)}
  className="px-6 py-3 rounded-full border-4 border-text font-[family-name:var(--font-baloo)] text-lg text-text shadow-lg transition-transform hover:scale-105 bg-sky"
>
  📊 Stats
</button>
```

### 4. Add Modal Render (after DailyChallenge modal)
```tsx
{/* Stats modal */}
{showStats && <StatsModal onClose={() => setShowStats(false)} />}
```

## Full Diff

```diff
 "use client";

-import { useState, useEffect } from "react";
+import { useState, useEffect } from "react";
 import { useLearningStore } from "@/stores/learningStore";
 import { useDailyChallengeStore } from "@/stores/dailyChallengeStore";
 import { useGameStore } from "@/stores/gameStore";
 import { DailyChallenge } from "./DailyChallenge";
+import { StatsModal } from "./StatsModal";
 import { EventBus, GameEvents } from "@/game/EventBus";

 export function MenuOverlay() {
   const { getDueReviewCount, totalResponses, onboardingComplete } = useLearningStore();
   const { isAvailable, currentStreak } = useDailyChallengeStore();
   const { bestScore } = useGameStore();
   const [isOnMenu, setIsOnMenu] = useState(true);
   const [showDailyChallenge, setShowDailyChallenge] = useState(false);
+  const [showStats, setShowStats] = useState(false);

   // ... existing useEffect code ...

   return (
     <>
       <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
         {/* Best Score */}
         {bestScore > 0 && (
           <div className="bg-yellow/90 px-6 py-2 rounded-full border-4 border-amber-500 shadow-lg">
             <span className="font-[family-name:var(--font-fredoka)] text-text text-lg">
               🏆 Best: {bestScore}
             </span>
           </div>
         )}

         {/* Daily Challenge button */}
         <button
           onClick={() => setShowDailyChallenge(true)}
           className={`px-6 py-3 rounded-full border-4 border-text font-[family-name:var(--font-baloo)] text-lg text-text shadow-lg transition-transform hover:scale-105 ${
             challengeAvailable
               ? "bg-yellow animate-pulse"
               : "bg-gray-200"
           }`}
         >
           🌟 Daily Challenge
           {currentStreak > 0 && (
             <span className="ml-2 text-sm">🔥 {currentStreak}</span>
           )}
         </button>

+        {/* Stats button */}
+        <button
+          onClick={() => setShowStats(true)}
+          className="px-6 py-3 rounded-full border-4 border-text font-[family-name:var(--font-baloo)] text-lg text-text shadow-lg transition-transform hover:scale-105 bg-sky"
+        >
+          📊 Stats
+        </button>

         {/* Due reviews badge */}
         {/* ... existing code ... */}
       </div>

       {/* Daily Challenge modal */}
       {showDailyChallenge && (
         <DailyChallenge onClose={() => setShowDailyChallenge(false)} />
       )}

+      {/* Stats modal */}
+      {showStats && <StatsModal onClose={() => setShowStats(false)} />}
     </>
   );
 }
```

## Button Placement
Stats button appears below Daily Challenge button in the menu. Uses sky color to differentiate from the yellow Daily Challenge button.

## Implementation Steps
1. Open `src/components/MenuOverlay.tsx`
2. Add import for StatsModal
3. Add showStats state
4. Add Stats button in button group
5. Add conditional StatsModal render
6. Test button click opens modal

## Testing
- [ ] Stats button visible on menu screen
- [ ] Click opens StatsModal
- [ ] Close button dismisses modal
- [ ] No console errors

## Estimated Changes
- ~15 lines additions
- 0 lines removed

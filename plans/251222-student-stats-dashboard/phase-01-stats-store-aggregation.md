# Phase 1: Stats Store Aggregation

## Objective
Extend learningStore to track Elo history for trend display. Add helper for topic mastery aggregation.

## Changes

### 1. learningStore.ts - Add Elo History Tracking

**Add to State Interface:**
```typescript
// Add to LearningState
eloHistory: { rating: number; timestamp: number }[];
```

**Add to Initial State:**
```typescript
eloHistory: [],
```

**Modify recordAnswer:**
After updating rating, append to history (keep last 20 entries):
```typescript
const eloHistory = [
  ...state.eloHistory,
  { rating: newRating, timestamp: Date.now() }
].slice(-20);

// Include in set({...})
eloHistory,
```

**Add to partialize:**
```typescript
eloHistory: state.eloHistory,
```

**Add New Getter:**
```typescript
getEloTrend: () => {
  const { eloHistory } = get();
  if (eloHistory.length < 2) return 0;
  const recent = eloHistory[eloHistory.length - 1].rating;
  const previous = eloHistory[eloHistory.length - 2].rating;
  return recent - previous; // positive = up, negative = down
},
```

### 2. Add Topic Mastery Aggregation Helper

**Add to learningStore actions:**
```typescript
getAllTopicProgress: () => {
  const topics: Topic[] = ["number", "calculation", "geometry", "measure", "data"];
  const masteryMap = get().getMasteryMap();
  return topics.map((topic) => ({
    topic,
    progress: Math.round(getTopicMastery(masteryMap, topic) * 100),
  }));
},

getWeakTopics: () => {
  const { masteryEntries } = get();
  return masteryEntries
    .filter((m) => m.status !== "mastered" && m.attempts > 0)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map((m) => m.subtopic);
},

getQuestionsToNextLevel: () => {
  const { studentRating, totalResponses } = get();
  const levels = [700, 850, 1000, 1150, 1300];
  const nextLevel = levels.find((l) => l > studentRating);
  if (!nextLevel) return 0; // At max level
  const diff = nextLevel - studentRating;
  // Rough estimate: ~2 points per correct answer on average
  return Math.ceil(diff / 2);
},
```

## Implementation Steps

1. Open `src/stores/learningStore.ts`
2. Add `eloHistory` to interface and initial state
3. Modify `recordAnswer` to track history
4. Add `eloHistory` to persistence partialize
5. Add `getEloTrend`, `getAllTopicProgress`, `getWeakTopics`, `getQuestionsToNextLevel` getters
6. Export Topic type if needed

## Testing

- Play 3 questions, verify eloHistory has 3 entries
- Check localStorage key `capy-learning-storage` contains eloHistory
- Call `getEloTrend()` and verify returns number
- Call `getAllTopicProgress()` returns array of 5 topics

## Estimated Changes
- ~40 lines additions
- 0 lines removed

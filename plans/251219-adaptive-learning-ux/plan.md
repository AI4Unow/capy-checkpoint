# Plan: Adaptive Learning UX Improvements

**Date:** 2025-12-19
**Status:** Ready for Implementation

---

## Overview

Enhance Mathie's adaptive learning visibility to build student trust in the system and provide actionable learning insights. Goal: students understand WHY questions get harder/easier.

## Architecture Summary

- **State**: Extend `learningStore.ts` (Zustand) with session mode, mastery events, onboarding flag
- **Events**: Add new events to `EventBus.ts` for React<->Phaser celebration/indicator communication
- **UI**: React components for overlays; Phaser for in-game indicators

## Phase Structure

| Phase | Focus | Effort | Files |
|-------|-------|--------|-------|
| 1 | Quick Wins | 1-2 days | [phase-1-quick-wins.md](./phase-1-quick-wins.md) |
| 2 | Visibility | 2-3 days | [phase-2-visibility.md](./phase-2-visibility.md) |
| 3 | Personalization | 2-3 days | [phase-3-personalization.md](./phase-3-personalization.md) |
| 4 | Advanced (Future) | TBD | [phase-4-future.md](./phase-4-future.md) |

## Key State Changes (learningStore.ts)

```typescript
// New fields
sessionMode: 'adventure' | 'practice' | 'review' | 'challenge';
onboardingComplete: boolean;
lastMasteredSubtopic: string | null;
sessionMasteries: string[]; // Subtopics mastered this session
sessionImproved: { subtopic: string; delta: number }[];
sessionWeakest: { subtopic: string; wrongCount: number }[];
```

## New EventBus Events

```typescript
MASTERY_ACHIEVED: 'mastery-achieved';      // { subtopic: string }
STREAK_MILESTONE: 'streak-milestone';       // { count: number, bonus: number }
DIFFICULTY_CHANGE: 'difficulty-change';     // { level: 'warmup'|'challenge'|... }
QUESTION_REASON: 'question-reason';         // { reason: 'review'|'weak'|'world'|'random' }
```

## Success Metrics

- Session length +20%
- Next-day return rate +30%
- Students articulate "why" when asked about difficulty

## Unresolved Questions

1. Difficulty indicator: exact Elo or abstract labels? (Recommend: abstract)
2. "Why this question" prominence level? (Recommend: subtle tooltip, not blocking)
3. Sound effects for celebrations? (Recommend: yes, with mute option)

---

**Next:** Start with [Phase 1: Quick Wins](./phase-1-quick-wins.md)

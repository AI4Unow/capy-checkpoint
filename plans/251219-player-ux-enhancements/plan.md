# Player UX Enhancements Plan

**Date:** 2025-12-19
**Status:** Ready for Review
**Priority:** High

## Overview

Implement high-impact UX improvements for Mathie game based on Top 5 recommendations from brainstorm, prioritizing quick wins first.

## Research Summary

- **Phaser UX**: Scene-based pause, native audio, Back.easeOut tweens, DOM overlay for a11y
- **Gamification**: Tiered badges, streak safety nets, collection grids, autonomy rewards
- **Codebase**: No audio exists, EventBus pattern solid, Zustand persistence ready

## Implementation Phases

| Phase | Name | Status | Effort | Impact |
|-------|------|--------|--------|--------|
| 1 | [Quick Wins](phase-01-quick-wins.md) | Pending | Low | High |
| 2 | [Sound System](phase-02-sound-system.md) | Pending | Medium | High |
| 3 | [Daily Challenge](phase-03-daily-challenge.md) | Pending | Medium | High |
| 4 | [Achievement Badges](phase-04-achievement-badges.md) | Pending | Medium | High |

## Phase Dependencies

```
Phase 1 (Quick Wins) ─────┐
                          ├──> Phase 2 (Sound) ──> Phase 3 (Daily) ──> Phase 4 (Badges)
                          │
```

Phase 1 is independent. Phases 2-4 can run sequentially.

## Success Criteria

- Pause/Resume works without breaking game state
- Sound effects enhance engagement without classroom disruption
- Daily challenge drives 7-day retention
- Badge collection motivates mastery progression

## Related Files

- `plans/251219-player-ux-enhancements/research/researcher-01-phaser-ux.md`
- `plans/251219-player-ux-enhancements/research/researcher-02-gamification.md`
- `plans/251219-player-ux-enhancements/scout/scout-01-codebase.md`

## Next Steps

1. Review and approve plan
2. Implement Phase 1 (Quick Wins)
3. Iterate based on testing feedback

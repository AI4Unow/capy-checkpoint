# Student Stats Dashboard - Implementation Plan

## Overview
Add a Stats Dashboard modal accessible from MenuOverlay showing comprehensive play and learning progress statistics. Follows KISS principle - modal pattern (like BadgeCollection), CSS progress bars, reads from existing stores.

## Architecture Decision
- **Modal-based** (not new route) - consistent with existing patterns
- **Read-only from existing stores** - no new data collection needed
- **CSS progress bars** - no external chart library
- **Single new component** - `StatsModal.tsx`

## Data Sources (Existing Stores)

| Store | Available Data |
|-------|---------------|
| `learningStore` | studentRating, totalResponses, masteryEntries, streakCount, bestStreak, sessionCorrect, sessionTotal |
| `gameStore` | coins, bestScore, answeredCount, correctCount |
| `badgeStore` | unlockedBadges (count) |
| `dailyChallengeStore` | currentStreak, longestStreak, history |
| `spinStore` | totalSpins, totalWon |

## Stats Categories

### 1. Session Stats
- Total questions answered (learningStore.totalResponses)
- Overall accuracy (learningStore session/total ratio)
- Best answer streak (learningStore.bestStreak)
- Sessions completed (derive from history length or add counter)

### 2. Learning Progress
- Current Elo rating + trend (learningStore.studentRating)
- Elo chart (CSS bar chart last 7 days - requires adding eloHistory to store)
- Topic mastery bars (5 strands from masteryEntries)
- Weak topics (masteryEntries with status !== "mastered")
- Next milestone (questions to next rating level)

### 3. Gamification Stats
- Badges earned / total (badgeStore.unlockedBadges.length / BADGES.length)
- Daily streak current/best (dailyChallengeStore)
- Coins earned (gameStore.coins)
- Spin wheel stats (spinStore.totalSpins)

## Phases

| Phase | File | Description |
|-------|------|-------------|
| 1 | phase-01-stats-store-aggregation.md | Add eloHistory tracking to learningStore, create helper functions |
| 2 | phase-02-stats-dashboard-ui.md | StatsModal component with all sections |
| 3 | phase-03-menu-integration.md | Add Stats button to MenuOverlay |

## Files to Modify/Create

**New:**
- `src/components/StatsModal.tsx`

**Modify:**
- `src/stores/learningStore.ts` (add eloHistory array)
- `src/components/MenuOverlay.tsx` (add Stats button)

## Design Tokens (Kawaii/Cottagecore)
- Header bg: purple-500 (consistent with BadgeCollection)
- Section cards: sky/30, sage/30, pink/30, yellow/30
- Font: Fredoka (headings), Nunito (body), Baloo (numbers)
- Progress bars: sage fill, h-2 rounded-full

## Acceptance Criteria
- [x] Stats button visible on Menu screen
- [x] Modal shows all 3 stat categories
- [x] Topic mastery shows 5 Cambridge strands
- [x] Elo displays with level emoji and progress
- [x] Modal closes on button click
- [x] Mobile responsive (max-w-md, scrollable)

## Implementation Status
**Phase 02 (UI):** ✅ Complete - StatsModal.tsx implemented (250 lines)
**Phase 03 (Menu Integration):** ✅ Complete - MenuOverlay.tsx modified (+15 lines)
**Build Status:** ✅ Passing
**Review:** See `plans/reports/code-reviewer-251222-stats-dashboard-review.md`

## Known Issues
1. **Critical:** Missing keyboard accessibility (Escape key, focus trap, ARIA attributes)
2. **Medium:** Consider extracting StatCard color mapping if reused in 3+ components

## Next Steps
1. Fix keyboard accessibility before merge
2. Optional: Add unit tests for formatSubtopic helper
3. Optional: Strengthen TopicProgressBar type safety with Topic enum

## Estimated LOC
- StatsModal.tsx: ~200 lines
- learningStore changes: ~20 lines
- MenuOverlay changes: ~15 lines
- Total: ~235 lines

## Risks
- Elo history needs persistence (already handled by learningStore persist)
- Topic progress calculation complexity (reuse getTopicProgress helper)

## Unresolved Questions
None - all data available in existing stores.

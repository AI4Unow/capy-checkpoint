# Brainstorm: Player UX Enhancements for Mathie

**Date:** 2025-12-19
**Topic:** UX improvements for Grade 5 math game player experience

## Current State

- Flappy Bird-style Phaser 3 game (1280x720)
- Elo rating + SM-2 spaced repetition adaptive system
- 447 Cambridge Primary Checkpoint math questions
- Boutique cosmetics (hats, accessories, trails, backgrounds)
- AI hints on wrong answers (Gemini)
- Recent additions: DifficultyIndicator, MasteryCelebration, StreakDisplay, CalibrationIndicator, QuestionReasonBadge, MenuOverlay, ModeSelector

---

## Category 1: Immediate Engagement

### 1.1 Animated Welcome Back Screen
- **Problem:** Cold start, no personalization
- **Solution:** "Welcome back!" with Capybara wave + yesterday's stats + due reviews
- **Effort:** Low | **Impact:** High

### 1.2 Quick Daily Challenge
- **Problem:** No daily habit formation
- **Solution:** 3-question daily challenge + bonus coins + streak calendar
- **Effort:** Medium | **Impact:** High

---

## Category 2: In-Game Flow

### 2.1 Question Preview Animation
- Gentle zoom-in for question text
- Subtle highlight on appearance
- **Effort:** Low | **Impact:** Medium

### 2.2 Answer Feedback Polish
- Correct: green glow + coins animation + "ding"
- Wrong: gentle shake + encouraging message
- Near-miss detection: "So close!"
- **Effort:** Medium | **Impact:** High

### 2.3 Pause/Resume Without Penalty
- Pause button during gameplay
- Game freezes, gates stop
- "Ready to continue?" overlay
- **Effort:** Low | **Impact:** High (essential for kids)

---

## Category 3: Motivation & Progression

### 3.1 World Map Progression
- Visual map: Forest → Garden → Rainbow → Ocean → Sky Castle
- Locked worlds with unlock requirements
- Progress percentage per world
- **Effort:** High | **Impact:** Very High

### 3.2 Achievement Badges
- Badge collection page
- Categories: Accuracy, Streaks, Mastery, Daily, Special
- Examples: "First Flight", "Streak Master", "Night Owl", "Speed Demon"
- **Effort:** Medium | **Impact:** High

### 3.3 XP/Level System
- Convert Elo to visual XP levels (1-50)
- Level-up animation with fanfare
- "50 XP to next level" progress bar
- **Effort:** Medium | **Impact:** Medium

---

## Category 4: Social & Sharing

### 4.1 Share Progress Screenshot
- Generates shareable image with stats + Capybara
- Copy to clipboard or native share
- **Effort:** Medium | **Impact:** Medium

### 4.2 Parent Report Card
- Weekly summary view
- Topics mastered, time spent, accuracy trends
- Weak areas highlighted
- **Effort:** High | **Impact:** High (for parents)

---

## Category 5: Accessibility

### 5.1 Reduced Motion Mode
- Settings toggle for simplified animations
- Respects `prefers-reduced-motion`
- **Effort:** Low | **Impact:** Medium

### 5.2 Larger Touch Targets
- Minimum 48x48px
- Larger gate answer boxes on mobile
- **Effort:** Low | **Impact:** Medium

### 5.3 Color Blind Friendly
- Icons (✓/✗) alongside colors
- High contrast toggle
- **Effort:** Low | **Impact:** Medium

---

## Category 6: Sound & Haptics

### 6.1 Sound Effects
- Flap, correct chime, wrong bonk, streak milestones
- Toggle in settings
- **Effort:** Medium | **Impact:** High

### 6.2 Background Music
- Light loop per world
- Volume slider + mute button
- **Effort:** Medium | **Impact:** Medium

---

## Top 5 Recommendations

| Rank | Enhancement | Effort | Impact | Rationale |
|------|-------------|--------|--------|-----------|
| 1 | **Pause/Resume** | Low | High | Essential for kids, prevents frustration |
| 2 | **Answer Feedback Polish** | Medium | High | Core loop, more satisfying |
| 3 | **Sound Effects** | Medium | High | Dramatic engagement boost |
| 4 | **Daily Challenge + Calendar** | Medium | High | Retention/habit formation |
| 5 | **Achievement Badges** | Medium | High | Collectionism motivation |

---

## Quick Wins (Low Effort, High Value)

1. Pause/Resume button
2. Reduced motion mode
3. Larger touch targets
4. Question preview animation
5. Color blind mode (icons)

---

## Open Questions

1. Target platform priority? (mobile vs desktop)
2. Sound effects desired? (classroom-friendly considerations)
3. Parent dashboard priority?
4. Which category resonates most?

---

## Next Steps

1. User to select priority enhancements
2. Create implementation plan for chosen features
3. Consider phased rollout (Quick Wins first)

# Brainstorm: Improve User Experience - Adaptive Learning

**Date:** 2025-12-19
**Status:** Recommendations Ready

---

## Current System Analysis

### What Exists
- **Elo Rating**: Student rating (400-1600) adjusts based on performance vs question difficulty
- **SM-2 Spaced Repetition**: Tracks intervals per subtopic for review scheduling
- **Mastery Tracking**: 65/35 weighted average per subtopic (learning → mastered at 80%+)
- **Question Selector**: 40% due review, 30% weak subtopic, 20% world theme, 10% random
- **Session Summary**: Shows score, accuracy, streak, coins, level progress
- **AI Hints**: Gemini-powered explanations on wrong answers

### Current Pain Points
1. **No visible learning progress during gameplay** - student doesn't know why questions get harder/easier
2. **Cold start problem** - new players may get discouraged by initial difficulty mismatch
3. **No feedback on WHY a subtopic is being practiced** - feels random
4. **Session summary lacks learning insights** - only shows stats, not what to improve
5. **No celebration for mastery achievements** - subtopic mastery goes unnoticed
6. **No spaced repetition awareness** - student doesn't know what's "due for review"

---

## Improvement Ideas (Prioritized)

### 🎯 HIGH IMPACT, LOW EFFORT

#### 1. Real-time Difficulty Indicator
Show current difficulty level during gameplay so students understand the system adapts.

```
[Easy 🟢] → [Medium 🟡] → [Hard 🔴] → [Challenge 🟣]
```

**Why:** Transparency builds trust in the system. Students understand "it's supposed to be hard because I'm doing well."

---

#### 2. Subtopic Mastery Celebration
When a subtopic reaches "mastered" status (80%+ after 5+ attempts), show a brief celebration.

```
🎉 "Fractions Mastered!"
   +50 bonus coins
```

**Why:** Positive reinforcement. Makes the mastery system visible and rewarding.

---

#### 3. "Why This Question?" Tooltip
Before each question, briefly show why it was selected:

- "📅 Review: Fractions (due today)"
- "💪 Practice: Decimals (needs work)"
- "🎮 World: Number topic"
- "🎲 Mix it up!"

**Why:** Demystifies the adaptive system. Builds metacognition.

---

#### 4. Session Summary Learning Insights
Add to SessionSummary:

```
📊 Learning Insights:
- Improved: Fractions (+15%)
- Needs Work: Decimals (3/5 wrong)
- Mastered Today: Place Value 🏆
- Due Tomorrow: Percentages
```

**Why:** Actionable feedback. Shows progress beyond just "score."

---

### 🚀 MEDIUM IMPACT, MEDIUM EFFORT

#### 5. Gentle Onboarding (First 10 Questions)
For new players (totalResponses < 10):
- Start at 600 difficulty (below 800 default)
- Use wider K-factor (40 instead of 32)
- Show "Calibrating your level..." message
- Only give encouraging feedback (no "wrong" harsh sounds)

**Why:** First impressions matter. Avoid discouraging beginners.

---

#### 6. Streak Bonuses with Explanation
Current streak system is silent. Make it visible:

```
🔥 3-streak! Questions getting harder...
🔥 5-streak! +20 bonus coins!
🔥 10-streak! LEGENDARY! +100 coins + unlock cosmetic
```

**Why:** Gamification that ties to adaptive system.

---

#### 7. Pre-Session Goal Setting
Before starting, let student choose:

- "🎯 Practice Mode" - Focus on weak areas (70% weak subtopics)
- "📅 Review Mode" - Focus on due items (70% SM-2 due)
- "🎮 Adventure Mode" - Balanced (current algorithm)
- "⚡ Challenge Mode" - Only hard questions (+100 difficulty)

**Why:** Student agency. Different moods = different learning needs.

---

#### 8. Daily Review Reminder
Show count of due reviews on menu screen:

```
📅 5 topics due for review today
```

Bonus: If all reviews completed → achievement + coins.

**Why:** SM-2 is only useful if students actually review on schedule.

---

### 💡 LOWER PRIORITY (Future Consideration)

#### 9. Parent/Teacher Dashboard
- View child's progress over time
- See mastery by topic
- Identify struggling areas
- Export progress report

---

#### 10. Comparative Analytics
- "You're better at Fractions than 70% of students"
- "Most students struggle with Percentages too"

**Risk:** Can be demotivating. Needs careful design.

---

#### 11. Adaptive Hint System
Before showing AI hint, offer progressive hints:
1. "Think about place value..."
2. "What's 1/4 as a decimal?"
3. Full AI explanation

**Why:** Scaffolded learning > full answer reveal.

---

#### 12. Question Difficulty Crowdsourcing
Track actual success rates per question, adjust difficulty dynamically.

```
If question.correctRate < 30% after 100 attempts:
  question.difficulty += 50  // It's harder than rated
```

**Why:** Self-correcting system. Fixes mis-rated questions.

---

## Recommended Implementation Order

### Phase 1: Quick Wins (1-2 days)
1. ✅ Real-time difficulty indicator
2. ✅ Subtopic mastery celebration
3. ✅ Enhanced session summary with learning insights

### Phase 2: Visibility (2-3 days)
4. "Why this question?" indicator
5. Visible streak bonuses
6. Daily review reminder on menu

### Phase 3: Personalization (3-5 days)
7. Gentle onboarding for new users
8. Pre-session goal/mode selection

### Phase 4: Advanced (Future)
9. Parent dashboard
10. Adaptive hint scaffolding

---

## Technical Considerations

### State Changes Needed
- Add `onboardingComplete: boolean` to learningStore
- Add `lastMasteredSubtopic: string | null` for celebration trigger
- Add `sessionMode: 'adventure' | 'practice' | 'review' | 'challenge'`

### UI Components Needed
- `DifficultyIndicator` - shows current question difficulty
- `MasteryCelebration` - modal/toast for mastery achievement
- `LearningInsights` - enhanced session summary section
- `ModeSelector` - pre-session mode picker

### No Breaking Changes
All improvements are additive. Existing gameplay loop unchanged.

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Session length | Unknown | +20% |
| Return rate (next day) | Unknown | +30% |
| Mastery achievements/week | Not tracked | Visible |
| Student understands "why" | Low | High |

---

## Unresolved Questions

1. Should difficulty indicator show exact Elo numbers or abstract (Easy/Medium/Hard)?
2. How prominent should "why this question" be without being distracting?
3. Is parent dashboard essential for launch or a later add-on?
4. Should we add sound effects for mastery celebrations?

---

## Next Steps

1. **Pick 2-3 Phase 1 items** to implement first
2. **Test with target user** (Grade 5 student) for feedback
3. **Iterate** based on observations

**Recommendation:** Start with #2 (Mastery Celebration) and #4 (Learning Insights) - highest impact on perceived value of adaptive system.

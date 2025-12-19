# Phase 2: Question System & Gates

## Context Links

- **Parent Plan:** [plan.md](./plan.md)
- **Depends On:** [Phase 1 - Core Game](./phase-01-project-setup-core-game.md)
- **Design Guidelines:** [design-guidelines.md](../../docs/design-guidelines.md)

---

## Overview

| Field | Value |
|-------|-------|
| Date | 2025-12-18 |
| Priority | P0 - Critical |
| Status | pending |
| Description | 3-path answer gates, question data structure, answer validation, lives system |

---

## Key Insights

- Gates use **overlap detection** (not collide) to check answer
- 3 paths = top, middle, bottom → each maps to an answer option
- Question displayed in React HUD, gates show answer labels
- Initial question bank: 50 questions (10 per Cambridge topic)
- Immediate feedback: correct = continue + coins, wrong = lose heart

---

## Requirements

### Functional
- F1: 3-path gate with answer labels (A, B, C or actual values)
- F2: Question text displayed in HUD before gate
- F3: Answer validation on gate overlap
- F4: Visual/audio feedback (correct: green flash, wrong: red + shake)
- F5: Lives system: 3 hearts, lose 1 on wrong answer
- F6: Game over when 0 hearts
- F7: Initial 50-question bank loaded from JSON

### Non-Functional
- NF1: Question visible 3+ seconds before gate arrives
- NF2: Gate labels large enough to read on mobile
- NF3: Answer feedback < 200ms perceived delay

---

## Architecture

### Gate Structure
```
     [Top Path]    ← Option A (e.g., "24")
         |
     [Middle Path] ← Option B (e.g., "18")  ✓ Correct
         |
     [Bottom Path] ← Option C (e.g., "12")
```

### Question Data Model
```typescript
interface Question {
  id: string;
  topic: 'number' | 'calculation' | 'geometry' | 'measure' | 'data';
  subtopic: string;
  difficulty: number; // 600-1400 Elo
  text: string;
  options: [string, string, string]; // Always 3
  correctIndex: 0 | 1 | 2;
  hint?: string;
  explanation: string;
}
```

### Gate Collision Logic
```typescript
// In Game scene
this.physics.add.overlap(
  this.capybara,
  this.gateGroup,
  (capy, gate) => {
    const pathIndex = this.getPathIndex(capy.y); // 0, 1, or 2
    const isCorrect = pathIndex === this.currentQuestion.correctIndex;
    EventBus.emit('answer', { isCorrect, pathIndex });
    gate.destroy();
  }
);

getPathIndex(y: number): number {
  if (y < GATE_TOP_THRESHOLD) return 0;
  if (y < GATE_MIDDLE_THRESHOLD) return 1;
  return 2;
}
```

### Component Updates
```
src/
├── data/
│   └── questions.json       # Initial 50 questions
├── game/
│   └── scenes/
│       └── Game.ts          # Updated with 3-path gates
├── components/
│   ├── GameHUD.tsx          # Add question display
│   ├── QuestionCard.tsx     # Question text + options preview
│   └── FeedbackOverlay.tsx  # Correct/wrong animation
└── stores/
    └── gameStore.ts         # Add currentQuestion, lives
```

---

## Related Code Files

| File | Purpose |
|------|---------|
| `src/data/questions.json` | 50 initial questions |
| `src/types/question.ts` | Question TypeScript interface |
| `src/game/scenes/Game.ts` | 3-path gate spawning + overlap |
| `src/components/QuestionCard.tsx` | Display current question |
| `src/components/FeedbackOverlay.tsx` | Correct/wrong visual |
| `src/stores/gameStore.ts` | Lives, current question state |
| `src/hooks/useQuestionBank.ts` | Load and shuffle questions |

---

## Implementation Steps

1. **Define Question interface** in `src/types/question.ts`

2. **Create initial question bank** `src/data/questions.json`
   - 10 questions per topic (Number, Calculation, Geometry, Measure, Data)
   - Difficulty spread: 3 easy (600-800), 4 medium (800-1000), 3 hard (1000-1200)
   - Example:
   ```json
   {
     "id": "num-001",
     "topic": "number",
     "subtopic": "place-value",
     "difficulty": 750,
     "text": "What is 3.45 rounded to one decimal place?",
     "options": ["3.4", "3.5", "3.0"],
     "correctIndex": 1,
     "explanation": "The 5 in the hundredths place rounds up."
   }
   ```

3. **Create useQuestionBank hook**
   - Load questions from JSON
   - Shuffle on session start
   - Provide `getNextQuestion()` method
   - Track answered questions to avoid immediate repeats

4. **Update Game scene for 3-path gates**
   - Gate = 3 overlapping physics bodies (top, mid, bottom)
   - Each body tagged with `pathIndex: 0|1|2`
   - Gate labels = Phaser Text objects with answer options

5. **Implement overlap detection**
   - On overlap, check capybara Y position → determine path
   - Emit event with answer result
   - Mark gate as "answered" to prevent double-trigger

6. **Create QuestionCard component**
   - Position: top of screen
   - Show: question text + timer bar (optional Phase 5)
   - Font: Baloo 2, 24px+, high contrast

7. **Create FeedbackOverlay component**
   - Correct: green checkmark + "+10 coins" toast
   - Wrong: red X + screen shake + heart loss
   - Animation: 500ms fade in/out

8. **Update gameStore**
   ```typescript
   interface GameState {
     lives: number; // default 3
     coins: number;
     currentQuestion: Question | null;
     answeredCount: number;
     correctCount: number;
   }
   ```

9. **Implement lives system**
   - Start with 3 hearts
   - Lose 1 on wrong answer
   - Game over at 0
   - Hearts displayed in HUD (red heart icons)

10. **Add answer feedback to Phaser**
    - Correct: brief slow-mo + happy Capybara animation
    - Wrong: screen shake using camera.shake()

11. **Test question flow**
    - Questions cycle correctly
    - No duplicate questions in sequence
    - All 3 paths register correctly
    - Lives decrement properly

---

## Question Bank: Initial 50 Questions

### Distribution
| Topic | Count | Difficulty Range |
|-------|-------|------------------|
| Number | 10 | 600-1200 |
| Calculation | 10 | 600-1200 |
| Geometry | 10 | 700-1100 |
| Measure | 10 | 650-1150 |
| Data Handling | 10 | 700-1200 |

### Sample Questions by Topic

**Number:**
- Place value to millions
- Decimals ordering
- Fraction equivalence
- Percentages

**Calculation:**
- Mental multiplication
- Division with remainders
- Fraction addition (same denominator)
- Multi-step problems

**Geometry:**
- Shape properties
- Angle identification
- Coordinates
- Symmetry

**Measure:**
- Unit conversions (km→m, kg→g)
- Time calculations
- Perimeter/area
- Money calculations

**Data:**
- Reading bar charts
- Mean calculation
- Probability language
- Interpreting tables

---

## Todo List

- [ ] Create Question TypeScript interface
- [ ] Write 50 initial questions in JSON
- [ ] Create useQuestionBank hook
- [ ] Update Game scene with 3-path gates
- [ ] Add answer labels to gates (Phaser Text)
- [ ] Implement overlap detection with path check
- [ ] Create QuestionCard React component
- [ ] Create FeedbackOverlay component
- [ ] Add lives system to gameStore
- [ ] Display hearts in GameHUD
- [ ] Add screen shake on wrong answer
- [ ] Test full question→answer→feedback loop

---

## Success Criteria

- [ ] Questions display clearly before gate arrives
- [ ] All 3 paths register correct overlaps
- [ ] Correct answer = +coins, continue play
- [ ] Wrong answer = -1 heart, continue until 0
- [ ] Game over at 0 hearts
- [ ] 50 questions cycle without immediate repeats

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Path detection inaccurate | Medium | High | Wide detection zones, clear visual lanes |
| Questions too small on mobile | Medium | Medium | 24px+ font, test on real devices |
| Gate collision double-fires | Low | High | Mark gate as "answered" after first overlap |
| Wrong answer feels punishing | Medium | Medium | Show explanation, forgiving lives count |

---

## Security Considerations

- Questions loaded client-side (acceptable for single-user MVP)
- No cheating concern for personal learning game

---

## Next Steps

After Phase 2 complete:
1. Proceed to **Phase 3: Adaptive Learning Engine**
2. Replace random question selection with Elo-based
3. Add mastery tracking per subtopic

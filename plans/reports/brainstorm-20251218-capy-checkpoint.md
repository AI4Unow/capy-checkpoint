# Brainstorm Report: Capy-Checkpoint

**Date:** 2025-12-18
**Target:** Grade 5 student preparing for Cambridge Primary Checkpoint Math (May 2025)
**Goal:** Engaging, adaptive math practice through Flappy Bird-style gameplay

---

## 1. Problem Statement

- **User:** 10-year-old girl finds math boring
- **Need:** Visual/gameplay motivation with personalized difficulty
- **Outcome:** Daily practice habit leading to checkpoint readiness

---

## 2. Solution: "Capy-Checkpoint"

Web-based (PWA) side-scroller where a Capybara with Yuzu hat flies through mathematical obstacle gates.

### Game Mechanics
- **Core:** Tap-to-flap physics (Phaser 3)
- **Gates:** 3-path answer system (fly through correct answer)
- **Lives:** 3 hearts per session
- **Coins:** Earn "Yuzu Coins" for correct answers → spend in Boutique

### Themed Worlds (5 total, matching Cambridge strands)
| World | Theme | Topics |
|-------|-------|--------|
| 1 | Forest | Numbers, decimals, fractions |
| 2 | Garden | Calculations, mental math |
| 3 | Rainbow | Geometry, shapes, angles |
| 4 | Ocean | Measure, time, money |
| 5 | Sky Castle | Data handling, problem solving |

### Reward System
- **Boutique:** Hats, capes, accessories for Capybara
- **Achievements:** Streak badges, mastery stars
- **World unlocks:** Progress-based gating

---

## 3. Adaptive Learning System

### 3.1 Elo Rating (Difficulty Matching)

Student ability matched to question difficulty for ~70% success rate.

```
Rating Scale:
600-800   → Beginner (basic arithmetic)
800-1000  → Developing (standard Grade 5)
1000-1200 → Proficient (complex multi-step)
1200-1400 → Advanced (challenge questions)
```

**Algorithm:**
```typescript
// Expected success probability
expected = 1 / (1 + 10^((questionDifficulty - studentRating) / 400))

// Rating update after answer
newRating = currentRating + K * (actual - expected)  // K=32
```

### 3.2 Spaced Repetition (SM-2 Simplified)

Weak topics resurface at optimal intervals:

| Performance | Next Review |
|-------------|-------------|
| Fail | Tomorrow |
| Pass (hard) | 3 days |
| Pass (easy) | 7 days |
| Mastered | 14-30 days |

### 3.3 Mastery Tracking

Per-subtopic tracking with 80% threshold:
- Minimum 10 attempts before mastery claim
- Based on last 10 responses (rolling window)
- Visual progress bar per subtopic

### 3.4 Adaptive Game Difficulty

| Recent Accuracy | Game Adjusts |
|-----------------|--------------|
| < 40% | Wider gates, slower scroll, auto-hints, 15s timer |
| 40-60% | Normal gates, hints available |
| 60-80% | Standard difficulty |
| > 80% | Narrow gates, faster scroll, 8s timer, bonus challenges |

### 3.5 Question Selection Priority

1. **Due for review** (spaced repetition) → 40%
2. **Weakest subtopic** → 30%
3. **Current world theme** → 20%
4. **Random variety** → 10%

### 3.6 Question Auto-Calibration

Questions adjust difficulty based on aggregate responses:
- If >80% students pass → increase difficulty rating
- If <50% students pass → decrease difficulty rating
- Recalibrate after 5+ responses

---

## 4. Technical Stack

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Frontend | React + Vite | Fast dev, component-based |
| Game Engine | Phaser 3 | Industry standard 2D web games |
| Styling | Tailwind CSS | Rapid UI for menus/dashboard |
| Backend/DB | Supabase | Free tier, realtime, auth included |
| AI (Optional) | OpenAI API | Dynamic question generation (Phase 3) |
| Hosting | Vercel | Seamless deployment, free tier |

**Cost Estimate:** $70-150 total
- Hosting: $0 (free tiers)
- Capybara sprites: $50-100 (Fiverr)
- Sound effects: $20-30 (or free)

---

## 5. Data Models

### Student Profile
```typescript
interface StudentProfile {
  id: string;
  name: string;
  avatar: { skin: string; hat: string; cape: string };

  // Adaptive
  globalRating: number;           // Default 1000
  topicRatings: Record<Topic, number>;
  subtopicMastery: SubtopicMastery[];

  // Progress
  currentWorld: number;
  unlockedWorlds: number[];
  yuzuCoins: number;
  ownedItems: string[];

  // Engagement
  streakDays: number;
  lastPlayedAt: Date;
  totalPlayTimeMinutes: number;

  // Stats
  questionsAnswered: number;
  correctAnswers: number;
}
```

### Question
```typescript
interface Question {
  id: string;
  topic: Topic;
  subtopic: string;
  difficulty: number;  // 600-1400

  text: string;
  options: string[];   // 3 options for gate paths
  correctIndex: number;

  hint?: string;
  explanation: string;
  imageUrl?: string;

  // Calibration
  timesAnswered: number;
  correctRate: number;
}
```

---

## 6. Cambridge Checkpoint Topics (Stage 5)

### Number
- Place value to 1 million, decimals, negatives
- Fractions, percentages, equivalence
- Ordering with > and < signs
- Rounding decimals

### Calculation
- All times tables to 10×10
- Mental strategies, doubles, halves
- Fractions (same denominator)
- Multi-step problems

### Geometry
- 2D/3D shapes, nets
- Angles (acute, obtuse, right, reflex)
- Coordinates, symmetry, reflection

### Measure
- Length, mass, capacity conversions
- Time (24-hour), area, perimeter
- Money calculations

### Data Handling
- Bar charts, line graphs, pie charts
- Probability (likely, unlikely, certain)
- Mean, mode, range

---

## 7. Implementation Plan

### Phase 1: MVP (Week 1-2)
- [ ] Phaser setup: Capybara physics, scrolling backgrounds
- [ ] Gate system: 3-path collision + answer validation
- [ ] 50 pre-built questions (10 per topic)
- [ ] Basic Elo rating system
- [ ] Local storage for progress
- [ ] Deploy to Vercel

### Phase 2: Core Adaptive (Week 3-4)
- [ ] Supabase integration (auth + data)
- [ ] Spaced repetition engine
- [ ] Per-subtopic mastery tracking
- [ ] Boutique shop (coins → items)
- [ ] 150+ questions
- [ ] Power-ups (shield, slow-mo)

### Phase 3: Polish (Week 5-6)
- [ ] All 5 themed worlds
- [ ] Parent dashboard (simple)
- [ ] Question auto-calibration
- [ ] Sound effects + animations
- [ ] 250+ questions
- [ ] OpenAI integration (dynamic questions)

### Phase 4: Later
- [ ] Multi-student support
- [ ] Teacher mode
- [ ] Mobile app wrapper
- [ ] Advanced analytics

---

## 8. Parent Dashboard

Simple 1-page view:

1. **Today:** Questions answered, accuracy, time spent
2. **Week:** Streak status, topics practiced, trend
3. **Readiness:** Topic-by-topic % toward checkpoint
4. **Focus:** "This week, practice fractions!"

---

## 9. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Physics too hard | Adaptive gate width + speed |
| Questions too hard/easy | Elo system + calibration |
| OpenAI latency | Pre-fetch 10 questions; cache commons |
| Distraction > learning | Short punchy questions; balance ratio |
| Burnout before May | Daily limits, streak rewards, variety |

---

## 10. Success Metrics

| Metric | Target |
|--------|--------|
| Daily engagement | 15+ min/day |
| Weekly streak | 5+ days |
| Rating growth | +50 rating/month |
| Topic mastery | 80%+ all topics by April |
| Exam confidence | Comfortable with checkpoint-style |

---

## 11. Asset Requirements

### Capybara
- Idle, flapping, thinking, happy, sad animations
- Yuzu hat (default)
- 5+ unlockable skins/hats

### Environment
- 5 parallax backgrounds (Forest → Sky Castle)
- Themed gate sprites
- Coin/power-up icons
- UI panels

### Audio
- Background music (chill, not distracting)
- Flap, correct, wrong, power-up sounds

---

## 12. Question Bank Resources

### Free Past Papers

| Source | Content | Link |
|--------|---------|------|
| CURSA/IHMC Archive | Papers 2015-2017 + mark schemes | [cursa.ihmc.us](https://cursa.ihmc.us/rid=1S7XV3F9D-H6QZD0-59H5/Cambridge) |
| CLAD Zimbabwe | Progression Tests + Checkpoint (Stage 3-6) | [clad.co.zw](https://clad.co.zw/cambridge-papers/) |
| Cambridge Official | Via School Support Hub (school access) | [cambridgeinternational.org](https://www.cambridgeinternational.org/support-and-training-for-schools/teaching-and-learning-during-covid-19/teaching-resources/past-papers/) |
| Cambridge Curriculum | Official syllabus + learning objectives | [cambridgeinternational.org/maths](https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-primary/curriculum/mathematics/) |

### Paid Paper Collections

| Source | Content | Price |
|--------|---------|-------|
| SmartEduHub | Past papers 2010-2024, solved, topic questions, mocks | [smarteduhub.com](https://smarteduhub.com/cambridge-primary-checkpoint-past-papers) ~$20-50/year |
| SmartExamResources | Similar + mark schemes | Subscription |
| Cambridge Solved Papers | Topical questions + fully solved | [cambridge.solvedpapers.co.uk](https://cambridge.solvedpapers.co.uk/checkpoint-pri-math-topicals/) ~$30/year |

### Official Textbooks

| Publisher | Series | Notes |
|-----------|--------|-------|
| Cambridge University Press | Primary Mathematics Learner's Book 5/6 | Main curriculum |
| Cambridge University Press | Primary Mathematics Workbook 5/6 | Practice exercises |
| Cambridge University Press | Skills Builder Workbook | For struggling students |
| Cambridge University Press | Challenge Workbook | For advanced students |
| Hodder Education | Cambridge Primary Maths | Alternative series |

### Online Platforms

| Platform | Features | Cost |
|----------|----------|------|
| Cambridge Online Mathematics | Official, teacher-assigned, progress tracking | School access |
| Maths Catch | Stage 5/6 workbooks with answers | ~$15-30/stage |
| Mathigon | Free manipulatives, interactive | FREE |
| Brilliant.org | Problem-solving, visual learning | ~$15/mo |

### Game-Based Apps (Reference)

| App | Style | Cost |
|-----|-------|------|
| Prodigy Math | RPG battles with math | Free (premium $9.95/mo) |
| Splash Math | 1,900+ games, adaptive | $9.99/mo |
| DoodleMaths | "7-a-day" adaptive | Subscription |
| Khan Academy Kids | Comprehensive, no ads | FREE |

### YouTube Solutions

- **Mathematics Tour** - April 2024 Checkpoint solutions
- Search: "Cambridge Primary Checkpoint Maths 2024"

### Curriculum Framework

- Download: [Cambridge Primary Maths Curriculum Outline](https://www.chartwell.cl/en/wp-content/uploads/2022/08/25127-cambridge-primary-maths-curriculum-outline.pdf)

### Question Bank Strategy

1. Download 10+ years of past papers → ~500 questions
2. Categorize by topic: Number, Geometry, Measure, Data, Problem Solving
3. Rate difficulty: Easy (600-800), Medium (800-1000), Hard (1000-1200)
4. Add hints + explanations
5. Supplement with dynamic generation for arithmetic

---

## 13. Next Steps

1. ✅ Approve this report
2. Create detailed implementation plan
3. Source/commission Capybara assets
4. Build question bank from Cambridge past papers
5. Develop MVP with core gameplay + Elo system
6. Beta test with daughter

---

## Decisions Made

| Decision | Choice |
|----------|--------|
| Platform | Web PWA (Vercel + Supabase) |
| User scope | Single student (daughter) |
| Difficulty | Adaptive Elo + auto-calibration |
| Questions | Pre-built + dynamic generation |
| Teacher mode | Deferred to later phase |

---

*Report refined: 2025-12-18*

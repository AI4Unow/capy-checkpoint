# Phase 4: Advanced Features (Future)

## Overview
Lower priority features requiring more significant development effort. Consider after Phases 1-3 validated with users.

---

## 4.1: Parent/Teacher Dashboard

**Scope:** Separate web view showing child's learning progress.

### Features
- Progress over time (chart)
- Mastery by topic (heatmap)
- Struggling areas highlighted
- Export progress report (PDF)

### Technical Considerations
- Requires authentication (Firebase Auth)
- Parent account linking to child
- Data privacy compliance (COPPA)
- Possibly separate Next.js route: `/parent-dashboard`

### Rough Effort: 5-7 days

---

## 4.2: Adaptive Hint Scaffolding

**Scope:** Progressive hints before showing full AI explanation.

### Hint Levels
1. **Nudge:** "Think about place value..."
2. **Specific:** "What's 1/4 as a decimal?"
3. **Full:** Gemini AI explanation (existing)

### Implementation Ideas
- Store hint templates per subtopic
- Track hint usage in learningStore
- Penalize Elo less if correct after hint

### Rough Effort: 3-5 days

---

## 4.3: Question Difficulty Crowdsourcing

**Scope:** Auto-adjust question difficulty based on actual success rates.

### Logic
```typescript
// After 100 attempts per question
if (question.successRate < 0.3) {
  question.difficulty += 50;  // Harder than rated
} else if (question.successRate > 0.8) {
  question.difficulty -= 50;  // Easier than rated
}
```

### Technical Considerations
- Requires server-side storage (Firebase Firestore)
- Batch update process (not real-time)
- A/B testing to validate

### Rough Effort: 2-3 days

---

## 4.4: Comparative Analytics

**Scope:** Show how student compares to peers.

### Examples
- "You're better at Fractions than 70% of students"
- "Most students struggle with Percentages too"

### Risks
- Can be demotivating for struggling students
- Needs careful UX design (opt-in?)
- Privacy implications

### Rough Effort: 4-6 days

---

## Prioritization Recommendation

1. **Hint Scaffolding** - Direct learning impact
2. **Crowdsourcing** - Self-improving system
3. **Parent Dashboard** - Stakeholder value
4. **Comparative Analytics** - Risky, defer

---

## Dependencies

- Firebase Auth for parent dashboard
- Firebase Firestore for crowdsourcing
- User research for comparative analytics

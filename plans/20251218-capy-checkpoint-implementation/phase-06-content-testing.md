# Phase 6: Content & Testing

## Context Links

- **Parent Plan:** [plan.md](./plan.md)
- **Depends On:** [Phase 5 - Rewards & Polish](./phase-05-rewards-polish.md)
- **Brainstorm:** [Cambridge topics](../reports/brainstorm-20251218-capy-checkpoint.md)

---

## Overview

| Field | Value |
|-------|-------|
| Date | 2025-12-18 |
| Priority | P1 - High |
| Status | pending |
| Description | Expand questions, all 5 worlds, parent dashboard, testing, deployment |

---

## Key Insights

- Question sources: Cambridge past papers (2015-2024), official curriculum
- 5 worlds map to 5 Cambridge strands: Number, Calculation, Geometry, Measure, Data
- Parent dashboard: simple stats page, no complex analytics initially
- Testing: focus on gameplay feel + adaptive accuracy
- Deployment: Vercel with custom domain optional

---

## Requirements

### Functional
- F1: Expand question bank to 150+ questions (30 per topic)
- F2: All 5 themed worlds with unique backgrounds/music
- F3: World unlocking based on progress
- F4: Parent dashboard with daily/weekly stats
- F5: Simple settings page
- F6: Deploy to Vercel with production config

### Non-Functional
- NF1: Questions categorized by subtopic for mastery tracking
- NF2: Parent dashboard loads < 2s
- NF3: Zero critical bugs before launch
- NF4: Lighthouse score > 80

---

## Architecture

### Question Bank Structure

```
Total: 150+ questions

Number (30)
├── Place Value (8)
├── Decimals (6)
├── Fractions (8)
└── Percentages (8)

Calculation (30)
├── Times Tables (8)
├── Mental Math (8)
├── Division (7)
└── Multi-step (7)

Geometry (30)
├── 2D Shapes (8)
├── 3D Shapes (6)
├── Angles (8)
└── Coordinates (8)

Measure (30)
├── Length/Mass (8)
├── Time (8)
├── Area/Perimeter (7)
└── Money (7)

Data Handling (30)
├── Bar Charts (8)
├── Line Graphs (6)
├── Probability (8)
└── Averages (8)
```

### World Configuration

| World | Theme | Topics | Background | Music |
|-------|-------|--------|------------|-------|
| 1 | Forest | Number | Green trees, flowers | Calm piano |
| 2 | Garden | Calculation | Flower beds, bees | Cheerful ukulele |
| 3 | Rainbow | Geometry | Colorful arcs, clouds | Dreamy synth |
| 4 | Ocean | Measure | Waves, fish, coral | Ambient water |
| 5 | Sky Castle | Data | Clouds, castle towers | Epic strings |

### World Unlock Logic

```typescript
interface WorldProgress {
  world: number;
  questionsRequired: number;
  masteryRequired: number; // % of subtopics at 80%+
}

const worldUnlocks: WorldProgress[] = [
  { world: 1, questionsRequired: 0, masteryRequired: 0 },
  { world: 2, questionsRequired: 50, masteryRequired: 20 },
  { world: 3, questionsRequired: 100, masteryRequired: 40 },
  { world: 4, questionsRequired: 150, masteryRequired: 60 },
  { world: 5, questionsRequired: 200, masteryRequired: 80 }
];
```

### Parent Dashboard

Simple single-page view:

```
┌────────────────────────────────────────────────┐
│  Capy-Checkpoint: Parent View                  │
├────────────────────────────────────────────────┤
│  TODAY                                         │
│  ✓ 15 questions answered                       │
│  ✓ 73% accuracy                                │
│  ⏱ 12 minutes played                           │
├────────────────────────────────────────────────┤
│  THIS WEEK                                     │
│  🔥 5-day streak                               │
│  📈 Rating: 1050 (+25)                         │
│  🎯 87 questions, 71% correct                  │
├────────────────────────────────────────────────┤
│  TOPIC MASTERY                                 │
│  Number      ████████░░  78%                   │
│  Calculation ██████░░░░  62%                   │
│  Geometry    █████████░  85%                   │
│  Measure     ███████░░░  68%                   │
│  Data        ██████████  92%                   │
├────────────────────────────────────────────────┤
│  FOCUS RECOMMENDATION                          │
│  "Practice more: Calculation - Division"       │
└────────────────────────────────────────────────┘
```

### Component Structure
```
src/
├── pages/
│   ├── WorldSelect.tsx     # World map navigation
│   ├── ParentDashboard.tsx # Stats view
│   └── Settings.tsx        # Preferences
├── components/
│   ├── WorldCard.tsx       # World selector item
│   └── MasteryBar.tsx      # Progress bar
└── data/
    └── questions/
        ├── number.json
        ├── calculation.json
        ├── geometry.json
        ├── measure.json
        └── data.json
```

---

## Related Code Files

| File | Purpose |
|------|---------|
| `src/pages/WorldSelect.tsx` | World selection screen |
| `src/pages/ParentDashboard.tsx` | Parent stats view |
| `src/pages/Settings.tsx` | Settings page |
| `src/components/WorldCard.tsx` | World card UI |
| `src/data/questions/*.json` | Question bank files |
| `public/backgrounds/*.png` | World backgrounds |
| `vercel.json` | Deployment config |

---

## Implementation Steps

### Question Bank Expansion

1. **Source questions from Cambridge papers**
   - Download past papers 2015-2024
   - Extract ~200 questions
   - Categorize by topic/subtopic
   - Assign difficulty ratings

2. **Format questions to JSON**
   ```json
   {
     "id": "calc-div-003",
     "topic": "calculation",
     "subtopic": "division",
     "difficulty": 950,
     "text": "What is 456 ÷ 8?",
     "options": ["57", "56", "58"],
     "correctIndex": 0,
     "explanation": "456 ÷ 8 = 57 (8 × 57 = 456)"
   }
   ```

3. **Validate question quality**
   - All 3 options plausible
   - Explanations clear
   - Difficulty accurately rated
   - No duplicate questions

4. **Upload to Supabase**
   - Batch insert via SQL
   - Verify counts per topic

### World Implementation

5. **Create world backgrounds**
   - 5 parallax backgrounds (or find assets)
   - Each 1920x1080 minimum
   - Kawaii/cottagecore style

6. **Create WorldSelect page**
   - Grid of 5 world cards
   - Lock/unlock visual state
   - Progress bar per world
   - Tap to enter world

7. **Create WorldCard component**
   ```tsx
   function WorldCard({ world, isUnlocked, progress }) {
     return (
       <div className={`world-card ${!isUnlocked && 'opacity-50'}`}>
         <img src={world.thumbnail} />
         <h3>{world.name}</h3>
         {isUnlocked ? (
           <ProgressBar value={progress} />
         ) : (
           <LockIcon />
         )}
       </div>
     );
   }
   ```

8. **Implement world unlock logic**
   - Check questions answered + mastery %
   - Show unlock celebration on first access
   - Persist unlocked worlds to profile

9. **Update Game scene for world themes**
   - Load correct background per world
   - Filter questions by world topics
   - Update music track

### Parent Dashboard

10. **Create ParentDashboard page**
    - Fetch stats from Supabase
    - Calculate daily/weekly aggregates
    - Display topic mastery bars

11. **Create MasteryBar component**
    ```tsx
    function MasteryBar({ topic, percentage }) {
      const color = percentage >= 80 ? 'green' :
                    percentage >= 50 ? 'yellow' : 'red';
      return (
        <div className="flex items-center gap-2">
          <span className="w-24">{topic}</span>
          <div className="flex-1 h-4 bg-gray-200 rounded">
            <div
              className={`h-full bg-${color}-500 rounded`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span>{percentage}%</span>
        </div>
      );
    }
    ```

12. **Add focus recommendation logic**
    - Find weakest subtopic
    - Display as "Focus: [subtopic]"

### Settings & Polish

13. **Create Settings page**
    - Sound toggle
    - Music toggle
    - Reset progress (with confirmation)
    - About/credits

14. **Add navigation**
    - Bottom nav: Play, Worlds, Shop, Settings
    - Parent dashboard: separate URL route

### Testing

15. **Gameplay testing checklist**
    - [ ] Physics feels smooth
    - [ ] Questions display correctly
    - [ ] Answers validate properly
    - [ ] Lives/coins update correctly
    - [ ] Power-ups work as expected
    - [ ] Sound effects play
    - [ ] PWA installs and works offline

16. **Adaptive testing**
    - [ ] Rating increases on correct streaks
    - [ ] Rating decreases on wrong streaks
    - [ ] Weaker topics appear more often
    - [ ] Questions match ability level

17. **Cross-device testing**
    - [ ] Desktop Chrome/Firefox/Safari
    - [ ] iPhone Safari
    - [ ] Android Chrome
    - [ ] iPad

18. **Bug fixes**
    - Document all bugs found
    - Prioritize by severity
    - Fix critical bugs before launch

### Deployment

19. **Prepare for production**
    - Remove console.logs
    - Optimize bundle size
    - Compress images
    - Minify audio

20. **Configure Vercel**
    ```json
    // vercel.json
    {
      "buildCommand": "npm run build",
      "outputDirectory": "dist",
      "framework": "vite",
      "rewrites": [
        { "source": "/(.*)", "destination": "/" }
      ]
    }
    ```

21. **Deploy**
    ```bash
    vercel --prod
    ```

22. **Post-deploy verification**
    - All pages load
    - Auth works
    - Data syncs
    - PWA installs

23. **Set up domain (optional)**
    - capy-checkpoint.vercel.app (free)
    - Or custom domain if purchased

---

## Todo List

### Questions
- [ ] Source 150 questions from Cambridge papers
- [ ] Format questions to JSON
- [ ] Assign difficulty ratings
- [ ] Write explanations for all
- [ ] Upload to Supabase

### Worlds
- [ ] Create/source 5 world backgrounds
- [ ] Create WorldSelect page
- [ ] Create WorldCard component
- [ ] Implement world unlock logic
- [ ] Add world-specific music

### Parent Dashboard
- [ ] Create ParentDashboard page
- [ ] Create MasteryBar component
- [ ] Add daily/weekly stats queries
- [ ] Add focus recommendation

### Settings
- [ ] Create Settings page
- [ ] Add sound/music toggles
- [ ] Add reset progress option

### Testing
- [ ] Complete gameplay testing checklist
- [ ] Test adaptive accuracy
- [ ] Cross-device testing
- [ ] Fix all critical bugs

### Deployment
- [ ] Production build optimization
- [ ] Configure Vercel
- [ ] Deploy to production
- [ ] Verify post-deploy

---

## Success Criteria

- [ ] 150+ questions in database
- [ ] All 5 worlds playable
- [ ] World unlocking works correctly
- [ ] Parent dashboard shows accurate stats
- [ ] No critical bugs
- [ ] PWA Lighthouse score > 80
- [ ] Deployed and accessible online

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Not enough time for 150 questions | Medium | Medium | Prioritize 100 high-quality over 150 rushed |
| World backgrounds look inconsistent | Medium | Low | Use consistent art style or single artist |
| Dashboard queries slow | Low | Medium | Add database indexes, cache results |
| Vercel build fails | Low | Medium | Test build locally first |

---

## Security Considerations

- Parent dashboard: consider PIN protection (future)
- Reset progress: require double confirmation
- Production env vars: never commit to git

---

## Next Steps

After Phase 6 complete:
1. **Launch!** Share with daughter for testing
2. Gather feedback for improvements
3. Future: Multi-student support, teacher mode, mobile app

---

## Unresolved Questions

1. **Custom domain?** Worth purchasing capy-checkpoint.com? (~$12/year)
2. **Analytics?** Add Plausible/Posthog for usage insights? (Future)
3. **Backup?** Daily Supabase exports to Google Drive? (Recommended)

# Phase 3: Upload to Firebase Firestore

## Context Links
- [Parent Plan](plan.md)
- [Phase 2: Parse Papers](phase-02-parse-additional-papers.md)

## Overview
- **Priority:** Medium
- **Status:** 🔴 Not Started
- **Description:** Upload all parsed questions to Firebase Firestore

## Key Insights
- Existing upload script handles 200 questions
- Firestore batch limit: 500 documents
- Current cost: Free tier sufficient for 500+ questions

## Requirements

### Functional
- Merge all year-specific JSON files
- Upload to `questions` collection
- Preserve existing questions (no duplicates)

### Non-Functional
- Use batch writes for efficiency
- Log upload progress

## Architecture

```
Input Files:
  src/data/questions.json (130)
  src/data/cambridge-2014-questions.json (70)
  src/data/cambridge-2018-questions.json (~60)
  src/data/cambridge-2020-questions.json (~60)
  src/data/cambridge-2022-questions.json (~60)
  src/data/cambridge-2024-questions.json (~60)
         ↓
Merge Script: scripts/upload-questions-to-firebase.ts
         ↓
Firebase Firestore: questions collection (~440 docs)
         ↓
Local Backup: src/data/all-questions.json
```

## Related Code Files
- `scripts/upload-questions-to-firebase.ts` - Upload script (modify)
- `src/lib/questionsService.ts` - Fetch service
- `firebase_service_account.json` - Credentials

## Implementation Steps

1. **Update Upload Script**
   ```typescript
   // Add all year files to merge
   const questionFiles = [
     "questions.json",
     "cambridge-2014-questions.json",
     "cambridge-2018-questions.json",
     "cambridge-2020-questions.json",
     "cambridge-2022-questions.json",
     "cambridge-2024-questions.json",
   ];
   ```

2. **Run Upload**
   ```bash
   npx tsx scripts/upload-questions-to-firebase.ts
   ```

3. **Verify in Firebase Console**
   - Check document count
   - Spot-check random questions
   - Verify topic distribution

4. **Update Local Backup**
   - Confirm `all-questions.json` updated
   - Verify game uses new questions

## Todo List
- [ ] Modify upload script to include all year files
- [ ] Run upload script
- [ ] Verify 400+ questions in Firestore
- [ ] Test game with expanded question bank
- [ ] Commit changes

## Success Criteria
- [ ] 400+ questions in Firebase
- [ ] No duplicate IDs
- [ ] Game loads questions correctly
- [ ] Topic distribution balanced

## Firestore Stats (Expected)

| Topic | Count | Percentage |
|-------|-------|------------|
| number | ~120 | 27% |
| calculation | ~100 | 23% |
| geometry | ~80 | 18% |
| measure | ~80 | 18% |
| data | ~60 | 14% |
| **Total** | **~440** | 100% |

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|------------|
| Batch size exceeded | Low | Script already handles 400+ batch chunks |
| Duplicate IDs | Medium | Merge by ID before upload |
| Firebase quota | Low | Free tier allows 20K writes/day |

## Security Considerations
- Service account key not committed to git
- Firestore rules restrict write access
- Read access open for game client

## Next Steps
→ After upload complete:
1. Test game with expanded questions
2. Monitor Firebase usage
3. Consider adding more years if needed

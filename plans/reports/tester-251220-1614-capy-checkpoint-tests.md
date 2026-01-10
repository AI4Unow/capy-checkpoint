# Test Report

**Scope**
- capy-checkpoint-next: `npm test`, `npm run test:coverage` (vitest)
- capy-checkpoint: no `test` script; fallback `npm run lint`

**Test Results Overview**
- capy-checkpoint-next: 6 files, 92 tests, 0 failed, 0 skipped
- capy-checkpoint: eslint completed with no errors (lint-only check)

**Coverage Metrics (capy-checkpoint-next)**
- Statements 20.81%, Branches 18.35%, Functions 22.87%, Lines 20.41%
- Good: engine/elo.ts, engine/mastery.ts, engine/sm2.ts all 100%
- Low/zero: lib/firebase.ts, lib/firebaseSync.ts, stores/* (authStore, badgeStore, boutiqueStore, challengeStore, learningStore, moodStore, masteryBoxStore, settingsStore, spinStore) all 0%; lib/questionsService.ts 31.42% stmts

**Failed Tests**
- None

**Performance Metrics**
- `npm test`: ~0.8s (transform 200ms, import 297ms, tests 21ms)
- `npm run test:coverage`: ~1.0s (transform 365ms, import 448ms, tests 28ms); no slow individual tests flagged

**Build Status**
- Not run (not requested)

**Critical Issues**
- Extremely low coverage outside engine tests; lib/firebase*, stores/* entirely untested

**Recommendations**
1) Add integration/unit tests for lib/firebase.ts and lib/firebaseSync.ts, including error paths and Firestore config absence.
2) Cover lib/questionsService.ts fetch/error branches and offline scenarios; mock Firestore client.
3) Add store tests (auth, badge, boutique, challenge, learning, mood, masteryBox, settings, spin) for state transitions, persistence, and error handling; ensure deterministic setup/teardown.
4) Add branch coverage for engine/questionSelector.ts around path selection edge cases (lines ~104-214, 259-302 reported uncovered).

**Next Steps**
1) Prioritize store coverage to raise overall metrics above target.
2) Add Firebase client mocks and tests for happy/error paths.
3) Re-run `npm run test:coverage` to track improvements.

Unresolved questions: none

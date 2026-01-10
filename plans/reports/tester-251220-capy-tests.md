# Test Report - 251220

## Scope
- Packages: capy-checkpoint-next (Next.js), capy-checkpoint (Vite template).
- Commands: `npm --prefix ".../capy-checkpoint-next" run test:run`, `npm --prefix ".../capy-checkpoint-next" run test:coverage`, `npm --prefix ".../capy-checkpoint" test` (missing script), `npm --prefix ".../capy-checkpoint" run` to verify scripts.

## Results
- capy-checkpoint-next vitest run: PASS. Files 6, tests 92, failures 0, skips 0. Duration ~1.0s (env ~4.3s init).
- capy-checkpoint-next coverage: PASS. Same counts; duration ~0.95s (env ~3.3s init).
- capy-checkpoint: no test script; npm reported "Missing script: \"test\"".

## Coverage (vitest v8 reporter)
- Overall: Stmts 20.81%, Branch 18.35%, Funcs 22.87%, Lines 20.41%.
- engine: Stmts 72.37%, Branch 69%, Funcs 77.5%, Lines 73.5%; gaps mainly `questionSelector.ts` (lines ~204-214, 259-302).
- lib: Stmts 14.66%; firebase.ts/firebaseSync.ts 0% (lines 9-68, 54-229); questionsService.ts partial (lines 54-62, 77-188).
- stores: Stmts 2.21%, Branch 0.92%, Funcs 6.72%, Lines 1.75%; most stores 0% except `gameStore.ts` (Lines 44-46 uncovered).

## Performance
- Total test runtime <= ~5s including env spin-up; no slow tests reported.

## Build/Typecheck
- Not run (task scoped to tests only).

## Warnings
- capy-checkpoint lacks `test` script/tests; only dev/build/lint/preview scripts exist.
- Coverage very low outside engine module; many store/lib files untested.

## Recommendations
1) Add tests for lib/firebase.ts + firebaseSync.ts (happy/error paths, Firestore config fallback).
2) Expand questionsService tests for edge cases (empty results, errors, retry paths) and higher branch coverage.
3) Add store-level tests (auth/badge/boutique/challenge/learning/mood/memoryBox/settings/spin) to cover state transitions and selectors.
4) Add integration-style tests exercising questionSelector edge branches.

## Unresolved Questions
- none

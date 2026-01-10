# Phase 03: Testing + Coverage Uplift

## Context Links
- Test reports:
  - `plans/reports/tester-251220-1614-capy-checkpoint-tests.md`
  - `plans/reports/tester-251220-capy-tests.md`

## Overview
- Date: 251220
- Priority: Medium
- Status: pending

## Key Insights
- `capy-checkpoint-next`: tests pass; coverage is low overall (~20% lines) despite strong engine coverage.
- Biggest gaps: `src/lib/firebase.ts`, `src/lib/firebaseSync.ts`, most `src/stores/*`.
- `capy-checkpoint`: no test script at all.

## Requirements
- Add tests where they buy confidence: Firebase sync, stores, and API handlers.
- Keep tests fast and deterministic.

## Architecture
- Keep pure logic tests in Node env (Vitest).
- Mock Firebase client modules for lib/store tests.
- Add minimal route handler tests for Next.js API (request/response shape, auth gates).

## Related Code Files
- `capy-checkpoint-next/src/lib/firebase.ts`
- `capy-checkpoint-next/src/lib/firebaseSync.ts`
- `capy-checkpoint-next/src/stores/*.ts`
- `capy-checkpoint-next/src/app/api/**/route.ts`

## Implementation Steps
1) Add unit tests for `firebase.ts` config gating (window presence + env presence).
2) Add tests for `firebaseSync.ts` data conversion (timestamps -> Date) and subscribe behavior.
3) Add store tests for persistence + key state transitions (auth/settings/learning/coins).
4) Add API route tests for auth failure paths and input validation.
5) Optional: add `capy-checkpoint` minimal test harness if it will remain in use.

## Todo
- Define coverage target (e.g., 60% lines for `lib/` + `stores/`).
- Decide if `capy-checkpoint` is a prototype or production target.

## Success Criteria
- Coverage increases in `lib/` and `stores/` without slowing suite.
- Tests catch obvious regressions in sync/auth.

## Risk Assessment
- Firebase module mocking can be brittle; keep wrapper boundaries small.

## Security Considerations
- Tests must not require real secrets or real Firestore.

## Next Steps
- Start with `firebase.ts` and `firebaseSync.ts` tests.

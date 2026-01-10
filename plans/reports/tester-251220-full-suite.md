# QA Test Report (tester)

- **Timestamp**: 2025-12-20 10:18 local
- **Scope**: capy-checkpoint-next (Next.js), capy-checkpoint (Vite/React) — TypeScript build + tests + coverage attempt

## Test Results Overview
- capy-checkpoint-next: `npm run test` (Vitest) — **pass**, 6 files, 92 tests, 0 failed, 0 skipped, duration ~1.06s
- capy-checkpoint: no tests defined

## Coverage Metrics
- capy-checkpoint-next: coverage run **failed** (missing dependency `@vitest/coverage-v8`), no report produced

## Failed Tests / Build Errors
- capy-checkpoint build (TypeScript) **failed** during `npm run build`:
  - `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/Preliminary math checkpoint/capy-checkpoint/src/game/PhaserGame.tsx:48,49,55,56` — handler signatures rejected by `EventCallback`; parameters typed as `unknown` vs expected `number`
  - `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/Preliminary math checkpoint/capy-checkpoint/src/game/scenes/Game.ts:67` — cast from `Body | StaticBody | Tile` to `Sprite` flagged; `Tile` lacks Sprite fields
- capy-checkpoint-next: no test failures; build succeeded

## Performance Metrics
- Vitest (capy-checkpoint-next): 1.06s total (transform 397ms, tests 23ms)
- Next build: ~3.3s compile + ~0.6s prerender; warning `--localstorage-file` without path

## Build Status
- capy-checkpoint-next `npm run build`: **pass** (Next 16, Turbopack); warning about `--localstorage-file` lacking path
- capy-checkpoint `npm run build`: **fail** due to TypeScript type errors above

## Critical Issues
- capy-checkpoint build blocked by TypeScript errors in PhaserGame and Game scene
- Coverage unavailable for capy-checkpoint-next until `@vitest/coverage-v8` installed

## Recommendations
1) capy-checkpoint: align event listener callbacks with expected `EventCallback` signature (likely accept `(args: unknown) => { ... }` or assert number) and adjust cast in `Game.ts` (validate type narrowing before Sprite access or guard Tile case).
2) Install coverage dependency in capy-checkpoint-next: `npm install -D @vitest/coverage-v8` and re-run `npm run test -- --coverage`.
3) Investigate Next build warning; either supply valid `--localstorage-file` path or remove flag to avoid runtime surprises.

## Next Steps
- Fix capy-checkpoint TypeScript errors, rerun `npm run build` for that package.
- Add coverage dependency and rerun coverage for capy-checkpoint-next to confirm metrics.
- If relevant, address `--localstorage-file` warning in Next build config or scripts.

## Unresolved Questions
- Should capy-checkpoint have tests to cover Phaser game logic?
- What intended type contract is for Phaser event callbacks in PhaserGame handlers?
- Should Next build set a specific localstorage file path or drop the flag?

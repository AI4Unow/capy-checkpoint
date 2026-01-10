# Plan: Fix coverage and build errors

## Scope
Address current issues:
1) `capy-checkpoint-next`: `vitest --coverage` fails (missing `@vitest/coverage-v8`).
2) `capy-checkpoint`: `npm run build` fails (TS2345 in `src/game/PhaserGame.tsx` about EventBus callback unknown; TS2352 in `src/game/scenes/Game.ts` unsafe cast to Sprite).
3) Optional: Next build warning about `--localstorage-file` invalid path.

## Constraints
- Follow YAGNI/KISS/DRY and repo development rules.
- No implementation here; plan only.

## Steps
1) **Context checks**
   - Review `capy-checkpoint-next` test/coverage config (`package.json`, vitest config if present).
   - Review `capy-checkpoint` Phaser typing setup (`EventBus`, scenes) to target TS errors.

2) **Coverage dependency fix (capy-checkpoint-next)**
   - Add devDependency `@vitest/coverage-v8` matching vitest major.
   - If vitest config references coverage provider, ensure `coverage.provider = 'v8'` (or default) and update scripts if needed.
   - Reinstall deps if lockfile present; prefer minimal change.

3) **EventBus typing fix (capy-checkpoint)**
   - Adjust `EventBus` typings so callbacks receive correct arg types (e.g., typed map or overload) to remove `unknown` in `PhaserGame.tsx` handlers.
   - Ensure emit signatures align with usage in `Game.ts` (score/lives numbers, booleans, etc.).

4) **Gate overlap typing fix (capy-checkpoint)**
   - Replace unsafe cast in `Game.ts` overlap handler with safe narrowing (check `gate` has `body` and texture key; use type predicate or `instanceof Phaser.Physics.Arcade.Sprite`).
   - Keep logic same (gate pass removal + score handling).

5) **Next warning about `--localstorage-file` (optional)**
   - Locate source (scripts, env, config). If present, either correct path or remove flag if unused. Document decision.

6) **Verification**
   - In `capy-checkpoint-next`: `npm install` (if dep added) then `npm run test:coverage`.
   - In `capy-checkpoint`: `npm run build`.
   - If optional warning touched: rerun `npm run build` or relevant Next command to confirm warning resolved/unchanged.

## Expected file touches
- `capy-checkpoint-next/package.json` (devDependency, maybe scripts or vitest config file if present).
- `capy-checkpoint-next/vitest.config.*` (only if provider needs setting).
- `capy-checkpoint/src/game/EventBus.ts` (typing improvements).
- `capy-checkpoint/src/game/PhaserGame.tsx` (type usage may adjust after EventBus typing update).
- `capy-checkpoint/src/game/scenes/Game.ts` (safe overlap typing).
- Optional: any script/config emitting `--localstorage-file` flag.

## Deliverables
- Coverage command succeeds with `@vitest/coverage-v8` installed.
- `npm run build` in `capy-checkpoint` passes with TypeScript errors resolved.
- Optional: Next warning addressed or documented.

## Unresolved questions
- Source of `--localstorage-file` flag? (Need to locate before change)

# Codebase Review Plan (Capy-Checkpoint)

Date: 251220

## Overview
Focus: architecture, testing, security improvements (Phaser + Next.js + Firebase).

## Phases
- Phase 01 (pending): Security hardening for Next.js API routes
  - See: `phase-01-nextjs-api-security.md`
- Phase 02 (pending): Game loop determinism + event contract cleanup (Phaser)
  - See: `phase-02-phaser-determinism-events.md`
- Phase 03 (pending): Testing strategy + coverage uplift (Vitest)
  - See: `phase-03-testing-coverage.md`
- Phase 04 (pending): Repo hygiene + risk cleanup (secrets, generated files)
  - See: `phase-04-repo-hygiene.md`

## Current Notes
- `capy-checkpoint-next`: tests pass; coverage runs; lint clean.
- `capy-checkpoint`: build/lint pass; no tests.
- Known warning: Next build prints `--localstorage-file` invalid path (source unknown).

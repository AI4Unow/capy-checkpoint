# Plan: Codebase Review (Mathie)

Status: draft (created 2025-12-19)

## Scope
Review current repo state for architecture, maintainability, security, and correctness. Focus on `capy-checkpoint-next` (Next.js + Phaser + Firebase).

## Phase 01 — Codebase map (done)
- Key subsystems and entry points
- Data flow: React ↔ Phaser, question selection, persistence, API routes

## Phase 02 — Risks & recommendations (next)
- Security: secrets handling, admin endpoints, client/server boundaries
- Correctness: gameplay loop, event lifecycle, store sync
- Maintainability: module boundaries, duplication, testing gaps

## Phase 03 — Improvement plan (next)
- Prioritized changes with minimal churn
- Concrete implementation steps + success criteria

Links
- Research: `plans/251219-2101-review-codebase/research/research-251219-2202-nextjs-phaser-firebase-best-practices.md`

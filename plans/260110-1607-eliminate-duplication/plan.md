---
title: "Eliminate Codebase Duplication"
description: "Remove abandoned folders, redundant files, and consolidate code"
status: completed
priority: P2
effort: 3.5h
branch: master
tags: [refactor, cleanup, tech-debt]
created: 2026-01-10
---

# Eliminate Codebase Duplication

## Overview

Clean up ~600MB of obsolete artifacts and consolidate redundant code patterns.

## Phase Summary

| Phase | Description | Effort | Priority |
|-------|-------------|--------|----------|
| [01](./phase-01-folder-cleanup.md) | Delete abandoned folders, HTML mockups, nested git | 30m | P1 |
| [02](./phase-02-readme-consolidation.md) | Merge and clean up README files | 30m | P2 |
| [03](./phase-03-store-consolidation.md) | Consolidate session stats, extract Zustand helper | 1.5h | P2 |
| [04](./phase-04-code-audit.md) | Audit cosmetics, hooks, SW registration | 1h | P3 |

## Key Findings

### Folder-Level (Critical)
- `capy-checkpoint/` - Abandoned Vite prototype (DELETE)
- 3 HTML mockups - Obsolete static files (DELETE)
- `capy-checkpoint-next/.git/` - Nested git repo (DELETE)

### Code-Level
- Session stats duplicated between gameStore/learningStore
- 11 Zustand stores repeat persist boilerplate
- Potential dead code: useQuestionBank hook

## Context

- [Research: Folder Duplication](./research/researcher-01-folder-duplication.md)
- [Research: Code Redundancy](./research/researcher-02-code-redundancy.md)
- [Codebase Summary](/Users/nad/My Drive (duc.a.nguyen@gmail.com)/Preliminary math checkpoint/docs/codebase-summary.md)

## Success Criteria

1. No abandoned folders in root
2. Single canonical README.md
3. No nested .git directories
4. Session stats in single store
5. All tests pass after consolidation

## Validated Decisions (2026-01-10)

- ✅ HTML mockups: DELETE (no archival needed)
- ✅ Nested .git: DELETE safely (no pre-check required)
- ✅ Scope: Full plan - all 4 phases

## Remaining Questions (investigate in Phase 04)

1. Is useQuestionBank still used?
2. Are cosmetics overlays truly duplicated?

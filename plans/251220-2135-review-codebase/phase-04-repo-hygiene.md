# Phase 04: Repo Hygiene + Risk Cleanup

## Context Links
- Git status snapshot (local): see `git status --porcelain` output in session logs.

## Overview
- Date: 251220
- Priority: High (security), Low (dev UX)
- Status: pending

## Key Insights
- `firebase_service_account.json` is tracked by git (high risk). Must be removed from repo and replaced with env/secret-store usage.
- Many local artifacts are modified/untracked (`.DS_Store`, `materials/*.pdf`, `plans/*` outputs). Some should be ignored by git.

## Requirements
- Ensure secrets are never tracked.
- Ensure generated artifacts and OS files are ignored.

## Architecture
- Use `.gitignore` for:
  - `**/.DS_Store`
  - `materials/`
  - `capy-checkpoint-next/coverage/`
- Remove `firebase_service_account.json` from git history (or at least from tracking) and replace with documented env approach.

## Related Code Files
- `firebase_service_account.json` (should not exist in repo)
- `.gitignore` (not yet inspected)

## Implementation Steps
1) Confirm `firebase_service_account.json` is not needed; extract to secret manager/env.
2) Remove file from git tracking and add ignore rule.
3) Add ignore rules for OS + local artifacts.
4) Add a quick audit check (CI or pre-commit) to block committing common secret file patterns.

## Todo
- Decide policy: rewrite history to remove secret file vs stop tracking going forward.
- Confirm which directories should be versioned under `plans/`.

## Success Criteria
- No secrets tracked by git.
- Clean git status after typical dev actions.

## Risk Assessment
- Removing tracked secret may require coordination if already pushed.

## Security Considerations
- Treat tracked `firebase_service_account.json` as a compromised secret until rotated.

## Next Steps
- Decide whether to rotate Firebase service account keys and rewrite git history.

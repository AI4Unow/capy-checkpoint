# Phase 01: Folder Cleanup

## Context

- [Plan](./plan.md)
- [Research: Folder Duplication](./research/researcher-01-folder-duplication.md)

## Overview

| Field | Value |
|-------|-------|
| Priority | P1 |
| Status | pending |
| Effort | 30m |
| Description | Delete abandoned Vite prototype, static HTML mockups, nested git repo |

## Key Insights

1. `capy-checkpoint/` is 100% obsolete - Vite prototype replaced by Next.js
2. 3 HTML mockups served design phase, now replaced by Phaser
3. Nested `.git/` in capy-checkpoint-next causes sync conflicts
4. Cleanup recovers ~600MB disk space

## Related Files

| File/Folder | Action | Rationale |
|-------------|--------|-----------|
| `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/Preliminary math checkpoint/capy-checkpoint/` | DELETE | Abandoned Vite prototype |
| `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/Preliminary math checkpoint/level1-forest.html` | DELETE | Obsolete mockup |
| `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/Preliminary math checkpoint/level2-garden.html` | DELETE | Obsolete mockup |
| `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/Preliminary math checkpoint/level3-sky.html` | DELETE | Obsolete mockup |
| `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/Preliminary math checkpoint/capy-checkpoint-next/.git/` | DELETE | Nested git repo |

## Implementation Steps

### Step 1: Verify No Uncommitted Work

```bash
# Check nested git for uncommitted changes
cd "/Users/nad/My Drive (duc.a.nguyen@gmail.com)/Preliminary math checkpoint/capy-checkpoint-next"
git status
git stash list
```

### Step 2: Delete Nested Git Repo

```bash
rm -rf "/Users/nad/My Drive (duc.a.nguyen@gmail.com)/Preliminary math checkpoint/capy-checkpoint-next/.git"
```

### Step 3: Delete Abandoned Vite Folder

```bash
rm -rf "/Users/nad/My Drive (duc.a.nguyen@gmail.com)/Preliminary math checkpoint/capy-checkpoint"
```

### Step 4: Delete Static HTML Mockups

```bash
rm "/Users/nad/My Drive (duc.a.nguyen@gmail.com)/Preliminary math checkpoint/level1-forest.html"
rm "/Users/nad/My Drive (duc.a.nguyen@gmail.com)/Preliminary math checkpoint/level2-garden.html"
rm "/Users/nad/My Drive (duc.a.nguyen@gmail.com)/Preliminary math checkpoint/level3-sky.html"
```

### Step 5: Update .gitignore

Add to root `.gitignore`:
```
# Removed folders (prevent recreation)
capy-checkpoint/
```

### Step 6: Update CLAUDE.md

Remove references to deleted files in architecture section.

## Todo List

- [ ] Verify no uncommitted changes in nested .git
- [ ] Delete nested .git in capy-checkpoint-next
- [ ] Delete capy-checkpoint folder
- [ ] Delete level1-forest.html
- [ ] Delete level2-garden.html
- [ ] Delete level3-sky.html
- [ ] Update .gitignore
- [ ] Update CLAUDE.md references
- [ ] Commit cleanup changes

## Success Criteria

1. `capy-checkpoint/` folder gone
2. No `level*.html` files in root
3. Only root `.git/` exists
4. `git status` shows clean after commit
5. Next.js app still runs: `npm run dev`

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Lost uncommitted work in nested git | Low | Medium | Check git status/stash before delete |
| Design team needs HTML mockups | Low | Low | Ask before delete or archive to materials/ |
| Break file references | Low | Low | Search codebase for level*.html imports |

## Rollback

If issues discovered post-cleanup:
```bash
git checkout HEAD -- capy-checkpoint/
git checkout HEAD -- level1-forest.html level2-garden.html level3-sky.html
```

Note: Rollback only works if committed before deletion.

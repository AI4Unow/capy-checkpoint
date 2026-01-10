# Phase 02: README Consolidation

## Context

- [Plan](./plan.md)
- [Research: Folder Duplication](./research/researcher-01-folder-duplication.md)

## Overview

| Field | Value |
|-------|-------|
| Priority | P2 |
| Status | pending |
| Effort | 30m |
| Description | Merge capy-checkpoint-next README into root, delete duplicates |

## Key Insights

1. Root README.md (122 lines) - comprehensive, production-ready
2. capy-checkpoint/README.md - generic Vite boilerplate (deleted with folder)
3. capy-checkpoint-next/README.md (76 lines) - user-focused game docs, emoji-rich

## Related Files

| File | Lines | Action |
|------|-------|--------|
| `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/Preliminary math checkpoint/README.md` | 122 | KEEP (canonical) |
| `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/Preliminary math checkpoint/capy-checkpoint/README.md` | 74 | AUTO-DELETED (Phase 01) |
| `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/Preliminary math checkpoint/capy-checkpoint-next/README.md` | 76 | MERGE then DELETE |

## Implementation Steps

### Step 1: Read Both READMEs

```bash
# Compare content
cat "/Users/nad/My Drive (duc.a.nguyen@gmail.com)/Preliminary math checkpoint/README.md"
cat "/Users/nad/My Drive (duc.a.nguyen@gmail.com)/Preliminary math checkpoint/capy-checkpoint-next/README.md"
```

### Step 2: Identify Unique Content

Extract from capy-checkpoint-next/README.md:
- Game mechanics description
- How to play section
- Badge/cosmetics info (if not in root)

### Step 3: Merge Into Root README

Add missing sections to root README.md:
- "How to Play" section (if missing)
- User-facing game instructions
- Remove emojis for consistency

### Step 4: Delete Redundant README

```bash
rm "/Users/nad/My Drive (duc.a.nguyen@gmail.com)/Preliminary math checkpoint/capy-checkpoint-next/README.md"
```

### Step 5: Update Root README Path References

Ensure all paths reference `capy-checkpoint-next/` as the active codebase.

## Todo List

- [ ] Read root README.md content
- [ ] Read capy-checkpoint-next/README.md content
- [ ] List unique content from nested README
- [ ] Merge unique sections into root README
- [ ] Remove emojis for consistency
- [ ] Delete capy-checkpoint-next/README.md
- [ ] Verify root README complete
- [ ] Commit changes

## Success Criteria

1. Single README.md at project root
2. No README in capy-checkpoint-next/
3. Root README contains game play instructions
4. All deployment URLs preserved
5. No orphaned references

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Lose unique game docs | Low | Medium | Copy before delete |
| Break documentation links | Low | Low | Search for README references |
| Miss important user info | Medium | Low | Side-by-side comparison |

## Content Merge Checklist

From capy-checkpoint-next/README.md, verify root has:
- [ ] Game overview/description
- [ ] How to play instructions
- [ ] Control instructions (up/down, answer gates)
- [ ] Badge/achievement info
- [ ] Cosmetics/boutique info
- [ ] PWA installation instructions

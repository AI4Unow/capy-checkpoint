# Phase 04: Code Audit

## Context

- [Plan](./plan.md)
- [Research: Code Redundancy](./research/researcher-02-code-redundancy.md)

## Overview

| Field | Value |
|-------|-------|
| Priority | P3 |
| Status | pending |
| Effort | 1h |
| Description | Investigate cosmetics overlays, hooks usage, SW registration |

## Key Insights

1. 3 cosmetics files may share overlay logic - needs verification
2. useQuestionBank hook may be dead code (superseded by questionsService)
3. SW registration split across 3 files - potential redundancy
4. AudioManager vs SynthSounds relationship unclear

## Related Files

### Cosmetics (Potential Duplication)
| File | Path |
|------|------|
| hat-overlays.ts | `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/Preliminary math checkpoint/capy-checkpoint-next/src/game/cosmetics/hat-overlays.ts` |
| accessory-overlays.ts | `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/Preliminary math checkpoint/capy-checkpoint-next/src/game/cosmetics/accessory-overlays.ts` |
| trail-effects.ts | `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/Preliminary math checkpoint/capy-checkpoint-next/src/game/cosmetics/trail-effects.ts` |

### Hooks (Potential Dead Code)
| File | Path |
|------|------|
| useQuestionBank.ts | `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/Preliminary math checkpoint/capy-checkpoint-next/src/hooks/useQuestionBank.ts` |

### Service Worker (Potential Redundancy)
| File | Path |
|------|------|
| register-sw.ts | `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/Preliminary math checkpoint/capy-checkpoint-next/src/lib/register-sw.ts` |
| ServiceWorkerRegistration.tsx | `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/Preliminary math checkpoint/capy-checkpoint-next/src/components/ServiceWorkerRegistration.tsx` |
| sw.ts | `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/Preliminary math checkpoint/capy-checkpoint-next/src/app/sw.ts` |

### Audio (Unclear Relationship)
| File | Path |
|------|------|
| AudioManager.ts | `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/Preliminary math checkpoint/capy-checkpoint-next/src/game/audio/AudioManager.ts` |
| SynthSounds.ts | `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/Preliminary math checkpoint/capy-checkpoint-next/src/game/audio/SynthSounds.ts` |

## Implementation Steps

### Task 1: Audit Cosmetics Overlays (20m)

```bash
# Read all 3 cosmetics files
cat "/Users/nad/My Drive (duc.a.nguyen@gmail.com)/Preliminary math checkpoint/capy-checkpoint-next/src/game/cosmetics/hat-overlays.ts"
cat "/Users/nad/My Drive (duc.a.nguyen@gmail.com)/Preliminary math checkpoint/capy-checkpoint-next/src/game/cosmetics/accessory-overlays.ts"
cat "/Users/nad/My Drive (duc.a.nguyen@gmail.com)/Preliminary math checkpoint/capy-checkpoint-next/src/game/cosmetics/trail-effects.ts"
```

Check for:
- [ ] Identical rendering patterns
- [ ] Shared positioning logic
- [ ] Common animation code
- [ ] Opportunity for base class/helper

### Task 2: Verify useQuestionBank Usage (10m)

```bash
# Search for imports
grep -rn "useQuestionBank" \
  "/Users/nad/My Drive (duc.a.nguyen@gmail.com)/Preliminary math checkpoint/capy-checkpoint-next/src/"
```

Decision:
- If 0 usages → DELETE
- If used → document purpose vs questionsService

### Task 3: Audit SW Registration (15m)

```bash
# Read all 3 SW files
cat "/Users/nad/My Drive (duc.a.nguyen@gmail.com)/Preliminary math checkpoint/capy-checkpoint-next/src/lib/register-sw.ts"
cat "/Users/nad/My Drive (duc.a.nguyen@gmail.com)/Preliminary math checkpoint/capy-checkpoint-next/src/components/ServiceWorkerRegistration.tsx"
cat "/Users/nad/My Drive (duc.a.nguyen@gmail.com)/Preliminary math checkpoint/capy-checkpoint-next/src/app/sw.ts"
```

Map responsibilities:
| File | Expected Purpose |
|------|------------------|
| sw.ts | Service worker implementation (cache logic) |
| register-sw.ts | Registration utility function |
| ServiceWorkerRegistration.tsx | React component wrapper |

Check for:
- [ ] Duplicate registration logic
- [ ] Redundant cache strategies
- [ ] Consolidation opportunities

### Task 4: Clarify Audio Architecture (15m)

```bash
# Read audio files
cat "/Users/nad/My Drive (duc.a.nguyen@gmail.com)/Preliminary math checkpoint/capy-checkpoint-next/src/game/audio/AudioManager.ts"
cat "/Users/nad/My Drive (duc.a.nguyen@gmail.com)/Preliminary math checkpoint/capy-checkpoint-next/src/game/audio/SynthSounds.ts"
```

Determine:
- [ ] SynthSounds extends AudioManager?
- [ ] SynthSounds duplicates AudioManager?
- [ ] Clear separation of concerns?

## Todo List

### Cosmetics Audit
- [ ] Read hat-overlays.ts
- [ ] Read accessory-overlays.ts
- [ ] Read trail-effects.ts
- [ ] Document common patterns
- [ ] Recommend: extract helper or leave as-is

### Hook Audit
- [ ] Search useQuestionBank imports
- [ ] Verify if used or dead
- [ ] Delete if dead, document if used

### SW Audit
- [ ] Read register-sw.ts
- [ ] Read ServiceWorkerRegistration.tsx
- [ ] Read sw.ts
- [ ] Map responsibilities
- [ ] Recommend consolidation if redundant

### Audio Audit
- [ ] Read AudioManager.ts
- [ ] Read SynthSounds.ts
- [ ] Document relationship
- [ ] Recommend if consolidation needed

## Success Criteria

1. Cosmetics: Clear answer on duplication (extract or document)
2. Hooks: Dead code removed or documented
3. SW: Clear responsibility map, no redundant logic
4. Audio: Relationship documented

## Deliverables

Create audit report at:
`/Users/nad/My Drive (duc.a.nguyen@gmail.com)/Preliminary math checkpoint/plans/260110-1607-eliminate-duplication/reports/audit-findings.md`

Report structure:
```md
# Code Audit Findings

## Cosmetics Overlays
- Status: [DUPLICATE | DISTINCT]
- Recommendation: [EXTRACT | KEEP]

## useQuestionBank Hook
- Status: [DEAD | USED]
- Action: [DELETE | DOCUMENT]

## Service Worker Files
- Responsibilities: [table]
- Redundancy: [YES | NO]
- Recommendation: [CONSOLIDATE | KEEP]

## Audio System
- Relationship: [EXTENDS | SEPARATE | DUPLICATE]
- Recommendation: [MERGE | KEEP]
```

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Delete used hook | Low | Medium | Verify 0 imports first |
| Break SW registration | Low | High | Test PWA after changes |
| Misunderstand cosmetics | Medium | Low | Audit only, no changes |
| Break audio | Low | Medium | Read-only in this phase |

## Notes

This phase is primarily investigative. Actions (delete, extract, consolidate) should become separate tasks or a follow-up plan based on findings.

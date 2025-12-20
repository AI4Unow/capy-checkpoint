# Cambridge Primary Checkpoint Math Papers Research Plan

**Date:** 2025-12-19
**Status:** 🔵 Planning Complete
**Active Plan:** `plans/251219-0942-cambridge-math-papers-research`

## Objective

Acquire Cambridge Primary Checkpoint Stage 5 Mathematics past papers (2010-2024) to expand the Capy-Checkpoint questions bank from 200 to 500+ questions.

## Research Summary

### Key Findings
- **Paper Type:** Stage 5 = "Progression Tests" (internal), Stage 6 = "Checkpoint" (external)
- **Structure:** 2 papers/year, ~25-30 questions each, 40 marks total
- **Available Years:** 2014, 2017, 2018, 2020, 2022, 2023, 2024
- **Estimated Questions:** ~400-500 unique questions across all years

### Source Categories

| Category | Sources | Cost |
|----------|---------|------|
| Free Archives | CIEnotes, Gamatrain, IHMC | Free |
| Paid Collections | SmartExamResources | $36-216/year |
| Official | Cambridge School Support Hub | School login |

## Implementation Phases

| Phase | Description | Status | Priority |
|-------|-------------|--------|----------|
| [Phase 1](phase-01-download-free-papers.md) | Download free papers from archives | 🔴 Not Started | High |
| [Phase 2](phase-02-parse-additional-papers.md) | Parse PDFs into structured JSON | 🔴 Not Started | High |
| [Phase 3](phase-03-upload-to-firebase.md) | Upload to Firebase Firestore | 🔴 Not Started | Medium |

## Dependencies

- Existing: `scripts/upload-questions-to-firebase.ts`
- Existing: `scripts/parse-cambridge-pdfs.py`
- Required: PDF files from archives

## Success Criteria

- [ ] 400+ unique questions in Firebase
- [ ] Coverage across all 5 topics
- [ ] Difficulty range 600-1200
- [ ] Source attribution preserved

## Links

- [Research: Official Sources](research/researcher-01-official-sources.md)
- [Research: Third-Party Sources](research/researcher-02-third-party-sources.md)

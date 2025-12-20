# Phase 1: Download Free Papers from Archives

## Context Links
- [Parent Plan](plan.md)
- [Research: Third-Party Sources](research/researcher-02-third-party-sources.md)

## Overview
- **Priority:** High
- **Status:** 🔴 Not Started
- **Description:** Download Cambridge Primary Checkpoint Stage 5 Mathematics papers from free archives

## Key Insights
- CIEnotes and Gamatrain offer comprehensive free access
- Papers from 2014, 2018, 2020, 2022, 2024 confirmed available
- Each year has Paper 1 (non-calc) and Paper 2 (calculator)
- Mark schemes included for answer validation

## Requirements

### Functional
- Download PDFs from multiple archive sources
- Organize by year and paper number
- Include mark schemes for answer extraction

### Non-Functional
- Respect rate limits on archive sites
- Store in organized folder structure

## Source URLs

### CIEnotes (Primary)
```
https://www.cienotes.com/cambridge-primary-checkpoint/mathematics/
```

### Gamatrain (Secondary)
```
https://gamatrain.com/cambridge-primary-progression-test-stage-5/
```

### IHMC Archive (Backup)
```
https://cmapspublic2.ihmc.us/rid=1N9F26462-23V66S6-2ZHN/
```

## Related Code Files
- `materials/` - Existing PDF storage folder
- `scripts/parse-cambridge-pdfs.py` - PDF parser (will need extension)

## Implementation Steps

1. Create folder structure:
   ```
   materials/
   ├── 2014/
   │   ├── Maths_stage_5_2014_01.pdf
   │   ├── Maths_stage_5_2014_02.pdf
   │   └── mark_scheme_2014.pdf
   ├── 2018/
   ├── 2020/
   ├── 2022/
   └── 2024/
   ```

2. Download from CIEnotes:
   - Navigate to Stage 5 Mathematics section
   - Download Paper 1, Paper 2, and Mark Scheme for each year

3. Verify downloads:
   - Check PDF opens correctly
   - Confirm question count (~25-30 per paper)
   - Note any image-heavy questions

4. Document availability:
   - Create `materials/inventory.md` tracking what's available

## Todo List
- [ ] Create year folders in materials/
- [ ] Download 2018 papers (Paper 1, Paper 2, MS)
- [ ] Download 2020 papers
- [ ] Download 2022 papers
- [ ] Download 2024 papers
- [ ] Verify all PDFs readable
- [ ] Create inventory.md

## Success Criteria
- [ ] 8+ papers downloaded (4 years × 2 papers)
- [ ] Mark schemes available for answer extraction
- [ ] All PDFs text-readable (not just scans)

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|------------|
| Site blocks downloads | Medium | Use multiple archive sources |
| PDFs are image-only | Medium | Use OCR or manual extraction |
| Papers incomplete | Low | Cross-reference with mark schemes |

## Security Considerations
- Personal use only (educational)
- Don't redistribute copyrighted material
- Attribute source in question metadata

## Next Steps
→ After download complete, proceed to [Phase 2: Parse Additional Papers](phase-02-parse-additional-papers.md)

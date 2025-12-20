# Phase 2: Parse Additional Papers into Structured JSON

## Context Links
- [Parent Plan](plan.md)
- [Phase 1: Download Papers](phase-01-download-free-papers.md)

## Overview
- **Priority:** High
- **Status:** 🔴 Not Started
- **Description:** Extend PDF parser to extract questions from newly downloaded papers

## Key Insights
- Existing parser handles 2014 papers (70 questions extracted)
- New papers follow similar format
- Mark schemes provide correct answers and explanations
- Image-based questions need `hasImage: true` flag

## Requirements

### Functional
- Parse each PDF to extract questions
- Map to topic/subtopic using keyword classification
- Assign difficulty based on marks and complexity
- Generate unique IDs per source

### Non-Functional
- Maintain consistency with existing question format
- Preserve source attribution

## Architecture

```
Input: materials/{year}/*.pdf
         ↓
Parser: scripts/parse-cambridge-pdfs.py
         ↓
Output: src/data/cambridge-{year}-questions.json
         ↓
Merge:  src/data/all-questions.json
```

## Related Code Files
- `scripts/parse-cambridge-pdfs.py` - Main parser (modify)
- `src/data/cambridge-2014-questions.json` - Existing output
- `src/types/question.ts` - Question interface

## Implementation Steps

1. **Extend Parser Configuration**
   ```python
   # Add paper configurations
   PAPERS = {
       2018: ["Maths_stage_5_2018_01.pdf", "Maths_stage_5_2018_02.pdf"],
       2020: ["Maths_stage_5_2020_01.pdf", "Maths_stage_5_2020_02.pdf"],
       # ...
   }
   ```

2. **Create Question Extraction Function**
   ```python
   def extract_from_pdf(path: str, year: int, paper: int) -> list[dict]:
       # Use PyMuPDF to extract text
       # Parse question patterns: "1 ", "2 ", "(a)", "(b)"
       # Extract options from multiple choice format
       # Return structured questions
   ```

3. **Parse Each Year**
   - Run parser on 2018 papers
   - Run parser on 2020 papers
   - Run parser on 2022 papers
   - Run parser on 2024 papers

4. **Manual Verification**
   - Spot-check 10% of questions
   - Verify correct answers match mark scheme
   - Flag image-dependent questions

5. **Merge All Questions**
   ```bash
   npx tsx scripts/upload-questions-to-firebase.ts
   ```

## Question ID Format
```
cam{YY}-p{paper}-{question}{sub}
Example: cam18-p1-05a, cam20-p2-12
```

## Todo List
- [ ] Update parser to accept year parameter
- [ ] Parse 2018 Paper 1 & 2 (~60 questions)
- [ ] Parse 2020 Paper 1 & 2 (~60 questions)
- [ ] Parse 2022 Paper 1 & 2 (~60 questions)
- [ ] Parse 2024 Paper 1 & 2 (~60 questions)
- [ ] Verify 10% random sample
- [ ] Generate cambridge-all-years-questions.json

## Expected Output
| Year | Paper 1 | Paper 2 | Total |
|------|---------|---------|-------|
| 2014 | 35 | 35 | 70 ✅ |
| 2018 | ~30 | ~30 | ~60 |
| 2020 | ~30 | ~30 | ~60 |
| 2022 | ~30 | ~30 | ~60 |
| 2024 | ~30 | ~30 | ~60 |
| **Total** | | | **~310** |

## Success Criteria
- [ ] 300+ new questions parsed
- [ ] All 5 topics represented
- [ ] Difficulty ratings assigned (600-1200)
- [ ] Source/year preserved in metadata

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|------------|
| Different PDF formats | Medium | Manual fallback for difficult pages |
| OCR errors | Medium | Cross-check with mark schemes |
| Complex diagrams | Low | Flag as hasImage, add text description |

## Next Steps
→ After parsing complete, proceed to [Phase 3: Upload to Firebase](phase-03-upload-to-firebase.md)

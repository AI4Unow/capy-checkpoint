# Phase 4: AI Hints Offline

## Context Links

- [Main Plan](./plan.md)
- [Phase 1: Service Worker](./phase-01-service-worker-setup.md)
- [Brainstorm](../reports/brainstorm-251223-1103-offline-pwa-firebase-sync.md)

## Overview

Pre-generate AI hints for all 447 questions and serve from cached JSON. Fallback to network API for uncached questions. Estimated Gemini cost: ~$0.50 one-time.

## Key Insights

- 447 questions x ~100 tokens/hint = ~45K tokens total
- Gemini 1.5 Flash: $0.075/1M input + $0.30/1M output ≈ $0.50
- Pre-generation = 100% offline reliability
- Cache-first strategy for hints.json

## Requirements

1. Create hint generation script
2. Generate hints for all 447 questions
3. Store in `public/data/hints.json`
4. Update AIHint component to check local first
5. Cache hints.json with service worker
6. Fallback to /api/hint for new questions

## Architecture

```
scripts/generate-hints.ts
├── Load all-questions.json
├── For each question:
│   └── Call Gemini API → generate hint
└── Output public/data/hints.json

public/data/hints.json
└── { [questionId]: "hint text", ... }

src/components/AIHint.tsx (modified)
├── Check hints.json cache first
├── If found → return cached hint
└── If not found → call /api/hint (network)

sw.ts
└── Cache hints.json (CacheFirst, 30d)
```

## Related Code Files

| File | Action | Purpose |
|------|--------|---------|
| `scripts/generate-hints.ts` | Create | One-time hint generation |
| `public/data/hints.json` | Create | Pre-generated hints |
| `src/components/AIHint.tsx` | Modify | Check local first |
| `src/app/sw.ts` | Verify | Already caches hints.json |

## Implementation Steps

### 1. Create Hint Generation Script

```typescript
// scripts/generate-hints.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import questions from '../src/data/all-questions.json';
import fs from 'fs';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function generateHints() {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const hints: Record<string, string> = {};

  console.log(`Generating hints for ${questions.length} questions...`);

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const prompt = `
      You are a friendly math tutor for a 10-year-old student.
      Give a short, encouraging hint (1-2 sentences) for this math problem.
      Do NOT give the answer, just guide their thinking.

      Question: ${q.question}
      Options: ${q.options?.join(', ') || 'N/A'}
    `;

    try {
      const result = await model.generateContent(prompt);
      hints[q.id] = result.response.text().trim();

      if ((i + 1) % 50 === 0) {
        console.log(`Progress: ${i + 1}/${questions.length}`);
      }

      // Rate limiting: 60 RPM for free tier
      await new Promise(r => setTimeout(r, 1100));
    } catch (error) {
      console.error(`Failed for question ${q.id}:`, error);
      hints[q.id] = 'Think about what the question is asking!';
    }
  }

  fs.writeFileSync(
    'public/data/hints.json',
    JSON.stringify(hints, null, 2)
  );

  console.log(`Generated ${Object.keys(hints).length} hints`);
}

generateHints();
```

### 2. Add Script to package.json

```json
{
  "scripts": {
    "generate-hints": "tsx scripts/generate-hints.ts"
  }
}
```

### 3. Create Hints Service

```typescript
// src/lib/hintsService.ts
let hintsCache: Record<string, string> | null = null;

export async function getHint(questionId: string): Promise<string | null> {
  // Try cached hints first
  if (!hintsCache) {
    try {
      const res = await fetch('/data/hints.json');
      if (res.ok) {
        hintsCache = await res.json();
      }
    } catch {
      // Offline and not cached yet
    }
  }

  if (hintsCache && hintsCache[questionId]) {
    return hintsCache[questionId];
  }

  // Fallback to API (online only)
  if (navigator.onLine) {
    try {
      const res = await fetch('/api/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.hint;
      }
    } catch {
      // Network error
    }
  }

  return null;
}
```

### 4. Update AIHint Component

```typescript
// src/components/AIHint.tsx (simplified modification)
import { getHint } from '@/lib/hintsService';

export function AIHint({ questionId }: { questionId: string }) {
  const [hint, setHint] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchHint = async () => {
    setLoading(true);
    const result = await getHint(questionId);
    setHint(result || 'Think about what the question is asking!');
    setLoading(false);
  };

  // ... render logic
}
```

### 5. Verify SW Caching

Already configured in Phase 1:
```typescript
{
  urlPattern: /\/data\/hints\.json$/,
  handler: new CacheFirst({
    cacheName: 'hints-v1',
    plugins: [new ExpirationPlugin({ maxAgeSeconds: 30 * 24 * 60 * 60 })],
  }),
}
```

## Hints JSON Format

```json
{
  "q-001": "Think about breaking down the problem into smaller steps.",
  "q-002": "What operation should you use when combining groups?",
  ...
}
```

Estimated size: 447 questions x ~150 chars = ~67KB (gzipped ~15KB)

## Todo List

- [ ] Install tsx for script execution (if not present)
- [ ] Create scripts/generate-hints.ts
- [ ] Add generate-hints script to package.json
- [ ] Run script with GEMINI_API_KEY env var
- [ ] Verify public/data/hints.json created
- [ ] Create src/lib/hintsService.ts
- [ ] Update AIHint.tsx to use hintsService
- [ ] Test: Offline hint display works
- [ ] Test: New question falls back to API

## Success Criteria

1. hints.json contains all 447 question IDs
2. Hints load instantly from cache (no network)
3. Fallback API works for uncached questions
4. Script completes in ~8 minutes (447 * 1.1s)

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Gemini rate limit | Medium | Low | 1.1s delay between calls |
| Script fails mid-run | Low | Low | Resume from last saved |
| Hints stale over time | Very Low | Low | Re-run script periodically |
| API key exposure | Medium | High | Use env var, .gitignore |

## Security Considerations

- GEMINI_API_KEY in env only, never committed
- hints.json is public (no sensitive data)
- Rate limiting in script prevents abuse

## Next Steps

After Phase 4 complete:
1. Proceed to [Phase 5: UX Polish](./phase-05-ux-polish.md)
2. Consider adding hints to questions JSON directly for simpler caching

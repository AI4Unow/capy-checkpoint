# Code Standards

## 📁 File Organization

### Naming Conventions
| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `StatsModal.tsx` |
| Stores | camelCase + Store | `learningStore.ts` |
| Utilities | camelCase | `questionsService.ts` |
| Types | camelCase | `question.ts` |
| Engine modules | camelCase | `elo.ts`, `sm2.ts` |

### Directory Structure
```
src/
├── app/          # Next.js routes (pages, API)
├── components/   # React UI components
├── data/         # Static data (JSON, TS constants)
├── engine/       # Adaptive learning algorithms
├── game/         # Phaser integration
├── hooks/        # Custom React hooks
├── lib/          # Shared utilities
├── stores/       # Zustand state stores
└── types/        # TypeScript definitions
```

---

## 🎨 UI/Styling

### Design System
- **Aesthetic:** Kawaii / Cottagecore
- **Colors:** Pink (#FFD6E0), Sage (#DDE5B6), Cream (#FEFAE0), Sky (#A2D2FF)
- **Text:** Soft brown (#5E503F)
- **Fonts:** Fredoka (headings), Nunito (body), Baloo 2 (game UI)

### Tailwind Patterns
```tsx
// Button pattern
className="px-6 py-3 rounded-full border-4 border-text font-[family-name:var(--font-baloo)] text-lg shadow-lg transition-transform hover:scale-105"

// Card pattern
className="bg-cream rounded-3xl border-4 border-text p-4"

// Modal backdrop
className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
```

---

## 🧠 State Management

### Store Pattern (Zustand)
```typescript
export const useExampleStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      // State
      value: 0,

      // Actions
      increment: () => set((s) => ({ value: s.value + 1 })),

      // Getters (use get() for computed values)
      getDoubled: () => get().value * 2,
    }),
    {
      name: "example-storage",
      partialize: (state) => ({ value: state.value }), // Only persist needed fields
    }
  )
);
```

### Store Categories
| Category | Persisted | Example |
|----------|-----------|---------|
| Session state | ❌ | gameStore (score, hearts) |
| User progress | ✅ | learningStore, badgeStore |
| Settings | ✅ | settingsStore |

---

## 🎮 Phaser-React Bridge

### EventBus Pattern
```typescript
// Emit from Phaser
EventBus.emit(GameEvents.SCORE_UPDATE, { score: 100 });

// Listen in React
useEffect(() => {
  const handler = (data: { score: number }) => setScore(data.score);
  EventBus.on(GameEvents.SCORE_UPDATE, handler);
  return () => EventBus.off(GameEvents.SCORE_UPDATE, handler);
}, []);
```

### Event Naming
- Use `GameEvents` enum for type safety
- Event names: SCREAMING_SNAKE_CASE
- Payload: typed object

---

## 🧪 Testing

### Test File Location
- Co-located: `module.test.ts` next to `module.ts`
- Framework: Vitest

### Test Pattern
```typescript
import { describe, it, expect, beforeEach } from 'vitest';

describe('ModuleName', () => {
  beforeEach(() => {
    // Reset state
  });

  it('should do specific thing', () => {
    expect(result).toBe(expected);
  });
});
```

---

## 📝 Component Patterns

### Modal Component
```tsx
interface ModalProps {
  onClose: () => void;
}

export function Modal({ onClose }: ModalProps) {
  // Escape key handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div role="dialog" aria-modal="true">
      {/* Content */}
    </div>
  );
}
```

### Accessibility Requirements
- Modals: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- Buttons: descriptive text or `aria-label`
- Escape key to close modals
- Respect `prefers-reduced-motion`

---

## 🔧 Engine Modules

### Algorithm Implementation
```typescript
// Pure functions preferred
export function calculate(input: Input): Output {
  // Implementation
}

// Constants at module top
const DEFAULT_VALUE = 100;
const THRESHOLD = 0.8;
```

### Module Exports
- Export types alongside functions
- Use named exports (no default)
- Document with JSDoc for complex algorithms

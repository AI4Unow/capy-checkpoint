# Phase 4: Supabase Integration

## Context Links

- **Parent Plan:** [plan.md](./plan.md)
- **Depends On:** [Phase 3 - Adaptive Learning](./phase-03-adaptive-learning-engine.md)
- **Research:** [Adaptive Learning Research](./research/researcher-02-adaptive-learning.md)

---

## Overview

| Field | Value |
|-------|-------|
| Date | 2025-12-18 |
| Priority | P1 - High |
| Status | pending |
| Description | Supabase database, auth, data sync, question bank migration |

---

## Key Insights

- Supabase free tier: 500MB database, 50K monthly auth users, 2GB bandwidth
- Use Row Level Security (RLS) for data isolation
- Single user initially → simple auth (email magic link or password)
- Sync strategy: write-through for answers, periodic for mastery
- Questions in database enables future admin interface

---

## Requirements

### Functional
- F1: Supabase project setup with database schema
- F2: Simple authentication (magic link preferred)
- F3: Sync student profile and ratings
- F4: Sync answer history for analytics
- F5: Move question bank to database
- F6: Offline-first with sync on reconnect

### Non-Functional
- NF1: Auth flow < 3 clicks
- NF2: Data sync latency < 2s (background)
- NF3: Works offline after initial load
- NF4: < 50KB Supabase client bundle

---

## Architecture

### Database Schema

```sql
-- Students (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  display_name TEXT,
  avatar JSONB DEFAULT '{"skin": "default", "hat": "yuzu"}',
  elo_rating INTEGER DEFAULT 1000,
  responses_count INTEGER DEFAULT 0,
  yuzu_coins INTEGER DEFAULT 0,
  current_world INTEGER DEFAULT 1,
  streak_days INTEGER DEFAULT 0,
  last_played_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Questions
CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  topic TEXT NOT NULL,
  subtopic TEXT NOT NULL,
  difficulty INTEGER DEFAULT 1000,
  text TEXT NOT NULL,
  options JSONB NOT NULL, -- ["opt1", "opt2", "opt3"]
  correct_index INTEGER NOT NULL,
  hint TEXT,
  explanation TEXT,
  image_url TEXT,
  times_answered INTEGER DEFAULT 0,
  correct_rate DECIMAL(3,2) DEFAULT 0.5,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Response history
CREATE TABLE student_responses (
  id SERIAL PRIMARY KEY,
  student_id UUID REFERENCES profiles(id),
  question_id INTEGER REFERENCES questions(id),
  is_correct BOOLEAN NOT NULL,
  response_time_ms INTEGER,
  student_rating_before INTEGER,
  student_rating_after INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Mastery tracking
CREATE TABLE student_mastery (
  id SERIAL PRIMARY KEY,
  student_id UUID REFERENCES profiles(id),
  subtopic TEXT NOT NULL,
  topic TEXT NOT NULL,
  mastery_score DECIMAL(3,2) DEFAULT 0,
  status TEXT DEFAULT 'not_started',
  attempts INTEGER DEFAULT 0,
  sm2_data JSONB DEFAULT '{"interval": 1, "easeFactor": 2.5, "reps": 0}',
  next_review TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, subtopic)
);

-- Owned cosmetic items
CREATE TABLE student_inventory (
  student_id UUID REFERENCES profiles(id),
  item_id TEXT NOT NULL,
  purchased_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (student_id, item_id)
);
```

### Row Level Security

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_inventory ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only access their own data
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Questions readable by all authenticated users
CREATE POLICY "Questions readable by authenticated" ON questions
  FOR SELECT TO authenticated USING (true);
```

### Sync Strategy

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  LocalStore │────▶│  SyncQueue  │────▶│  Supabase   │
│  (Zustand)  │◀────│  (offline)  │◀────│  (source)   │
└─────────────┘     └─────────────┘     └─────────────┘

Write Path:
1. User answers question
2. Update local store immediately (optimistic)
3. Queue sync operation
4. Batch sync to Supabase every 30s or on idle

Read Path:
1. Initial load: fetch from Supabase
2. Cache in localStorage
3. Subsequent loads: local-first, background refresh
```

### Component Structure
```
src/
├── lib/
│   └── supabase.ts         # Supabase client init
├── services/
│   ├── auth.ts             # Auth helpers
│   ├── profileService.ts   # Profile CRUD
│   ├── questionService.ts  # Question fetching
│   ├── responseService.ts  # Answer recording
│   └── syncService.ts      # Offline sync queue
├── hooks/
│   ├── useAuth.ts          # Auth state hook
│   └── useSync.ts          # Sync status hook
└── components/
    └── AuthGate.tsx        # Login/signup wrapper
```

---

## Related Code Files

| File | Purpose |
|------|---------|
| `src/lib/supabase.ts` | Supabase client initialization |
| `src/services/auth.ts` | Login, logout, session management |
| `src/services/profileService.ts` | Profile read/update |
| `src/services/questionService.ts` | Fetch questions |
| `src/services/responseService.ts` | Record answers |
| `src/services/syncService.ts` | Offline queue + sync |
| `src/hooks/useAuth.ts` | Auth state React hook |
| `src/components/AuthGate.tsx` | Auth wrapper component |
| `supabase/migrations/001_initial_schema.sql` | DB migration |

---

## Implementation Steps

1. **Create Supabase project**
   - Go to supabase.com → New Project
   - Note: Project URL, anon key, service role key
   - Region: closest to user (Singapore for SE Asia)

2. **Run database migrations**
   ```bash
   # Using Supabase CLI
   supabase init
   supabase db push
   ```

3. **Configure environment variables**
   ```env
   VITE_SUPABASE_URL=https://xxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```

4. **Initialize Supabase client**
   ```typescript
   // src/lib/supabase.ts
   import { createClient } from '@supabase/supabase-js';

   export const supabase = createClient(
     import.meta.env.VITE_SUPABASE_URL,
     import.meta.env.VITE_SUPABASE_ANON_KEY
   );
   ```

5. **Implement auth service**
   ```typescript
   // src/services/auth.ts
   export async function signInWithEmail(email: string) {
     return supabase.auth.signInWithOtp({ email });
   }

   export async function signOut() {
     return supabase.auth.signOut();
   }

   export function onAuthChange(callback: (user: User | null) => void) {
     return supabase.auth.onAuthStateChange((_, session) => {
       callback(session?.user ?? null);
     });
   }
   ```

6. **Create useAuth hook**
   ```typescript
   export function useAuth() {
     const [user, setUser] = useState<User | null>(null);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
       const { data: { subscription } } = onAuthChange(setUser);
       setLoading(false);
       return () => subscription.unsubscribe();
     }, []);

     return { user, loading, signIn: signInWithEmail, signOut };
   }
   ```

7. **Create AuthGate component**
   ```tsx
   export function AuthGate({ children }: { children: ReactNode }) {
     const { user, loading } = useAuth();

     if (loading) return <LoadingSpinner />;
     if (!user) return <LoginScreen />;
     return <>{children}</>;
   }
   ```

8. **Migrate question bank**
   - Export questions.json to SQL INSERT statements
   - Run migration or use Supabase dashboard import
   - Update questionService to fetch from Supabase

9. **Implement profileService**
   ```typescript
   export async function getProfile(userId: string) {
     const { data, error } = await supabase
       .from('profiles')
       .select('*')
       .eq('id', userId)
       .single();
     return { data, error };
   }

   export async function updateProfile(userId: string, updates: Partial<Profile>) {
     return supabase.from('profiles').update(updates).eq('id', userId);
   }
   ```

10. **Implement syncService**
    ```typescript
    interface SyncOperation {
      type: 'response' | 'mastery' | 'profile';
      data: any;
      timestamp: number;
    }

    class SyncQueue {
      private queue: SyncOperation[] = [];

      add(op: SyncOperation) {
        this.queue.push(op);
        this.persist();
      }

      async flush() {
        while (this.queue.length > 0) {
          const op = this.queue[0];
          const success = await this.execute(op);
          if (success) this.queue.shift();
          else break; // Retry later
        }
        this.persist();
      }
    }
    ```

11. **Update learningStore for sync**
    - On `recordAnswer()`: queue sync operation
    - On app focus: flush sync queue
    - On periodic interval (30s): flush queue

12. **Add offline indicator**
    - Show "Offline" badge when disconnected
    - Show sync status (pending operations count)

13. **Seed initial questions**
    - Insert 50 questions from JSON into database
    - Set appropriate difficulty ratings

14. **Test auth flow**
    - Magic link email delivery
    - Session persistence
    - Sign out and back in

15. **Test sync**
    - Answer questions offline
    - Reconnect and verify sync
    - Check data in Supabase dashboard

---

## Todo List

- [ ] Create Supabase project
- [ ] Write database migration SQL
- [ ] Configure RLS policies
- [ ] Add environment variables
- [ ] Initialize Supabase client
- [ ] Implement auth service
- [ ] Create useAuth hook
- [ ] Create AuthGate component
- [ ] Implement profileService
- [ ] Implement questionService
- [ ] Implement responseService
- [ ] Implement syncService with offline queue
- [ ] Migrate 50 questions to database
- [ ] Update learningStore for sync
- [ ] Add offline indicator UI
- [ ] Test auth flow end-to-end
- [ ] Test offline sync behavior

---

## Success Criteria

- [ ] User can sign in with email magic link
- [ ] Profile loads from Supabase on login
- [ ] Questions load from database
- [ ] Answers sync to student_responses table
- [ ] Ratings persist across devices
- [ ] Works offline after initial load
- [ ] Syncs pending operations on reconnect

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Magic link emails spam-filtered | Medium | High | Add password fallback option |
| Supabase free tier limits | Low | Medium | Monitor usage, optimize queries |
| Sync conflicts on reconnect | Low | Medium | Last-write-wins, server timestamp |
| Slow initial question load | Medium | Low | Paginate, cache aggressively |

---

## Security Considerations

- RLS ensures user data isolation
- No sensitive data beyond email
- Anon key is public-safe (RLS enforced)
- Service role key: server-only, never expose

---

## Next Steps

After Phase 4 complete:
1. Proceed to **Phase 5: Rewards & Polish**
2. Add Yuzu Coins economy
3. Implement boutique shop

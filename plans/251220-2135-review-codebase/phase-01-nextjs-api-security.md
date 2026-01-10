# Phase 01: Next.js API Security

## Context Links
- Research: `plans/reports/researcher-251220-nextjs-api-security.md`
- Code: `capy-checkpoint-next/src/app/api/admin/upload-questions/route.ts`
- Code: `capy-checkpoint-next/src/app/api/hint/route.ts`

## Overview
- Date: 251220
- Priority: High
- Status: pending

## Key Insights
- Admin upload uses static `ADMIN_API_KEY` header check; no rate limiting or claims.
- Firebase Admin init falls back to `NEXT_PUBLIC_FIREBASE_PROJECT_ID` (weak default).
- APIs return `details: String(error)` which can leak internal errors.
- `/api/hint` is unauthenticated and can be abused to burn Gemini quota.

## Requirements
- Restrict admin endpoints to authenticated admins.
- Remove unsafe Firebase Admin fallback; fail closed on missing creds.
- Add basic abuse controls: rate limit + payload bounds.
- Sanitize error responses; keep server logs useful.

## Architecture
- Add `middleware.ts` matcher for `/api/admin/:path*`:
  - Verify auth (Firebase ID token or signed JWT).
  - Check `admin` claim.
  - Rate limit (IP/user).
- In route handler:
  - Re-check authZ (defense in depth).
  - Validate inputs (zod) and cap operations.

## Related Code Files
- `capy-checkpoint-next/src/app/api/admin/upload-questions/route.ts`
- `capy-checkpoint-next/src/app/api/hint/route.ts`
- `capy-checkpoint-next/src/lib/firebase.ts`

## Implementation Steps
1) Introduce centralized auth helper for API routes.
2) Add middleware gate for `/api/admin/*`.
3) Add rate limiting (edge or server) + request body size checks.
4) Remove Firebase Admin fallback to NEXT_PUBLIC vars; require server-only env.
5) Sanitize error responses; add correlation IDs.

## Todo
- Decide auth mechanism: Firebase ID token w/ admin claim vs static key.
- Decide rate limiting store: Upstash vs in-memory (local dev).
- Confirm bulk upload size caps.

## Success Criteria
- `/api/admin/upload-questions` rejects unauth callers.
- Service account never read from repo file; only env/secret store.
- `/api/hint` protected against obvious abuse.

## Risk Assessment
- Breaking admin workflows if auth mechanism changes.
- Rate limiting needs shared store in prod.

## Security Considerations
- Never rely on `NEXT_PUBLIC_*` for server credentials.
- Avoid returning raw errors to clients.

## Next Steps
- Implement middleware + auth helper.

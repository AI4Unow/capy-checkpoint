# Research Report: Next.js API Route Security (Admin, Firebase Admin, Env, Bulk Upload)

Timestamp: 2025-12-20T19:43 local

## Executive Summary
Harden Next.js admin APIs with centralized middleware, role-aware token verification, strict input validation, rate limiting, and audit trails. For Firebase Admin, scope credentials to server-only, lock service accounts, and enforce per-request verification with short-lived tokens. Bulk uploads need auth+authorization gates, size/row caps, streaming/parsing limits, and integrity checks before writes.

## Research Methodology
- Sources: 5 (official docs, vendor blogs, OWASP)
- Date range: 2023-2025
- Key terms: "Next.js API route security 2025", "Next.js middleware RBAC", "Firebase Admin security best practices", "bulk upload API security", "env secrets Next.js"

## Key Findings

### Next.js API/Admin Endpoints
- Centralize auth in `middleware.ts` with `matcher: /api/admin/:path*`; block by default, allow explicitly. Prefer role claims over static keys for auditability.
- Use server-side token verification; never trust `NEXT_PUBLIC_*` for secrets. Edge middleware ok for JWT/header checks; heavy work stays in route handler.
- Enforce `Origin`/`Host` allowlist for browser-originated admin calls; add CSRF token or SameSite=strict cookies if cookies are used.
- Rate limit at edge (`@upstash/ratelimit` or similar) per IP/user for admin routes and auth endpoints.
- Response hygiene: uniform error shape, no stack traces; log errors with correlation IDs.

### Firebase Admin Usage
- Run Admin SDK only server-side; never bundle to client. Load creds via env/secret manager, not checked into repo. Prefer Application Default Credentials or Vercel/Cloud secret store.
- Principle of least privilege service account: restrict roles to needed Firestore/Storage; rotate keys; monitor audit logs.
- Verify Firebase ID token each request; check custom claims (`admin: true`) and token revocation where applicable.
- Avoid long-lived session cookies; favor short-lived ID tokens + refresh or server-validated sessions.

### Env Management
- Keep secrets out of repo; use environment-specific secret stores (Vercel env vars, GCP Secret Manager). No `NEXT_PUBLIC_` for anything sensitive.
- Separate staging/prod credentials; deny wildcard CORS; set `Secure`, `HttpOnly`, `SameSite` on cookies.
- Track secret rotation playbook; fail closed when missing envs.

### Bulk Upload Endpoints
- AuthZ: allow only admins with explicit claim/role; re-check in handler even if middleware exists (defense-in-depth).
- Input controls: limit file size (e.g., Vercel edge limit-aware), row count, and content-type. Parse via streaming to avoid memory blowup.
- Validation: schema-validate every record (Zod/Valibot); reject on first fatal error or collect per-row errors; checksum/hash optional for integrity.
- Rate limiting + idempotency keys to prevent duplicates; enqueue long-running writes (queue/cron) instead of synchronous massive writes.
- Audit log every upload (who, when, counts, source) and store artifacts in restricted bucket if needed.

### Practical Checklist
- `middleware.ts`: verify JWT (Firebase ID token) -> check `admin` claim -> optional IP allowlist -> rate limit.
- In handler: re-verify auth, parse with streaming, validate rows, batch writes with quotas, log audit record.
- Secrets: no `NEXT_PUBLIC_*`; store `FIREBASE_ADMIN_*` in secret manager; rotate and monitor service account keys.
- Observability: structured logs for auth decisions and upload outcomes; alerts on repeated 401/429/5xx.

## Sources (<=5)
1) Next.js Security (official): https://nextjs.org/docs/app/building-your-application/securing/overall
2) Next.js Middleware: https://nextjs.org/docs/app/building-your-application/routing/middleware
3) Firebase Admin Setup & Security: https://firebase.google.com/docs/admin/setup and https://firebase.google.com/docs/auth/admin/manage-sessions
4) Vercel + Upstash Rate Limiting guide: https://vercel.com/guides/nextjs-rate-limiting-middleware
5) OWASP API Security Top 10 (2023): https://owasp.org/API-Security/

## Unresolved Questions
- Required storage limits/row caps for bulk uploads?
- Preferred logging stack (Datadog/Axiom/Sentry) and retention policy?
- Should admin access be IP-restricted in addition to JWT/claims?

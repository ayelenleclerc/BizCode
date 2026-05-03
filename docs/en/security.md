# Security

## Threat Model (STRIDE — lightweight)

| Threat | Category | Mitigation |
|---|---|---|
| SQL injection via API parameters | Tampering | Prisma ORM uses parameterized queries; raw SQL is not used |
| XSS in rendered user data | Tampering | React's JSX escapes all interpolated values by default |
| Unauthorized API access | Elevation of Privilege | API runs on loopback (127.0.0.1); not exposed to network in production |
| Sensitive data exposure in logs | Information Disclosure | No PII is logged at INFO level; `console.error` used only for unexpected errors |
| Dependency vulnerabilities | various | `npm audit` runs in CI (non-blocking warning); update policy: monthly |
| Malicious file paths in Tauri | Tampering | Tauri allowlist restricts filesystem access to app directories only |

## OWASP Top 10 Mapping

| Risk | Status |
|---|---|
| A01 Broken Access Control | Partial — cookie session and permission checks on protected routes ([`server/createApp.ts`](../../server/createApp.ts), [`server/auth.ts`](../../server/auth.ts)) |
| A02 Cryptographic Failures | N/A — no secrets stored in the app database |
| A03 Injection | Mitigated — Prisma parameterized queries |
| A04 Insecure Design | Mitigated — threat model reviewed; loopback-only API |
| A05 Security Misconfiguration | Partial — CORS allowlist + `credentials: true` ([`server/createApp.ts`](../../server/createApp.ts), `CORS_ORIGINS` in [`.env.example`](../../.env.example)); other headers not fully hardened |
| A06 Vulnerable Components | Monitored — `npm audit` in CI |
| A07 Auth Failures | Partial — login and session endpoints; password hashing in [`server/auth.ts`](../../server/auth.ts) |
| A09 Logging Failures | Partial — structured logging not yet implemented |

## Secrets Management

- `DATABASE_URL` is stored in `.env` (gitignored).
- `.env.example` lists variable names and non-sensitive placeholders (for example `REPLACE_DB_USER` / `REPLACE_DB_CREDENTIAL` in `DATABASE_URL`); committed file must not contain real credentials.
- Super-admin bootstrap (`npm run bootstrap:superadmin`): password from `BIZCODE_BOOTSTRAP_SUPERADMIN_PASSWORD` set in your local `.env` only (see commented keys in `.env.example`; never commit real values).
- No secrets are hardcoded in source code.
- Tauri does not bundle `.env`; the sidecar reads environment variables at runtime.

## Prisma seed (development bootstrap)

- `npx prisma db seed` creates or updates tenant `platform` and user `ayelen` (SuperAdmin). **`BIZCODE_SEED_SUPERADMIN_PASSWORD` must be set** in `.env` before running the seed (minimum 8 characters). [`.env.example`](../../.env.example) lists the variable without a committed default.
- **Do not** reuse the same development password in staging, production, or shared databases. Use a strong secret per environment; re-running the seed overwrites the stored password hash for that user.

## CORS

The Express app enables **`cors`** with **`credentials: true`** so the browser can send the session cookie on cross-origin requests from the SPA dev server (for example Vite on port **5173**) to the API on port **3001**.

- **Allowlist:** `http://localhost:5173` and `http://127.0.0.1:5173` by default, plus any extra origins from the comma-separated **`CORS_ORIGINS`** environment variable (see [`.env.example`](../../.env.example)).
- **Code:** [`server/createApp.ts`](../../server/createApp.ts) (`getCorsOriginAllowlist`, `createApp`).
- **Tests:** [`tests/server/cors.test.ts`](../../tests/server/cors.test.ts).
- Requests **without** an `Origin` header (for example supertest in CI) are allowed; disallowed origins do not receive `Access-Control-Allow-Origin`.
- **Packaged desktop builds:** if the WebView uses an origin other than the dev defaults, add it to `CORS_ORIGINS`.

## Dependency Policy

- `npm audit --audit-level=high` is run in CI.
- Critical/High vulnerabilities must be resolved before merging to `main`.
- Moderate vulnerabilities are tracked in the issue tracker with a 30-day SLA.

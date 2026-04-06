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
| A01 Broken Access Control | N/A — single-user desktop app, no auth layer |
| A02 Cryptographic Failures | N/A — no secrets stored in the app database |
| A03 Injection | Mitigated — Prisma parameterized queries |
| A04 Insecure Design | Mitigated — threat model reviewed; loopback-only API |
| A05 Security Misconfiguration | Partial — CORS not configured (loopback only); headers not hardened |
| A06 Vulnerable Components | Monitored — `npm audit` in CI |
| A07 Auth Failures | N/A — no authentication in current scope |
| A09 Logging Failures | Partial — structured logging not yet implemented |

## Secrets Management

- `DATABASE_URL` is stored in `.env` (gitignored).
- `.env.example` contains only placeholder values and is committed.
- No secrets are hardcoded in source code.
- Tauri does not bundle `.env`; the sidecar reads environment variables at runtime.

## Prisma seed (development bootstrap)

- `npx prisma db seed` creates or updates tenant `platform` and user `ayelen` (SuperAdmin). **`BIZCODE_SEED_SUPERADMIN_PASSWORD` must be set** in `.env` before running the seed (minimum 8 characters). [`.env.example`](../../.env.example) lists the variable without a committed default.
- **Do not** reuse the same development password in staging, production, or shared databases. Use a strong secret per environment; re-running the seed overwrites the stored password hash for that user.

## CORS

The Express API does not set CORS headers because it only accepts connections from the local WebView (same process). If the API is ever exposed to a network interface, `cors` middleware with an explicit origin allowlist must be added before any other change.

## Dependency Policy

- `npm audit --audit-level=high` is run in CI.
- Critical/High vulnerabilities must be resolved before merging to `main`.
- Moderate vulnerabilities are tracked in the issue tracker with a 30-day SLA.

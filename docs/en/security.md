# Security

## Threat Model (STRIDE — lightweight)

| Threat | Category | Mitigation |
|---|---|---|
| SQL injection via API parameters | Tampering | Prisma ORM parameterized queries; tagged `$queryRaw` / `Prisma.sql` where raw SQL is required (inputs bound, not concatenated). Health check uses constant `SELECT 1` |
| XSS in rendered user data | Tampering | React's JSX escapes all interpolated values by default |
| Unauthorized API access | Elevation of Privilege | Session cookie + permission checks; desktop API typically loopback; SaaS/hosted deployments must use TLS and network controls |
| Sensitive data exposure in logs | Information Disclosure | No PII at INFO; avoid logging tokens, passwords, or payment secrets |
| Dependency vulnerabilities | various | Blocking `pnpm audit --audit-level=high` in Quality Gate; Snyk CI (`SNYK_TOKEN`) — see [dependency scanning](quality/dependency-scanning-and-triage.md) |
| Malicious file paths in Tauri | Tampering | Tauri allowlist restricts filesystem access to app directories only |

## OWASP Top 10 Mapping

| Risk | Status |
|---|---|
| A01 Broken Access Control | Partial — cookie session and permission checks on protected routes ([`apps/server/createApp.ts`](../../apps/server/createApp.ts)); tenant isolation / IDOR remain a pentest focus ([#194](https://github.com/ayelenleclerc/BizCode/issues/194)) |
| A02 Cryptographic Failures | Partial — secrets in env / encrypted provider tokens where implemented; operator-owned key management |
| A03 Injection | Mitigated — Prisma parameterized queries; raw SQL via tagged templates |
| A04 Insecure Design | Partial — threat model reviewed; hosted SaaS expands attack surface vs loopback desktop |
| A05 Security Misconfiguration | Partial — CORS allowlist + `credentials: true`; Helmet/CSP via [`securityHeaders.ts`](../../apps/server/middleware/securityHeaders.ts) (Swagger needs limited `unsafe-inline`) |
| A06 Vulnerable Components | Monitored — blocking `pnpm audit` HIGH+; Snyk when `SNYK_TOKEN` is set |
| A07 Auth Failures | Partial — login and session endpoints; password hashing |
| A09 Logging Failures | Partial — observability middleware; structured security events (#221) |

## HTTP security headers

Express applies Helmet through [`getSecurityHeadersMiddleware`](../../apps/server/middleware/securityHeaders.ts) in `createApp` (frame deny, CSP, HSTS in production, referrer policy). CSP allows limited inline script/style for Swagger UI at `/api-docs`.

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
- **Code:** [`apps/server/createApp.ts`](../../apps/server/createApp.ts) (`getCorsOriginAllowlist`, `createApp`).
- **Tests:** [`tests/server/cors.test.ts`](../../tests/server/cors.test.ts).
- Requests **without** an `Origin` header (for example supertest in CI) are allowed; disallowed origins do not receive `Access-Control-Allow-Origin`.
- **Packaged desktop builds:** if the WebView uses an origin other than the dev defaults, add it to `CORS_ORIGINS`.

## Dependency Policy

- `pnpm audit --audit-level=high` is **blocking** in the Quality Gate.
- Snyk `test` / `monitor` runs when repository secret `SNYK_TOKEN` is configured ([`.github/workflows/snyk.yml`](../../.github/workflows/snyk.yml)).
- Critical/High vulnerabilities with an available fix must be resolved before merge to protected branches (see [dependency scanning triage](quality/dependency-scanning-and-triage.md)).
- Moderate vulnerabilities are tracked in the issue tracker with a 30-day SLA.

## Penetration testing (#194)

Automated DAST (OWASP ZAP baseline) and external engagement process: [Penetration testing](quality/penetration-testing.md). ZAP CI reports are **not** a substitute for an external pentest report.

## Pre-launch checklist (engineering)

| Check | Evidence |
|---|---|
| Dependency HIGH+ gates | Quality Gate `pnpm audit`; Snyk workflow |
| Raw SQL review | Tagged `$queryRaw` / `Prisma.sql`; no user-string concatenation found in current `$queryRaw*` call sites |
| Security headers | Helmet middleware on API |
| Tenant / IDOR | Auth + permission middleware; external pentest must verify cross-tenant access |
| Secrets in logs | Operators: review production log sinks before launch |

## Incident response (#222)

Operational runbook (classification, runbooks, legal notes, post-mortem): [Incident response](quality/incident-response.md). Super-admin tools: revoke tenant sessions, disable tenant, maintenance mode, forensic audit listing.

## Security monitoring (#221)

Async classification and alerts for platform operators: [Security monitoring](quality/security-monitoring.md). Timeline UI `/superadmin/security`; API `GET /api/superadmin/security-events`. Related ISO stub: [SEC-011](certificacion-iso/sec/sec-011-log-monitoring-alerting-procedure.md).

## Mobile app hardening (#220)

App Driver / App Seller: SecureStore tokens, encrypted offline cache, root/jailbreak soft-gate, Android TLS pinning, pin rotation runbook — [Mobile app hardening](quality/mobile-app-hardening.md).

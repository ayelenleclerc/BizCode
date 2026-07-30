# Log sanitization and retention policy (GitHub #218)

## Scope

This document covers **residual hardening** after observability MVP ([#151](https://github.com/ayelenleclerc/BizCode/issues/151)): extended redaction catalog, audit of non-Pino log surfaces, retention/access rules, and an automated guardrail. It does **not** re-implement metrics, health, or base Pino setup (see [observability.md](observability.md)).

Printing mock integration ([#153](https://github.com/ayelenleclerc/BizCode/issues/153) Fase 1, PR #311) is **out of scope** here; physical fiscal/thermal drivers remain a follow-up.

## Sensitive field catalog

Canonical names live in [`server/logRedaction.ts`](../../../server/logRedaction.ts) (`SENSITIVE_LOG_FIELD_NAMES`). They map to Pino `redact.paths` via `LOGGER_REDACT_PATHS` in [`server/logger.ts`](../../../server/logger.ts).

| Category | Field names (representative) |
|----------|------------------------------|
| Auth / session | `password`, `token`, `authorization`, `cookie`, `session`, `bearer`, `jwt`, `refreshToken`, `accessToken` |
| Crypto / certs | `secret`, `privateKey`, `private_key`, `certificate`, `clientSecret` |
| Integrations | `apiKey`, `api_key`, `smtpPassword`, `twilioAuthToken`, `x-api-key` (headers) |
| Payments | `creditCard`, `cardNumber`, `cvv`, `cvc`, `cbu`, `aliasCbu` |

Nested objects and HTTP headers use wildcard paths (`*.password`, `req.headers.authorization`, etc.). Serialized logs use censor `[Redacted]` (see [`tests/server/logger.test.ts`](../../../tests/server/logger.test.ts)).

## Log surfaces audit (2026-06)

| Surface | Risk | Action |
|---------|------|--------|
| Express API (`server/*`) | Structured `logger` only; no `console.*` | **OK** — request lines omit IP/UA by default ([#151](observability.md)) |
| `server/middleware/errorHandler.ts` | May log `err.stack` server-side | **Accepted** — stacks stay server-side; API responses hide details in production |
| Cron/CLI jobs (`scripts/*-job.ts`, `arca-retry-pending.ts`) | `console.log(JSON.stringify(...))` | **OK** — only aggregate counters (`processed`, `issued`, `failed`, `sent`, `skipped`) and `tenantId` |
| `scripts/bootstrap-superadmin.ts` | Logs username on create | **OK** — no password; bootstrap is operator-only |
| `scripts/inspect-dbf*.ts`, `migrate-from-dbf.ts` | Legacy DBF **samples** to stdout | **Exempt** — operator-only CLI; not part of runtime API logs |
| GitHub plan tooling (`scripts/github/*`) | Operational messages | **OK** — no secrets in templates |

## Retention and access

| Environment | Where logs go | Retention (policy) | Who may access |
|-------------|---------------|--------------------|----------------|
| Local dev | Process stdout / terminal | Session only; not collected centrally | Developer workstation |
| CI | GitHub Actions job logs | Platform default (~90 days per GitHub policy) | Maintainers with repo access |
| Production (future) | Host/orchestrator log sink (not defined in repo) | **TBD** when destination is chosen — align with ops retention; database backups are covered by [#150](https://github.com/ayelenleclerc/BizCode/issues/150) | Roles with `audit.read` for **metrics**; raw logs restricted to platform ops |

`GET /api/metrics` remains aggregate-only and requires `audit.read` when enabled ([#151](observability.md)). Raw request logs must not be exposed via API.

## Preventive guardrail

```bash
npm run check:logs
```

Implemented in [`scripts/check-log-sanitization.ts`](../../../scripts/check-log-sanitization.ts): fails if non-exempt `scripts/**/*.ts` use `console.*` with forbidden snippets (`req.body`, `password:`, `token:`, etc.). Exemptions are explicit in that script and listed in the audit table above.

CI runs this check via `npm run docs:validate` (together with OpenAPI checks).

## Related backlog (deferred)

| Issue | Decision |
|-------|----------|
| [#150](https://github.com/ayelenleclerc/BizCode/issues/150) automated PostgreSQL backup | **Delivered** in-repo (#150): local encrypted backups + optional S3 CLI; see [backup-and-restore.md](backup-and-restore.md). Centralized **log** sink destination remains TBD. |
| [#152](https://github.com/ayelenleclerc/BizCode/issues/152) staging/production pipelines | Deferred until server, domain, and deploy targets exist |
| [#153](https://github.com/ayelenleclerc/BizCode/issues/153) hardware fiscal/thermal | Fase 1 (mock) delivered; RS-232/ESC/POS real drivers remain open |

HTTP security headers for the API are documented with implementation evidence under [#214](https://github.com/ayelenleclerc/BizCode/issues/214) in [`server/middleware/securityHeaders.ts`](../../../server/middleware/securityHeaders.ts) and [`tests/server/security-headers.test.ts`](../../../tests/server/security-headers.test.ts).

## Validation

```bash
npm run check:logs
npm run test -- tests/server/logger.test.ts tests/server/security-headers.test.ts
```

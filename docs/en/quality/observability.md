# Observability MVP (Issue #151)

## Scope

BizCode includes a baseline observability layer for backend operations without external monitoring infrastructure:

- Structured JSON logs with `pino`.
- Request correlation through `X-Request-Id`.
- In-memory technical metrics exposed by `GET /api/metrics`.
- Additive health payload on `GET /api/health`.

Out of scope for this MVP: Prometheus, Grafana, Loki, Datadog, Sentry, and real operational alerts (email/Slack/WhatsApp paging).

## Structured logs

- Log level comes from `LOG_LEVEL` (default `info`, `silent` in tests).
- Sensitive fields are redacted (`password`, `token`, `authorization`, `cookie`, `session`, `secret`, `privateKey`, `certificate`).
- Request logs store operational metadata only (`requestId`, `method`, normalized `path`, `statusCode`, `durationMs`; `tenantId` and `userId` when available server-side).
- Full `req.body` payloads are not logged.

Privacy by default:

- IP and User-Agent are **not** logged in request access lines by default.

## Request metrics endpoint

`GET /api/metrics` returns aggregated technical counters in memory and requires permission `audit.read`.

Security and data minimization rules:

- No tenant identifiers, user identifiers, IPs, User-Agent strings, or per-request payloads are exposed.
- Route keys are normalized to avoid high cardinality and real IDs in output.
- If `METRICS_ENABLED=false`, the endpoint returns `404 Not found`.

## Health endpoint

`GET /api/health` keeps backward compatibility (`status`, `timestamp`) and adds:

- DB check result (`db.ok`) and check latency (`db.latencyMs`).
- `uptimeSeconds`.
- `version` when available from runtime environment.

## Runtime limits and future path

Current metrics are:

- In memory.
- Volatile (reset on process restart).
- Not persisted and not distributed across instances.

This MVP is preparation work for future integrations (Prometheus/Grafana/Loki/Sentry) once production infrastructure and channels are defined.

## Local validation

Run:

```bash
npm run check:openapi
npm run check:openapi-sync
npm run test
```

Full gate (including generated docs):

```bash
npm run type-check
npm run lint
npm run check:i18n
npm run check:docs-map
npm run check:openapi
npm run check:openapi-sync
npm run test
npm run docs:generate
npm run docs:validate
```

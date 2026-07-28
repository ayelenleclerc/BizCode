# ADR-0016: Edge WAF contract (Cloudflare) + Redis-backed rate limiting

**Status:** Accepted  
**Date:** 2026-07-28  
**ISO reference:** ISO/IEC 27001:2022 A.8.9 (configuration management); A.8.20 (networks security); A.5.15 (access control)

---

## Context

BizCode already applies per-route HTTP rate limits with `express-rate-limit` (#87) using an **in-process memory store**, keyed primarily by IP, mounted before session resolution. Redis (`REDIS_URL`) is used for refresh-token blacklist (#212) and MFA challenges (#213) but not for HTTP counters. Issue #217 requires multi-instance-safe limits, authenticated vs anonymous keys, tighter login limits, `Retry-After` on 429, and a documented Cloudflare edge WAF posture. There is **no** Cloudflare SDK in the repository.

## Decision

1. **Cloudflare = deployment contract (docs only):** Operators place Cloudflare (Free minimum) in front of the origin, enable WAF/bot/geo/SSL/Under Attack Mode as documented. The app does **not** call Cloudflare APIs in v1. Operator guide lives under `docs/*/quality/` via [`DOCUMENT_LOCALE_MAP.md`](../../DOCUMENT_LOCALE_MAP.md) (not a monolingual `docs/deployment/cloudflare.md`).
2. **Application rate limit store:** `rate-limit-redis` + shared `ioredis` when `REDIS_URL` is set; otherwise the default memory store (local/single-instance). Prefixed keys `bizcode:rl:*`. When `NODE_ENV=production`, `REDIS_URL` is **required** (fail-fast in `loadAppConfig`) so horizontal scale does not reset counters per pod.
3. **Trust proxy:** Optional `TRUST_PROXY` (hop count, typically `1` behind Cloudflare) sets Express `trust proxy` so `req.ip` reflects the client. Default off locally to avoid IP spoofing.
4. **Middleware order:** General API limiters run **after** `express.json()` and `resolveSession` so authenticated requests can be keyed by `userId`. Login IP / username limiters mount on `/api/auth` routes that already have a JSON body.
5. **Default limits (env-overridable):** login **5 / 15 min per IP**; login **10 / hour per tenant+username**; unauthenticated API **20 / min per IP**; authenticated API **100 / min per user**; costly reports/exports **10 / hour per tenant**; existing import/portal/MP limiters retained with Redis store when available.
6. **Webhooks:** Optional `WEBHOOK_IP_ALLOWLIST` (comma-separated IPs). When set, non-listed IPs receive **403**. Mercado Pago ranges are **not** hard-coded (operator-maintained).
7. **Out of scope v1:** `express-slow-down`, Cloudflare Terraform/API automation, dependency scanning (#219).

## Consequences

- **Positive:** Multi-instance rate limits; AC-aligned login/API/report budgets; edge WAF documented without inventing cloud account IDs; aligns ISO network/access evidence.
- **Negative:** Production deployments must provide Redis; mis-set `TRUST_PROXY` can spoof client IP; DB login lockout (`ACCOUNT_LOCKED`) and HTTP 429 may both apply.
- **Tests:** Extended route rate-limit suite (#87 pattern) plus login/`Retry-After`/user-vs-IP cases; Redis store exercises when `REDIS_URL` is present in CI/local.

## References

- Issue #217
- [ADR-0015: Secrets management](ADR-0015-secrets-management.md)
- [Cloudflare edge and WAF](../quality/cloudflare-edge-and-waf.md)

# Cloudflare edge and WAF (#217)

## Purpose

Operator checklist for placing **Cloudflare** in front of the BizCode API/origin. The application does **not** call Cloudflare APIs; edge configuration lives in the Cloudflare dashboard (or your IaC outside this repo).

Normative decision: [ADR-0016](../adr/ADR-0016-waf-and-rate-limiting.md).

## Application-layer companion

BizCode enforces HTTP rate limits in Express (`apps/server/middleware/routeRateLimit.ts`) with a **Redis store** when `REDIS_URL` is set (required in production). Behind Cloudflare you must set:

| Variable | Typical value | Why |
|----------|---------------|-----|
| `TRUST_PROXY` | `1` | So Express `req.ip` is the client IP (CF → origin is one hop) |
| `REDIS_URL` | Your Redis URL | Shared counters across API instances |
| `WEBHOOK_IP_ALLOWLIST` | Optional CSV of provider IPs | When set, webhook routes reject other IPs with 403 |

Do **not** invent Cloudflare account IDs or zone names in this repository.

## Operator checklist (Cloudflare Free minimum)

1. **DNS / proxy:** Point the public hostname at Cloudflare; orange-cloud (proxied) to the origin.
2. **SSL/TLS:** Full (strict) when the origin has a valid certificate; otherwise Full until origin TLS is ready. Prefer Cloudflare-managed certificates for the edge.
3. **WAF custom rule (auth):** Rate-limit or block clients exceeding ~100 requests/minute to `/api/auth*` paths (edge budget; app also enforces 5 login attempts / 15 minutes per IP).
4. **Bot Fight Mode / challenge:** Enable managed challenge for known bots where acceptable for your UX.
5. **Geo (optional):** Block or challenge high-risk countries only if product/ops explicitly approve the list.
6. **Under Attack Mode:** Document how to enable it during active DDoS; expect extra challenges for humans.
7. **Webhooks:** Prefer direct origin allowlisting via `WEBHOOK_IP_ALLOWLIST` (operator-maintained from provider docs such as Mercado Pago IPN). If Cloudflare sits in front of webhooks, ensure provider IPs are not challenged incorrectly.

## Local / CI

Cloudflare is not required locally. Use [`.env.example`](../../../.env.example) and optional Redis via `docker compose -f docker-compose.redis.yml up -d`.

## Out of scope in the app

- Cloudflare Workers, Terraform, or API tokens in this repo
- `express-slow-down` gradual degradation (v1)
- Hard-coded third-party IP ranges (they change; keep them in env/ops config)

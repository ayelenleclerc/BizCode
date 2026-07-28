# ADR-0015: Secrets management (Doppler inject + dual HMAC secret)

**Status:** Accepted  
**Date:** 2026-07-28  
**ISO reference:** ISO/IEC 27001:2022 A.5.10 (acceptable use of information); A.8.24 (use of cryptography); A.5.15 (access control)

---

## Context

BizCode previously loaded application secrets only from process environment / local `.env` (`DATABASE_URL`, `JWT_SECRET`, fiscal/MFA AES keys). AFIP and Mercado Pago credentials at rest are already AES-256-GCM ([`fiscalSecrets.ts`](../../../apps/server/fiscal/ar/fiscalSecrets.ts)); MFA TOTP secrets use a dedicated key ([`mfaSecrets.ts`](../../../apps/server/lib/mfaSecrets.ts)). Issue #216 requires production secrets not to live in committed `.env` files, JWT/HMAC rotation without simultaneous restart of all instances, and secret scanning in CI.

Despite the historical name `JWT_SECRET`, session and portal tokens are **opaque** values hashed with HMAC-SHA256 (see [ADR context in #212](ADR-0007-dual-deployment-and-fiscal-modularity.md) / session cookies), not signed JWTs.

## Decision

1. **Production secrets source = Doppler (issue option A):** Doppler (or an equivalent orchestrator) **injects** secrets into the process environment at start (`doppler run`, Doppler Kubernetes operator, host env from a secrets store). The Node app does **not** embed an AWS Secrets Manager / Vault SDK in v1; it continues to read validated env via [`loadAppConfig`](../../../apps/server/config/env.ts).
2. **Local / test / CI:** `.env` (gitignored) and GitHub Actions `env:` blocks remain valid. Never commit real production values; [`.env.example`](../../../.env.example) holds placeholders only.
3. **HMAC rotation without downtime:** `JWT_SECRET` (current; used to mint new hashes) and optional `JWT_SECRET_PREVIOUS`. Lookups try all candidates from [`secretHmac.ts`](../../../apps/server/lib/secretHmac.ts) (`opaqueTokenHashCandidates` / `portalTokenHashCandidates`) so pods on the new secret still accept tokens hashed with the previous secret until they expire or refresh.
4. **AES master keys:** `BIZCODE_FISCAL_ENCRYPTION_KEY` and `BIZCODE_MFA_ENCRYPTION_KEY` are required when `NODE_ENV=production` (no insecure defaults). Dev/test may use documented non-production fallbacks.
5. **CI:** Gitleaks runs on push/PR and fails the job on findings. Git history audit of `**/.env*` is documented; BFG/history rewrite is out of band if exposure is found.
6. **Out of scope v1:** AWS Secrets Manager SDK, HashiCorp Vault, automatic scheduled AES key rotation, Cloudflare WAF (#217).

## Consequences

- **Positive:** Production can drop file-based `.env` with real secrets; rolling secret rotation for sessions/portal; CI catches accidental commits; aligns with ISO crypto/access control evidence.
- **Negative:** Operators must configure Doppler (or inject equivalent env); dual-secret window must be finite or previous secret stays valid indefinitely.
- **Tests:** [`tests/server/lib/secretHmac.test.ts`](../../../../tests/server/lib/secretHmac.test.ts), env production harden tests, fiscal/MFA decrypt tests.

## References

- Issue #216
- [ADR-0007: Dual deployment and fiscal modularity](ADR-0007-dual-deployment-and-fiscal-modularity.md)
- [Secrets management and Doppler](../quality/secrets-management-and-doppler.md)

# Secrets management and Doppler (#216)

## Purpose

Document how BizCode loads sensitive configuration in production versus local/CI, without embedding cloud vendor SDKs in the application.

Normative decision: [ADR-0015](../adr/ADR-0015-secrets-management.md).

## Model

| Environment | How secrets reach the process |
|-------------|-------------------------------|
| Local development | Gitignored `.env` (copy from [`.env.example`](../../../.env.example)) |
| CI (GitHub Actions) | Workflow `env:` / repository secrets injected as process env |
| Production | **Doppler** (or equivalent) injects env at process start (`doppler run -- …`, operator, or orchestrator secrets → env). Do **not** mount a production `.env` file with real values into the image/repo |

The API always reads validated environment variables via `apps/server/config/env.ts` (`DATABASE_URL`, `JWT_SECRET`, optional `JWT_SECRET_PREVIOUS`, AES keys, etc.).

## Canonical inventory (sensitive)

| Variable | Role |
|----------|------|
| `DATABASE_URL` | PostgreSQL connection (includes DB password) |
| `JWT_SECRET` | Current HMAC key for opaque session/refresh/portal/MFA-challenge token hashes |
| `JWT_SECRET_PREVIOUS` | Optional previous HMAC key during rolling rotation |
| `BIZCODE_FISCAL_ENCRYPTION_KEY` | AES-256-GCM master key for AFIP/MP secrets at rest (**required in production**) |
| `BIZCODE_MFA_ENCRYPTION_KEY` | AES-256-GCM master key for TOTP secrets (**required in production**; never reuse fiscal key) |
| `REDIS_URL` | Redis (refresh blacklist, MFA challenges, **HTTP rate-limit store** — **required in production**, #217) |
| `SMTP_*` / `TWILIO_*` | Optional outbound channels |

Seed/bootstrap passwords (`BIZCODE_SEED_*`, `BIZCODE_BOOTSTRAP_*`) are local/ops only — never production app runtime secrets.

## JWT_SECRET rotation (no simultaneous full restart)

1. Set `JWT_SECRET_PREVIOUS` to the **old** value in Doppler (and peers).
2. Set `JWT_SECRET` to the **new** value.
3. Roll / restart instances gradually. Lookups accept hashes from either secret (`opaqueTokenHashCandidates` / `portalTokenHashCandidates`).
4. After access/refresh/portal tokens minted under the old secret have expired (or users re-login), remove `JWT_SECRET_PREVIOUS`.

New hashes are always minted with the current `JWT_SECRET`.

## AES key procedure (manual)

Rotating `BIZCODE_FISCAL_ENCRYPTION_KEY` or `BIZCODE_MFA_ENCRYPTION_KEY` requires re-encrypting stored ciphertext (out of automated scope in #216). Prefer a dedicated maintenance window and a dual-read decrypt helper if introducing a previous AES key later.

## Doppler operator checklist

1. Create a Doppler project/config for the environment (staging/production).
2. Mirror the inventory above as Doppler secrets (placeholders never committed).
3. Start the API with injection, e.g. `doppler run -- npm run server` (or the platform’s Doppler sync into container env).
4. Confirm `NODE_ENV=production` and that fiscal/MFA keys are set (bootstrap fails otherwise).
5. Keep GitHub Actions / deploy SSH secrets for CI and host access separate from app runtime Doppler secrets when appropriate.

## CI: Gitleaks

Workflow `.github/workflows/gitleaks.yml` fails the job when secrets are detected in the diff/history scanned by Gitleaks. Allowlists, if any, live in `.gitleaks.toml` and must stay minimal.

## Git history audit

Operators may run:

```bash
git log --all --full-history -- "**/.env*"
```

If real secrets appear in history, rotate every affected credential and plan a separate history-rewrite (BFG / `git-filter-repo`) — **not** part of the application PR.

Evidence template: [`docs/evidence/secrets-env-history-audit.md`](../../evidence/secrets-env-history-audit.md).

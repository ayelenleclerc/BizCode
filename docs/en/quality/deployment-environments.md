# Deployment environments (#152)

## Purpose

Documents how BizCode separates **local**, **staging**, and **production** deployment targets: branches, secrets, GitHub Environments, and what remains residual until a remote host exists.

**Evidence status:** Repo workflows and Environment scaffolding are implemented. Remote DNS, Let’s Encrypt, and cloud databases are **not** provisioned in this delivery. Not a certification claim.

## Environment matrix

| Environment | Branch / trigger | App URL | Database | Deploy |
|-------------|------------------|---------|----------|--------|
| Local development | `feature/*` | `localhost` (API `:3001`, Vite `:5173`) | Docker Postgres `:5432` | Manual (`pnpm` / compose) |
| Staging | Push to `develop` | Host URL from ops (not hardcoded in repo) | Staging DB only (`STAGING_DATABASE_URL`) | `.github/workflows/staging.yml` → GHCR `staging*` tags; SSH only if `STAGING_DEPLOY_*` secrets exist |
| Production | `main` / release / `workflow_dispatch` | Host URL from ops (not hardcoded) | Production DB (`PROD_DATABASE_URL` / deploy host `.env`) | `.github/workflows/deploy.yml` with GitHub Environment **`production`** (approval) |

## GitHub Environments

| Name | Role |
|------|------|
| `staging` | Optional SSH deploy job in `staging.yml` |
| `production` | Required for SSH deploy job in `deploy.yml` when `run_deploy=true` |

Configure protection rules (required reviewers on `production`) in GitHub **Settings → Environments**.

## Secrets (expected)

### Staging (`STAGING_*` / deploy)

| Secret | Purpose |
|--------|---------|
| `STAGING_DEPLOY_HOST` | SSH host |
| `STAGING_DEPLOY_USER` | SSH user |
| `STAGING_DEPLOY_SSH_KEY` | Private key |
| `STAGING_DEPLOY_PATH` | Remote directory with `docker-compose` (staging compose file) |
| `STAGING_DATABASE_URL` | Optional; used by seed/guardrail scripts — **must never equal** `PROD_DATABASE_URL` |

If deploy secrets are missing, the staging **SSH deploy job is skipped** (fail-closed summary in the log). Image build/push to GHCR still runs when the workflow runs on `develop`.

### Production (`DEPLOY_*`)

| Secret | Purpose |
|--------|---------|
| `DEPLOY_HOST` | SSH host |
| `DEPLOY_USER` | SSH user |
| `DEPLOY_SSH_KEY` | Private key |
| `DEPLOY_PATH` | Remote directory with [`docker-compose.prod.yml`](../../docker-compose.prod.yml) |
| `PROD_DATABASE_URL` | Optional guardrail comparison for seed scripts |

Production SSH deploy remains **manual**: `workflow_dispatch` with `run_deploy=true` and Environment approval.

## Database isolation

- Staging must never use the production database.
- Script `npm run seed:staging` aborts if `STAGING_DATABASE_URL` equals `PROD_DATABASE_URL`, or if the target URL host matches `BIZCODE_PROD_DB_HOSTS` (comma-separated denylist).
- Default local target: `DATABASE_URL` → Docker Postgres `:5432` (synthetic data only; no real PII).

```bash
# Local smoke (Docker Desktop Postgres on :5432)
npm run seed:staging
```

## Residual (ops — not in this PR)

- DNS / TLS certificates (Let’s Encrypt + certbot on the host)
- nginx reverse-proxy on the server
- Provisioning the VPS and remote Postgres instances
- Measuring end-to-end “deploy &lt; 8 min” against a real staging host (requires secrets)

## Related

- Workflows: [`.github/workflows/staging.yml`](../../.github/workflows/staging.yml), [`.github/workflows/deploy.yml`](../../.github/workflows/deploy.yml)
- Backup restore drills: [backup-and-restore.md](backup-and-restore.md)
- Local setup: [local-development-setup.md](local-development-setup.md)

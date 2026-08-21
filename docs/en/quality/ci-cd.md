# CI/CD Pipeline

## Overview

BizCode uses GitHub Actions for continuous integration. The pipeline is defined in `.github/workflows/ci.yml`.

## Monorepo and Turborepo selective CI (#158)

BizCode is a **pnpm workspace** (`apps/web`, `apps/server`, `packages/types`, `packages/api-client`) orchestrated by **Turborepo** (`turbo.json`).

| Mechanism | Purpose |
|---|---|
| `turbo.json` `inputs` / `outputs` | Local task cache under `.turbo/` |
| `.github/actions/turbo-cache` | GitHub Actions cache keyed by `pnpm-lock.yaml` |
| `pnpm exec turbo run lint` | Workspace-aware ESLint (Quality Gate, deploy) |
| `turbo run type-check lint --filter=@bizcode/web...` | Frontend validation without the server workspace |
| `turbo run type-check lint --filter=@bizcode/server...` | Backend validation (server + package dependencies) |
| Workflow `paths:` filters | Skip jobs when unrelated paths change |
| Root `pnpm run type-check` | Full-repo `tsc --noEmit` (tests, scripts, e2e) — **unchanged** in Quality Gate |
| Vitest / Playwright | Rooted at repo level; selective via workflow `paths:`, not `turbo run test --filter` |

`deploy.yml` runs on `push`/`pull_request` only when application, package, Docker, or lockfile paths change; `workflow_dispatch` and `release` triggers are unchanged.

**Staging / production environments (#152):** `.github/workflows/staging.yml` runs on push to `develop` (same path filters), publishes GHCR tags `staging` / `sha-…`, and optionally SSH-deploys when `STAGING_DEPLOY_*` secrets exist (`environment: staging`). Production SSH deploy in `deploy.yml` uses GitHub Environment **`production`** (approval). See [deployment-environments.md](deployment-environments.md) and [ENVIRONMENTS.md](../../ENVIRONMENTS.md).

**Limitation:** SBOM regeneration is skipped in CI (`scripts/docs-generate.mjs`); the committed `docs/evidence/sbom-cyclonedx.json` is not drift-checked in CI.

## Pipeline Stages

```
push / pull_request
      │
      ▼
┌──────────────────────────────────────────────────────────────┐
│  Job: quality (ubuntu-latest)                              │
│                                                              │
│  1. Checkout                                                 │
│  2. Setup Node.js 22 (cache: npm)                           │
│  3. npm ci (uses `.npmrc` `legacy-peer-deps` for ESLint peers) │
│  3b. pnpm audit --audit-level=high (blocking HIGH+)       │
│  4. npx prisma generate                                     │
│  5. npx prisma validate       ← schema syntax / metadata (no DB write) │
│  6. npx prisma migrate deploy  ← schema on PostgreSQL       │
│  7. npm run type-check                      ← blocks         │
│  7b. npm run docs:validate                 ← blocks         │
│  8. npm run docs:generate                  ← blocks         │
│  9. Verify TypeDoc HTML post-process (no unpatched footer)  ← blocks │
│ 10. git diff (generated docs / SBOM check) ← blocks         │
│ 11. npm run lint                           ← blocks         │
│ 12. API contract tests (tests/api/contract.test.ts) ← blocks │
│ 13. npm run test:coverage ← blocks (Vitest + v8 thresholds; scope see matrix below) │
│ 14. npm run check:i18n         ← blocks                        │
│ 15. npx playwright install --with-deps chromium              │
│ 16. npm run test:e2e           ← blocks (Playwright smoke; see ADR-0004) │
│ 17. npm run test:integration   ← blocks (Prisma + PostgreSQL; ADR-0004 B) │
│ 18. npm run check:docs-map     ← blocks                        │
│ 19. Upload coverage artifact (always)                       │
└──────────────────────────────────────────────────────────────┘
```

## Triggers

| Event | Branches |
|---|---|
| `push` | `main`, `develop` |
| `pull_request` | targeting `main` or `develop` |

## Secret scanning (#216)

Workflow [`.github/workflows/gitleaks.yml`](../../../.github/workflows/gitleaks.yml) runs Gitleaks on push/PR to `main`/`develop` and fails on findings. Config: [`.gitleaks.toml`](../../../.gitleaks.toml). See [secrets management / Doppler](secrets-management-and-doppler.md).

## Dependency and image scanning (#219)

- **Dependabot:** [`.github/dependabot.yml`](../../../.github/dependabot.yml) (weekly npm + GitHub Actions, patch groups).
- **pnpm audit:** blocking HIGH+ on the Quality Gate (see [ADR-0017](../adr/ADR-0017-dependency-scanning.md)).
- **Snyk:** [`.github/workflows/snyk.yml`](../../../.github/workflows/snyk.yml) — requires `SNYK_TOKEN`; fails on HIGH+ with available fix.
- **Trivy images:** after Docker build in [`.github/workflows/deploy.yml`](../../../.github/workflows/deploy.yml), fail on CRITICAL before GHCR publish.
- Triage: [dependency scanning and triage](dependency-scanning-and-triage.md).

## Blocking Conditions

| Step | Blocking condition |
|---|---|
| prisma validate | Invalid `schema.prisma` according to Prisma (no PostgreSQL mutation) |
| type-check | Any TypeScript compilation error |
| check:openapi | OpenAPI 3.x validation failures for `docs/api/openapi.yaml` (script `npm run check:openapi`) |
| docs:generate + git diff | Drift between committed files and regenerated docs under `docs/generated/`, `docs/api/openapi-reference.generated.md`, `docs/evidence/sbom-cyclonedx.json` |
| TypeDoc post-process | No `target="_blank">TypeDoc</` in `docs/generated/typedoc/` (runs via `docs:typedoc` + `scripts/patch-typedoc-html-noopener.mjs`) |
| lint | Any ESLint error or **warning** (`npm run lint` uses `--max-warnings 0`) |
| API contract tests | Any failure in `tests/api/contract.test.ts` (OpenAPI paths/schemas vs Ajv) |
| test:coverage | Any test failure OR any coverage threshold not met |
| check:i18n | Any locale namespace has missing or extra keys vs. `es` source |
| test:e2e | Any Playwright failure (includes `vite build` + preview via `playwright.config.ts`) |
| test:integration | Any Vitest integration failure (`tests/integration/`; real PostgreSQL) |
| check:docs-map | Any path in `DOCUMENT_LOCALE_MAP.md` missing on disk |

## Verification traceability matrix (PR → `develop` / `main`)

| Surface | Evidence / behavior checked | Typical workflow(s) |
|---|---|---|
| TypeScript compilation | Whole repo `tsconfig` include (`src`, `server`, `tests`, `e2e`, …) | `ci.yml` → `npm run type-check` |
| REST API vs contract | OpenAPI YAML syntax + route sync + regenerated schemas / MD drift | `ci.yml` → `docs:validate`, `docs:generate`, git diff |
| Database schema lifecycle | Client generation, validated schema file, migrations or `db push`, seed used by runtime tests | `ci.yml` → `prisma generate`, `prisma validate`, migrate/push + `test:integration`; `backend-validation.yml` (paths) adds DB migration smoke |
| Line / branch metrics (coverage) | **`vitest` v8 thresholds** apply only to **`server/**/*.ts`**, root `server.ts`, and **`src/**/*.{ts,tsx}`**, excluding tests, barrels, typings, and `server/main.ts`/`packages/types/src/server-inputs.ts`/`src/types.ts` via `coverage.exclude`. **Not everything in repo** (scripts, prisma seed, standalone tools) file: `vitest.config.ts` | `ci.yml`, `frontend-validation.yml`, `qa-validation.yml` → `npm run test:coverage` |
| Integration with PostgreSQL | Real DB paths in `tests/integration/**`; **explicitly without line-coverage instrumentation** (`vitest.integration.config.ts`) | `ci.yml`, `backend-validation.yml` |
| Frontend production bundle | `vite build` is executed by Playwright **`webServer`** before UI smoke (`playwright.config.ts`) | `ci.yml`, `frontend-validation.yml` → `test:e2e` |
| i18n key parity | All locales aligned to source `es` | `npm run check:i18n` |
| Human docs structure | Locale map completeness | `check:docs-map` |
| Human docs localization policy | Controlled roots (quality, ISO, specs, **user manuals**, changelogs, ADR, OpenAPI) must stay trilingual EN/ES/PT-BR | `docs-governance.yml` (**PR to `main` and `develop`**) |
| External links in Markdown (under `docs/`) | HTTP(S) targets alive (**Lychee**; loopback, flaky npm/AAIP, and GitHub issue/PR URLs in `.lycheeignore`). Relative `.md` cross-links are not validated here. | `docs-links.yml` |

## Services

The job starts a **PostgreSQL 16** service container (`DATABASE_URL` is set). After `prisma migrate deploy`, **`npm run test:integration`** runs HTTP + real Prisma tests under `tests/integration/`. API **contract** tests (`tests/api/`) still **mock** Prisma for OpenAPI validation ([ADR-0004](../adr/ADR-0004-e2e-playwright-integration-roadmap.md)).

## Artifacts

| Artifact | Retention | Contents |
|---|---|---|
| `coverage-report` | 14 days | `coverage/` directory (HTML, LCOV, text summary) |

## What Is NOT in CI

**Tauri desktop build** is excluded from CI (native WebKit/WebView2, display server, Rust toolchain). See workflow comments in `.github/workflows/ci.yml`.

**Manual release gate (desktop binaries):** after `main` is green, invoke **Actions → Tauri self-hosted build** (`tauri-selfhosted.yml`) before shipping installers; tagged releases can also use **Actions → Tauri release** (`tauri-release.yml` on `v*.*.*` tags). See [ADR-0006](../adr/ADR-0006-release-and-tauri-ci-workflows.md).

**App Seller EAS (#173)** is **not** part of Quality Gate (cloud minutes + Expo credentials). Workflow [`.github/workflows/seller-eas.yml`](../../../.github/workflows/seller-eas.yml):

| Trigger | What runs |
|---|---|
| Tag `seller-v*` | Android `production` (AAB) + `internal` (APK), then `eas update --channel production` |
| `workflow_dispatch` | Chosen platform (`android` / `ios`) and profile; optional OTA |

Secrets (fail-closed, no silent skip): `EXPO_TOKEN`, `EAS_PROJECT_ID`. Optional: `EXPO_PUBLIC_API_BASE_URL`. CLI: `pnpm dlx eas-cli@16` (`--non-interactive`). Distinct from desktop tags `v*.*.*`. Operator still uploads the first AAB to Play Console; `eas submit` iOS is out of this workflow.

**App Driver EAS (#166)** is **not** part of Quality Gate. Workflow [`.github/workflows/driver-eas.yml`](../../../.github/workflows/driver-eas.yml):

| Trigger | What runs |
|---|---|
| Tag `driver-v*` | Android `production` (AAB) + `internal` (APK), attach APK to GitHub Release, then `eas update --channel production` |
| `workflow_dispatch` | Chosen platform (`android` / `ios`) and profile; optional OTA |

Secrets (fail-closed): `EXPO_TOKEN`, **`EAS_DRIVER_PROJECT_ID`** (Driver Expo project — do not reuse Seller `EAS_PROJECT_ID`). Optional: `EXPO_PUBLIC_API_BASE_URL`. Distinct from tags `seller-v*` and desktop `v*.*.*`.

## Documentation branch (`documentacion`)

The **orphan** branch `documentacion` contains **no application source** — only a snapshot of documentation suitable for static hosting (e.g. GitHub Pages).

| Item | Detail |
|---|---|
| Workflow | `.github/workflows/sync-documentacion.yml` |
| When it runs | `push` to **`main`** that touches `docs/**`, `Certificación-ISO/**`, root `README.md`, `AGENTS.md`, or `CONTRIBUTING.md`; or **`workflow_dispatch`** (Actions → *Sync documentacion branch*) |
| Manual ref | Optional input `source_ref` (default `main`) to copy from another branch or SHA |
| Code branches | Unchanged: work on `develop` / `feature/*` / `fix/*`, merge to `main` per [CONTRIBUTING](../../../CONTRIBUTING.md); this job **does not** land app code on `documentacion` |

## Docker production deployment (issue #149)

### Container topology

- `server` (`Dockerfile`): Node 22 container running `npm run server`, health check on `GET /api/health`.
- `frontend` (`Dockerfile.frontend`): Vite static build served by Nginx, health check on `/`.
- `postgres`: PostgreSQL 16 with persistent volume.
- `docker-compose.prod.yml` orchestrates the three services. Existing local parity compose (`docker-compose.postgres.yml`) remains unchanged.
- Current status is **deploy-ready**: infrastructure is prepared, but real production deploy is pending a defined server.

### Nginx role

- The Nginx container serves frontend static assets.
- It proxies `/api/*` requests to the backend service (`server:3001`) inside the compose network.
- This is an internal reverse proxy role within the stack; no external domain/certificate assumptions are embedded in repository files.

### Required deploy environment variables

- Runtime env (`.env` on target host, never committed): `DATABASE_URL`, `POSTGRES_PASSWORD`, `JWT_SECRET`/`SESSION_SECRET`, `APP_ENV`.
- Optional tuning: `POSTGRES_DB`, `POSTGRES_USER`, `FRONTEND_PORT`, `VITE_API_URL`, `CORS_ORIGINS`, `LOG_LEVEL`, SMTP/Twilio variables.
- Optional fiscal encryption key: `BIZCODE_FISCAL_ENCRYPTION_KEY`.

### GitHub Actions deployment workflow

Workflow file: `.github/workflows/deploy.yml`.

- `build_and_test` (always-on validation for `push`/`pull_request`/manual):
  - `npm ci`
  - `npm run type-check`
  - `npm run lint`
  - `npm run test`
  - `npm run check:i18n`
  - `npm run check:docs-map`
  - `npm run docs:validate`
  - Docker build validation for backend/frontend images
- `publish_images` (prepared for `main`, release tags, or manual run):
  - Login to GHCR using `GHCR_TOKEN` when provided, otherwise `GITHUB_TOKEN`
  - Build/push `ghcr.io/<owner>/bizcode-server` and `ghcr.io/<owner>/bizcode-frontend`
- `deploy` (real deploy remains blocked unless explicitly enabled):
  - Runs only on `workflow_dispatch` with input `run_deploy: true` (after `publish_images`)
  - SSH port via workflow input `deploy_ssh_port` (default `22`); add GitHub Environment `production` with reviewers when a server exists
  - SSH to host and run `docker compose -f docker-compose.prod.yml pull && up -d`
  - Feature/develop workflows still pass validation/build without requiring server infrastructure

### Required repository secrets for SSH deploy

- `DEPLOY_HOST`
- `DEPLOY_USER`
- `DEPLOY_SSH_KEY`
- `DEPLOY_PATH`
- Workflow input `deploy_ssh_port` (optional; default `22`, not a secret)
- `DATABASE_URL`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`
- `APP_ENV`
- `VITE_API_URL`
- `CORS_ORIGINS`
- `SESSION_SECRET`
- `GHCR_TOKEN` (optional when `GITHUB_TOKEN` is insufficient)

### Activation checklist (future production server)

1. Define host/domain/networking outside repository.
2. Create repository secrets listed above (no plaintext in git).
3. Protect `production` environment with required manual approval.
4. Run `workflow_dispatch` or publish release tag.
5. Verify `/api/health` and `/` health checks after deployment.

### Rollback baseline

- Keep previous image tags in GHCR (`sha` and tag-based references are published).
- On host, rollback by pinning previous image tags in `docker-compose.prod.yml` (or host-level override) and re-running:
  - `docker compose -f docker-compose.prod.yml pull`
  - `docker compose -f docker-compose.prod.yml up -d`

## Optional / follow-up automation

- [x] **Sync `documentacion` orphan branch** from `main` — `.github/workflows/sync-documentacion.yml` (see *Documentation branch* above)
- [x] **`pnpm audit --audit-level=high`** after install (**blocking** HIGH+; #219 / ADR-0017) — previously informational under ADR-0006
- [x] PostgreSQL-backed integration tests (Phase B, ADR-0004) — `tests/integration/`, `npm run test:integration`
- [x] **Tauri build on self-hosted runner** — `.github/workflows/tauri-selfhosted.yml` (`workflow_dispatch` only) — [ADR-0006](../adr/ADR-0006-release-and-tauri-ci-workflows.md)
- [x] **semantic-release** — `release.config.cjs`, `.github/workflows/release.yml` (`workflow_dispatch` on `main`) — [ADR-0006](../adr/ADR-0006-release-and-tauri-ci-workflows.md)
- [x] **External HTTP(S) links in `docs/`** — `.github/workflows/docs-links.yml`, `.lycheeignore` (Lychee; not relative `.md` cross-links)
- [x] **App Seller EAS on `seller-v*` tags** — `.github/workflows/seller-eas.yml` (`EXPO_TOKEN` / `EAS_PROJECT_ID`; not Quality Gate) — #173
- [x] **App Driver EAS on `driver-v*` tags** — `.github/workflows/driver-eas.yml` (`EXPO_TOKEN` / `EAS_DRIVER_PROJECT_ID`; GitHub Release APK; not Quality Gate) — #166

## Project status automation (GitHub)

Validated operating behavior for board `BizCode Delivery`:

- Open PR with `Closes #<issue>` -> `In Progress`.
- Close PR without merge -> `Backlog`.
- Merge PR -> `Done`.

Implementation:

- Workflow: `.github/workflows/project-status-automation.yml`
- Required repository variables:
  - `PROJECT_V2_ID`
  - `PROJECT_STATUS_FIELD_ID`
  - `PROJECT_STATUS_OPTION_BACKLOG`
  - `PROJECT_STATUS_OPTION_IN_PROGRESS`
  - `PROJECT_STATUS_OPTION_DONE`
  - `PROJECT_STATUS_OPTION_BLOCKED` (optional)
- Optional repository variable:
  - `PROJECT_PR_ASSOCIATED_FIELD_ID`: GraphQL id of the **PR asociado** text field on the project. When set, the workflow stores the PR URL there for each linked issue it updates.
- Recommended secret for user-owned Project V2 boards:
  - `PROJECT_AUTOMATION_TOKEN` (`repo`, `project`, `read:project`)

## Cursor plan → GitHub Issues + Project (local tooling)

- **CI validation (no token):** `.github/workflows/plan-md-validate.yml` runs `npm run plan:validate` on pull requests and on pushes to `main` / `develop`. By default it validates only `tests/plan-sync/fixtures/valid-*.plan.md` (contract + labels). Locally, `npm run plan:validate -- --with-cursor-plans` also checks `.cursor/plans/*.plan.md` if that directory exists.
- **Local sync:** `npm run plan:sync -- --plan <path-to.plan.md> [--repo owner/repo] [--repo-root <dir>] [--dry-run]` upserts one issue per plan todo, links issues to Project v2, sets board status from todo state, and persists mapping under `.github/plan-sync/state/`. Non-dry-run requires `GH_TOKEN` or `GITHUB_TOKEN`, `GITHUB_REPOSITORY` (or `GITHUB_OWNER` + `GITHUB_REPO`, or `--repo`), and the same Project variables as above (`PROJECT_V2_ID`, `PROJECT_STATUS_FIELD_ID`, and the `PROJECT_STATUS_OPTION_*` option IDs). Sync reports are written under `.github/plan-sync/reports/` (gitignored).
- **Optional approve flow:** `npm run plan:approve -- --plan <path>` archives a copy under `.cursor/plans/` and runs `plan:sync` (see `scripts/github/plan-approve-main.ts`).
- **Interaction with PR automation:** Once items are on the board, `.github/workflows/project-status-automation.yml` still updates status from PR open/close/merge when issues are linked with `Closes #<issue>`.
- **Board hygiene:** Keep **Backlog** for work not actively in flight (no open PR). Use **Ready** when committed but no PR yet; **In Progress** when a linked PR is open. Avoid **In Progress** without a PR.

**Post-merge (maintainer):** After merging a PR that links issues with `Closes #…`, verify in GitHub that those issues closed, and confirm the **BizCode Delivery** project columns moved affected items to **Done** when expected (requires secrets/variables documented above for `.github/workflows/project-status-automation.yml`).

Daily usage checklist:

1. Create issue from `Task` template.
2. Add issue to Project.
3. Open PR with `Closes #<issue>`.
4. Verify required checks (`Quality Gate`, `Docs governance`, `Documentation links`, security/CodeQL checks as enabled).
5. Merge only when CI is green.

## Scheduled operational jobs (host cron)

These jobs are **not** run by GitHub Actions in the default pipeline; schedule them on the deployment host (or an orchestrator) with tenant database access.

| Schedule | Command | Purpose |
|---|---|---|
| `*/5 * * * *` | `npm run arca:retry-pending-job` | Retry `estadoCae: pending` invoices via homologación WSFE mock (`ArcaService.retryPending`) for every tenant with `TenantFiscalConfig`. |
| `0 */2 * * *` | `npm run shipping:tracking-refresh` | Refresh in-flight carrier tracking (`ShippingTrackingService`) for tenants with active `ShippingCarrierConfig`; notifies managers when status becomes delivered (#193). |
| `0 */5 * * *` | `npm run meli:token-refresh` | Refresh Mercado Libre OAuth access tokens (expire ~6h) for tenants with active `MeliConfig` approaching expiry (#183). |
| `*/5 * * * *` | `npm run meli:catalog-sync` | Retry pending/error Mercado Libre catalog listings (`MeliPublicacion`) after article updates (#184). |
| `0 * * * *` (hourly) | `npm run meli:stock-reconcile` | Compare ML `available_quantity` vs BizCode `Articulo.stock` for linked listings; push BizCode qty to ML when they differ (no duplicate `StockAjuste`) (#185). |
| `* * * * *` (every minute) | `npm run ecommerce:sync-worker` | Process due `EcommerceSyncJob` rows (shared sync engine): retry/backoff, SyncLog, DLQ alert to super_admin after 3 failures (#189). |
| `0 * * * *` (hourly) | `npm run cobranzas:recordatorios` | Overdue collection reminders for every tenant with `ParamEmpresa`; sends at **08:00 tenant local** (minute &lt; 15) within configured business hours. Use `0 8 * * *` only for single–time zone deployments. |
| `0 * * * *` (hourly) | `npm run mercadopago:reconciliacion` | Mercado Pago payment reconciliation for every tenant with `MercadoPagoConfig` active; runs at **02:00 tenant local** (minute &lt; 15). Use `0 2 * * *` only for single–time zone deployments. |
| `0 2 * * *` (UTC) | `npm run backup:postgres` then `npm run backup:postgres:prune` | Encrypted PostgreSQL backup to `BIZCODE_BACKUP_DIR` (+ optional S3 CLI). Requires `BACKUP_ENCRYPTION_KEY`. See [backup-and-restore.md](backup-and-restore.md). |

Optional env for a single tenant in dev/staging: `BIZCODE_TENANT_ID=<id>` (applies to `arca:retry-pending-job`, `arca:retry-pending`, `cobranzas:recordatorios`, `mercadopago:reconciliacion`, `shipping:tracking-refresh`, `meli:token-refresh`, `meli:catalog-sync`, and `meli:stock-reconcile`). Optional `BIZCODE_ECOMMERCE_SYNC_LIMIT` for `ecommerce:sync-worker` batch size (default 50). Optional `BIZCODE_RECORDATORIO_CANAL` (default `email`).

Documentation governance (Wiki vs controlled docs):

- Fast-changing operational notes can live in Wiki.
- Auditable/release-gated documentation must remain in repository docs.
- Reference: [Wiki vs controlled documentation policy](wiki-vs-controlled-docs-policy.md).

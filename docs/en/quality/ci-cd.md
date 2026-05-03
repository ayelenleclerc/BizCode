# CI/CD Pipeline

## Overview

BizCode uses GitHub Actions for continuous integration. The pipeline is defined in `.github/workflows/ci.yml`.

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
│  3b. npm audit (informational, continue-on-error)          │
│  4. npx prisma generate                                     │
│  5. npx prisma migrate deploy  ← schema on PostgreSQL       │
│  6. npm run type-check                      ← blocks         │
│  6b. npm run check:openapi                 ← blocks         │
│  7. npm run docs:generate                  ← blocks         │
│  8. git diff (generated docs / SBOM check) ← blocks         │
│  9. npm run lint                           ← blocks         │
│ 10. npm run test:coverage      ← blocks (Vitest + coverage + API contract + a11y) │
│ 11. npm run check:i18n         ← blocks                        │
│ 12. npx playwright install --with-deps chromium              │
│ 13. npm run test:e2e           ← blocks (Playwright smoke; see ADR-0004) │
│ 14. npm run test:integration   ← blocks (Prisma + PostgreSQL; ADR-0004 B) │
│ 15. npm run check:docs-map     ← blocks                        │
│ 16. Upload coverage artifact (always)                       │
└──────────────────────────────────────────────────────────────┘
```

## Triggers

| Event | Branches |
|---|---|
| `push` | `main`, `develop` |
| `pull_request` | targeting `main` or `develop` |

## Blocking Conditions

| Step | Blocking condition |
|---|---|
| type-check | Any TypeScript compilation error |
| check:openapi | OpenAPI 3.x validation failures for `docs/api/openapi.yaml` (script `npm run check:openapi`) |
| docs:generate + git diff | Drift between committed files and regenerated docs under `docs/generated/`, `docs/api/openapi-reference.generated.md`, `docs/evidence/sbom-cyclonedx.json` |
| lint | Any ESLint error or **warning** (`npm run lint` uses `--max-warnings 0`) |
| test:coverage | Any test failure OR any coverage threshold not met |
| check:i18n | Any locale namespace has missing or extra keys vs. `es` source |
| test:e2e | Any Playwright failure (includes `vite build` + preview via `playwright.config.ts`) |
| test:integration | Any Vitest integration failure (`tests/integration/`; real PostgreSQL) |
| check:docs-map | Any path in `DOCUMENT_LOCALE_MAP.md` missing on disk |

## Services

The job starts a **PostgreSQL 16** service container (`DATABASE_URL` is set). After `prisma migrate deploy`, **`npm run test:integration`** runs HTTP + real Prisma tests under `tests/integration/`. API **contract** tests (`tests/api/`) still **mock** Prisma for OpenAPI validation ([ADR-0004](../adr/ADR-0004-e2e-playwright-integration-roadmap.md)).

## Artifacts

| Artifact | Retention | Contents |
|---|---|---|
| `coverage-report` | 14 days | `coverage/` directory (HTML, LCOV, text summary) |

## What Is NOT in CI

**Tauri desktop build** is excluded from CI (native WebKit/WebView2, display server, Rust toolchain). See workflow comments in `.github/workflows/ci.yml`.

## Documentation branch (`documentacion`)

The **orphan** branch `documentacion` contains **no application source** — only a snapshot of documentation suitable for static hosting (e.g. GitHub Pages).

| Item | Detail |
|---|---|
| Workflow | `.github/workflows/sync-documentacion.yml` |
| When it runs | `push` to **`main`** that touches `docs/**`, `Certificación-ISO/**`, root `README.md`, `AGENTS.md`, or `CONTRIBUTING.md`; or **`workflow_dispatch`** (Actions → *Sync documentacion branch*) |
| Manual ref | Optional input `source_ref` (default `main`) to copy from another branch or SHA |
| Code branches | Unchanged: work on `develop` / `feature/*` / `fix/*`, merge to `main` per [CONTRIBUTING](../../../CONTRIBUTING.md); this job **does not** land app code on `documentacion` |

## Optional / follow-up automation

- [x] **Sync `documentacion` orphan branch** from `main` — `.github/workflows/sync-documentacion.yml` (see *Documentation branch* above)
- [x] **`npm audit --audit-level=high`** after `npm ci` with `continue-on-error: true` (visibility without blocking the gate) — see [ADR-0006](../adr/ADR-0006-release-and-tauri-ci-workflows.md)
- [x] PostgreSQL-backed integration tests (Phase B, ADR-0004) — `tests/integration/`, `npm run test:integration`
- [x] **Tauri build on self-hosted runner** — `.github/workflows/tauri-selfhosted.yml` (`workflow_dispatch` only) — [ADR-0006](../adr/ADR-0006-release-and-tauri-ci-workflows.md)
- [x] **semantic-release** — `release.config.cjs`, `.github/workflows/release.yml` (`workflow_dispatch` on `main`) — [ADR-0006](../adr/ADR-0006-release-and-tauri-ci-workflows.md)

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
4. Verify required checks (`Quality Gate`, `Docs governance`, security checks).
5. Merge only when CI is green.

Documentation governance (Wiki vs controlled docs):

- Fast-changing operational notes can live in Wiki.
- Auditable/release-gated documentation must remain in repository docs.
- Reference: [Wiki vs controlled documentation policy](wiki-vs-controlled-docs-policy.md).

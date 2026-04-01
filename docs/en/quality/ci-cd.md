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
│  6. npm run type-check           ← blocks                   │
│  6b. npm run docs:generate       ← blocks                   │
│  6c. git diff (generated docs)   ← blocks                   │
│  7. npm run lint                 ← blocks                   │
│  8. npm run test:coverage        ← blocks (Vitest + coverage + API contract + a11y) │
│  9. npm run check:i18n           ← blocks                   │
│ 10. npx playwright install --with-deps chromium             │
│ 11. npm run test:e2e             ← blocks (Playwright smoke; see ADR-0004) │
│ 12. npm run test:integration     ← blocks (Prisma + PostgreSQL; ADR-0004 B) │
│ 13. npm run check:docs-map       ← blocks                   │
│ 14. Upload coverage artifact (always)                       │
└──────────────────────────────────────────────────────────────┘
```

## Triggers

| Event | Branches |
|---|---|
| `push` | `main`, `develop` |
| `pull_request` | targeting `main` |

## Blocking Conditions

| Step | Blocking condition |
|---|---|
| type-check | Any TypeScript compilation error |
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

## Optional / follow-up automation

- [x] **`npm audit --audit-level=high`** after `npm ci` with `continue-on-error: true` (visibility without blocking the gate) — see [ADR-0006](../adr/ADR-0006-release-and-tauri-ci-workflows.md)
- [x] PostgreSQL-backed integration tests (Phase B, ADR-0004) — `tests/integration/`, `npm run test:integration`
- [x] **Tauri build on self-hosted runner** — `.github/workflows/tauri-selfhosted.yml` (`workflow_dispatch` only) — [ADR-0006](../adr/ADR-0006-release-and-tauri-ci-workflows.md)
- [x] **semantic-release** — `release.config.cjs`, `.github/workflows/release.yml` (`workflow_dispatch` on `main`) — [ADR-0006](../adr/ADR-0006-release-and-tauri-ci-workflows.md)

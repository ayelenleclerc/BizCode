# Testing Strategy

**Standard:** ISO/IEC 29119-2 (Test Planning), ISO/IEC 29119-4 (Test Techniques)

---

## Testing Pyramid

```
          ┌──────────────────────────┐
          │   E2E (Playwright smoke) │   CI: Chromium, vite preview (see ADR-0004)
          ├──────────────────────────┤
          │   E2E (manual / Tauri)   │   Desktop shell not covered by Playwright harness
          ├──────────────────────────┤
          │   Integration (PostgreSQL) │   tests/integration/ — Prisma real, supertest (ADR-0004 phase B)
          ├──────────────────────────┤
          │   Unit + a11y            │   CI: 100% lines/functions/branches on src/lib/** and server/createApp.ts
          │   (Vitest+axe)           │       axe smoke on App (src/App.a11y.test.tsx)
          ├──────────────────────────┤
          │   API contract           │   tests/api/contract.test.ts (supertest + Ajv vs openapi.yaml)
          └──────────────────────────┘
```

## Coverage policy (three tiers)

BizCode distinguishes **normative targets**, **CI floors**, and **realistic ceilings**. Do not treat “100% unit tests” as a single global number over the whole repository.

### Tier 1 — Normative 100% (mandatory on change)

| Scope | Lines / functions / branches / statements | Notes |
|---|---|---|
| **`server/createApp.ts`** | **100%** | Enforced in CI today (see coverage report). |
| **`server.ts`** | **100%** | Bootstrap only; `server/main.ts` excluded from coverage ([ADR-0005](../adr/ADR-0005-vitest-coverage-server-bootstrap.md)). |
| **`src/lib/**` pure modules** | **100%** | Validators, invoice math, RBAC, migration helpers, plans/modules catalog, etc. |
| **`src/lib/api.ts`**, **`src/lib/portalApi.ts`** | **Ratchet toward 100%** | Large HTTP clients; new/changed endpoints need tests; prefer splitting into smaller modules over time. |

**PR rule:** any production change under Tier 1 must add or extend unit tests so touched files stay at **100% lines** (or improve `api.ts` / `portalApi.ts` coverage when those files change).

### Tier 2 — CI global floor (`vitest.config.ts`)

Vitest measures `coverage.include`: `server/**/*.ts`, `server.ts`, `src/**/*.{ts,tsx}` (see `vitest.config.ts`).

| Metric | Current floor (ratchet) | Enforcement |
|---|---|---|
| Lines | **66%** | `npm run test:coverage` in CI (`ci.yml`, `qa-validation.yml`, `frontend-validation.yml`) |
| Statements | **64%** | Same |
| Functions | **55%** | Same |
| Branches | **44%** | Same |

**Do not lower** these floors without an **ADR** and an update to this document (EN/ES/PT-BR). **Do not decrease** coverage in a PR. Raising the ratchet requires the same governance.

Widening `coverage.include` beyond Tier 1 paths requires an **ADR** ([ADR-0004](../adr/ADR-0004-e2e-playwright-integration-roadmap.md)).

### Tier 3 — Realistic ceiling on the current `include`

| Layer | Typical measured range (lines) | Practical ceiling |
|---|---|---|
| `server/createApp.ts`, `server.ts` | **100%** | **100%** |
| `server/services/**` | ~75–80% | ~85–90% with service unit tests |
| `server/routes/**` | ~65–70% | ~80–85% with contract + route tests |
| `src/pages/**` | ~15–80% (module-dependent) | ~70–80% on modules with UI tests |
| **Global (`include` as configured)** | ~**66%** (CI baseline) | ~**80–88%** with sustained effort |

**100% lines on the full `include` is not a short- or medium-term goal.** React pages, thin glue, and rarely exercised branches are covered by **component tests where valuable**, **API contract tests**, **integration tests** (`tests/integration/`), and **E2E smoke** — not solely by Vitest line coverage.

Additional coverage exclusions (bundler entries, `server/main.ts`, etc.) only with an **ADR** and explicit `vitest.config.ts` change — see [ADR-0003](../adr/ADR-0003-api-contract-testing.md), [ADR-0004](../adr/ADR-0004-e2e-playwright-integration-roadmap.md), and [ADR-0005](../adr/ADR-0005-vitest-coverage-server-bootstrap.md).

## Coverage targets (KPI summary)

| KPI | Target | Where enforced |
|-----|--------|----------------|
| Tier 1 files (`createApp.ts`, `server.ts`, pure `src/lib/**`) | **100%** lines on touched files | This document; reviewers + `npm run test:coverage` |
| Tier 2 global floor | See `vitest.config.ts` → `coverage.thresholds` | CI quality gates |
| Tier 3 ceiling | Ratchet upward only; no silent widening of `include` | ADR + strategy updates |
| API contract vs OpenAPI | All paths in `tests/api/contract.test.ts` pass | `npm run test` |
| E2E (Playwright) | Smoke + critical paths in `e2e/` pass on Chromium | `npm run test:e2e` |
| Integration (PostgreSQL) | `tests/integration/**` pass | `npm run test:integration` |
| Accessibility | `jest-axe` smoke + `@axe-core/playwright` on critical surfaces + ESLint `jsx-a11y` | `npm run test:a11y`, Playwright specs, `npm run lint` |

## Where suites run (local vs CI)

| Suite | Local command | CI workflow (evidence) |
|-------|---------------|-------------------------|
| Type-check | `npm run type-check` | `.github/workflows/ci.yml` |
| Lint (incl. jsx-a11y) | `npm run lint` | `ci.yml`, `frontend-validation.yml` |
| Unit + coverage | `npm run test`, `npm run test:coverage` | `ci.yml`, `qa-validation.yml` (`unit_tests`) |
| API contract | part of `npm run test` | `ci.yml` |
| OpenAPI syntax + route sync | `npm run docs:validate` | `ci.yml` |
| Integration | `npm run test:integration` (needs `DATABASE_URL`) | `ci.yml`, `qa-validation.yml` (`integration_tests`) |
| E2E Playwright | `npm run test:e2e` (uses `playwright.config.ts` webServer) | `ci.yml`, `qa-validation.yml` (`e2e_tests`) |
| A11y unit smoke | `npm run test:a11y` | `qa-validation.yml` (`accessibility_tests`) |
| Flake hunt (optional) | `npm run test:e2e:repeat` | Documented in QA job summary |
| Load smoke (optional) | `npm run perf:smoke` (requires [k6](https://k6.io/docs/get-started/installation/) CLI) | Not in default CI |

**Visual regression (Playwright):** use `expect(page).toHaveScreenshot()` in a dedicated spec; store baselines under revision control using **one** platform (typically Linux Chromium in CI) via `snapshotPathTemplate` in `playwright.config.ts` so paths do not vary by OS. This repository does not commit screenshot baselines yet; add them in a focused PR once a stable Linux baseline is generated in CI or a Linux runner.

**Environment parity (ports, Postgres, seed):** [test-environments-parity.md](test-environments-parity.md) · [Manual QA checklist](manual-qa-checklist.md)

## Tools

| Tool | Version | Purpose |
|---|---|---|
| Vitest | 4.x | Test runner, assertion library (`expect`), mock API (`vi`) |
| @vitest/coverage-v8 | 4.x | V8-based coverage instrumentation |
| @testing-library/react | latest | Component rendering in jsdom |
| @testing-library/jest-dom | latest | DOM matchers (`toBeInTheDocument`, etc.) |
| jest-axe | latest | Automated accessibility smoke on rendered DOM (WCAG via axe-core) |
| supertest | latest | HTTP requests to Express in API contract tests |
| @apidevtools/swagger-parser | latest | OpenAPI dereferencing to validate responses |
| yaml | latest | Local parse of `docs/api/openapi.yaml` (avoids fetch in Vitest) |
| ajv + ajv-formats | latest | JSON Schema validation of response bodies |
| jsdom | latest | DOM simulation for non-browser test environment |
| @playwright/test | 1.x | E2E smoke against Vite preview (`e2e/`) — see ADR-0004 |

## Test File Locations

```
src/lib/
  validators.test.ts   ← Pure function tests
  invoice.test.ts      ← Invoice calculation tests
  api.test.ts          ← HTTP client tests (Axios mocked)
src/test/
  setup.ts             ← Global test setup (jest-dom matchers, i18n)
App.a11y.test.tsx       ← axe smoke on initial route (API mocked)
tests/api/
  contract.test.ts      ← HTTP contract + 500 responses (Prisma mocked)
  validate-openapi-response.ts  ← Ajv against docs/api/openapi.yaml
  repartos.test.ts      ← Repartos + GPS ubicacion/activos (mocked Prisma)
  ordenes-entrega.test.ts ← Delivery orders + picking (mocked Prisma)
tests/server/
  server.test.ts        ← `server.ts` bootstrap (Prisma mocked; see ADR-0005)
  services/repartoUbicacionService.test.ts ← GPS retention and role gates
e2e/
  smoke.spec.ts         ← Playwright smoke (production bundle via vite preview)
tests/integration/
  api.integration.test.ts  ← HTTP + real Prisma against PostgreSQL (`npm run test:integration`; excluded from default Vitest)
  dbf-migration.integration.test.ts ← Generates minimal DBF fixtures at runtime and validates `scripts/migrate-from-dbf.ts` against PostgreSQL
  repartos.integration.test.ts ← Delivery routes with real Prisma when `DATABASE_URL` is set
```

Vitest **excludes** `e2e/**` (`vitest.config.ts`) so files under `e2e/` are only executed by Playwright. **`tests/integration/**`** is excluded from the default Vitest run (no `DATABASE_URL` required for `npm run test:coverage`); integration tests use `vitest.integration.config.ts`.

### Logistics API evidence (#140–#145)

| Area | Test files | Notes |
|------|------------|--------|
| Delivery routes | `tests/api/repartos.test.ts`, `tests/api/contract.test.ts` | CRUD, iniciar/cerrar, POD item, OpenAPI paths |
| GPS tracking | `tests/api/repartos.test.ts`, `tests/server/services/repartoUbicacionService.test.ts`, contract paths `/api/repartos/activos`, `.../ubicacion` | Module gate `logistics.gps`; `TEST_DEFAULT_MODULES` in [`server/middleware/tenantModules.ts`](../../../server/middleware/tenantModules.ts) |
| Warehouse picking | `tests/api/ordenes-entrega.test.ts`, contract `iniciar-picking` / `lista` | Module `logistics.picking` |
| KPIs and reports (#145) | `tests/api/logistica-reportes.test.ts`, `tests/server/services/logisticaReportesService.test.ts`, `src/pages/logistica/LogisticaReportesPanel.test.tsx`, contract `/api/logistica/kpis`, `reporte-choferes`, `reporte-zonas` | Module `logistics.dispatches`; `dispatchedAt` / ADR-0011; optional `choferId` on all three endpoints |
| Audit matrix (#84) | `tests/server/http-mutations-audit-coverage.test.ts` | Picking, repartos, GPS `ubicacion`, POD `reparto_item_pod_signed` |
| Integration | `tests/integration/repartos.integration.test.ts` | Optional; requires migrated PostgreSQL |

Contract tests mock Prisma; they validate HTTP status and OpenAPI response shapes. Service unit tests cover purge (7-day retention) and role gates without a database.

## Mocking Strategy

- **HTTP (Axios)**: Mocked via `vi.mock('axios')` using `vi.hoisted()` to create mock refs accessible in the factory function. This isolates tests from the network entirely.
- **Browser APIs**: `localStorage`, `console.*` are mocked via `vi.spyOn` where needed (e.g., silencing `console.assert` from in-library self-tests).
- **Database (Prisma)**: `api.test.ts` mocks Axios (HTTP client). **API contract** tests (`tests/api/contract.test.ts`) mock `PrismaClient` and validate responses against OpenAPI. **Integration** tests (`tests/integration/`) use a real `PrismaClient` and PostgreSQL ([ADR-0004](../adr/ADR-0004-e2e-playwright-integration-roadmap.md) phase B); they complement contract tests and do not duplicate OpenAPI validation in the same file.
- **Interactive API explorer (Swagger UI):** Served at `/api-docs` when the API runs (`npm run server`). Reference and agent policy: [swagger-openapi-ui-plan.md](swagger-openapi-ui-plan.md) (mirrored in ES/PT-BR per [DOCUMENT_LOCALE_MAP.md](../../DOCUMENT_LOCALE_MAP.md)). Does not replace contract tests or `docs/api/openapi.yaml`.

## Entry and Exit Criteria

**Entry (to run tests in CI):**
- All TypeScript files compile without errors (`tsc --noEmit`).
- ESLint reports zero errors.

**Exit (CI passes):**
- All unit/API tests pass (0 failures).
- E2E smoke passes (`npm run test:e2e` — Playwright + Chromium).
- Integration tests pass (`npm run test:integration` — requires migrated schema; CI runs `prisma migrate deploy` first).
- All coverage thresholds are met.
- Coverage report artifact is uploaded.

## Regression Policy

When a bug is found:
1. Write a test that reproduces the bug before fixing it.
2. Verify the test fails on the current code.
3. Fix the bug.
4. Verify the test passes.

This ensures the fix is covered and the bug cannot regress silently.

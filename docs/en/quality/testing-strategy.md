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
          │   Integration (future)   │   CI: PostgreSQL service available; tests not yet added (ADR-0004)
          ├──────────────────────────┤
          │   Unit + a11y            │   CI: 100% lines/functions/branches on src/lib/** and server/createApp.ts
          │   (Vitest+axe)           │       axe smoke on App (src/App.a11y.test.tsx)
          ├──────────────────────────┤
          │   API contract           │   tests/api/contract.test.ts (supertest + Ajv vs openapi.yaml)
          └──────────────────────────┘
```

## Coverage Policy

| Scope | Lines | Functions | Branches | Statements |
|---|---|---|---|---|
| **`src/lib/**/*.ts`** (excludes `*.test.ts`) | **100%** | **100%** | **100%** | **100%** |
| **`server/createApp.ts`** (Express API; injected Prisma) | **100%** | **100%** | **100%** | **100%** |

Additional coverage exclusions (bundler entries, `server.ts` bootstrap, React pages, etc.) only with an **ADR** and explicit `vitest.config.ts` change — see [ADR-0003](../adr/ADR-0003-api-contract-testing.md) and [ADR-0004](../adr/ADR-0004-e2e-playwright-integration-roadmap.md).

Thresholds are enforced by Vitest's `coverage.thresholds` configuration. The CI pipeline fails if any threshold is not met.

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
e2e/
  smoke.spec.ts         ← Playwright smoke (production bundle via vite preview)
```

Vitest **excludes** `e2e/**` (`vitest.config.ts`) so files under `e2e/` are only executed by Playwright.

## Mocking Strategy

- **HTTP (Axios)**: Mocked via `vi.mock('axios')` using `vi.hoisted()` to create mock refs accessible in the factory function. This isolates tests from the network entirely.
- **Browser APIs**: `localStorage`, `console.*` are mocked via `vi.spyOn` where needed (e.g., silencing `console.assert` from in-library self-tests).
- **Database (Prisma)**: `api.test.ts` mocks Axios (HTTP client). **API contract** tests (`tests/api/contract.test.ts`) mock `PrismaClient` and validate responses against OpenAPI; they do not replace **integration** tests against real PostgreSQL (Phase B in [ADR-0004](../adr/ADR-0004-e2e-playwright-integration-roadmap.md)).

## Entry and Exit Criteria

**Entry (to run tests in CI):**
- All TypeScript files compile without errors (`tsc --noEmit`).
- ESLint reports zero errors.

**Exit (CI passes):**
- All unit/API tests pass (0 failures).
- E2E smoke passes (`npm run test:e2e` — Playwright + Chromium).
- All coverage thresholds are met.
- Coverage report artifact is uploaded.

## Regression Policy

When a bug is found:
1. Write a test that reproduces the bug before fixing it.
2. Verify the test fails on the current code.
3. Fix the bug.
4. Verify the test passes.

This ensures the fix is covered and the bug cannot regress silently.

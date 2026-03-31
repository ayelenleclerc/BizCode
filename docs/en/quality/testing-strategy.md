# Testing Strategy

**Standard:** ISO/IEC 29119-2 (Test Planning), ISO/IEC 29119-4 (Test Techniques)

---

## Testing Pyramid

```
          ┌─────────────────┐
          │   E2E (Manual)  │   Smoke test per release
          ├─────────────────┤
          │  Integration    │   CI: PostgreSQL service (ready; current tests mock HTTP)
          │  (future)       │
          ├─────────────────┤
          │  Unit + a11y    │   CI: 100% lines/functions/branches on src/lib/** and server/createApp.ts
          │  (Vitest+axe)   │       axe smoke on App (src/App.a11y.test.tsx)
          ├─────────────────┤
          │  API contract   │   tests/api/contract.test.ts (supertest + Ajv vs openapi.yaml)
          └─────────────────┘
```

## Coverage Policy

| Scope | Lines | Functions | Branches | Statements |
|---|---|---|---|---|
| **`src/lib/**/*.ts`** (excludes `*.test.ts`) | **100%** | **100%** | **100%** | **100%** |
| **`server/createApp.ts`** (Express API; injected Prisma) | **100%** | **100%** | **100%** | **100%** |

Additional coverage exclusions (bundler entries, `server.ts` bootstrap, etc.) only with an **ADR** or approval in this strategy, named in `vitest.config.ts`. See [ADR-0003](../adr/ADR-0003-api-contract-testing.md).

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
```

## Mocking Strategy

- **HTTP (Axios)**: Mocked via `vi.mock('axios')` using `vi.hoisted()` to create mock refs accessible in the factory function. This isolates tests from the network entirely.
- **Browser APIs**: `localStorage`, `console.*` are mocked via `vi.spyOn` where needed (e.g., silencing `console.assert` from in-library self-tests).
- **Database (Prisma)**: `api.test.ts` mocks Axios (HTTP client). **API contract** tests (`tests/api/contract.test.ts`) mock `PrismaClient` and validate responses against OpenAPI; they do not replace a future integration test against real PostgreSQL in CI (service is already available in the workflow for evolution).

## Entry and Exit Criteria

**Entry (to run tests in CI):**
- All TypeScript files compile without errors (`tsc --noEmit`).
- ESLint reports zero errors.

**Exit (CI passes):**
- All test cases pass (0 failures).
- All coverage thresholds are met.
- Coverage report artifact is uploaded.

## Regression Policy

When a bug is found:
1. Write a test that reproduces the bug before fixing it.
2. Verify the test fails on the current code.
3. Fix the bug.
4. Verify the test passes.

This ensures the fix is covered and the bug cannot regress silently.

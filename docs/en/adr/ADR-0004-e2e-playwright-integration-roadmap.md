# ADR-0004: E2E automation (Playwright) and integration-test roadmap

**Status:** Accepted  
**Date:** 2026-03-31  
**ISO reference:** ISO/IEC 29119-2 (test planning), ISO/IEC 12207:2017 §6.4.9 (qualification testing)

---

## Context

- Contract tests ([ADR-0003](ADR-0003-api-contract-testing.md)) mock Prisma and validate HTTP + OpenAPI; they do not prove the full stack against a real database.
- The **desktop shell** is Tauri + WebView; the **web UI** is Vite + React.
- The project needs a **documented, phased** approach to automated E2E and future PostgreSQL integration tests without claiming coverage or tooling that does not exist in CI.

## Decision

1. **Automated E2E (Phase A — implemented):** use **Playwright** against **`vite preview`** after `vite build` (production bundle). Tests live under `e2e/`; CI installs **Chromium** only and runs `npm run test:e2e`. Initial scope: **smoke** (root route loads, `#root` visible, document title). This validates the SPA shell; it does **not** replace manual testing of the Tauri desktop wrapper or native integrations.
2. **PostgreSQL integration tests (Phase B — implemented):** the GitHub Actions workflow provides a **PostgreSQL 16** service and runs `npx prisma migrate deploy` before the main test steps. **Automated** integration tests live under `tests/integration/` (`npm run test:integration`, `vitest.integration.config.ts`): real `PrismaClient`, HTTP via supertest, tables reset with `TRUNCATE … CASCADE` between cases. They complement (do not replace) contract tests with mocked Prisma. Any material change to coverage scope or CI layout still warrants an ADR update.
3. **Vitest coverage scope:** any expansion of `coverage.include` in `vitest.config.ts` beyond `src/lib/**/*.ts`, `server/createApp.ts`, and `server.ts` requires a **new ADR** and explicit threshold updates (no silent widening). `server.ts` bootstrap is covered by [ADR-0005](ADR-0005-vitest-coverage-server-bootstrap.md).

## Consequences

- **Positive:** repeatable smoke E2E in CI; clear boundary between SPA web tests and Tauri/desktop.
- **Negative:** CI time and Playwright browser cache; `build:web` runs before preview (E2E job cost).
- **Maintenance:** update Playwright and smoke tests when routing or bootstrapping changes; keep `playwright.config.ts` aligned with Vite preview port.

## References

- [quality/testing-strategy.md](../quality/testing-strategy.md)
- `playwright.config.ts`, `e2e/smoke.spec.ts`
- `vitest.integration.config.ts`, `tests/integration/`
- `.github/workflows/ci.yml`

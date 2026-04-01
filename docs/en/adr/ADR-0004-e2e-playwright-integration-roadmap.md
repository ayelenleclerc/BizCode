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
2. **PostgreSQL integration tests (Phase B — not implemented here):** the GitHub Actions workflow already provides a **PostgreSQL 16** service. Adding **automated** tests that run migrations, seed data, and assert HTTP behaviour against a real DB is **deferred** until a dedicated backlog item: new ADR if thresholds or CI time change materially, plus `vitest` or `node:test` layout under `tests/integration/` (or similar).
3. **Vitest coverage scope:** any expansion of `coverage.include` in `vitest.config.ts` beyond `src/lib/**/*.ts` and `server/createApp.ts` requires a **new ADR** and explicit threshold updates (no silent widening).

## Consequences

- **Positive:** repeatable smoke E2E in CI; clear boundary between SPA web tests and Tauri/desktop.
- **Negative:** CI time and Playwright browser cache; `build:web` runs before preview (E2E job cost).
- **Maintenance:** update Playwright and smoke tests when routing or bootstrapping changes; keep `playwright.config.ts` aligned with Vite preview port.

## References

- [quality/testing-strategy.md](../quality/testing-strategy.md)
- `playwright.config.ts`, `e2e/smoke.spec.ts`
- `.github/workflows/ci.yml`

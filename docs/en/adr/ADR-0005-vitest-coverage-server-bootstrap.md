# ADR-0005: Vitest coverage scope — `server.ts` bootstrap

**Status:** Accepted  
**Date:** 2026-03-31  
**ISO reference:** ISO/IEC 29119-2 (test planning), ISO/IEC 12207:2017 §6.4.9 (qualification testing)

---

## Context

[ADR-0003](ADR-0003-api-contract-testing.md) and [ADR-0004](ADR-0004-e2e-playwright-integration-roadmap.md) require **explicit ADR + `vitest.config.ts` change** before widening `coverage.include` beyond `src/lib/**` and `server/createApp.ts`. HTTP logic lives in `createApp`; process bootstrap (listen, SIGINT) lived inline in `server.ts` without coverage.

## Decision

1. **Refactor** `server.ts` to export `createServerInstance`, `bindHttpServer`, and `startServer` (no side effects on import). **Entrypoint** for `npm run server` is `server/main.ts`, which calls `startServer()` only when launched via `tsx server/main.ts`.
2. **Coverage:** `vitest.config.ts` `coverage.include` adds **`server.ts`** with the **same 100% thresholds** (lines, functions, branches, statements) as existing scope. `server/main.ts` is **excluded** from coverage (thin re-export only).
3. **Tests:** `tests/server/server.test.ts` covers bootstrap behaviour; `PrismaClient` is **mocked** in that file so no database is required for coverage runs.

## Consequences

- **Positive:** bootstrap and graceful shutdown are regression-tested; `import '../../server'` from tests does not start a listener.
- **Negative:** maintainers must run `npm run server` via `server/main.ts`; scripts and docs updated accordingly.

## References

- [quality/testing-strategy.md](../quality/testing-strategy.md)
- `server.ts`, `server/main.ts`, `tests/server/server.test.ts`
- `vitest.config.ts`

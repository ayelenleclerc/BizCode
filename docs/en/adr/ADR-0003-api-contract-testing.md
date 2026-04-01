# ADR-0003: HTTP contract tests against OpenAPI

**Status:** Accepted
**Date:** 2026-03-31
**ISO Reference:** ISO/IEC 12207:2017 §6.4.9 (Software Qualification Testing)

---

## Context

The ISO-ready quality plan requires **integration/contract testing against OpenAPI** for the Express API, with blocking CI and documented exclusions.

## Decision

1. **Refactor** of `server.ts`: HTTP logic lives in `server/createApp.ts` exporting `createApp(prisma)` so a mocked `PrismaClient` can be injected in tests.
2. **Contract:** `tests/api/contract.test.ts` uses **supertest** against the app without listening on a port; responses are validated with **Ajv** + **@apidevtools/swagger-parser** (dereferenced spec) against `docs/api/openapi.yaml`.
3. **OpenAPI** is the source of truth for JSON **shape** (especially `success`/`data` and `error` on 500); the YAML was aligned with actual Express behaviour (`q` as query, `200` on POST, envelope `{ success, data }`).

## Consequences

- **Positive:** spec ↔ implementation drift is detected in CI; `server/createApp.ts` has 100% coverage under the same threshold as `src/lib/**`.
- **Negative:** maintain `openapi.yaml` when routes or response shapes change; contract tests depend on Prisma mocks (they do not replace E2E tests with real PostgreSQL).

## References

- `tests/api/validate-openapi-response.ts`
- `tests/api/contract.test.ts`
- [quality/testing-strategy.md](../quality/testing-strategy.md) (coverage scope)

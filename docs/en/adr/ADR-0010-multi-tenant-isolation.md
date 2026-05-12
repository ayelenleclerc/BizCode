# ADR-0010: Multi-tenant data isolation

**Status:** Accepted  
**Date:** 2026-05-12  
**ISO reference:** ISO/IEC 27001:2022 A.5.15 (access control); ISO 9001:2015 clause 8.5.1 (controlled operations)

---

## Context

BizCode stores business data in PostgreSQL with a `tenantId` column on tenant-scoped models (see Prisma schema). The API uses **cookie sessions** and `AuthClaims.tenantId` from [`server/auth.ts`](../../../server/auth.ts), not JWT access tokens. Issue #75 requires every authenticated handler to scope reads and writes to the caller’s tenant.

## Decision

1. After `resolveSession`, [`server/middleware/tenantContext.ts`](../../../server/middleware/tenantContext.ts) copies `req.auth.claims.tenantId` to `req.tenantId` when the session is present and the id is a positive integer.
2. REST handlers obtain the active tenant via [`getTenantId`](../../../server/routes/restDomainShared.ts) (preferring `req.tenantId`, falling back to claims).
3. **Rule:** Prisma queries for tenant-owned entities must include `tenantId` in `where` on reads and in `data` on creates; updates and deletes must verify ownership with `{ id, tenantId }` before mutating.
4. Domain services (`ClienteService`, `ArticuloService`, `FacturaService`, `ImportService`, etc.) take `tenantId` as an explicit parameter from routes — no global tenant filter in Prisma middleware.
5. **Exceptions:** `/api/health`, auth bootstrap/login, and unauthenticated routes do not attach tenant context; audit rows still record `tenantId` from the session when available.

## Consequences

- **Positive:** Single source of tenant id per request; test suite can assert `where.tenantId` on mocked Prisma calls; aligns with SaaS direction in [ADR-0007](ADR-0007-dual-deployment-and-fiscal-modularity.md).
- **Negative:** Each new route must continue to pass `tenantId` explicitly; mistakes are caught by review and API tests, not automatic ORM filtering.
- **Tests:** [`tests/api/tenant-isolation.test.ts`](../../../../tests/api/tenant-isolation.test.ts) and related API suites.

## References

- [ADR-0007: Dual deployment and fiscal modularity](ADR-0007-dual-deployment-and-fiscal-modularity.md)
- [`docs/api/openapi.yaml`](../../api/openapi.yaml)
- [`src/lib/rbac.ts`](../../../../src/lib/rbac.ts)

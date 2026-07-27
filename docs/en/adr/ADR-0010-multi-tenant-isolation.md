# ADR-0010: Multi-tenant data isolation

**Status:** Accepted (amended 2026-07-27, #215)  
**Date:** 2026-05-12  
**ISO reference:** ISO/IEC 27001:2022 A.5.15 (access control); ISO 9001:2015 clause 8.5.1 (controlled operations)

---

## Context

BizCode stores business data in PostgreSQL with a `tenantId` column (`Int`, not UUID) on tenant-scoped models (see Prisma schema). The API uses **cookie sessions** and `AuthClaims.tenantId` from [`server/auth.ts`](../../../server/auth.ts), not JWT access tokens. Issue #75 requires every authenticated handler to scope reads and writes to the caller’s tenant. Issue #215 adds PostgreSQL **FORCE ROW LEVEL SECURITY** as a second line of defense (anti-IDOR / SaaS isolation), without replacing application filters.

## Decision

1. After `resolveSession`, [`server/middleware/tenantContext.ts`](../../../server/middleware/tenantContext.ts) copies `req.auth.claims.tenantId` to `req.tenantId` when the session is present and the id is a positive integer. [`tenantRlsContext`](../../../apps/server/middleware/tenantRlsContext.ts) then binds that id into AsyncLocalStorage for RLS helpers.
2. REST handlers obtain the active tenant via [`getTenantId`](../../../server/routes/restDomainShared.ts) (preferring `req.tenantId`, falling back to claims).
3. **Rule (application — still mandatory):** Prisma queries for tenant-owned entities must include `tenantId` in `where` on reads and in `data` on creates; updates and deletes must verify ownership with `{ id, tenantId }` before mutating. High-traffic `:id` routes also use [`verifyOwnership`](../../../apps/server/middleware/verifyOwnership.ts) (404 when not in tenant).
4. Domain services (`ClienteService`, `ArticuloService`, `FacturaService`, `ImportService`, etc.) take `tenantId` as an explicit parameter from routes — **no ORM-level auto-filter that replaces explicit `tenantId`** (Prisma `$extends` does **not** inject `where.tenantId`; it only sets the DB GUC).
5. **Rule (database — #215):** On the AC-minimum tables below, PostgreSQL `ENABLE` + `FORCE ROW LEVEL SECURITY` applies. Policies compare `"tenantId"` to `NULLIF(current_setting('app.current_tenant_id', true), '')::int`. Missing/empty GUC → **0 rows** (fail-safe). Runtime sets the GUC with `set_config(..., true)` (**LOCAL**) inside the same interactive transaction as the queries ([`createTenantRlsPrisma`](../../../apps/server/lib/tenantRls.ts) / `runWithTenantRls`). Migrate/seed use a role with `BYPASSRLS` or superuser; the app runtime role must not bypass. Optional local role: `bizcode_app` (no bypass).
6. **RLS v1 inventory (Prisma model → column `tenantId`):** `Factura`, `Cliente`, `Proveedor`, `Articulo`, `Pedido`, `OrdenCompra`, `StockAjuste`, `Notification`, `AuditEvent` (issue wording “AuditLog”). Child rows without `tenantId` (`FacturaItem`, `PedidoItem`, …) are out of direct RLS in v1 (protected via parent + app filters).
7. **Exceptions:** `/api/health`, auth bootstrap/login, and unauthenticated routes may have null ALS tenant (RLS models then see 0 rows unless `runWithTenantRls` is used with an explicit id, e.g. audit writes). `BIZCODE_RLS_BYPASS=true` is only for documented seed/test helpers — not production.

## Consequences

- **Positive:** Defense in depth (app filter + FORCE RLS); single tenant id per request in ALS; test suite can assert `where.tenantId` and A↔B API isolation; aligns with SaaS direction in [ADR-0007](ADR-0007-dual-deployment-and-fiscal-modularity.md).
- **Negative:** Each new route must still pass `tenantId` explicitly; RLS v1 covers nine tables only; pool-safe GUC requires transaction-local `set_config`; superuser DB URLs still bypass RLS (use non-bypass app role in deploy).
- **Tests:** [`tests/api/tenant-isolation.test.ts`](../../../../tests/api/tenant-isolation.test.ts), [`tests/api/rls-isolation.test.ts`](../../../../tests/api/rls-isolation.test.ts), and related API suites.

## References

- [ADR-0007: Dual deployment and fiscal modularity](ADR-0007-dual-deployment-and-fiscal-modularity.md)
- [`docs/api/openapi.yaml`](../../api/openapi.yaml)
- [`src/lib/rbac.ts`](../../../../src/lib/rbac.ts)
- Issue #215 (RLS + anti-IDOR)

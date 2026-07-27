# ADR-0010: Aislamiento de datos multi-tenant

**Estado:** Aceptado (enmendado 2026-07-27, #215)  
**Fecha:** 2026-05-12  
**Referencia ISO:** ISO/IEC 27001:2022 A.5.15 (control de acceso); ISO 9001:2015 cláusula 8.5.1 (operaciones controladas)

---

## Contexto

BizCode persiste datos de negocio en PostgreSQL con columna `tenantId` (`Int`, no UUID) en modelos con alcance de tenant (véase el esquema Prisma). La API usa **sesión por cookie** y `AuthClaims.tenantId` desde [`server/auth.ts`](../../../server/auth.ts), no tokens JWT de acceso. El issue #75 exige que cada handler autenticado acote lecturas y escrituras al tenant del llamador. El issue #215 añade **FORCE ROW LEVEL SECURITY** en PostgreSQL como segunda línea de defensa (anti-IDOR / aislamiento SaaS), sin sustituir los filtros de aplicación.

## Decisión

1. Tras `resolveSession`, [`server/middleware/tenantContext.ts`](../../../server/middleware/tenantContext.ts) copia `req.auth.claims.tenantId` a `req.tenantId` cuando hay sesión y el id es un entero positivo. [`tenantRlsContext`](../../../apps/server/middleware/tenantRlsContext.ts) enlaza ese id en AsyncLocalStorage para helpers RLS.
2. Los handlers REST obtienen el tenant activo con [`getTenantId`](../../../server/routes/restDomainShared.ts) (prioriza `req.tenantId`, fallback a claims).
3. **Regla (aplicación — sigue siendo obligatoria):** las consultas Prisma de entidades por tenant deben incluir `tenantId` en `where` en lecturas y en `data` en altas; actualizaciones y bajas deben verificar pertenencia con `{ id, tenantId }` antes de mutar. Rutas `:id` de alto tráfico también usan [`verifyOwnership`](../../../apps/server/middleware/verifyOwnership.ts) (404 si no pertenece al tenant).
4. Los servicios de dominio reciben `tenantId` explícito desde las rutas — **sin auto-filtro ORM que reemplace `tenantId` explícito** (`$extends` de Prisma **no** inyecta `where.tenantId`; solo setea el GUC de BD).
5. **Regla (base de datos — #215):** En las tablas mínimas del AC, PostgreSQL aplica `ENABLE` + `FORCE ROW LEVEL SECURITY`. Las policies comparan `"tenantId"` con `NULLIF(current_setting('app.current_tenant_id', true), '')::int`. Sin GUC / vacío → **0 filas** (fail-safe). En runtime se setea con `set_config(..., true)` (**LOCAL**) en la misma transacción interactiva ([`createTenantRlsPrisma`](../../../apps/server/lib/tenantRls.ts) / `runWithTenantRls`). Migrate/seed: rol con `BYPASSRLS` o superuser; el rol de la app en runtime no debe hacer bypass. Rol local opcional: `bizcode_app`.
6. **Inventario RLS v1 (modelo Prisma → columna `tenantId`):** `Factura`, `Cliente`, `Proveedor`, `Articulo`, `Pedido`, `OrdenCompra`, `StockAjuste`, `Notification`, `AuditEvent` (en el issue: “AuditLog”). Hijos sin `tenantId` quedan fuera de RLS directa en v1.
7. **Excepciones:** rutas sin tenant en ALS ven 0 filas en modelos RLS salvo `runWithTenantRls` con id explícito. `BIZCODE_RLS_BYPASS=true` solo para helpers documentados de seed/test — no producción.

## Consecuencias

- **Pros:** Defensa en profundidad (filtro app + FORCE RLS); id de tenant por petición en ALS; pruebas A↔B y `where.tenantId`; alineado con SaaS en [ADR-0007](ADR-0007-dual-deployment-and-fiscal-modularity.md).
- **Contras:** Cada ruta nueva debe seguir pasando `tenantId`; RLS v1 cubre nueve tablas; el GUC seguro requiere `set_config` local a la transacción; URLs superuser siguen haciendo bypass de RLS.
- **Pruebas:** [`tests/api/tenant-isolation.test.ts`](../../../../tests/api/tenant-isolation.test.ts), [`tests/api/rls-isolation.test.ts`](../../../../tests/api/rls-isolation.test.ts) y suites API relacionadas.

## Referencias

- [ADR-0007: Despliegue dual y modularidad fiscal](ADR-0007-dual-deployment-and-fiscal-modularity.md)
- [`docs/api/openapi.yaml`](../../api/openapi.yaml)
- [`src/lib/rbac.ts`](../../../../src/lib/rbac.ts)
- Issue #215 (RLS + anti-IDOR)

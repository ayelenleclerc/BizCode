# ADR-0010: Aislamiento de datos multi-tenant

**Estado:** Aceptado  
**Fecha:** 2026-05-12  
**Referencia ISO:** ISO/IEC 27001:2022 A.5.15 (control de acceso); ISO 9001:2015 cláusula 8.5.1 (operaciones controladas)

---

## Contexto

BizCode persiste datos de negocio en PostgreSQL con columna `tenantId` en modelos con alcance de tenant (véase el esquema Prisma). La API usa **sesión por cookie** y `AuthClaims.tenantId` desde [`server/auth.ts`](../../../server/auth.ts), no tokens JWT de acceso. El issue #75 exige que cada handler autenticado acote lecturas y escrituras al tenant del llamador.

## Decisión

1. Tras `resolveSession`, [`server/middleware/tenantContext.ts`](../../../server/middleware/tenantContext.ts) copia `req.auth.claims.tenantId` a `req.tenantId` cuando hay sesión y el id es un entero positivo.
2. Los handlers REST obtienen el tenant activo con [`getTenantId`](../../../server/routes/restDomainShared.ts) (prioriza `req.tenantId`, fallback a claims).
3. **Regla:** las consultas Prisma de entidades por tenant deben incluir `tenantId` en `where` en lecturas y en `data` en altas; actualizaciones y bajas deben verificar pertenencia con `{ id, tenantId }` antes de mutar.
4. Los servicios de dominio (`ClienteService`, `ArticuloService`, `FacturaService`, `ImportService`, etc.) reciben `tenantId` explícito desde las rutas — sin filtro global de tenant en middleware Prisma.
5. **Excepciones:** `/api/health`, bootstrap/login de auth y rutas no autenticadas no adjuntan contexto de tenant; las filas de auditoría siguen registrando `tenantId` de la sesión cuando exista.

## Consecuencias

- **Pros:** Fuente única de tenant por petición; la suite de pruebas puede afirmar `where.tenantId` en mocks Prisma; alineado con SaaS en [ADR-0007](ADR-0007-dual-deployment-and-fiscal-modularity.md).
- **Contras:** Cada ruta nueva debe seguir pasando `tenantId` de forma explícita; los errores se detectan por revisión y pruebas API, no por filtrado ORM automático.
- **Pruebas:** [`tests/api/tenant-isolation.test.ts`](../../../../tests/api/tenant-isolation.test.ts) y suites API relacionadas.

## Referencias

- [ADR-0007: Despliegue dual y modularidad fiscal](ADR-0007-dual-deployment-and-fiscal-modularity.md)
- [`docs/api/openapi.yaml`](../../api/openapi.yaml)
- [`src/lib/rbac.ts`](../../../../src/lib/rbac.ts)

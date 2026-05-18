# Module catalog and feature flags (implementation record)

**Evidence:** GitHub issues #227 (catalog), #223 (per-tenant engine) · milestone v0.11.5

## Scope in repository

- **Catalog source of truth:** [`src/lib/modules/catalog.ts`](../../../src/lib/modules/catalog.ts) — `MODULE_CATALOG`, `DEFAULT_MODULES`, dependency graph, `required` / `requiredInProd` flags.
- **Validation:** [`src/lib/modules/validation.ts`](../../../src/lib/modules/validation.ts) — `validateModuleSet`, `canDeactivate`, cycle detection.
- **Presets:** [`src/lib/modules/presets.ts`](../../../src/lib/modules/presets.ts) — six business templates (e.g. `MAYORISTA_ALIMENTOS`, `MINORISTA_ROPA`); validated in [`tests/lib/modules-catalog.test.ts`](../../../tests/lib/modules-catalog.test.ts).
- **Deployment environment:** [`src/lib/modules/env.ts`](../../../src/lib/modules/env.ts) — `resolveDeploymentEnv()` from `APP_ENV` or `NODE_ENV` (never from tenant configuration).
- **HTTP (catalog):** `GET /api/modules/catalog` — [`server/routes/registerModulesCatalogRoute.ts`](../../../server/routes/registerModulesCatalogRoute.ts); OpenAPI contract; requires an authenticated session.
- **HTTP (tenant):** `GET /api/me/features` — enabled modules and integrations for the session tenant ([`server/routes/registerMeFeaturesRoute.ts`](../../../server/routes/registerMeFeaturesRoute.ts)).
- **Persistence:** `TenantConfig` / `TenantConfigHistory` in [`prisma/schema.prisma`](../../../prisma/schema.prisma); migration `20260518190000_tenant_config`.
- **Service:** [`server/services/TenantConfigService.ts`](../../../server/services/TenantConfigService.ts) — `validateModuleSet`, history, presets; in-process cache ([`server/services/tenantConfigCache.ts`](../../../server/services/tenantConfigCache.ts)) (no Redis in the repo).
- **Middleware:** [`server/middleware/requireModule.ts`](../../../server/middleware/requireModule.ts) + [`server/middleware/tenantModules.ts`](../../../server/middleware/tenantModules.ts); first consumer: `/api/pedidos` requires `billing.orders`.
- **SuperAdmin API:** `GET/PUT /api/superadmin/tenants/:id/config`, history, `POST .../apply-template` — [`server/routes/registerSuperadminTenantConfigRoutes.ts`](../../../server/routes/registerSuperadminTenantConfigRoutes.ts); requires `super_admin` and `platform.tenants.manage`.
- **Tenant bootstrap:** `POST /api/auth/setup-owner` and SuperAdmin seed create `TenantConfig` with [`NEW_TENANT_MODULES`](../../../src/lib/modules/tenantDefaults.ts); existing-tenant backfill includes `billing.orders` for #132 compatibility.

## `requiredInProd` (Argentina)

`billing.afip_cae` has `requiredInProd: true`: it must stay enabled when `deploymentEnv` is `prod`. In `dev`, super_admin may disable it for AFIP-free testing. Core modules (`core.*`) use `required: true` in all environments.

## Pending (#224–#225)

- **#224:** `useFeatureFlags` hook, conditional nav and routes in the SPA.
- **#225:** SuperAdmin UI `/superadmin/tenants/:id/modules` (depends on #137 multi-tenant panel).

## Related

- OpenAPI: [`docs/api/openapi.yaml`](../../api/openapi.yaml)
- Product vision (modular fiscal): [product-vision-and-deployment.md](product-vision-and-deployment.md)

**Other languages:** [Español](../../es/quality/catalogo-modulos-y-feature-flags.md) · [Português (Brasil)](../../pt-br/quality/catalogo-modulos-e-feature-flags.md)

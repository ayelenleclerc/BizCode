# Module catalog and feature flags (implementation record)

**Evidence:** GitHub issues #227 (catalog), #223 (per-tenant engine), #224 (frontend), #226 (pricing/trials), #181 (SaaS plans) · milestones v0.11.5 / v0.11.0

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
- **Frontend (#224):** [`src/contexts/FeatureFlagsContext.tsx`](../../../src/contexts/FeatureFlagsContext.tsx) (`useFeatureFlags`, `FeatureFlagsGate`); [`src/components/IfModule.tsx`](../../../src/components/IfModule.tsx); [`src/components/ModuleRoute.tsx`](../../../src/components/ModuleRoute.tsx); nav map in [`src/components/layout/navSections.ts`](../../../src/components/layout/navSections.ts); loaded after login via `featuresAPI.get()` in [`src/lib/api.ts`](../../../src/lib/api.ts); i18n `modules.*` labels; `/inicio` alert via `errors.moduleNotEnabled`.
- **SuperAdmin UI (#225):** [`src/pages/superadmin/TenantModulesPage.tsx`](../../../src/pages/superadmin/TenantModulesPage.tsx) at `/superadmin/tenants/:tenantId/modules`; client `superadminAPI.getConfig` / `putConfig` / `getConfigHistory` / `applyConfigTemplate` and `modulesCatalogAPI.get()` in [`src/lib/api.ts`](../../../src/lib/api.ts); toggles with UX validation (`canDeactivate`, dependencies); required reason on save; presets and history.
- **Pricing and trials (#226):** [`src/lib/modules/pricing.ts`](../../../src/lib/modules/pricing.ts) (`PLAN_BASE_MONTHLY_ARS`, `estimateTenantMonthlyPrice`); `GET /api/superadmin/tenants/:id/pricing` ([`TenantPricingService`](../../../server/services/TenantPricingService.ts)); `TenantModuleTrial` + `GET/POST/DELETE .../trials` ([`TenantTrialService`](../../../server/services/TenantTrialService.ts)); job `npm run modules:trial-expire` ([`scripts/module-trial-expire-job.ts`](../../../scripts/module-trial-expire-job.ts)); notification `module_trial_expiring` to tenant owners; UI pricing panel and trial controls on `TenantModulesPage`.
- **SaaS plans (#181):** `Plan` / `TenantPlan` models; catalog [`src/lib/plans/catalog.ts`](../../../src/lib/plans/catalog.ts); `GET /api/planes`, `GET /api/me/plan`, `POST /api/superadmin/tenants/:id/plan`; `requirePlanFeature` middleware and hard limits on `POST /api/users` / `POST /api/facturas`; `PlanProvider` / `PlanGate`; plan selector on `TenantDetailPage`. External payment (MP) **out of scope** in this slice.

## Logistics modules (#140–#145)

| Module key | Catalog label | UI / API gate (evidence) |
|------------|---------------|---------------------------|
| `logistics.dispatches` | Repartos + reportes | `ModuleRoute` on `/logistica`, `/logistica/repartos`, `/logistica/repartos/chofer`; **Reports** tab on `/logistica` (#145, no new module key); `requireModule('logistics.dispatches')` on `GET /api/logistica/*` in [`registerLogisticaReportesRoutes.ts`](../../../server/routes/registerLogisticaReportesRoutes.ts); nav in [`navSections.ts`](../../../src/components/layout/navSections.ts); `/api/repartos` routes (permission `logistics.read` / dispatch permissions) |
| `logistics.picking` | Picking | `ModuleRoute` on `/logistica/picking`; `requireModule('logistics.picking')` on picking endpoints in [`registerOrdenesEntregaRoutes.ts`](../../../server/routes/registerOrdenesEntregaRoutes.ts) |
| `logistics.pod` | POD firma | `hasModule('logistics.pod')` in chofer wizard and tracking panel; POD `PUT` on reparto items (permissions `orders.deliver.confirm`) |
| `logistics.gps` | Tracking GPS | `ModuleRoute` on `/logistica/seguimiento`; `requireModule('logistics.gps')` on `activos` / `ubicacion` / `ubicacion/ultima` in [`registerRepartosRoutes.ts`](../../../server/routes/registerRepartosRoutes.ts) |

Dependencies (from [`catalog.ts`](../../../src/lib/modules/catalog.ts)): `logistics.picking` → `logistics.dispatches` + `inventory.stock`; `logistics.pod` and `logistics.gps` → `logistics.dispatches`. Retention job: `npm run reparto-ubicacion:purge` ([`scripts/reparto-ubicacion-purge-job.ts`](../../../scripts/reparto-ubicacion-purge-job.ts)).

## `requiredInProd` (Argentina)

`billing.arca_cae` has `requiredInProd: true`: it must stay enabled when `deploymentEnv` is `prod`. In `dev`, super_admin may disable it for AFIP-free testing. Core modules (`core.*`) use `required: true` in all environments.

## Related

- OpenAPI: [`docs/api/openapi.yaml`](../../api/openapi.yaml)
- Product vision (modular fiscal): [product-vision-and-deployment.md](product-vision-and-deployment.md)

**Other languages:** [Español](../../es/quality/catalogo-modulos-y-feature-flags.md) · [Português (Brasil)](../../pt-br/quality/catalogo-modulos-e-feature-flags.md)

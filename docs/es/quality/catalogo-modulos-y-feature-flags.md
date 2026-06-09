# Catálogo de módulos y feature flags (registro de implementación)

**Evidencia:** issues GitHub #227 (catálogo), #223 (motor por tenant), #224 (frontend), #226 (pricing/trials), #181 (planes SaaS) · hitos v0.11.5 / v0.11.0

## Alcance en el repositorio

- **Fuente del catálogo:** [`src/lib/modules/catalog.ts`](../../../src/lib/modules/catalog.ts) — `MODULE_CATALOG`, `DEFAULT_MODULES`, grafo de dependencias, flags `required` / `requiredInProd`.
- **Validación:** [`src/lib/modules/validation.ts`](../../../src/lib/modules/validation.ts) — `validateModuleSet`, `canDeactivate`, detección de ciclos.
- **Presets:** [`src/lib/modules/presets.ts`](../../../src/lib/modules/presets.ts) — seis plantillas de negocio (p. ej. `MAYORISTA_ALIMENTOS`, `MINORISTA_ROPA`); validadas en [`tests/lib/modules-catalog.test.ts`](../../../tests/lib/modules-catalog.test.ts).
- **Ambiente de despliegue:** [`src/lib/modules/env.ts`](../../../src/lib/modules/env.ts) — `resolveDeploymentEnv()` desde `APP_ENV` o `NODE_ENV` (nunca desde configuración del tenant).
- **HTTP (catálogo):** `GET /api/modules/catalog` — [`server/routes/registerModulesCatalogRoute.ts`](../../../server/routes/registerModulesCatalogRoute.ts); contrato OpenAPI; exige sesión autenticada.
- **HTTP (tenant):** `GET /api/me/features` — módulos e integraciones del tenant de la sesión ([`server/routes/registerMeFeaturesRoute.ts`](../../../server/routes/registerMeFeaturesRoute.ts)).
- **Persistencia:** `TenantConfig` / `TenantConfigHistory` en [`prisma/schema.prisma`](../../../prisma/schema.prisma); migración `20260518190000_tenant_config`.
- **Servicio:** [`server/services/TenantConfigService.ts`](../../../server/services/TenantConfigService.ts) — validación con `validateModuleSet`, historial, presets; caché en memoria por proceso ([`server/services/tenantConfigCache.ts`](../../../server/services/tenantConfigCache.ts)) (sin Redis en el repo).
- **Middleware:** [`server/middleware/requireModule.ts`](../../../server/middleware/requireModule.ts) + [`server/middleware/tenantModules.ts`](../../../server/middleware/tenantModules.ts); primer consumidor: `/api/pedidos` exige `billing.orders`.
- **SuperAdmin API:** `GET/PUT /api/superadmin/tenants/:id/config`, historial y `POST .../apply-template` — [`server/routes/registerSuperadminTenantConfigRoutes.ts`](../../../server/routes/registerSuperadminTenantConfigRoutes.ts); requiere rol `super_admin` y permiso `platform.tenants.manage`.
- **Alta de tenant:** `POST /api/auth/setup-owner` y seed SuperAdmin crean fila `TenantConfig` con [`NEW_TENANT_MODULES`](../../../src/lib/modules/tenantDefaults.ts); backfill de tenants existentes incluye `billing.orders` por compatibilidad con #132.
- **Frontend (#224):** [`src/contexts/FeatureFlagsContext.tsx`](../../../src/contexts/FeatureFlagsContext.tsx) (`useFeatureFlags`, `FeatureFlagsGate`); [`src/components/IfModule.tsx`](../../../src/components/IfModule.tsx); [`src/components/ModuleRoute.tsx`](../../../src/components/ModuleRoute.tsx); mapa nav en [`src/components/layout/navSections.ts`](../../../src/components/layout/navSections.ts); carga tras login vía `featuresAPI.get()` en [`src/lib/api.ts`](../../../src/lib/api.ts); etiquetas i18n `modules.*` en locales; alerta en `/inicio` con `errors.moduleNotEnabled`.
- **SuperAdmin UI (#225):** [`src/pages/superadmin/TenantModulesPage.tsx`](../../../src/pages/superadmin/TenantModulesPage.tsx) en `/superadmin/tenants/:tenantId/modules`; cliente `superadminAPI.getConfig` / `putConfig` / `getConfigHistory` / `applyConfigTemplate` y `modulesCatalogAPI.get()` en [`src/lib/api.ts`](../../../src/lib/api.ts); toggles con validación UX (`canDeactivate`, dependencias); motivo obligatorio al guardar; plantillas y historial.
- **Pricing y trials (#226):** [`src/lib/modules/pricing.ts`](../../../src/lib/modules/pricing.ts); `GET /api/superadmin/tenants/:id/pricing`; modelo `TenantModuleTrial` y `GET/POST/DELETE .../trials`; job `npm run modules:trial-expire`; notificación `module_trial_expiring` a owners; panel de precio y controles de trial en `TenantModulesPage`.
- **Planes SaaS (#181):** modelos `Plan` / `TenantPlan`; catálogo en [`src/lib/plans/catalog.ts`](../../../src/lib/plans/catalog.ts); `GET /api/planes`, `GET /api/me/plan`, `POST /api/superadmin/tenants/:id/plan`; middleware `requirePlanFeature` y límites hard en `POST /api/users` / `POST /api/facturas`; `PlanProvider` / `PlanGate` en frontend; selector de plan en `TenantDetailPage`. Cobro externo (MP) **fuera de alcance** en este slice.

## Módulos de logística (#140–#145)

| Clave | Etiqueta catálogo | Puerta UI / API (evidencia) |
|-------|-------------------|-----------------------------|
| `logistics.dispatches` | Repartos + reportes | `ModuleRoute` en `/logistica`, `/logistica/repartos`, `/logistica/repartos/chofer`; pestaña **Reportes** en `/logistica` (#145, sin clave nueva); `requireModule('logistics.dispatches')` en `GET /api/logistica/*` ([`registerLogisticaReportesRoutes.ts`](../../../server/routes/registerLogisticaReportesRoutes.ts)); nav en [`navSections.ts`](../../../src/components/layout/navSections.ts); rutas `/api/repartos` (permisos RBAC) |
| `logistics.picking` | Picking | `ModuleRoute` en `/logistica/picking`; `requireModule('logistics.picking')` en endpoints de picking en [`registerOrdenesEntregaRoutes.ts`](../../../server/routes/registerOrdenesEntregaRoutes.ts) |
| `logistics.pod` | POD firma | `hasModule('logistics.pod')` en wizard chofer y panel de seguimiento; `PUT` POD en ítems de reparto |
| `logistics.gps` | Tracking GPS | `ModuleRoute` en `/logistica/seguimiento`; `requireModule('logistics.gps')` en `activos` / `ubicacion` / `ubicacion/ultima` en [`registerRepartosRoutes.ts`](../../../server/routes/registerRepartosRoutes.ts) |

Dependencias ([`catalog.ts`](../../../src/lib/modules/catalog.ts)): `logistics.picking` → `logistics.dispatches` + `inventory.stock`; `logistics.pod` y `logistics.gps` → `logistics.dispatches`. Job de retención: `npm run reparto-ubicacion:purge`.

## `requiredInProd` (Argentina)

`billing.arca_cae` tiene `requiredInProd: true`: debe permanecer activo cuando `deploymentEnv` es `prod`. En `dev`, super_admin puede desactivarlo para pruebas sin AFIP. Los módulos core (`core.*`) usan `required: true` en todos los ambientes.

## Relacionado

- OpenAPI: [`docs/api/openapi.yaml`](../../api/openapi.yaml)
- Visión de producto (fiscal modular): [vision-producto-y-despliegue.md](vision-producto-y-despliegue.md)

**Otros idiomas:** [English](../../en/quality/module-catalog-and-feature-flags.md) · [Português (Brasil)](../../pt-br/quality/catalogo-modulos-e-feature-flags.md)

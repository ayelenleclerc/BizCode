# Catálogo de módulos y feature flags (registro de implementación)

**Evidencia:** issues GitHub #227 (catálogo), #223 (motor por tenant), #224 (frontend) · hito v0.11.5

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

## `requiredInProd` (Argentina)

`billing.afip_cae` tiene `requiredInProd: true`: debe permanecer activo cuando `deploymentEnv` es `prod`. En `dev`, super_admin puede desactivarlo para pruebas sin AFIP. Los módulos core (`core.*`) usan `required: true` en todos los ambientes.

## Pendiente (#225)

- **#225:** UI SuperAdmin `/superadmin/tenants/:id/modules` (depende de #137 panel multi-tenant).

## Relacionado

- OpenAPI: [`docs/api/openapi.yaml`](../../api/openapi.yaml)
- Visión de producto (fiscal modular): [vision-producto-y-despliegue.md](vision-producto-y-despliegue.md)

**Otros idiomas:** [English](../../en/quality/module-catalog-and-feature-flags.md) · [Português (Brasil)](../../pt-br/quality/catalogo-modulos-e-feature-flags.md)

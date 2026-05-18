# Catálogo de módulos y feature flags (registro de implementación)

**Evidencia:** issue GitHub #227 · hito v0.11.5

## Alcance en el repositorio

- **Fuente del catálogo:** [`src/lib/modules/catalog.ts`](../../../src/lib/modules/catalog.ts) — `MODULE_CATALOG`, `DEFAULT_MODULES`, grafo de dependencias, flags `required` / `requiredInProd`.
- **Validación:** [`src/lib/modules/validation.ts`](../../../src/lib/modules/validation.ts) — `validateModuleSet`, `canDeactivate`, detección de ciclos.
- **Presets:** [`src/lib/modules/presets.ts`](../../../src/lib/modules/presets.ts) — seis plantillas de negocio (p. ej. `MAYORISTA_ALIMENTOS`, `MINORISTA_ROPA`); validadas en [`tests/lib/modules-catalog.test.ts`](../../../tests/lib/modules-catalog.test.ts).
- **Ambiente de despliegue:** [`src/lib/modules/env.ts`](../../../src/lib/modules/env.ts) — `resolveDeploymentEnv()` desde `APP_ENV` o `NODE_ENV` (nunca desde configuración del tenant).
- **HTTP:** `GET /api/modules/catalog` — registrado en [`server/routes/registerModulesCatalogRoute.ts`](../../../server/routes/registerModulesCatalogRoute.ts); contrato OpenAPI `/api/modules/catalog`; exige sesión autenticada.

## `requiredInProd` (Argentina)

`billing.afip_cae` tiene `requiredInProd: true`: debe permanecer activo cuando `deploymentEnv` es `prod`. En `dev`, super_admin puede desactivarlo para pruebas sin AFIP. Los módulos core (`core.*`) usan `required: true` en todos los ambientes.

## Fuera de alcance (#223–#225)

Módulos habilitados por tenant (`TenantConfig`), `GET /api/me/features`, middleware `requireModule`, UI de toggles en SuperAdmin y aplicar `DEFAULT_MODULES` al crear tenant están en los issues #223–#225.

## Relacionado

- OpenAPI: [`docs/api/openapi.yaml`](../../api/openapi.yaml)
- Visión de producto (fiscal modular): [vision-producto-y-despliegue.md](vision-producto-y-despliegue.md)

**Otros idiomas:** [English](../../en/quality/module-catalog-and-feature-flags.md) · [Português (Brasil)](../../pt-br/quality/catalogo-modulos-e-feature-flags.md)

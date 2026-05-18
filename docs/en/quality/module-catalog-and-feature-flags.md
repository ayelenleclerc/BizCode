# Module catalog and feature flags (implementation record)

**Evidence:** GitHub issue #227 · milestone v0.11.5

## Scope in repository

- **Catalog source of truth:** [`src/lib/modules/catalog.ts`](../../../src/lib/modules/catalog.ts) — `MODULE_CATALOG`, `DEFAULT_MODULES`, dependency graph, `required` / `requiredInProd` flags.
- **Validation:** [`src/lib/modules/validation.ts`](../../../src/lib/modules/validation.ts) — `validateModuleSet`, `canDeactivate`, cycle detection.
- **Presets:** [`src/lib/modules/presets.ts`](../../../src/lib/modules/presets.ts) — six business templates (e.g. `MAYORISTA_ALIMENTOS`, `MINORISTA_ROPA`); validated in [`tests/lib/modules-catalog.test.ts`](../../../tests/lib/modules-catalog.test.ts).
- **Deployment environment:** [`src/lib/modules/env.ts`](../../../src/lib/modules/env.ts) — `resolveDeploymentEnv()` from `APP_ENV` or `NODE_ENV` (never from tenant configuration).
- **HTTP:** `GET /api/modules/catalog` — registered in [`server/routes/registerModulesCatalogRoute.ts`](../../../server/routes/registerModulesCatalogRoute.ts); OpenAPI path `/api/modules/catalog`; requires an authenticated session.

## `requiredInProd` (Argentina)

`billing.afip_cae` has `requiredInProd: true`: it must stay enabled when `deploymentEnv` is `prod`. In `dev`, super_admin may disable it for AFIP-free testing. Core modules (`core.*`) use `required: true` in all environments.

## Out of scope (#223–#225)

Per-tenant enabled modules (`TenantConfig`), `GET /api/me/features`, `requireModule` middleware, SuperAdmin toggle UI, and applying `DEFAULT_MODULES` on tenant create are tracked in follow-up issues #223–#225.

## Related

- OpenAPI: [`docs/api/openapi.yaml`](../../api/openapi.yaml)
- Product vision (modular fiscal): [product-vision-and-deployment.md](product-vision-and-deployment.md)

**Other languages:** [Español](../../es/quality/catalogo-modulos-y-feature-flags.md) · [Português (Brasil)](../../pt-br/quality/catalogo-modulos-e-feature-flags.md)

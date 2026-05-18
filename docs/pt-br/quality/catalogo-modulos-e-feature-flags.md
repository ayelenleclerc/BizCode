# Catálogo de módulos e feature flags (registro de implementação)

**Evidência:** issues GitHub #227 (catálogo), #223 (motor por tenant), #224 (frontend) · marco v0.11.5

## Escopo no repositório

- **Fonte do catálogo:** [`src/lib/modules/catalog.ts`](../../../src/lib/modules/catalog.ts) — `MODULE_CATALOG`, `DEFAULT_MODULES`, grafo de dependências, flags `required` / `requiredInProd`.
- **Validação:** [`src/lib/modules/validation.ts`](../../../src/lib/modules/validation.ts) — `validateModuleSet`, `canDeactivate`, detecção de ciclos.
- **Presets:** [`src/lib/modules/presets.ts`](../../../src/lib/modules/presets.ts) — seis templates de negócio (ex.: `MAYORISTA_ALIMENTOS`, `MINORISTA_ROPA`); validados em [`tests/lib/modules-catalog.test.ts`](../../../tests/lib/modules-catalog.test.ts).
- **Ambiente de implantação:** [`src/lib/modules/env.ts`](../../../src/lib/modules/env.ts) — `resolveDeploymentEnv()` a partir de `APP_ENV` ou `NODE_ENV` (nunca da configuração do tenant).
- **HTTP (catálogo):** `GET /api/modules/catalog` — [`server/routes/registerModulesCatalogRoute.ts`](../../../server/routes/registerModulesCatalogRoute.ts); contrato OpenAPI; exige sessão autenticada.
- **HTTP (tenant):** `GET /api/me/features` — módulos e integrações do tenant da sessão ([`server/routes/registerMeFeaturesRoute.ts`](../../../server/routes/registerMeFeaturesRoute.ts)).
- **Persistência:** `TenantConfig` / `TenantConfigHistory` em [`prisma/schema.prisma`](../../../prisma/schema.prisma); migração `20260518190000_tenant_config`.
- **Serviço:** [`server/services/TenantConfigService.ts`](../../../server/services/TenantConfigService.ts) — `validateModuleSet`, histórico, presets; cache em processo ([`server/services/tenantConfigCache.ts`](../../../server/services/tenantConfigCache.ts)) (sem Redis no repo).
- **Middleware:** [`server/middleware/requireModule.ts`](../../../server/middleware/requireModule.ts) + [`server/middleware/tenantModules.ts`](../../../server/middleware/tenantModules.ts); primeiro consumidor: `/api/pedidos` exige `billing.orders`.
- **API SuperAdmin:** `GET/PUT /api/superadmin/tenants/:id/config`, histórico e `POST .../apply-template` — [`server/routes/registerSuperadminTenantConfigRoutes.ts`](../../../server/routes/registerSuperadminTenantConfigRoutes.ts); exige `super_admin` e permissão `platform.tenants.manage`.
- **Criação de tenant:** `POST /api/auth/setup-owner` e seed SuperAdmin criam `TenantConfig` com [`NEW_TENANT_MODULES`](../../../src/lib/modules/tenantDefaults.ts); backfill de tenants existentes inclui `billing.orders` por compatibilidade com #132.
- **Frontend (#224):** [`src/contexts/FeatureFlagsContext.tsx`](../../../src/contexts/FeatureFlagsContext.tsx) (`useFeatureFlags`, `FeatureFlagsGate`); [`src/components/IfModule.tsx`](../../../src/components/IfModule.tsx); [`src/components/ModuleRoute.tsx`](../../../src/components/ModuleRoute.tsx); mapa de nav em [`src/components/layout/navSections.ts`](../../../src/components/layout/navSections.ts); carga após login via `featuresAPI.get()` em [`src/lib/api.ts`](../../../src/lib/api.ts); rótulos i18n `modules.*`; alerta em `/inicio` com `errors.moduleNotEnabled`.

## `requiredInProd` (Argentina)

`billing.afip_cae` tem `requiredInProd: true`: deve permanecer ativo quando `deploymentEnv` é `prod`. Em `dev`, super_admin pode desativá-lo para testes sem AFIP. Módulos core (`core.*`) usam `required: true` em todos os ambientes.

## Pendente (#225)

- **#225:** UI SuperAdmin `/superadmin/tenants/:id/modules` (depende de #137 painel multi-tenant).

## Relacionado

- OpenAPI: [`docs/api/openapi.yaml`](../../api/openapi.yaml)
- Visão de produto (fiscal modular): [visao-produto-e-implantacao.md](visao-produto-e-implantacao.md)

**Outros idiomas:** [English](../../en/quality/module-catalog-and-feature-flags.md) · [Español](../../es/quality/catalogo-modulos-y-feature-flags.md)

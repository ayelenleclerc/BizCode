# Catálogo de módulos e feature flags (registro de implementação)

**Evidência:** issue GitHub #227 · marco v0.11.5

## Escopo no repositório

- **Fonte do catálogo:** [`src/lib/modules/catalog.ts`](../../../src/lib/modules/catalog.ts) — `MODULE_CATALOG`, `DEFAULT_MODULES`, grafo de dependências, flags `required` / `requiredInProd`.
- **Validação:** [`src/lib/modules/validation.ts`](../../../src/lib/modules/validation.ts) — `validateModuleSet`, `canDeactivate`, detecção de ciclos.
- **Presets:** [`src/lib/modules/presets.ts`](../../../src/lib/modules/presets.ts) — seis templates de negócio (ex.: `MAYORISTA_ALIMENTOS`, `MINORISTA_ROPA`); validados em [`tests/lib/modules-catalog.test.ts`](../../../tests/lib/modules-catalog.test.ts).
- **Ambiente de implantação:** [`src/lib/modules/env.ts`](../../../src/lib/modules/env.ts) — `resolveDeploymentEnv()` a partir de `APP_ENV` ou `NODE_ENV` (nunca da configuração do tenant).
- **HTTP:** `GET /api/modules/catalog` — registrado em [`server/routes/registerModulesCatalogRoute.ts`](../../../server/routes/registerModulesCatalogRoute.ts); contrato OpenAPI `/api/modules/catalog`; exige sessão autenticada.

## `requiredInProd` (Argentina)

`billing.afip_cae` tem `requiredInProd: true`: deve permanecer ativo quando `deploymentEnv` é `prod`. Em `dev`, super_admin pode desativá-lo para testes sem AFIP. Módulos core (`core.*`) usam `required: true` em todos os ambientes.

## Fora de escopo (#223–#225)

Módulos ativos por tenant (`TenantConfig`), `GET /api/me/features`, middleware `requireModule`, UI de toggles no SuperAdmin e aplicar `DEFAULT_MODULES` na criação do tenant estão nos issues #223–#225.

## Relacionado

- OpenAPI: [`docs/api/openapi.yaml`](../../api/openapi.yaml)
- Visão de produto (fiscal modular): [visao-produto-e-implantacao.md](visao-produto-e-implantacao.md)

**Outros idiomas:** [English](../../en/quality/module-catalog-and-feature-flags.md) · [Español](../../es/quality/catalogo-modulos-y-feature-flags.md)

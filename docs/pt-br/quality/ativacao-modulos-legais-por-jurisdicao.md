# Ativação de módulos legais por jurisdição fiscal (#437)

**Escopo:** como o BizCode decide quais módulos legais um tenant pode usar, e como uma instalação declara os países que atende.

**Relacionado:** [ADR-0022](../../en/adr/ADR-0022-legal-module-activation-by-jurisdiction.md) · [ADR-0007](../../en/adr/ADR-0007-dual-deployment-and-fiscal-modularity.md) · [base-fiscal-multipais.md](base-fiscal-multipais.md)

---

## Três decisões independentes

| Decisão | Onde vive | Quem define |
|---|---|---|
| Quais países esta instalação atende | `BIZCODE_FISCAL_JURISDICTIONS`, `BIZCODE_DEFAULT_JURISDICTION` (ambiente do servidor) | Quem implanta a instalação |
| Em qual país um tenant é tributado | `TenantConfig.jurisdiccionFiscal` | O formulário de registro, ou o super-admin |
| Quais módulos esse tenant pode ativar | `ModuleDef.availableForCountries` (catálogo) | O catálogo, por módulo |

A jurisdição é lida apenas do ambiente do servidor, nunca da configuração do tenant, seguindo a mesma regra de `resolveDeploymentEnv`.

## Declarar a aplicabilidade no catálogo

`ModuleDef.availableForCountries` lista as jurisdições em que um módulo é legalmente aplicável. **Omiti-lo significa que o módulo se aplica em toda parte**, portanto declarar a propriedade é o que o restringe:

```ts
'billing.arca_cae': {
  label: 'ARCA CAE',
  required: false,
  requiredInProd: false,
  requiredInProdForCountries: ['AR'],
  availableForCountries: ['AR'],
  dependencies: ['core.invoicing'],
  plan: 'starter',
  price: 0,
},
```

Hoje há quatro módulos restritos a `['AR']`: `billing.arca_cae`, `finance.retenciones`, `fiscal.remito` e `fiscal.cheques`.

Note a diferença em relação a `requiredInProdForCountries`, introduzido em #207: aquele indica onde um módulo é **obrigatório em produção**, este indica onde ele é **sequer aplicável**. Um módulo pode ser aplicável e ainda assim opcional.

### O que a aplicabilidade impõe

- `getDefaultModulesForJurisdiction(code)` filtra `DEFAULT_MODULES`, de modo que um tenant tributado fora da Argentina não começa com os módulos argentinos.
- `validateModuleSet` retorna `not_available_in_country:<code>` quando há um módulo não aplicável ativo.
- `buildModuleCatalogPayload` omite esses módulos, e recorta os presets, para que a UI de super-admin não os ofereça.
- Um módulo não aplicável nunca é tratado como obrigatório, então a validação de produção não exige um módulo que o tenant não pode usar.

## Declarar as jurisdições de uma instalação

```bash
# Jurisdições oferecidas por esta instalação. Sem definir: todas as do catálogo.
BIZCODE_FISCAL_JURISDICTIONS=AR,UY
# Jurisdição dos tenants criados sem escolha explícita. Sem definir: AR.
BIZCODE_DEFAULT_JURISDICTION=AR
```

`resolveInstallationJurisdictions` (`apps/web/src/lib/modules/jurisdictionEnv.ts`) aplica estas regras:

- Os valores são aparados, convertidos para maiúsculas e deduplicados; códigos desconhecidos são ignorados.
- Se nada válido sobreviver, todas as jurisdições do catálogo são habilitadas: o comportamento anterior a #437.
- Um padrão explícito é sempre forçado para dentro das habilitadas; quando `AR` não está habilitada, o padrão passa a ser a primeira habilitada. O padrão resolvido, portanto, está sempre habilitado.

Os códigos suportados vêm de `FISCAL_JURISDICTION_CODES`: `AR`, `UY`.

## Efeito na criação de tenants

Todos os caminhos que criam um tenant escrevem `jurisdiccionFiscal` explicitamente por meio de `buildNewTenantFiscalDefaults` (`apps/server/services/tenantProvisioningDefaults.ts`), em vez de depender do padrão `'AR'` da coluna:

| Caminho | Arquivo |
|---|---|
| Registro SaaS público | `apps/server/saas/SaasOnboardingService.ts` |
| Criação do primeiro owner | `apps/server/auth.ts` (`setup-owner`) |
| Criação pelo super-admin | `apps/server/services/SuperadminTenantService.ts` |
| Configuração criada sob demanda | `apps/server/services/TenantConfigService.ts`, `apps/server/services/SellerAlertService.ts` |
| Seeds | `prisma/seedSuperAdmin.ts`, `scripts/seed-staging.ts` |

## Efeito nas interfaces

- **Registro público** (`apps/web/src/pages/saas/RegistroPage.tsx`): seletor de país alimentado por `GET /api/saas/jurisdictions`, oculto quando a instalação oferece uma única jurisdição. O rótulo do identificador fiscal segue o `taxIdKind` da jurisdição e o campo carrega `data-tax-id-kind`.
- **Backend de registro:** valida com `validateTaxId` para a jurisdição escolhida, rejeita uma desabilitada com `JURISDICTION_NOT_ENABLED` e consulta o cadastro da ARCA apenas para `AR`.
- **Super-admin** (`TenantModulesPage.tsx`): o seletor de jurisdição oferece as habilitadas, mais o valor atual do tenant para não reescrever silenciosamente uma configuração existente. `GET /api/me/features` as informa em `jurisdiccionesHabilitadas`.
- **`upsertConfig`:** rejeita uma jurisdição desabilitada com `jurisdiction_not_enabled`; `applyPreset` recorta o preset ao que é aplicável.

## Fora de escopo

Nenhuma transmissão real a órgão fiscal é implementada. DGI (Uruguai), SII (Chile), SAT (México) e NF-e (Brasil) exigem certificado digital e homologação, e continuam sendo stubs que falham de forma explícita. O licenciamento por jurisdição, mencionado como eixo de ativação no ADR-0007, não está implementado: a ativação é apenas por configuração.

## Evidência

| Aspecto | Teste |
|---|---|
| Aplicabilidade do catálogo, padrões derivados, rejeição e filtragem do payload | `tests/lib/modules-availability.test.ts` |
| Resolução do ambiente e seus fallbacks | `tests/lib/jurisdictionEnv.test.ts` |
| Registro por jurisdição | `tests/server/saasOnboardingService.test.ts` |

## Evolução posterior

O núcleo ainda assumia condições fiscais, CUIT/CBU e letras argentinas até [#440](https://github.com/ayelenleclerc/BizCode/issues/440) — ver [conjuntos-regras-fiscais-por-pais.md](conjuntos-regras-fiscais-por-pais.md) e [ADR-0023](../../en/adr/ADR-0023-fiscal-rule-sets-by-country.md).

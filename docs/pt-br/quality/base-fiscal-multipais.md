# Base fiscal multipaís — jurisdição, RUT, IVA e módulos (#207)

**Escopo:** jurisdição fiscal do tenant (`AR` / `UY`) · **Padrão:** `AR`, que mantém o comportamento histórico

MVP que elimina as premissas argentinas fixadas no faturamento para que um tenant possa declarar o país em que é tributado. Parametriza as alíquotas de IVA, adiciona o validador de RUT uruguaio, desacopla os módulos genéricos do módulo fiscal argentino e seleciona o adaptador fiscal por país.

## Escopo

### Implementado

| Capacidade | Evidência |
|---|---|
| Jurisdição fiscal do tenant | `TenantConfig.jurisdiccionFiscal` em [prisma/schema.prisma](../../../prisma/schema.prisma) |
| Catálogo declarativo de jurisdições | [packages/types/src/fiscal-jurisdictions.ts](../../../packages/types/src/fiscal-jurisdictions.ts) |
| Validador de RUT uruguaio | [apps/web/src/lib/validators/rut.ts](../../../apps/web/src/lib/validators/rut.ts) |
| Alíquotas de IVA por jurisdição | `calculateInvoice` em [apps/web/src/lib/invoice.ts](../../../apps/web/src/lib/invoice.ts), `calculateIVA` em [apps/web/src/lib/validators.ts](../../../apps/web/src/lib/validators.ts) |
| Módulos genéricos independentes da ARCA | `billing.credit_notes`, `finance.ledger` e `finance.retenciones` em [packages/types/src/modules-catalog.ts](../../../packages/types/src/modules-catalog.ts) |
| Adaptador fiscal escolhido por país | `resolveDefaultProvider` em [apps/server/fiscal/FiscalProviderConfigService.ts](../../../apps/server/fiscal/FiscalProviderConfigService.ts) |

### Fora de escopo (residual)

- Emissão de nota fiscal eletrônica (CFE) junto à DGI uruguaia. Exige certificado digital e homologação perante o órgão; `UruguayDgiFiscalAdapter` continua sendo um stub que lança `FiscalAdapterNotImplementedError` (`implemented: false`).
- O circuito CAE argentino não é alterado e continua sendo um mock local: `arcaWsfeMock.ts` calcula o CAE aritmeticamente e o cliente WSFE real segue pendente em #133.
- O México fica deliberadamente fora do catálogo operacional: seu adaptador também é um stub de capacidades.

## Catálogo de jurisdições

`FISCAL_JURISDICTIONS` é dado declarativo puro, sem comportamento próprio:

| Código | Moeda | Identificador | IVA padrão | IVA reduzido | Provedor |
|---|---|---|---|---|---|
| `AR` | ARS | CUIT | 21% | 10,5% | `arca_wsfe` |
| `UY` | UYU | RUT | 22% | 10% | `uruguay_dgi` |

`resolveJurisdiction` restringe qualquer valor persistido e retorna a `AR`, de modo que um código desconhecido ou ausente jamais altera como um tenant existente é faturado.

## IVA

`calculateInvoice(items, clienteIva, jurisdiccion?)` lê as alíquotas do catálogo. O terceiro argumento é opcional e assume a Argentina, então todas as chamadas existentes continuam produzindo totais idênticos — esse invariante é fixado por um teste de regressão que compara `calculateInvoice(items, 'RI')` com `calculateInvoice(items, 'RI', 'AR')`.

A estrutura de colunas `neto1`/`neto2`/`neto3` e `iva1`/`iva2` não muda: `neto1` é o bucket da alíquota padrão e `neto2` o da reduzida, qualquer que seja o país. Portanto **não há migração de dados** em `Factura`.

Os totais calculados no servidor leem a jurisdição do tenant por meio de `getTenantJurisdiction` ([apps/server/services/tenantJurisdiction.ts](../../../apps/server/services/tenantJurisdiction.ts)), que reutiliza o cache de configuração e é consumido por `PedidoService`, `OrdenTrabajoService` e `ContratoBillingService`.

## Validador de RUT

`validateRUT` aceita 12 dígitos com separadores opcionais e verifica o dígito verificador por módulo 11 sobre os 11 primeiros com os pesos `4,3,6,7,8,9,2,3,4,5,6`. Um resto igual a 1 não possui verificador válido e é rejeitado.

A especificação da DGI não faz parte deste repositório: o algoritmo é a regra pública documentada e os vetores de teste de [rut.test.ts](../../../apps/web/src/lib/validators/rut.test.ts) derivam dele, não de dados oficiais de amostra. `validateTaxId(taxId, jurisdiction)` despacha entre CUIT e RUT.

## Catálogo de módulos

`billing.credit_notes`, `finance.ledger` e `finance.retenciones` dependiam de `billing.arca_cae`, o que tornava o módulo fiscal argentino um pré-requisito para notas de crédito e conta corrente em qualquer lugar do mundo. Agora dependem de `core.invoicing`.

`ModuleDef.requiredInProdForCountries` substitui o `requiredInProd` global de `billing.arca_cae`: ele é obrigatório em produção apenas para `AR`. `validateModuleSet(modules, env, jurisdiction?)` e `canDeactivate(key, env, jurisdiction?)` recebem a jurisdição com padrão argentino.

Apenas arestas de dependência foram removidas, nunca adicionadas, então nenhum conjunto de módulos válido antes desta mudança deixa de sê-lo.

## Seleção do adaptador fiscal

`resolveDefaultProvider` mantém a linha `isDefault` como precedência máxima. Quando nenhuma linha está marcada, agora procura uma configuração habilitada cujo `countryCode` corresponda à jurisdição do tenant e só recorre à linha legada `TenantFiscalConfig` (que implica `arca_wsfe`) para tenants argentinos. Um tenant uruguaio com apenas o stub configurado recebe `FiscalAdapterNotImplementedError` ao autorizar, que é o resultado correto.

## API e interface do usuário

`GET /api/me/features` e os endpoints de configuração de tenant do super-admin expõem `jurisdiccionFiscal`; omiti-lo em `PUT /api/superadmin/tenants/{tenantId}/config` preserva o valor armazenado em vez de devolver o tenant à Argentina. Contrato: [docs/api/openapi.yaml](../../api/openapi.yaml).

- Página de módulos do super-admin: seletor de jurisdição (`superadmin-jurisdiction-select`) que mostra as alíquotas que serão aplicadas.
- `ClienteForm`, `ProveedorForm` e `EmpresaPage`: o rótulo, o placeholder, a dica e a validação do identificador fiscal seguem a jurisdição, e o campo expõe `data-tax-id-kind`.
- A consulta ao Padrón A4 da AFIP ao perder o foco é ignorada fora da Argentina.

Todos os textos estão traduzidos em EN/ES/PT-BR.

## Testes

- [tests/lib/fiscal-jurisdictions.test.ts](../../../tests/lib/fiscal-jurisdictions.test.ts) — catálogo e fallbacks.
- [apps/web/src/lib/validators/rut.test.ts](../../../apps/web/src/lib/validators/rut.test.ts) — dígito verificador e casos limite.
- [apps/web/src/lib/invoice.test.ts](../../../apps/web/src/lib/invoice.test.ts) — regressão argentina e alíquotas uruguaias.
- [tests/lib/modules-catalog.test.ts](../../../tests/lib/modules-catalog.test.ts) — desacoplamento e obrigatoriedade por país.
- [tests/server/fiscal/fiscalProviderConfigService.test.ts](../../../tests/server/fiscal/fiscalProviderConfigService.test.ts) — seleção do adaptador por país.
- [tests/server/services/tenantJurisdiction.test.ts](../../../tests/server/services/tenantJurisdiction.test.ts) — cache, leitura do banco e fallback.

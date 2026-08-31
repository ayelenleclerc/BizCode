# Chile como jurisdição fiscal (#208)

**Escopo:** jurisdição `CL` sobre a base multipaís de [#207](base-fiscal-multipais.md) e a ativação de módulos por país de [#437](ativacao-modulos-legais-por-jurisdicao.md) · **Padrão:** sem alterações, `AR`

O Chile é adicionado de forma declarativa: nenhum condicional foi introduzido no código de faturamento, módulos ou adaptadores. A generalização feita em #437 é o que torna isso possível.

## Escopo

### Implementado

| Capacidade | Evidência |
|---|---|
| `CL` no catálogo de jurisdições | `FISCAL_JURISDICTIONS` em [packages/types/src/fiscal-jurisdictions.ts](../../../packages/types/src/fiscal-jurisdictions.ts) |
| Validador de RUT chileno | [apps/web/src/lib/validators/rutCl.ts](../../../apps/web/src/lib/validators/rutCl.ts) |
| Seleção do identificador fiscal por país | `TAX_ID_ALGORITHMS` em [apps/web/src/lib/validators.ts](../../../apps/web/src/lib/validators.ts) |
| Provedor `chile_sii` | [apps/server/fiscal/types.ts](../../../apps/server/fiscal/types.ts), [bootstrapFiscalProviders.ts](../../../apps/server/fiscal/bootstrapFiscalProviders.ts), [fiscalProviderRegistry.ts](../../../apps/server/fiscal/fiscalProviderRegistry.ts) |
| Adaptador apenas de capacidades | [apps/server/fiscal/stubs/ChileSiiFiscalAdapter.ts](../../../apps/server/fiscal/stubs/ChileSiiFiscalAdapter.ts) |

### Fora de escopo (residual)

- Emitir um DTE ao SII chileno. Requer certificado digital e homologação junto ao órgão, tal como a e-fatura da DGI em #207. `ChileSiiFiscalAdapter` declara `implemented: false` e toda chamada operacional lança `FiscalAdapterNotImplementedError`.

## Entrada do catálogo

| Código | Moeda | Identificador | IVA geral | IVA reduzido | Provedor |
|---|---|---|---|---|---|
| `CL` | CLP | RUT | 19 % | 19 % | `chile_sii` |

O Chile tem uma única alíquota de IVA. `VatRates` continua exigindo `standard` e `reduced` porque `Factura` persiste os buckets `neto1`/`neto2` e `iva1`/`iva2`, então `reduced` também é declarado como 19 %: uma fatura chilena distribui suas linhas entre os dois buckets, mas ambos são tributados igualmente, e nenhuma mudança de esquema é necessária.

## Identificador fiscal

O RUT chileno compartilha o nome com o uruguaio, mas não o algoritmo: 7-8 dígitos de corpo, pesos cíclicos 2..7 aplicados da direita para a esquerda e um verificador que pode ser `K` (resto 10) ou `0` (resto 11).

Por isso `TaxIdKind` continua sendo `'cuit' | 'rut'`: é um rótulo de interface, não um seletor de algoritmo. `validateTaxId` e `formatTaxId` resolvem pelo **código de jurisdição**, de modo que `UY` e `CL` exibem "RUT" mas executam algoritmos diferentes, e nenhuma chave i18n precisou ser migrada.

Os rótulos de interface seguem a mesma regra. As chaves `form.taxId.*` são indexadas por código de jurisdição (`AR`, `UY`, `CL`) e não por tipo de identificador, porque uma chave `rut` compartilhada mostrava aos tenants chilenos o exemplo uruguaio `01-234567-8908`, que não valida como RUT chileno. A consulta ao padrón também é ignorada por país, e não por tipo de identificador.

A especificação do SII não faz parte deste repositório: a regra implementada é a pública documentada e os vetores de teste em [tests/lib/validators/rutCl.test.ts](../../../tests/lib/validators/rutCl.test.ts) derivam dela, não de dados oficiais do SII.

## Módulos

Nenhum módulo foi marcado com `availableForCountries: ['CL']`. Os quatro módulos legais argentinos (`billing.arca_cae`, `fiscal.remito`, `fiscal.cheques`, `finance.retenciones`) já estão restritos a `AR` por #437, então um tenant chileno é provisionado sem eles e o catálogo de módulos não os oferece. Nada mais precisou mudar.

## Adaptador fiscal

`resolveDefaultProvider` já seleciona pela jurisdição do tenant, então um tenant chileno resolve para `chile_sii` quando existe uma linha de configuração. Como o adaptador é um stub, autorizar um documento falha explicitamente em vez de fabricar um folio.

## Testes

- [tests/lib/fiscal-jurisdictions-chile.test.ts](../../../tests/lib/fiscal-jurisdictions-chile.test.ts) — entrada do catálogo, alíquotas via `calculateInvoice`, identificador fiscal e módulos padrão.
- [tests/lib/validators/rutCl.test.ts](../../../tests/lib/validators/rutCl.test.ts) — verificador incluindo os casos `K` e `0`, validação e formatação.
- [tests/server/fiscal/stubs/fiscalStubs.test.ts](../../../tests/server/fiscal/stubs/fiscalStubs.test.ts) — o adaptador rejeita toda chamada operacional.
- [tests/server/fiscal/fiscalProviderRegistry.test.ts](../../../tests/server/fiscal/fiscalProviderRegistry.test.ts) — `chile_sii` fica registrado no bootstrap.

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
| Adapter mock de homologação | [apps/server/fiscal/cl/ChileSiiFiscalAdapter.ts](../../../apps/server/fiscal/cl/ChileSiiFiscalAdapter.ts) ([ADR-0026](../adr/ADR-0026-chile-sii-dte-mock.md)) |

### Fora de escopo (residual)

- SII SOAP/XML XAdES live e certificados digitais — **não evidenciado**. O mock DTE de homologação está em `apps/server/fiscal/cl/` ([ADR-0026](../adr/ADR-0026-chile-sii-dte-mock.md)); módulo `billing.dte_sii`.

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

O módulo `billing.dte_sii` está disponível e é requerido em prod para `CL` (#208 residual). Os módulos legais argentinos continuam restritos a `AR` por #437.

## Adaptador fiscal

`resolveDefaultProvider` seleciona `chile_sii` para tenants chilenos. O mock de homologação em `apps/server/fiscal/cl/` reporta `implemented: true` e grava códigos sintéticos nos campos CAE existentes ([ADR-0026](../adr/ADR-0026-chile-sii-dte-mock.md)). SII live permanece não evidenciado.

## Testes

- [tests/lib/fiscal-jurisdictions-chile.test.ts](../../../tests/lib/fiscal-jurisdictions-chile.test.ts) — entrada do catálogo, alíquotas via `calculateInvoice`, identificador fiscal e módulos padrão.
- [tests/lib/validators/rutCl.test.ts](../../../tests/lib/validators/rutCl.test.ts) — verificador incluindo os casos `K` e `0`, validação e formatação.
- [tests/server/fiscal/cl/chileSiiFiscalAdapter.test.ts](../../../tests/server/fiscal/cl/chileSiiFiscalAdapter.test.ts) — mock DTE e capacidades.
- [tests/server/fiscal/fiscalProviderRegistry.test.ts](../../../tests/server/fiscal/fiscalProviderRegistry.test.ts) — `chile_sii` fica registrado no bootstrap.

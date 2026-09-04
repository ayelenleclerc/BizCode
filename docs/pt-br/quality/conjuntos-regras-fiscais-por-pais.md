# Conjuntos de regras fiscais por país (#440)

## Propósito

O núcleo do BizCode não deve fixar códigos fiscais argentinos (`RI`, `CF`, letras `A/B/C`, CUIT/CBU, rótulos 21%/10,5%). Cada jurisdição declara o seu `FiscalRuleSet` em `packages/types/src/fiscal/`. Ver [ADR-0023](../../en/adr/ADR-0023-fiscal-rule-sets-by-country.md).

## O que cada país declara

| Aspecto | Fonte |
| --- | --- |
| Algoritmo e exemplo do identificador fiscal | `taxId` |
| Identificador bancário (ou nenhum) | `bankAccount` (`null` se não houver evidência) |
| Condições do sujeito + quem paga IVA | `subjectTaxConditions` (`paysVat`) |
| Códigos de IVA do artigo `1`/`2`/`3` | `vatRateCodes` |
| Letras de comprovante | `documentKinds` ou `null` |
| Buckets IVA padrão/reduzido | `vatRates` |
| Provedor fiscal padrão | `providerCode` |

## Consumidores em runtime

- **Servidor:** `validateBodyForTenant` + fábricas de esquemas de cliente/fornecedor.
- **Motor de fatura:** `subjectPaysVat` em vez de comparar com `CF`/`Exento`.
- **UI:** `apps/web/src/lib/fiscal/uiOptions.ts`; `NuevaFacturaForm` passa a jurisdição a `calculateInvoice`.
- **Gating:** `fiscal.libro_iva` (só AR) para Livro IVA; `echeq` só com `fiscal.cheques`.

## Limites de evidência

As condições fiscais do Uruguai e do Chile são um **modelo de produto** (se o sujeito paga IVA). Os catálogos oficiais da DGI/SII não estão no repositório e exigem revisão de um consultor fiscal local.

## Relacionados

- [#440](https://github.com/ayelenleclerc/BizCode/issues/440), [#207](https://github.com/ayelenleclerc/BizCode/issues/207), [#437](https://github.com/ayelenleclerc/BizCode/issues/437), [#208](https://github.com/ayelenleclerc/BizCode/issues/208)
- [Base fiscal multipaís](base-fiscal-multipais.md), [Ativação de módulos legais](ativacao-modulos-legais-por-jurisdicao.md), [Chile](jurisdicao-fiscal-chile.md)

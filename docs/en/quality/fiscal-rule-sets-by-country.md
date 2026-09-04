# Per-country fiscal rule sets (#440)

## Purpose

The core of BizCode must not hardcode Argentine tax codes (`RI`, `CF`, invoice letters `A/B/C`, CUIT/CBU, 21%/10.5% labels). Each jurisdiction declares its own `FiscalRuleSet` under `packages/types/src/fiscal/`. See [ADR-0023](../adr/ADR-0023-fiscal-rule-sets-by-country.md).

## What each country declares

| Concern | Source |
| --- | --- |
| Tax identifier algorithm and example | `taxId` on the rule set |
| Bank account identifier (or none) | `bankAccount` (`null` when not evidenced) |
| Subject tax conditions + who pays VAT | `subjectTaxConditions` (`paysVat`) |
| Article VAT codes `1`/`2`/`3` → rates | `vatRateCodes` |
| Invoice letters | `documentKinds` or `null` |
| Standard/reduced VAT buckets | `vatRates` |
| Default fiscal provider | `providerCode` |

## Runtime consumers

- **Server:** `validateBodyForTenant` + `buildClienteBodySchema` / `buildProveedorBodySchema`.
- **Invoice engine:** `subjectPaysVat` instead of comparing to `CF`/`Exento`.
- **UI:** `apps/web/src/lib/fiscal/uiOptions.ts` builds selects; `NuevaFacturaForm` passes `jurisdiccionFiscal` to `calculateInvoice`.
- **Gating:** `fiscal.libro_iva` (AR-only) for Libro IVA; `echeq` only with `fiscal.cheques`.

## Evidence limits

Uruguayan and Chilean subject tax condition codes are a **product model** derived from whether the subject pays VAT. Official DGI/SII catalogs are not in this repository and require review by a local tax adviser before treating them as normative.

## Related

- [#440](https://github.com/ayelenleclerc/BizCode/issues/440), [#207](https://github.com/ayelenleclerc/BizCode/issues/207), [#437](https://github.com/ayelenleclerc/BizCode/issues/437), [#208](https://github.com/ayelenleclerc/BizCode/issues/208)
- [Multi-country fiscal base](multi-country-fiscal-base.md), [Legal module activation](legal-module-activation-by-jurisdiction.md), [Chile](chile-fiscal-jurisdiction.md)

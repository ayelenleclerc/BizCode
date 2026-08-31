# Chile as a fiscal jurisdiction (#208)

**Scope:** `CL` jurisdiction over the multi-country base of [#207](multi-country-fiscal-base.md) and the per-country module activation of [#437](legal-module-activation-by-jurisdiction.md) · **Default:** unchanged, `AR`

Chile is added declaratively: no conditional was introduced in the invoicing, module or adapter code. The generalisation done in #437 is what makes this possible.

## Scope

### Implemented

| Capability | Evidence |
|---|---|
| `CL` in the jurisdiction catalog | `FISCAL_JURISDICTIONS` in [packages/types/src/fiscal-jurisdictions.ts](../../../packages/types/src/fiscal-jurisdictions.ts) |
| Chilean RUT validator | [apps/web/src/lib/validators/rutCl.ts](../../../apps/web/src/lib/validators/rutCl.ts) |
| Tax identifier dispatch by country | `TAX_ID_ALGORITHMS` in [apps/web/src/lib/validators.ts](../../../apps/web/src/lib/validators.ts) |
| `chile_sii` provider | [apps/server/fiscal/types.ts](../../../apps/server/fiscal/types.ts), [bootstrapFiscalProviders.ts](../../../apps/server/fiscal/bootstrapFiscalProviders.ts), [fiscalProviderRegistry.ts](../../../apps/server/fiscal/fiscalProviderRegistry.ts) |
| Capability-only adapter | [apps/server/fiscal/stubs/ChileSiiFiscalAdapter.ts](../../../apps/server/fiscal/stubs/ChileSiiFiscalAdapter.ts) |

### Out of scope (residual)

- Issuing a DTE against the Chilean SII. It requires a digital certificate and homologation with the tax authority, exactly like the DGI e-invoice in #207. `ChileSiiFiscalAdapter` declares `implemented: false` and every operational call throws `FiscalAdapterNotImplementedError`.

## Catalog entry

| Code | Currency | Tax ID | Standard VAT | Reduced VAT | Provider |
|---|---|---|---|---|---|
| `CL` | CLP | RUT | 19% | 19% | `chile_sii` |

Chile has a single VAT rate. `VatRates` still requires `standard` and `reduced` because `Factura` persists the `neto1`/`neto2` and `iva1`/`iva2` buckets, so `reduced` is declared as 19% as well: a Chilean invoice splits its lines across the two buckets but both are taxed identically, and no schema change is needed.

## Tax identifier

The Chilean RUT shares its name with the Uruguayan one but not its algorithm: 7–8 body digits, cyclic weights 2..7 applied right to left, and a check digit that may be `K` (remainder 10) or `0` (remainder 11).

`TaxIdKind` therefore stays `'cuit' | 'rut'` — it is a user-facing label, not an algorithm selector. `validateTaxId` and `formatTaxId` dispatch on the **jurisdiction code**, so `UY` and `CL` both display "RUT" while running different algorithms, and no i18n key had to be migrated.

The user-facing labels follow the same rule. `form.taxId.*` keys are indexed by jurisdiction code (`AR`, `UY`, `CL`) instead of by identifier kind, because a shared `rut` key showed the Uruguayan example `01-234567-8908` to Chilean tenants, and that value does not validate as a Chilean RUT. The padron lookup is likewise skipped by country rather than by identifier kind.

The SII specification is not part of this repository: the rule implemented is the documented public one and the test vectors in [tests/lib/validators/rutCl.test.ts](../../../tests/lib/validators/rutCl.test.ts) are derived from it, not from official SII sample data.

## Modules

No module was marked `availableForCountries: ['CL']`. The four Argentine legal modules (`billing.arca_cae`, `fiscal.remito`, `fiscal.cheques`, `finance.retenciones`) are already restricted to `AR` by #437, so a Chilean tenant is provisioned without them and the module catalog does not offer them. Nothing else had to change.

## Fiscal adapter

`resolveDefaultProvider` already selects by tenant jurisdiction, so a Chilean tenant resolves to `chile_sii` once a configuration row exists. Because the adapter is a stub, authorising a document fails explicitly rather than fabricating a folio.

## Tests

- [tests/lib/fiscal-jurisdictions-chile.test.ts](../../../tests/lib/fiscal-jurisdictions-chile.test.ts) — catalog entry, VAT rates through `calculateInvoice`, tax identifier dispatch and module defaults.
- [tests/lib/validators/rutCl.test.ts](../../../tests/lib/validators/rutCl.test.ts) — check digit including the `K` and `0` cases, validation and formatting.
- [tests/server/fiscal/stubs/fiscalStubs.test.ts](../../../tests/server/fiscal/stubs/fiscalStubs.test.ts) — the adapter rejects every operational call.
- [tests/server/fiscal/fiscalProviderRegistry.test.ts](../../../tests/server/fiscal/fiscalProviderRegistry.test.ts) — `chile_sii` is registered by the bootstrap.

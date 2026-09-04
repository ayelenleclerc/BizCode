# Multi-country fiscal base — jurisdiction, RUT, VAT and modules (#207)

**Scope:** tenant tax jurisdiction (`AR` / `UY`) · **Default:** `AR`, which preserves the historical behaviour

MVP that removes the Argentine assumptions hard-coded across invoicing so a tenant can declare the country it is taxed in. It parameterises VAT rates, adds the Uruguayan RUT validator, decouples the generic modules from the Argentine fiscal module and selects the fiscal adapter by country.

## Scope

### Implemented

| Capability | Evidence |
|---|---|
| Tenant tax jurisdiction | `TenantConfig.jurisdiccionFiscal` in [prisma/schema.prisma](../../../prisma/schema.prisma) |
| Declarative jurisdiction catalog | [packages/types/src/fiscal-jurisdictions.ts](../../../packages/types/src/fiscal-jurisdictions.ts) |
| Uruguayan RUT validator | [apps/web/src/lib/validators/rut.ts](../../../apps/web/src/lib/validators/rut.ts) |
| VAT rates per jurisdiction | `calculateInvoice` in [apps/web/src/lib/invoice.ts](../../../apps/web/src/lib/invoice.ts), `calculateIVA` in [apps/web/src/lib/validators.ts](../../../apps/web/src/lib/validators.ts) |
| Generic modules independent from ARCA | `billing.credit_notes`, `finance.ledger` and `finance.retenciones` in [packages/types/src/modules-catalog.ts](../../../packages/types/src/modules-catalog.ts) |
| Fiscal adapter chosen by country | `resolveDefaultProvider` in [apps/server/fiscal/FiscalProviderConfigService.ts](../../../apps/server/fiscal/FiscalProviderConfigService.ts) |

### Out of scope (residual)

- Live DGI (Uruguay) SOAP/REST and digital certificates — **Not evidenced**. Homologación CFE mock is evidenced under `apps/server/fiscal/uy/` ([ADR-0025](../adr/ADR-0025-uruguay-dgi-cfe-mock.md)); module `billing.dgi_cfe`.
- The Argentine CAE circuit is untouched and is still a local mock: `arcaWsfeMock.ts` computes the CAE arithmetically and the real WSFE client remains pending in #133.
- Mexico CFDI live PAC (Facturama/Finkok) remains Not evidenced; `mexico_sat_pac` is a homologación mock ([ADR-0024](../adr/ADR-0024-mexico-sat-cfdi-mock-pac.md)). See [mexico-fiscal-jurisdiction.md](mexico-fiscal-jurisdiction.md).

## Jurisdiction catalog

`FISCAL_JURISDICTIONS` is plain declarative data, with no behaviour of its own:

| Code | Currency | Tax ID | Standard VAT | Reduced VAT | Provider |
|---|---|---|---|---|---|
| `AR` | ARS | CUIT | 21% | 10.5% | `arca_wsfe` |
| `UY` | UYU | RUT | 22% | 10% | `uruguay_dgi` |

`resolveJurisdiction` narrows any persisted value and falls back to `AR`, so an unknown or missing code can never change how an existing tenant is invoiced.

## VAT

`calculateInvoice(items, clienteIva, jurisdiccion?)` reads the rates from the catalog. The third argument is optional and defaults to Argentina, so every existing call site keeps producing identical totals — that invariant is pinned by a regression test that compares `calculateInvoice(items, 'RI')` against `calculateInvoice(items, 'RI', 'AR')`.

The `neto1`/`neto2`/`neto3` and `iva1`/`iva2` column layout does not change: `neto1` is the standard rate bucket and `neto2` the reduced one, whatever the country. There is therefore **no data migration** on `Factura`.

Server-side totals read the tenant jurisdiction through `getTenantJurisdiction` ([apps/server/services/tenantJurisdiction.ts](../../../apps/server/services/tenantJurisdiction.ts)), which reuses the tenant-config cache and is consumed by `PedidoService`, `OrdenTrabajoService` and `ContratoBillingService`.

## RUT validator

`validateRUT` accepts 12 digits with an optional separator and checks the modulo 11 check digit over the first 11 with the weights `4,3,6,7,8,9,2,3,4,5,6`. A remainder of 1 has no valid check digit and is rejected.

The DGI specification is not part of this repository: the algorithm is the documented public rule, and the test vectors in [rut.test.ts](../../../apps/web/src/lib/validators/rut.test.ts) are derived from it rather than from official sample data. `validateTaxId(taxId, jurisdiction)` dispatches between CUIT and RUT.

## Module catalog

`billing.credit_notes`, `finance.ledger` and `finance.retenciones` used to depend on `billing.arca_cae`, which made the Argentine fiscal module a prerequisite for credit notes and the customer ledger anywhere in the world. They now depend on `core.invoicing`.

`ModuleDef.requiredInProdForCountries` replaces the blanket `requiredInProd` on `billing.arca_cae`: it is mandatory in production only for `AR`. `validateModuleSet(modules, env, jurisdiction?)` and `canDeactivate(key, env, jurisdiction?)` take the jurisdiction with an Argentine default.

Only dependency edges were removed, never added, so no module set that was valid before this change becomes invalid.

## Fiscal adapter selection

`resolveDefaultProvider` keeps the `isDefault` row as the highest precedence. When no row is flagged it now looks for an enabled configuration whose `countryCode` matches the tenant jurisdiction, and only falls back to the legacy `TenantFiscalConfig` row (which implies `arca_wsfe`) for Argentine tenants. A Uruguayan tenant with just the stub configured gets `FiscalAdapterNotImplementedError` when authorising, which is the correct outcome.

## API and user interface

`GET /api/me/features` and the super-admin tenant configuration endpoints expose `jurisdiccionFiscal`; omitting it in `PUT /api/superadmin/tenants/{tenantId}/config` preserves the stored value rather than resetting the tenant to Argentina. Contract: [docs/api/openapi.yaml](../../api/openapi.yaml).

- Super-admin module page: jurisdiction selector (`superadmin-jurisdiction-select`) showing the VAT rates that will apply.
- `ClienteForm`, `ProveedorForm` and `EmpresaPage`: the tax identifier label, placeholder, hint and validation follow the jurisdiction, and the field exposes `data-tax-id-kind`.
- The AFIP Padrón A4 lookup on blur is skipped outside Argentina.

All strings are translated in EN/ES/PT-BR.

## Tests

- [tests/lib/fiscal-jurisdictions.test.ts](../../../tests/lib/fiscal-jurisdictions.test.ts) — catalog and fallbacks.
- [apps/web/src/lib/validators/rut.test.ts](../../../apps/web/src/lib/validators/rut.test.ts) — check digit and edge cases.
- [apps/web/src/lib/invoice.test.ts](../../../apps/web/src/lib/invoice.test.ts) — Argentine regression plus Uruguayan rates.
- [tests/lib/modules-catalog.test.ts](../../../tests/lib/modules-catalog.test.ts) — decoupling and per-country requirements.
- [tests/server/fiscal/fiscalProviderConfigService.test.ts](../../../tests/server/fiscal/fiscalProviderConfigService.test.ts) — adapter selection by country.
- [tests/server/services/tenantJurisdiction.test.ts](../../../tests/server/services/tenantJurisdiction.test.ts) — cache, database read and fallback.

## Later evolution

Hardcoded Argentine codes that remained in the core after #207 were moved into the per-country rule registry in [#440](https://github.com/ayelenleclerc/BizCode/issues/440) — see [fiscal-rule-sets-by-country.md](fiscal-rule-sets-by-country.md) and [ADR-0023](../adr/ADR-0023-fiscal-rule-sets-by-country.md).

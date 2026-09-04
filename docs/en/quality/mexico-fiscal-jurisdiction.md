# Mexico as a fiscal jurisdiction (#210)

## Purpose

Adds Mexico (`MX`) to the per-country fiscal rule registry introduced in [#440](https://github.com/ayelenleclerc/BizCode/issues/440). See [ADR-0023](../adr/ADR-0023-fiscal-rule-sets-by-country.md) and [ADR-0024](../adr/ADR-0024-mexico-sat-cfdi-mock-pac.md).

## Declared rules

| Concern | Value |
| --- | --- |
| Currency | MXN |
| Tax id | RFC (persona moral 12 / física 13) with modulo-11 check digit |
| Bank account | none evidenced (no CBU equivalent in this repo) |
| VAT | standard 16%; reduced bucket 0% (food/medicine mass use case) |
| Border 8% | residual — depends on establishment location, not the article |
| Document letters | none |
| Provider | `mexico_sat_pac` — **homologación mock PAC** (ADR-0024); live Facturama/Finkok Not evidenced |
| Module | `billing.cfdi_sat` (`availableForCountries: ['MX']`) |
| Article mapping | `Articulo.claveProdServ` (SAT `c_ClaveProdServ`) |
| Catalogs | `SatCatalogEntry` + `GET /api/fiscal/sat/catalog` (curated subset; seed via `scripts/sat-catalog-seed.ts`) |
| Cancel | `POST /api/fiscal/documents/{id}/cancel` with SAT reasons 01–04 |

## Evidence limits

- SAT official sample catalogs and PAC contracts are **not** fully in this repository. The RFC algorithm is the public check-digit rule; catalog fixtures are a curated public subset labeled `sat-cfdi-4.0-curated-2026-09`.
- Subject tax conditions (`IVA` / `CF` / `Exento`) are a product model (who pays VAT), not an official SAT regime catalog.
- Live CFDI stamping through an authorized PAC remains **Not evidenced** — the mock stamps deterministic UUID-like values for tests.

## Related

- [#210](https://github.com/ayelenleclerc/BizCode/issues/210), [#440](https://github.com/ayelenleclerc/BizCode/issues/440)
- [Fiscal rule sets by country](fiscal-rule-sets-by-country.md)

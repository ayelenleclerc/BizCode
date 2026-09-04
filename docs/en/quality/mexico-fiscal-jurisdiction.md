# Mexico as a fiscal jurisdiction (#210)

## Purpose

Adds Mexico (`MX`) to the per-country fiscal rule registry introduced in [#440](https://github.com/ayelenleclerc/BizCode/issues/440). See [ADR-0023](../adr/ADR-0023-fiscal-rule-sets-by-country.md).

## Declared rules

| Concern | Value |
| --- | --- |
| Currency | MXN |
| Tax id | RFC (persona moral 12 / física 13) with modulo-11 check digit |
| Bank account | none evidenced (no CBU equivalent in this repo) |
| VAT | standard 16%; reduced bucket 0% (food/medicine mass use case) |
| Border 8% | residual — depends on establishment location, not the article |
| Document letters | none |
| Provider | `mexico_sat_pac` (stub; CFDI 4.0 timbrado not implemented) |

## Evidence limits

- SAT official sample catalogs and PAC contracts are **not** in this repository. The RFC algorithm is the public check-digit rule; test vectors are derived from it.
- Subject tax conditions (`IVA` / `CF` / `Exento`) are a product model (who pays VAT), not an official SAT regime catalog.
- Real CFDI stamping requires an authorized PAC and digital certificate — `MexicoSatFiscalAdapter` stays `implemented: false`.

## Related

- [#210](https://github.com/ayelenleclerc/BizCode/issues/210), [#440](https://github.com/ayelenleclerc/BizCode/issues/440)
- [Fiscal rule sets by country](fiscal-rule-sets-by-country.md)

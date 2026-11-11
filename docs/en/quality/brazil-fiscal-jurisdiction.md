# Brazil as a fiscal jurisdiction (#211)

## Purpose

Adds Brazil (`BR`) to the per-country fiscal rule registry introduced in [#440](https://github.com/ayelenleclerc/BizCode/issues/440). See [ADR-0023](../adr/ADR-0023-fiscal-rule-sets-by-country.md) and [ADR-0027](../adr/ADR-0027-brazil-sefaz-nfe-mock.md).

## Declared rules

| Concern | Value |
| --- | --- |
| Currency | BRL |
| Tax id | CNPJ (14 digits, two modulo-11 check digits) |
| Bank account | none evidenced (no CBU equivalent in this repo) |
| VAT (product model) | standard 18%; reduced 12% — **not** the real ICMS state matrix |
| Document kinds | `55-NFe`, `NFe-Devolucao` (product model) |
| Provider | `brazil_sefaz_nfe` — **homologación mock** (ADR-0027); live SEFAZ Not evidenced |
| Module | `billing.nfe_sefaz` (`availableForCountries: ['BR']`) |
| Cancel | Not evidenced (`supportsCancel: false`) |

## Evidence limits

- Receita Federal / SEFAZ official catalogs are **not** in this repository. The CNPJ algorithm is the public check-digit rule.
- Subject tax conditions (`Contribuinte` / `NaoContribuinte` / `Isento`) are a product model (who pays VAT), not an official SEFAZ regime catalog.
- Simples Nacional, ICMS-ST, IPI, PIS/COFINS, DANFE PDF, and live SEFAZ authorization remain **Not evidenced**.
- Dual-bucket `Factura.neto1`/`neto2` cannot express full Brazilian multi-tax without a schema change (#440).

## Related

- [#211](https://github.com/ayelenleclerc/BizCode/issues/211), [#440](https://github.com/ayelenleclerc/BizCode/issues/440)
- [Fiscal rule sets by country](fiscal-rule-sets-by-country.md)

# ADR-0024: Mexico SAT CFDI via homologación mock PAC

- **Status:** Accepted
- **Date:** 2026-09-04
- **Issue:** [#210](https://github.com/ayelenleclerc/BizCode/issues/210)
- **Related:** [ADR-0018](ADR-0018-fiscal-multi-organism-e-invoicing.md), [ADR-0023](ADR-0023-fiscal-rule-sets-by-country.md)

## Context

Issue #210 requires CFDI 4.0 stamping via a PAC, searchable SAT catalogs, and cancel with SAT reason codes 01–04. BizCode’s only working fiscal adapter today is ARCA, which uses a **homologación mock** (`arcaWsfeMock.ts`) — live AFIP SOAP is not evidenced.

Commercial PAC APIs (Facturama, Finkok, etc.) require contracts and secrets that are **Not evidenced in current codebase**.

## Decision

1. Implement `mexico_sat_pac` as a **homologación mock PAC** under `apps/server/fiscal/mx/`, mirroring ARCA’s pattern (`MexicoSatService` + `mxSatPacMock` + `MexicoSatFiscalAdapter`).
2. Mark capabilities `implemented: true` with an explicit note that live PAC/SAT REST is not evidenced.
3. Persist curated `SatCatalogEntry` rows (subset) and expose `GET /api/fiscal/sat/catalog`.
4. Extend `FiscalProviderAdapter.cancel` with optional `FiscalCancelOptions.reasonCode` for SAT 01–04.
5. Add module `billing.cfdi_sat` (`availableForCountries: ['MX']`).
6. Defer live Facturama/Finkok to a future ADR + credentials.

## Consequences

- Positive: #210 AC for “ambiente de pruebas”, catalogs, and cancel reasons can be verified in CI without inventing PAC HTTP.
- Positive: MX tenants get a dedicated module and article `claveProdServ` mapping.
- Negative: Production CFDI issuance still requires a follow-up integration; docs must not claim live PAC.
- Follow-up: live PAC client ADR when secrets and sandbox account exist.

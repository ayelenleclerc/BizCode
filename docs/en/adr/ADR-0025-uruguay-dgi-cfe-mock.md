# ADR-0025: Uruguay DGI CFE via homologación mock

- **Status:** Accepted
- **Date:** 2026-09-04
- **Issue:** [#207](https://github.com/ayelenleclerc/BizCode/issues/207)
- **Related:** [ADR-0018](ADR-0018-fiscal-multi-organism-e-invoicing.md), [ADR-0023](ADR-0023-fiscal-rule-sets-by-country.md), [ADR-0024](ADR-0024-mexico-sat-cfdi-mock-pac.md)

## Context

Issue #207 residual requires CFE e-invoice authorization in a homologación environment for Uruguay. BizCode already ships ARCA and Mexico SAT as **homologación mocks**; live DGI SOAP/REST and digital certificates are **Not evidenced in current codebase**.

## Decision

1. Implement `uruguay_dgi` as a **homologación mock CFE** under `apps/server/fiscal/uy/`, mirroring ARCA/MX (`UruguayDgiService` + `uyDgiCfeMock` + `UruguayDgiFiscalAdapter`).
2. Mark capabilities `implemented: true` with an explicit note that live DGI is not evidenced.
3. Persist synthetic authorization codes on existing `Factura`/`NotaCredito` CAE fields (`cae` / `caeVto` / `estadoCae`).
4. Add module `billing.dgi_cfe` (`availableForCountries: ['UY']`).
5. Product-model `documentKinds` (`e-Factura` / `e-NotaCredito`) — not the full official DGI CFE catalog.
6. Do **not** implement cancel in this mock (`supportsCancel: false`) until a cancel contract is evidenced.
7. Defer live DGI client + certificates to a future ADR + secrets.

## Consequences

- Positive: #207 AC for homologación emission can be verified in CI without inventing DGI HTTP/SOAP.
- Positive: UY tenants get a dedicated module and config UI (RUT + ambiente).
- Negative: Production CFE issuance still requires a follow-up integration; docs must not claim live DGI.
- Follow-up: live DGI ADR when sandbox credentials exist; #207 may remain open for that residual.

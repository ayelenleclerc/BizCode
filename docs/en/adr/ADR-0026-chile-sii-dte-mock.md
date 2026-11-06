# ADR-0026: Chile SII DTE via homologación mock

- **Status:** Accepted
- **Date:** 2026-10-28
- **Issue:** [#208](https://github.com/ayelenleclerc/BizCode/issues/208)
- **Related:** [ADR-0018](ADR-0018-fiscal-multi-organism-e-invoicing.md), [ADR-0023](ADR-0023-fiscal-rule-sets-by-country.md), [ADR-0025](ADR-0025-uruguay-dgi-cfe-mock.md)

## Context

Issue #208 residual requires DTE authorization in a homologación environment for Chile. BizCode already ships ARCA, Mexico SAT, and Uruguay DGI as **homologación mocks**; live SII SOAP/XML XAdES and digital certificates are **Not evidenced in current codebase**.

## Decision

1. Implement `chile_sii` as a **homologación mock DTE** under `apps/server/fiscal/cl/`, mirroring UY (`ChileSiiService` + `clSiiDteMock` + `ChileSiiFiscalAdapter`).
2. Mark capabilities `implemented: true` with an explicit note that live SII is not evidenced.
3. Persist synthetic authorization codes on existing `Factura`/`NotaCredito` CAE fields.
4. Add module `billing.dte_sii` (`availableForCountries: ['CL']`).
5. Product-model `documentKinds` (`33-FacturaAfecta` / `61-NotaCredito`) — codes cited by #208 AC; not the full official SII catalog.
6. Do **not** implement cancel in this mock (`supportsCancel: false`).
7. Defer live SII client + certificates to a future ADR + secrets.

## Consequences

- Positive: #208 AC for homologación emission can be verified in CI without inventing SII HTTP/XML.
- Negative: Production DTE issuance still requires a follow-up integration; docs must not claim live SII.
- Follow-up: live SII ADR when sandbox credentials exist; #208 may remain open for that residual.

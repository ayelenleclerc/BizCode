# ADR-0027: Brazil SEFAZ NF-e via homologación mock

- **Status:** Accepted
- **Date:** 2026-11-11
- **Issue:** [#211](https://github.com/ayelenleclerc/BizCode/issues/211)
- **Related:** [ADR-0018](ADR-0018-fiscal-multi-organism-e-invoicing.md), [ADR-0023](ADR-0023-fiscal-rule-sets-by-country.md), [ADR-0026](ADR-0026-chile-sii-dte-mock.md)

## Context

Issue #211 requires a path to NF-e authorization for Brazil. BizCode already ships ARCA, Mexico SAT, Uruguay DGI, and Chile SII as **homologación mocks**. Live SEFAZ SOAP/REST, ICP-Brasil certificates, DANFE PDF, and full ICMS/Simples tax engines are **Not evidenced in current codebase**. The `Factura` dual-bucket model (`neto1`/`neto2`) cannot represent multi-tax Brazilian regimes without a Prisma redesign (#440).

## Decision

1. Implement `brazil_sefaz_nfe` as a **homologación mock NF-e** under `apps/server/fiscal/br/`, mirroring CL (`BrazilSefazNfeService` + `brSefazNfeMock` + `BrazilSefazNfeFiscalAdapter`).
2. Mark capabilities `implemented: true` with an explicit note that live SEFAZ is not evidenced.
3. Persist synthetic authorization codes on existing `Factura`/`NotaCredito` CAE fields.
4. Add module `billing.nfe_sefaz` (`availableForCountries: ['BR']`).
5. Declare `BR` in the fiscal rule registry with CNPJ validation, BRL, and product-model VAT buckets 18/12 (not the real ICMS state matrix).
6. Product-model `documentKinds` (`55-NFe` / `NFe-Devolucao`) — not the full official SEFAZ catalog.
7. Do **not** implement cancel in this mock (`supportsCancel: false`).
8. Defer live SEFAZ client + certificates + DANFE + Simples/ICMS-ST/PIS/COFINS to a future ADR + secrets.

## Consequences

- Positive: #211 AC for homologación emission can be verified in CI without inventing SEFAZ HTTP/XML.
- Negative: Production NF-e issuance still requires a follow-up integration; docs must not claim live SEFAZ or full Brazilian tax computation.
- Follow-up: live SEFAZ ADR when sandbox credentials exist; #211 remains open for residual live/multi-tax/DANFE/Simples.

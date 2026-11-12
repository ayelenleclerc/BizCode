# ADR-0028: FCEM MiPyME via homologación mock WSFECM

- **Status:** Accepted
- **Date:** 2026-11-12
- **Issue:** [#239](https://github.com/ayelenleclerc/BizCode/issues/239)
- **Related:** [ADR-0018](ADR-0018-fiscal-multi-organism-e-invoicing.md), [ADR-0014](ADR-0014-legal-arca-invoice-pdf.md)

## Context

Issue #239 requires Factura de Crédito Electrónica MiPyME (FCEM, Ley 27440) for Argentine issuers: detection when the issuer is MiPyME, the buyer is RI, the amount meets the threshold, and the payment term is ≥ 31 days; emission of types 201/206/211; and receptor acceptance / rejection / tacit acceptance. Live AFIP WSFECM, MiPyME catalog sync, and ConsultaObligado are **Not evidenced in current codebase**. Existing ARCA support is WSFE mock for types A/B/C only (`arcaWsfeMock.ts`).

## Decision

1. Ship a **local MVP** gated by module `billing.fcem_mipyme` (`availableForCountries: ['AR']`, depends on `billing.arca_cae`).
2. Persist FCEM state on `Factura` (`fcemEstado`, `fcemTipoCbte`, `fcemPlazoPagoDias`, reject/timestamps) and MiPyME knobs on `ParamEmpresa` (`esMipyme`, `fcemUmbralMonto`).
3. Pure detection in `@bizcode/types` (`evaluateFcemRequirement`) with configurable threshold default `FCEM_DEFAULT_UMBRAL_ARS` (not an auto-updated AFIP table).
4. Homologación mock `arcaWsfecmMock` + `FcemService` + `/api/fcem/facturas/*` for emit / accept / reject / tacit accept.
5. Do **not** implement live WSFECM SOAP/REST, AFIP certificates beyond existing ARCA mock, or automatic tacit-acceptance calendar jobs in this ADR.
6. Keep #239 **OPEN** for residual live AFIP / catalog / ConsultaObligado work.

## Consequences

- Positive: distributors can exercise FCEM flows in CI and UI without inventing live AFIP HTTP.
- Negative: production FCEM against AFIP still requires a follow-up integration; docs must not claim live WSFECM.
- Follow-up: live WSFECM ADR when sandbox credentials exist; official threshold sync; receptor portal / AFIP acceptance push.

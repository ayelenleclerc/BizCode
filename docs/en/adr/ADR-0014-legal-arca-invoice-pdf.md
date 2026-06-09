# ADR-0014: Legal AFIP invoice PDF and 80mm ticket (#148)

**Status:** Accepted  
**Date:** 2026-05-29  
**GitHub:** #148

---

## Context

Issue #133 delivered a minimal invoice PDF (`GET /api/facturas/:id/pdf`, preview with watermark). Issue #148 requires a **legal fiscal layout** (RG 4291-aligned), AFIP **QR** and **Interleaved 2 of 5** barcode, company header fields, and an **80mm ticket** route.

The repository does **not** include an official AFIP certification tool; claims are **aligned to public AFIP/ARCA practice**, not certified compliance.

## Decision

1. **Legal PDF:** `GET /api/facturas/:id/pdf` — requires `estadoCae === 'issued'` and `cae`; layout A4 with issuer/receiver, items, VAT totals, CAE, QR, barcode (`pdfkit` + `bwip-js`).
2. **Preview:** `GET /api/facturas/:id/pdf/preview` — watermarked, **non-fiscal**; no QR/barcode.
3. **Ticket:** `GET /api/facturas/:id/ticket` — 80mm operational PDF; without issued CAE labelled **non-fiscal** (counter/quotation).
4. **Payloads:** `afipQrPayload.ts` and `afipBarcodePayload.ts` — pure functions with unit tests; QR URL base `https://www.afip.gob.ar/fe/qr/`.
5. **Company header:** `ParamEmpresa.condicionIva`, `ingresosBrutos`, `fechaInicioActividades` (optional; conservative migration defaults).
6. **Validation:** structural/unit tests only; **manual AFIP portal verification** documented as pending.

## Consequences

- **Positive:** Extends #133 without Puppeteer; fiscal logic stays in `server/fiscal/ar/`.
- **Negative:** RG 4291 full certification not evidenced in repo.
- **Dependencies:** existing `pdfkit`, `bwip-js`.

## References

- [docs/api/openapi.yaml](../../api/openapi.yaml) — `/api/facturas/{id}/pdf`, `/ticket`
- Issue #133, #148

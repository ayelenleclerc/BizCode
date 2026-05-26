# ADR-0013: Libro IVA Ventas (Fase 1) — scope and purchases gap

**Status:** Accepted  
**Date:** 2026-05-26  
**GitHub:** #147 (Fase 1)

---

## Context

Issue #147 requests digital **Libro IVA Ventas** and **Compras** (ARCA / RG 3685). In the current codebase:

- **`Factura`** exposes fiscal fields sufficient for a first sales export: `tipo` (A/B/C), `neto1`/`neto2`/`neto3`, `iva1`/`iva2`, `total`, `estado`, `fecha`, `prefijo`, `numero`, CAE.
- **`OrdenCompra`** / purchase lines do **not** model supplier fiscal vouchers (no A/B/C, netos/IVA by rate, CAE). Inferring IVA from `Articulo.condIva` would not be audit-ready.

Credit notes from #146 (`NotaCredito`, ADR-0012) must appear coherently in the sales book when voided in the period.

## Decision

1. **Fase 1 scope:** implement **Libro IVA Ventas only** end-to-end.
2. **API:** `GET /api/contabilidad/libro-iva-ventas?periodo=YYYY-MM&format=preview|txt|xlsx`.
3. **Module:** `finance.ledger`; permission `reports.financial.read` (roles `finance`, `auditor`, `owner`).
4. **Data source:** only persisted `Factura` header fields (no inference from `FacturaItem` or `Articulo`).
5. **TXT (`format=txt`):** ZIP with `CBTV.txt` + `ALICUOTAS.txt` (comma-separated, amounts with dot decimal, no thousands separator).
6. **Excel (`format=xlsx`):** internal review workbook (not an ARCA substitute).
7. **Credit notes / voids (ADR-0012):**
   - Active invoices (`estado=A`) with `fecha` in period → normal CBTV + alícuotas.
   - `NotaCredito` with `createdAt` in period → NC tipo (003/008/013 from origin `tipo`) + alícuotas from origin netos/IVA; plus CBTV **tipo 999** for the voided origin voucher.
   - NC fiscal numbering: until a dedicated NC `prefijo`/`numero` exists, use `NotaCredito.id` as comprobante number (documented limitation).
8. **Out of scope Fase 1:** Libro IVA Compras, `GET /api/contabilidad/libro-iva-compras`, CBTU, any mapping from `OrdenCompra` / `OrdenCompraItem`.
9. **Follow-up issue:** model supplier fiscal vouchers, then implement purchases book (linked from PR #147 Fase 1).
10. **ARCA validation:** structural tests (record counts, period, CBTV ↔ ALICUOTAS consistency); official ARCA validator may be run manually and noted in PR.

## Consequences

- **Positive:** Defensible sales export without fake purchase data; clear module and permission gates.
- **Negative:** Issue #147 AC for purchases deferred; PR uses `Part of #147`.
- **Dependencies:** `exceljs`, `archiver` for export formats.

## References

- [docs/api/openapi.yaml](../../api/openapi.yaml) — `/api/contabilidad/libro-iva-ventas`
- [ADR-0012](ADR-0012-invoice-void-credit-note.md)
- Issue #147

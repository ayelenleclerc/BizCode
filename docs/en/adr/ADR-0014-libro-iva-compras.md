# ADR-0014: Libro IVA Compras — supplier vouchers (#306)

**Status:** Accepted  
**Date:** 2026-06-03  
**GitHub:** #306

---

## Context

ADR-0013 delivered **Libro IVA Ventas** from `Factura` only. Issue #306 closes the purchases gap: `OrdenCompra` does not model supplier fiscal vouchers (tipo A/B/C, netos/IVA, CAE).

## Decision

1. **Model:** `ComprobanteCompra` with fiscal header fields aligned to `Factura` (neto1/2/3, iva1/2, total, tipo, prefijo, numero, proveedorId, optional ordenCompraId).
2. **Data entry:** `POST /api/comprobantes-compra` (module `finance.ledger`, permission `reports.financial.read`).
3. **Export:** `GET /api/contabilidad/libro-iva-compras?periodo=YYYY-MM&format=preview|txt|xlsx`.
4. **TXT:** ZIP with `CBTU.txt` + `ALICUOTAS.txt` (same RG 3685 comma layout as ventas; counterparty = supplier).
5. **Out of scope:** Inferring IVA from `OrdenCompra` totals; purchase credit notes / void tipo 999 (future issue).

## Consequences

- **Positive:** Audit-ready purchases book without fake data from purchase orders.
- **Negative:** Manual registration of supplier vouchers until purchase invoice capture UX expands.
- **Dependencies:** Reuses `exceljs`, `archiver`, and ventas format helpers.

## References

- [docs/api/openapi.yaml](../../api/openapi.yaml)
- [ADR-0013](ADR-0013-libro-iva-ventas-fase1.md)
- Issue #306

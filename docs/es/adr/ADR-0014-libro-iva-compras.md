# ADR-0014: Libro IVA Compras — comprobantes de proveedor (#306)

**Estado:** Aceptado  
**Fecha:** 2026-06-03  
**GitHub:** #306

---

## Contexto

ADR-0013 entregó el **Libro IVA Ventas** solo desde `Factura`. El issue #306 cierra la brecha de compras: `OrdenCompra` no modela comprobantes fiscales de proveedor (tipo A/B/C, netos/IVA, CAE).

## Decisión

1. **Modelo:** `ComprobanteCompra` con campos fiscales de cabecera alineados a `Factura` (neto1/2/3, iva1/2, total, tipo, prefijo, numero, proveedorId, ordenCompraId opcional).
2. **Alta de datos:** formulario en Finanzas **Alta de comprobante de compra** y `POST /api/comprobantes-compra` (módulo `finance.ledger`, permiso `reports.financial.read`).
3. **Exportación:** `GET /api/contabilidad/libro-iva-compras?periodo=YYYY-MM&format=preview|txt|xlsx`.
4. **TXT:** ZIP con `CBTU.txt` + `ALICUOTAS.txt` (mismo layout RG 3685 que ventas; contraparte = proveedor).
5. **Fuera de alcance:** Inferir IVA desde totales de `OrdenCompra`; notas de crédito de compra / anulación tipo 999 (issue futuro).

## Consecuencias

- **Positivo:** Libro de compras defendible sin datos ficticios desde órdenes de compra.
- **Negativo:** Registro manual vía formulario en Finanzas; ampliaciones futuras (NC compras, escáner) quedan fuera de alcance.
- **Dependencias:** Reutiliza `exceljs`, `archiver` y helpers de formato de ventas.

## Referencias

- [docs/api/openapi.yaml](../../api/openapi.yaml)
- [ADR-0013](ADR-0013-libro-iva-ventas-fase1.md)
- Issue #306

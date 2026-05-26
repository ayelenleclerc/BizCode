# ADR-0013: Libro IVA Ventas (Fase 1) — alcance y brecha Compras

**Estado:** Aceptado  
**Fecha:** 2026-05-26  
**GitHub:** #147 (Fase 1)

---

## Contexto

El issue #147 pide **Libro IVA Ventas** y **Compras** digital (ARCA / RG 3685). En el código actual:

- **`Factura`** tiene campos fiscales suficientes para una primera exportación de ventas: `tipo` (A/B/C), `neto1`/`neto2`/`neto3`, `iva1`/`iva2`, `total`, `estado`, `fecha`, `prefijo`, `numero`, CAE.
- **`OrdenCompra`** no modela comprobantes fiscales de proveedor (sin A/B/C, netos/IVA por alícuota, CAE). Inferir IVA desde `Articulo.condIva` no sería defendible ante auditoría.

Las notas de crédito del #146 (`NotaCredito`, ADR-0012) deben reflejarse en el libro de ventas cuando la anulación cae en el período.

## Decisión

1. **Alcance Fase 1:** implementar **solo Libro IVA Ventas** end-to-end.
2. **API:** `GET /api/contabilidad/libro-iva-ventas?periodo=YYYY-MM&format=preview|txt|xlsx`.
3. **Módulo:** `finance.ledger`; permiso `reports.financial.read` (roles `finance`, `auditor`, `owner`).
4. **Fuente de datos:** solo cabecera `Factura` persistida (sin inferir desde `FacturaItem` ni `Articulo`).
5. **TXT (`format=txt`):** ZIP con `CBTV.txt` + `ALICUOTAS.txt` (comas, importes con punto decimal, sin miles).
6. **Excel (`format=xlsx`):** planilla de revisión interna (no sustituto ARCA).
7. **NC / anulaciones (ADR-0012):**
   - Facturas vigentes (`estado=A`) con `fecha` en el período → CBTV + alícuotas normales.
   - `NotaCredito` con `createdAt` en el período → tipo NC (003/008/013 según origen) + alícuotas desde netos/IVA de origen; más CBTV **tipo 999** del comprobante anulado.
   - Numeración NC: hasta existir `prefijo`/`numero` fiscal propio, usar `NotaCredito.id` como número (limitación documentada).
8. **Fuera de alcance Fase 1:** Libro IVA Compras, `libro-iva-compras`, CBTU, mapeos desde `OrdenCompra` / `OrdenCompraItem`.
9. **Issue posterior:** modelar comprobantes fiscales de compra/proveedor y luego Libro IVA Compras.
10. **Validación ARCA:** pruebas estructurales; validador oficial puede quedar manual en el PR.

## Consecuencias

- **Positivo:** Export de ventas defendible sin datos ficticios de compras.
- **Negativo:** AC de compras del #147 diferidos; PR con `Part of #147`.

## Referencias

- [docs/api/openapi.yaml](../../api/openapi.yaml)
- [ADR-0012](ADR-0012-anulacion-factura-nota-credito.md)
- Issue #147

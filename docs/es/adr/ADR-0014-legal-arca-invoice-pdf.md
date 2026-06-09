# ADR-0014: PDF legal AFIP e ticket 80 mm (#148)

**Estado:** Aceptado  
**Fecha:** 2026-05-29  
**GitHub:** #148

---

## Contexto

El issue #133 entregó un PDF mínimo de factura. El #148 exige layout **fiscal legal** (alineado RG 4291), **QR** y código de barras **Interleaved 2 of 5** AFIP, datos de encabezado de empresa y ruta **ticket 80 mm**.

El repositorio **no** incluye herramienta oficial de certificación AFIP; se documenta como **alineado a práctica pública AFIP/ARCA**, no certificación completa.

## Decisión

1. **PDF legal:** `GET /api/facturas/:id/pdf` — exige CAE emitido; layout A4 con emisor/receptor, ítems, IVA, CAE, QR, código de barras.
2. **Vista previa:** `GET /api/facturas/:id/pdf/preview` — marca de agua, **no fiscal**.
3. **Ticket:** `GET /api/facturas/:id/ticket` — PDF 80 mm operativo; sin CAE emitido = **no fiscal**.
4. **Payloads:** funciones puras testeadas en `afipQrPayload.ts` / `afipBarcodePayload.ts`.
5. **Encabezado empresa:** campos mínimos en `ParamEmpresa` (migración conservadora).
6. **Validación:** tests estructurales; verificación manual en portal AFIP pendiente.

## Consecuencias

- **Positivo:** Evolución de #133 sin Puppeteer; lógica en `server/fiscal/ar/`.
- **Negativo:** Certificación RG 4291 completa no evidenciada en el repo.

## Referencias

- [docs/api/openapi.yaml](../../api/openapi.yaml)
- Issues #133, #148

# Impresión POS opcional (hardware opt-in)

**Relacionado:** GitHub [#153](https://github.com/ayelenleclerc/BizCode/issues/153) (Fase 1 mock en PR #311), [ADR-0007](../adr/ADR-0007-dual-deployment-and-fiscal-modularity.md), [vision-producto-y-despliegue.md](vision-producto-y-despliegue.md).

## Principio

Los controladores fiscales y las impresoras térmicas de 80 mm son **opcionales por cliente**. No son obligatorios para emitir facturas, obtener CAE ni descargar PDF legal.

| Capacidad | ¿Obligatoria? | Por defecto |
|-----------|---------------|-------------|
| PDF legal / factura electrónica (flujo CAE AFIP) | Sí (baseline del producto) | Siempre disponible |
| Controlador fiscal (Hasar/Epson/Olivetti, RS-232/USB) | No | Apagado (`FISCAL_PRINTER_ENABLED=false`) |
| Térmica 80 mm (ESC/POS) | No | Apagado (`THERMAL_PRINTER_ENABLED=false`) |

## Configuración en servidor

Variables en el **host de despliegue** (`.env`):

- `FISCAL_PRINTER_ENABLED=true` — opt-in al canal fiscal (Fase 1: mock; Fase 2: hardware real).
- `THERMAL_PRINTER_ENABLED=true` — opt-in al canal térmico (Fase 1: mock; Fase 2: ESC/POS).

Si un dispositivo está deshabilitado, `POST /api/facturas/{id}/print` y `POST /api/printing/test` devuelven `fallbackToPdf: true` y `downloadPath` al PDF legal cuando corresponde.

## API y UI

- `GET /api/printing/status` expone `fiscalPrinterEnabled` y `thermalPrinterEnabled`.
- **Facturación** muestra acciones fiscal/térmica solo si el flag está activo; el **PDF legal** siempre visible.
- **Configuración → Dispositivos de impresión** explica el opt-in y oculta pruebas si ambos flags están en false.

## Fase 2 (futuro, por cliente)

Drivers reales solo cuando el cliente provee hardware y criterios de aceptación. Issue de backlog dedicado; no bloquear tenants sin POS.

## Validación

```bash
npm run check:openapi && npm run check:openapi-sync
npm run test -- tests/api/printing-status.test.ts tests/api/factura-print.test.ts
```

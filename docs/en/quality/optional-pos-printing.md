# Optional POS printing (hardware opt-in)

**Related:** GitHub [#153](https://github.com/ayelenleclerc/BizCode/issues/153) (phase 1 mock delivered in PR #311), [ADR-0007](../adr/ADR-0007-dual-deployment-and-fiscal-modularity.md), [product-vision-and-deployment.md](product-vision-and-deployment.md).

## Principle

Fiscal controllers and 80mm thermal ticket printers are **optional per customer**. They are not required to issue invoices, obtain CAE, or download legal PDFs.

| Capability | Required? | Default |
|------------|-----------|---------|
| Legal PDF / electronic invoice (AFIP CAE flow) | Yes (product baseline) | Always available |
| Fiscal printer (Hasar/Epson/Olivetti, RS-232/USB) | No | Off (`FISCAL_PRINTER_ENABLED=false`) |
| Thermal 80mm (ESC/POS) | No | Off (`THERMAL_PRINTER_ENABLED=false`) |

## Server configuration

Set on the **deployment host** (`.env`), not per end-user session:

- `FISCAL_PRINTER_ENABLED=true` — opt in to fiscal driver path (phase 1: mock; phase 2: real hardware).
- `THERMAL_PRINTER_ENABLED=true` — opt in to thermal ticket path (phase 1: mock; phase 2: ESC/POS).

When a device is disabled, `POST /api/facturas/{id}/print` and `POST /api/printing/test` return `fallbackToPdf: true` and a `downloadPath` to the legal PDF where applicable.

## API and UI

- `GET /api/printing/status` exposes `fiscalPrinterEnabled` and `thermalPrinterEnabled` (no secrets).
- **Facturación** shows fiscal/thermal actions only when the corresponding flag is true; **legal PDF** remains always visible.
- **Configuración → Dispositivos de impresión** documents opt-in and hides device tests when both flags are false.

## Phase 2 (future, customer-specific)

Real drivers (RS-232/USB fiscal, ESC/POS thermal) are implemented only when a customer provides hardware and acceptance criteria. Track in a dedicated backlog issue; do not block tenants without POS hardware.

## Validation

```bash
npm run check:openapi && npm run check:openapi-sync
npm run test -- tests/api/printing-status.test.ts tests/api/factura-print.test.ts
```

# Export vertical — multi-currency, Incoterms and customs broker (#206)

**Module:** `vertical.export` (depends on `catalog.multicurrency`) · **Plan:** enterprise

MVP that lets an invoice be denominated in a foreign currency with an explicit exchange rate, records the Incoterm and the destination country, keeps customer balances separated by currency and emails the customs broker the order detail.

## Scope

### Implemented

| Capability | Evidence |
|---|---|
| Operation currency, total and rate on the invoice | `Factura.monedaOperacion`, `Factura.totalMonedaOperacion`, `Factura.incoterm`, `Factura.paisDestino` in [prisma/schema.prisma](../../../prisma/schema.prisma) |
| Incoterm and destination on the order plus the customs broker contact | `Pedido.incoterm`, `Pedido.paisDestino`, `Pedido.despachanteNombre`, `Pedido.despachanteEmail` |
| Running balance per currency | `MovimientoClienteCC.moneda` and `ClienteCuentaCorrienteService.getSaldosPorMoneda` |
| Validation rules | [apps/server/services/exportOperationMath.ts](../../../apps/server/services/exportOperationMath.ts) |
| Incoterms catalog and broker notification | [apps/server/routes/registerExportacionRoutes.ts](../../../apps/server/routes/registerExportacionRoutes.ts) |
| Sales report broken down by currency | `ReportesOperacionalesService.getVentasPorPeriodo` → `porMoneda[]` |

### Out of scope (residual)

- AFIP export voucher type E (`CbteTipo=19`) with `MonId` / `MonCotiz`. `arcaWsfeMock.ts` is a homologation mock that only accepts A/B/C, and `libroIvaVentas` fixes `COD_MONEDA_PES`. Real WSFE integration is a prerequisite (#133).
- Foreign-exchange settlement in the MULC.
- Any claim of exchange-control compliance.

## Domain rules

`normalizeExportFields` is the single source of truth and rejects with `422`:

- The Incoterm must belong to the 11 Incoterms 2020 rules (`EXW, FCA, CPT, CIP, DAP, DPU, DDP, FAS, FOB, CFR, CIF`).
- The destination country must be an ISO-3166-1 alpha-2 code.
- Supported currencies mirror the FX catalog of #243: `ARS`, `USD`, `EUR`.
- A currency other than `ARS` requires both a positive `totalMonedaOperacion` and a positive `tipoCambioOperacion`.

`Factura.total` always stays in local currency; the operation rate is persisted in the existing FX snapshot columns (`tipoCambioValor`, `tipoCambioMoneda`, `tipoCambioFecha`).

## Accounts receivable

`MovimientoClienteCC.moneda` defaults to `'ARS'`, so every entry created before #206 keeps its meaning. The running balance in `saldoPost` is now computed per `(customer, currency)` pair, and `Cliente.balance` keeps mirroring the local-currency ledger only — which is what the credit-limit check and the existing UI rely on.

`GET /api/clientes/{id}/cuenta-corriente/saldo` returns the local balance plus `saldosPorMoneda[]`. Aging (`/antiguedad`) is computed per currency: the local currency also covers invoices with no export data.

## Endpoints

| Method | Path | Permission |
|---|---|---|
| GET | `/api/exportacion/incoterms` | `products.read` |
| POST | `/api/pedidos/{id}/notificar-despachante` | `orders.create` |

Both require `vertical.export`; otherwise they answer `403 MODULE_NOT_ENABLED`. The notification stores the broker contact on the order, sends a plain-text summary and writes the `pedido_notificar_despachante` audit event. When SMTP is not configured the response returns `enviado: false` and the attempt is still audited. No customs declaration is filed.

Contract: [docs/api/openapi.yaml](../../api/openapi.yaml), tag `exportacion`.

## User interface

- Invoice form: currency selector, exchange rate prefilled from the current quote (`tiposCambioAPI.getVigente`) and editable, Incoterm and destination country. The panel only renders with the module enabled.
- Orders: Incoterm, destination and broker contact on creation, plus a "Notify broker" action per row.
- Customer account tab: balance per currency.

All strings are translated in EN/ES/PT-BR and every control exposes a stable `data-testid`.

## Tests

- [tests/server/exportOperationMath.test.ts](../../../tests/server/exportOperationMath.test.ts) — pure domain rules.
- [tests/api/exportacion.test.ts](../../../tests/api/exportacion.test.ts) — module gate, catalog and notification.
- [tests/server/services/clienteCuentaCorrienteService.test.ts](../../../tests/server/services/clienteCuentaCorrienteService.test.ts) — per-currency ledger.
- [packages/api-client/src/modules/exportacion.test.ts](../../../packages/api-client/src/modules/exportacion.test.ts) — HTTP client.
- `apps/web/src/pages/clientes/ClienteCuentaCorrienteSection.test.tsx` — balance panel.

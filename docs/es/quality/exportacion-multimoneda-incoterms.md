# Vertical exportación — multi-moneda, Incoterms y despachante (#206)

**Módulo:** `vertical.export` (depende de `catalog.multicurrency`) · **Plan:** enterprise

MVP que permite denominar una factura en moneda extranjera con tipo de cambio explícito, registrar el Incoterm y el país de destino, separar el saldo del cliente por moneda y enviar por email al despachante el detalle del pedido.

## Alcance

### Implementado

| Capacidad | Evidencia |
|---|---|
| Moneda, total y cotización de la operación en la factura | `Factura.monedaOperacion`, `Factura.totalMonedaOperacion`, `Factura.incoterm`, `Factura.paisDestino` en [prisma/schema.prisma](../../../prisma/schema.prisma) |
| Incoterm y destino en el pedido más el contacto del despachante | `Pedido.incoterm`, `Pedido.paisDestino`, `Pedido.despachanteNombre`, `Pedido.despachanteEmail` |
| Saldo corrido por moneda | `MovimientoClienteCC.moneda` y `ClienteCuentaCorrienteService.getSaldosPorMoneda` |
| Reglas de validación | [apps/server/services/exportOperationMath.ts](../../../apps/server/services/exportOperationMath.ts) |
| Catálogo de Incoterms y aviso al despachante | [apps/server/routes/registerExportacionRoutes.ts](../../../apps/server/routes/registerExportacionRoutes.ts) |
| Reporte de ventas con desglose por moneda | `ReportesOperacionalesService.getVentasPorPeriodo` → `porMoneda[]` |

### Fuera de alcance (residual)

- Comprobante AFIP de exportación tipo E (`CbteTipo=19`) con `MonId` / `MonCotiz`. `arcaWsfeMock.ts` es un mock de homologación que solo acepta A/B/C y `libroIvaVentas` fija `COD_MONEDA_PES`. La integración WSFE real es requisito previo (#133).
- Liquidación de divisas en el MULC.
- Cualquier afirmación de conformidad cambiaria.

## Reglas de dominio

`normalizeExportFields` es la única fuente de verdad y rechaza con `422`:

- El Incoterm debe pertenecer a las 11 reglas Incoterms 2020 (`EXW, FCA, CPT, CIP, DAP, DPU, DDP, FAS, FOB, CFR, CIF`).
- El país de destino debe ser un código ISO-3166-1 alpha-2.
- Las monedas admitidas reflejan el catálogo FX de #243: `ARS`, `USD`, `EUR`.
- Una moneda distinta de `ARS` exige `totalMonedaOperacion` y `tipoCambioOperacion` positivos.

`Factura.total` permanece siempre en moneda local; la cotización de la operación se persiste en las columnas de snapshot FX existentes (`tipoCambioValor`, `tipoCambioMoneda`, `tipoCambioFecha`).

## Cuenta corriente

`MovimientoClienteCC.moneda` tiene default `'ARS'`, de modo que todo asiento anterior a #206 conserva su significado. El saldo corrido de `saldoPost` ahora se calcula por par `(cliente, moneda)`, y `Cliente.balance` sigue reflejando solo el libro en moneda local, que es de lo que dependen el control de límite de crédito y la UI actual.

`GET /api/clientes/{id}/cuenta-corriente/saldo` devuelve el saldo local más `saldosPorMoneda[]`. La antigüedad (`/antiguedad`) se calcula por moneda: la moneda local también abarca las facturas sin datos de exportación.

## Endpoints

| Método | Ruta | Permiso |
|---|---|---|
| GET | `/api/exportacion/incoterms` | `products.read` |
| POST | `/api/pedidos/{id}/notificar-despachante` | `orders.create` |

Ambos requieren `vertical.export`; en caso contrario responden `403 MODULE_NOT_ENABLED`. La notificación guarda el contacto del despachante en el pedido, envía un resumen en texto plano y registra el evento de auditoría `pedido_notificar_despachante`. Si SMTP no está configurado la respuesta devuelve `enviado: false` y el intento igualmente se audita. No se presenta ninguna declaración aduanera.

Contrato: [docs/api/openapi.yaml](../../api/openapi.yaml), tag `exportacion`.

## Interfaz de usuario

- Formulario de factura: selector de moneda, cotización precargada con el tipo de cambio vigente (`tiposCambioAPI.getVigente`) y editable, Incoterm y país de destino. El panel solo se muestra con el módulo activo.
- Pedidos: Incoterm, destino y contacto del despachante al crear, más una acción «Notificar despachante» por fila.
- Pestaña de cuenta corriente: saldo por moneda.

Todos los textos están traducidos a EN/ES/PT-BR y cada control expone un `data-testid` estable.

## Pruebas

- [tests/server/exportOperationMath.test.ts](../../../tests/server/exportOperationMath.test.ts) — reglas puras de dominio.
- [tests/api/exportacion.test.ts](../../../tests/api/exportacion.test.ts) — gate de módulo, catálogo y notificación.
- [tests/server/services/clienteCuentaCorrienteService.test.ts](../../../tests/server/services/clienteCuentaCorrienteService.test.ts) — libro por moneda.
- [packages/api-client/src/modules/exportacion.test.ts](../../../packages/api-client/src/modules/exportacion.test.ts) — cliente HTTP.
- `apps/web/src/pages/clientes/ClienteCuentaCorrienteSection.test.tsx` — panel de saldo.

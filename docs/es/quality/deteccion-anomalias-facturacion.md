# Detección de anomalías en facturación — MVP (#200)

**Rol del documento:** Guía de calidad del producto para reglas estadísticas / heurísticas de anomalías de factura (Fase 1).  
**Issue relacionado:** [#200](https://github.com/ayelenleclerc/BizCode/issues/200)

**No** afirma Isolation Forest, microservicio Python ni tasa de falsos positivos &lt;5% medida en flota de producción.

## Alcance (MVP)

| Ítem | Evidencia en el repo |
|------|----------------------|
| Persistencia | Prisma `AnomaliaDetectada` (migración `20260826120000_anomalia_detectada_200`) |
| Math | [`facturaAnomalyMath.ts`](../../../apps/server/services/facturaAnomalyMath.ts) |
| Servicio | [`FacturaAnomalyService.ts`](../../../apps/server/services/FacturaAnomalyService.ts) desde `FacturaService.create` |
| Umbrales por tenant | Prisma `ConfigAnomaliaFactura`; `GET/PUT /api/anomalias/config` (`settings.business.manage`); sección en Empresa |
| Listado API / panel Admin | `GET /api/anomalias` (`audit.read`); página Admin `/admin/anomalias` |
| REST | `POST /api/facturas` — body opcional `confirmAnomalies`; respuesta puede incluir `warnings[]`; `422 DUPLICATE_INVOICE_CONFIRM_REQUIRED` |
| UI | Banner en `NuevaFacturaForm` + confirmar/cancelar duplicado; umbrales en Empresa; listado Admin de anomalías |
| Auditoría | `factura_anomaly_detected` (además de `factura_create`); `anomalia_config_update`; también en Audit Log |
| Fixture AC | Tests en `tests/server/facturaAnomalyMath.test.ts`, `tests/api/factura-anomaly.test.ts` (incl. OpenAPI Ajv para `POST /api/facturas` 422/200+warnings), `tests/api/anomalia-config.test.ts`, `tests/api/anomalia-list.test.ts` |

## Reglas (Fase 1)

1. **`factura_duplicada`** — mismo `clienteId` + mismo `total` + misma fecha calendario + `estado='A'`. Bloqueo suave sin `confirmAnomalies: true` → `422` + `warnings`. Con confirm → crea y persiste `confirmada=true`.
2. **`monto_inusual`** — cliente con **&gt; `minHistory`** (default 20) facturas activas; alerta si `|Z| &gt; zScoreThreshold` (default 3). Soft warning.
3. **`descuento_excesivo`** — promedio ponderado de `dscto` de líneas &gt; `discountThresholdPct` (default 30). Soft warning.
4. **`cliente_nuevo_compra_grande`** — ≤ 1 factura previa activa y `total &gt; newCustomerCreditFraction` (default 0.5) de `creditLimit` no nulo. Soft warning.

## Permisos

- `sales.create` en `POST /api/facturas`.
- `settings.business.manage` en `GET/PUT /api/anomalias/config`.
- `audit.read` en `GET /api/anomalias` y panel Admin de anomalías.

## Fuera de alcance / residual

- Isolation Forest / ML Fase 2
- Pico de ventas por vendedor (sin `vendedorId` en `Factura`)
- Cobro fuera de horario comercial enforceable
- FP &lt;5% en flota real
- Gates de aprobación de manager para disposición de anomalías

## Relacionado

- OpenAPI: `confirmAnomalies`, `warnings`, `FacturaAnomalyWarning`, `ConfigAnomaliaFactura*`, `AnomaliaDetectada*`
- Defaults en `facturaAnomalyMath.ts`; overrides por tenant vía `ConfigAnomaliaFactura`

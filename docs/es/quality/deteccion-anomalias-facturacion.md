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
| REST | `POST /api/facturas` — body opcional `confirmAnomalies`; respuesta puede incluir `warnings[]`; `422 DUPLICATE_INVOICE_CONFIRM_REQUIRED` |
| UI | Banner en `NuevaFacturaForm` + confirmar/cancelar duplicado |
| Auditoría | `factura_anomaly_detected` (además de `factura_create`); visible en Audit Log de Admin |
| Fixture AC | Tests en `tests/server/facturaAnomalyMath.test.ts` y `tests/api/factura-anomaly.test.ts` |

## Reglas (Fase 1)

1. **`factura_duplicada`** — mismo `clienteId` + mismo `total` + misma fecha calendario + `estado='A'`. Bloqueo suave sin `confirmAnomalies: true` → `422` + `warnings`. Con confirm → crea y persiste `confirmada=true`.
2. **`monto_inusual`** — cliente con **&gt; 20** facturas activas; alerta si `|Z| &gt; 3`. Soft warning.
3. **`descuento_excesivo`** — promedio ponderado de `dscto` de líneas &gt; **30%**. Soft warning.
4. **`cliente_nuevo_compra_grande`** — ≤ 1 factura previa activa y `total &gt; 50%` de `creditLimit` no nulo. Soft warning.

## Permisos

- Sin cambio: `sales.create` en `POST /api/facturas`.

## Fuera de alcance / residual

- Isolation Forest / ML Fase 2
- Pico de ventas por vendedor (sin `vendedorId` en `Factura`)
- Cobro fuera de horario comercial enforceable
- Panel dedicado (usar Audit Log + `AnomaliaDetectada`)
- FP &lt;5% en flota real
- Umbral de descuento configurable por tenant

## Relacionado

- OpenAPI: `confirmAnomalies`, `warnings`, `FacturaAnomalyWarning`
- Constantes en `facturaAnomalyMath.ts`

# Billing anomaly detection — MVP (#200)

**Document role:** Product quality guide for statistical / heuristic invoice anomaly rules (Fase 1).  
**Related issue:** [#200](https://github.com/ayelenleclerc/BizCode/issues/200)

Does **not** claim Isolation Forest, a Python microservice, or measured false-positive rate &lt;5% on production fleet data.

## Scope (MVP)

| Item | Evidence in repo |
|------|------------------|
| Persistence | Prisma `AnomaliaDetectada` (migration `20260826120000_anomalia_detectada_200`) |
| Math | [`facturaAnomalyMath.ts`](../../../apps/server/services/facturaAnomalyMath.ts) |
| Service | [`FacturaAnomalyService.ts`](../../../apps/server/services/FacturaAnomalyService.ts) hooked from `FacturaService.create` |
| REST | `POST /api/facturas` — optional body `confirmAnomalies`; response may include `warnings[]`; `422 DUPLICATE_INVOICE_CONFIRM_REQUIRED` |
| UI | `NuevaFacturaForm` banner + confirm/cancel for duplicates |
| Audit | `factura_anomaly_detected` (plus existing `factura_create`); rows visible in Admin Audit Log |
| AC fixture | Unit tests in `tests/server/facturaAnomalyMath.test.ts`; API tests in `tests/api/factura-anomaly.test.ts` |

## Rules (Fase 1)

1. **`factura_duplicada`** — same `clienteId` + same `total` + same calendar date + `estado='A'`. Soft block: without `confirmAnomalies: true` → `422` + `warnings` (no persist). With confirm → create, persist with `confirmada=true`.
2. **`monto_inusual`** — customer has **&gt; 20** active invoices; alert if `|Z| &gt; 3` vs mean/stddev of prior totals. Soft warning on successful create.
3. **`descuento_excesivo`** — weighted average line `dscto` % &gt; **30** (`ANOMALY_DISCOUNT_THRESHOLD_PCT`). Soft warning.
4. **`cliente_nuevo_compra_grande`** — ≤ 1 prior active invoice and `total &gt; 50%` of non-null `creditLimit`. Soft warning.

## Permissions

- Unchanged: `sales.create` on `POST /api/facturas`.

## Out of scope / residual

- Isolation Forest / ML Fase 2
- Peak sales by seller (`Factura` has no `vendedorId`)
- Collection outside business hours (no enforceable commercial-hours policy for cobros)
- Dedicated anomaly panel (use Audit Log + `AnomaliaDetectada`)
- FP &lt;5% measured on real production fleet
- Tenant-configurable discount threshold (fixed constant in MVP)

## Related

- OpenAPI: `FacturaInput.confirmAnomalies`, `FacturaEnvelope.warnings`, `FacturaAnomalyWarning`, `FacturaDuplicateConfirmErrorEnvelope`
- Constants documented in `facturaAnomalyMath.ts`

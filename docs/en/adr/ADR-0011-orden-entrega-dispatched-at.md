# ADR-0011: Explicit `dispatchedAt` on delivery orders

**Status:** Accepted  
**Date:** 2026-05-26  
**GitHub:** #145

---

## Context

Logistics KPIs (#145) require a reliable **dispatch** timestamp. Using `OrdenEntrega.updatedAt` as a proxy is unsafe because any field update changes the value. Assigning a route (`assigned`) does not mean the order left the warehouse.

## Decision

1. Add nullable `dispatchedAt` and `dispatchTimestampSource` (`event` | `estimated`) on `OrdenEntrega`.
2. Set both fields when estado becomes **`in_transit`** (physical dispatch):
   - [`RepartoService.iniciar`](../../../server/services/RepartoService.ts) (bulk on route start)
   - [`OrdenEntregaService.update`](../../../server/services/OrdenEntregaService.ts) (manual transition)
3. Only set when `dispatchedAt` is still null (first dispatch wins).
4. Migration backfill: prefer `AuditEvent` with action `orden_entrega_in_transit`; else `updatedAt` with `estimated`.
5. KPIs in [`LogisticaReportesService`](../../../server/services/LogisticaReportesService.ts) use `dispatchedAt` for denominators and delivery-time averages.

## Consequences

- **Positive:** Auditable dispatch event; first-visit rate and avg delivery time are explainable.
- **Negative:** Legacy rows without audit use estimated timestamps (documented in operator manual).
- **Out of scope:** OEs delivered without `RepartoItem` history are excluded from first-attempt numerators.

## References

- [docs/api/openapi.yaml](../../api/openapi.yaml) — `/api/logistica/*`
- Issue #145

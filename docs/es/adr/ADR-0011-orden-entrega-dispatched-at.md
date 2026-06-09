# ADR-0011: `dispatchedAt` explícito en órdenes de entrega

**Estado:** Aceptado  
**Fecha:** 2026-05-26  
**GitHub:** #145

---

## Contexto

Los KPIs logísticos (#145) requieren un timestamp de **despacho** fiable. Usar `OrdenEntrega.updatedAt` como proxy es inseguro porque cualquier actualización modifica el valor. Estar `assigned` a un reparto no implica salida física a ruta.

## Decisión

1. Campos nullable `dispatchedAt` y `dispatchTimestampSource` (`event` | `estimated`) en `OrdenEntrega`.
2. Se setean al pasar a **`in_transit`**:
   - [`RepartoService.iniciar`](../../../server/services/RepartoService.ts)
   - [`OrdenEntregaService.update`](../../../server/services/OrdenEntregaService.ts)
3. Solo si `dispatchedAt` es null (primer despacho).
4. Backfill en migración: `AuditEvent` con `orden_entrega_in_transit`; si no, `updatedAt` con `estimated`.
5. KPIs en [`LogisticaReportesService`](../../../server/services/LogisticaReportesService.ts) usan `dispatchedAt`.

## Consecuencias

- **Positivo:** evento de despacho auditable; métricas explicables.
- **Negativo:** histórico sin auditoría usa timestamps estimados (manual del operador).
- **Fuera de alcance:** OE entregadas sin `RepartoItem` quedan fuera del numerador de primer intento.

## Referencias

- [docs/api/openapi.yaml](../../api/openapi.yaml)
- Issue #145

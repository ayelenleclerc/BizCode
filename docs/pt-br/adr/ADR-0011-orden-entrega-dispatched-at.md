# ADR-0011: `dispatchedAt` explícito em ordens de entrega

**Status:** Aceito  
**Data:** 2026-05-26  
**GitHub:** #145

---

## Contexto

KPIs logísticos (#145) exigem timestamp de **despacho** confiável. `updatedAt` como proxy é inseguro; `assigned` não significa saída física para rota.

## Decisão

1. Campos nullable `dispatchedAt` e `dispatchTimestampSource` (`event` | `estimated`) em `OrdenEntrega`.
2. Definidos ao passar para **`in_transit`** em `RepartoService.iniciar` e `OrdenEntregaService.update`.
3. Apenas se `dispatchedAt` ainda for null.
4. Backfill: `AuditEvent` `orden_entrega_in_transit`; senão `updatedAt` com `estimated`.
5. KPIs em `LogisticaReportesService` usam `dispatchedAt`.

## Consequências

- **Positivo:** despacho auditável; métricas explicáveis.
- **Negativo:** legado sem auditoria usa estimativa (manual).
- **Fora de escopo:** OE sem `RepartoItem` fora do numerador de primeira visita.

## Referências

- [docs/api/openapi.yaml](../../api/openapi.yaml)
- Issue #145

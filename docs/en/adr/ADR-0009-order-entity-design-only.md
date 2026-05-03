# ADR-0009: Order / “Pedido” domain — design only until BP1-1

**Status:** Accepted  
**Date:** 2026-05-03  
**ISO reference:** ISO/IEC 12207 (design vs implementation lifecycle); ISO 9001:2015 clause 8.3 (design and development)

---

## Context

Quality docs describe a target lifecycle for **pedido → entrega → cobrança** (`docs/en/quality/operational-flow-order-delivery-collection.md`). The RBAC vocabulary already exposes `orders.*` permissions in [`src/lib/rbac.ts`](../../../../src/lib/rbac.ts). The database and public REST contract **do not** yet model a persisted `Pedido` entity (`docs/api/openapi.yaml` MVP scope is cliente / producto / factura).

GitHub backlog item **BP1-1** (orders) decides when to implement persistence and APIs.

## Decision

1. Treat the **pedido/order** lifecycle as **design-only** until BP1-1 is executed and an implementation plan + migrations are approved.
2. Do **not** add Prisma models or REST routes for `Pedido` in this backlog slice; keep the authoritative design narrative in [`docs/en/quality/operational-flow-order-delivery-collection.md`](../../quality/operational-flow-order-delivery-collection.md) and equivalents in ES/PT-BR.
3. When BP1-1 starts: align schema and OpenAPI with the states and RACI table in that doc, and wire **`orders.*`** to real handlers (with audit parity per `#84`).
4. **Channel scope:** the optional header `x-bizcode-channel` (see [`server/auth.ts`](../../../../server/auth.ts) and [`docs/api/openapi.yaml`](../../api/openapi.yaml)) remains orthogonal; order APIs must respect authenticated `claims.scope.channels` the same way as existing routes once implemented.

## Consequences

- **Positive:** No speculative schema or undocumented endpoints; audit and contract tests remain truthful to the codebase.
- **Negative:** Operational “order” workflows stay manual/off-system until BP1-1 ships.
- **Follow-up:** On implementation, update this ADR status or supersede with a numbered ADR for the concrete `Pedido` schema.

## Alternatives considered (GitHub #69)

| Option | Rationale | Why not now |
|--------|-----------|-------------|
| Flat `estado` string without enum | Faster spike | Harder to enforce transitions and i18n labels consistently. |
| Event-sourced order log | Full audit of transitions | Heavier operations and read models; defer until product requires replay. |
| Single wide `Pedido` row with JSON `items` | Fewer tables | Weak relational integrity vs `Articulo`/`Cliente`; Prisma relations preferred when implemented. |

**Chosen path for BP1-1:** relational `Pedido` + `PedidoItem` (sketched, not migrated) with an explicit `PedidoEstado` enum keyed as in the operational-flow doc (`draft` … `collected`).

## Currency strategy

**Tenant-default currency** for the first implementation slice (see [order-domain-implementation-sketch.md](../quality/order-domain-implementation-sketch.md)). Multi-currency requires a separate ADR if product mandates FX rules.

## State machine (implementation keys)

Authoritative mapping from the UX-facing diagram to persisted/API keys lives in the **Canonical implementation states** section of [`operational-flow-order-delivery-collection.md`](../quality/operational-flow-order-delivery-collection.md) (EN; ES/PT in locale map).

## References

- [`docs/en/quality/operational-flow-order-delivery-collection.md`](../../quality/operational-flow-order-delivery-collection.md)
- [`docs/en/quality/order-domain-implementation-sketch.md`](../quality/order-domain-implementation-sketch.md)
- [`docs/api/openapi.yaml`](../../api/openapi.yaml)

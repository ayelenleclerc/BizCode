# ADR-0009: Order / “Pedido” domain — design and commercial MVP slice

**Status:** Accepted (updated 2026-05-18: MVP slice #132 in code; modular gating #223)  
**Date:** 2026-05-03  
**ISO reference:** ISO/IEC 12207 (design vs implementation lifecycle); ISO 9001:2015 clause 8.3 (design and development)

---

## Context

Quality docs describe a target lifecycle for **pedido → delivery → collection** (`docs/en/quality/operational-flow-order-delivery-collection.md`). RBAC exposes `orders.*` in [`src/lib/rbac.ts`](../../../../src/lib/rbac.ts).

**Repository evidence (MVP #132):** `Pedido` / `PedidoItem` in [`prisma/schema.prisma`](../../../../prisma/schema.prisma); `GET/POST/PUT/DELETE /api/pedidos` plus `POST .../confirm` and `POST .../invoice` in [`server/routes/registerPedidosRoutes.ts`](../../../../server/routes/registerPedidosRoutes.ts); contract in [`docs/api/openapi.yaml`](../../api/openapi.yaml). States in this slice: `draft`, `confirmed`, `invoiced`, `cancelled` (not the full logistics cycle `packed`…`collected` — backlog #65).

**Modular gating (#223):** orders require `billing.orders` via `requireModule` and per-tenant `TenantConfig`.

## Decision

1. **Commercial BP1-1 slice (#132):** persist `Pedido` + `PedidoItem` and expose documented OpenAPI routes with audit actions `pedido_*`.
2. **Pending (#65 / full BP1-1):** logistics states and pedido→delivery→collection links per the operational-flow doc.
3. Keep the operational-flow narrative in EN/ES/PT-BR as the target lifecycle reference.
4. **Channel scope:** optional `x-bizcode-channel` remains orthogonal; order APIs respect `claims.scope.channels` like other authenticated routes.

## Consequences

- **Positive:** Contract, tests, and docs match the commercial MVP; per-tenant module gating without Redis (in-process cache, #223).
- **Negative:** Full diagram lifecycle remains partial until #65.

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

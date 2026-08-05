# ADR-0009: Order / “Pedido” domain — design, MVP, and full BP1-1 lifecycle

**Status:** Accepted (updated 2026-08-05: full lifecycle #391; prior MVP #132 + gating #223)  
**Date:** 2026-05-03  
**ISO reference:** ISO/IEC 12207 (design vs implementation lifecycle); ISO 9001:2015 clause 8.3 (design and development)

---

## Context

Quality docs describe the lifecycle **pedido → delivery → collection** (`docs/en/quality/operational-flow-order-delivery-collection.md`). RBAC exposes `orders.*`.

**Commercial MVP (#132):** `Pedido` / `PedidoItem`; `GET/POST/PUT/DELETE /api/pedidos` plus `confirm` / `invoice`; states `draft`, `confirmed`, `invoiced`, `cancelled`. Paths live under [`apps/server/routes/registerPedidosRoutes.ts`](../../../../apps/server/routes/registerPedidosRoutes.ts).

**Modular gating (#223):** module `billing.orders`.

**Full BP1-1 (#391):** logistics states `packed`, `shipped`, `delivered`, financial close `collected`; endpoints `pack` / `ship` / `deliver` / `collect` / `transitions`; remito/OE → Pedido sync; cobro → `collected` when Factura is fully paid. Design history: GitHub #65 (design-only, closed).

## Decision

1. Persist `Pedido` + `PedidoItem` with `estado` as validated string keys (`draft` … `collected` | `cancelled`) — not a Prisma enum — to avoid migration churn (TS/`pedidoStateMachine` enforce adjacency).
2. **Early invoice:** `confirmed → invoiced` may run before logistics. Invoicing from `packed|shipped|delivered` sets `facturaId` and **keeps** the logistics `estado`.
3. `collect` requires linked `facturaId` and Factura fully imputed via recibo de cobro; allowed from `invoiced` or `delivered`.
4. Cancel only from `draft` | `confirmed`.
5. Channel scope (`x-bizcode-channel`) remains orthogonal.

## Consequences

- **Positive:** Single Pedido estado spans commercial + logistics + collection; OE/remito/cobros machines stay specialized and sync into Pedido.
- **Negative:** Dual machines (Pedido vs OE) need careful sync tests; ecommerce origins must keep skip-stock / mark-dispatched behavior.

## Currency strategy

**Tenant-default currency** for this slice. Multi-currency requires a separate ADR.

## References

- [`docs/en/quality/operational-flow-order-delivery-collection.md`](../quality/operational-flow-order-delivery-collection.md)
- GitHub #65 (design), #132 (MVP), #223 (gating), #391 (full lifecycle)
- [`docs/api/openapi.yaml`](../../api/openapi.yaml)
- [`apps/server/lib/pedidoStateMachine.ts`](../../../../apps/server/lib/pedidoStateMachine.ts)

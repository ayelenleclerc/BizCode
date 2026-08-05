# Order (`Pedido`) domain — implementation sketch (BP1-1)

**Superseded for implementation by #391.** Historical Prisma/OpenAPI sketch retained for traceability. Live contract: [`docs/api/openapi.yaml`](../../api/openapi.yaml); machine: [`apps/server/lib/pedidoStateMachine.ts`](../../../apps/server/lib/pedidoStateMachine.ts); ADR-0009.

## Prisma sketch (indicative — historical)

```prisma
// SKETCH — applied as String estado + app validation (#391), not Prisma enum
// enum PedidoEstado {
//   draft, confirmed, packed, shipped, delivered, invoiced, collected, cancelled
// }
```

## OpenAPI path sketch → implemented

| Method | Path | Status |
|--------|------|--------|
| `POST` | `/api/pedidos` | Implemented |
| `GET` | `/api/pedidos` | Implemented |
| `GET` | `/api/pedidos/:id` | Implemented |
| `PUT` | `/api/pedidos/:id` | Implemented |
| `POST` | `/api/pedidos/:id/transitions` | Implemented (#391) |
| `POST` | `/api/pedidos/:id/pack\|ship\|deliver\|collect` | Implemented (#391) |
| `POST` | `/api/pedidos/:id/invoice` | Implemented (early invoice) |

## Currency strategy

**Tenant-default currency** (ADR-0009).

## References

- [operational-flow-order-delivery-collection.md](operational-flow-order-delivery-collection.md)
- [ADR-0009](../adr/ADR-0009-order-entity-design-only.md)
- GitHub #391

# Order (`Pedido`) domain — implementation sketch (BP1-1)

**Design only.** No migration or route in this repository slice is implied by this file. Supersedes nothing; when BP1-1 is executed, replace sketches with real `schema.prisma` and `openapi.yaml` fragments.

## Prisma sketch (indicative)

```prisma
// SKETCH — not applied. Align field names and enums with operational-flow-order-delivery-collection.md
// model Pedido {
//   id          Int      @id @default(autoincrement())
//   tenantId    Int
//   estado      PedidoEstado
//   clienteId   Int
//   channel     String?  // optional snapshot; authority remains AuthScope + header rules
//   createdAt   DateTime @default(now())
//   updatedAt   DateTime @updatedAt
//   items       PedidoItem[]
//   tenant      Tenant   @relation(fields: [tenantId], references: [id])
//   cliente     Cliente  @relation(fields: [clienteId], references: [id])
// }
//
// model PedidoItem {
//   id         Int @id @default(autoincrement())
//   pedidoId   Int
//   articuloId Int
//   cantidad   Decimal
//   precioUnit Decimal
//   pedido     Pedido   @relation(fields: [pedidoId], references: [id])
//   articulo   Articulo @relation(fields: [articuloId], references: [id])
// }
//
// enum PedidoEstado {
//   draft
//   confirmed
//   packed
//   shipped
//   delivered
//   invoiced
//   collected
// }
```

## OpenAPI path sketch (indicative)

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/pedidos` | Create in `draft` |
| `GET` | `/api/pedidos` | List (tenant-scoped, paginated) |
| `GET` | `/api/pedidos/:id` | Detail + items |
| `PUT` | `/api/pedidos/:id` | Update while allowed by `estado` |
| `POST` | `/api/pedidos/:id/transitions` | Body: `{ "to": "confirmed" \| "packed" \| ... }` with server-side validation |
| `POST` | `/api/pedidos/:id/invoice` | Optional shortcut to create/link `Factura` and set `invoiced` |

All routes: `requirePermission` with `orders.*` as per [rbac-matrix-roles-permissions-scopes.md](rbac-matrix-roles-permissions-scopes.md); respect `x-bizcode-channel` per [ADR-0009](../adr/ADR-0009-order-entity-design-only.md).

## Currency strategy (decision placeholder)

**Default for MVP:** single **tenant-default currency** on `Tenant` (or reuse existing monetary fields on `Factura`); no multi-currency conversion in the first BP1-1 slice unless product signs off. If multi-currency is required later, add `currency` on `Pedido` + conversion policy ADR.

## Legacy `PEDIDO*.DBF` (optional mapping)

When source files are available under an agreed path, map legacy columns to `Pedido` / `PedidoItem` fields in `scripts/` documentation (see `scripts/MIGRACION_PROGRAMA_VIEJO.md` pattern). Do not hard-code host-specific absolute paths in controlled docs.

## References

- [operational-flow-order-delivery-collection.md](operational-flow-order-delivery-collection.md)
- [ADR-0009](../adr/ADR-0009-order-entity-design-only.md)
- [master-plan-bizcode-execution.md](master-plan-bizcode-execution.md)

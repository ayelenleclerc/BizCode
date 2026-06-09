# Dominio Pedido — boceto de implementación (BP1-1)

**Solo diseño.** Este archivo no implica migración ni rutas en el repositorio. Cuando se ejecute BP1-1, sustituir los bocetos por fragmentos reales de `schema.prisma` y `openapi.yaml`.

## Boceto Prisma (indicativo)

Misma forma que la versión en inglés: ver [order-domain-implementation-sketch.md](../../en/quality/order-domain-implementation-sketch.md) sección «Prisma sketch» (los comentarios Prisma son idénticos en inglés para evitar divergencia de nombres de enum).

## Boceto OpenAPI (indicativo)

| Método | Ruta | Propósito |
|--------|------|-----------|
| `POST` | `/api/pedidos` | Alta en `draft` |
| `GET` | `/api/pedidos` | Listado (tenant, paginado) |
| `GET` | `/api/pedidos/:id` | Detalle + ítems |
| `PUT` | `/api/pedidos/:id` | Actualización según `estado` |
| `POST` | `/api/pedidos/:id/transitions` | Cuerpo `{ "to": "confirmed" \| ... }` con validación servidor |
| `POST` | `/api/pedidos/:id/invoice` | Atajo opcional hacia `Factura` y estado `invoiced` |

Rutas con `requirePermission` y `orders.*`; cabecera `x-bizcode-channel` según [ADR-0009](../adr/ADR-0009-entidad-pedido-diseno-previo-a-bp1-1.md).

## Moneda

**MVP por defecto:** moneda única por tenant; sin multi-moneda en el primer slice de BP1-1 salvo decisión explícita de producto (entonces ADR adicional).

## Referencias

- [flujo-operativo-pedido-entrega-cobranza.md](flujo-operativo-pedido-entrega-cobranza.md)
- [ADR-0009](../adr/ADR-0009-entidad-pedido-diseno-previo-a-bp1-1.md)

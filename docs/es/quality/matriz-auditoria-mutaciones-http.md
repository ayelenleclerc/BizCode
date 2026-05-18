# Matriz: mutaciones HTTP → AuditEvent (issue #84)

Este documento refleja rutas cuyos caminos felices persisten cambios **y** generan una fila en `AuditEvent` con la acción indicada.

Evidencia automática equivalente en `tests/server/http-mutations-audit-coverage.test.ts`.

## Mutaciones auditadas en dominio REST

| Método | Ruta | `AuditEvent.action` | Recurso / notas |
|--------|------|---------------------|----------------|
| POST | `/api/clientes` | `cliente_create` | `resource: cliente` |
| PUT | `/api/clientes/:id` | `cliente_update` | `resourceId` del path |
| POST | `/api/articulos` | `articulo_create` | `resource: articulo` |
| PUT | `/api/articulos/:id` | `articulo_update` | `resourceId` del path |
| POST | `/api/rubros` | `rubro_create` | `resource: rubro` |
| POST | `/api/proveedores` | `proveedor_create` | `resource: proveedor` |
| PUT | `/api/proveedores/:id` | `proveedor_update` | `resourceId` del path |
| POST | `/api/facturas` | `factura_create` | `resource: factura` |
| PUT | `/api/facturas/:id/void` | `factura_void` | motivo persistido dentro de la misma operación auditada |
| PUT | `/api/afip/config` | `afip_config_upsert` | credenciales cifradas en reposo |
| POST | `/api/afip/cae` | `afip_cae_request` | `resource: factura` |
| POST | `/api/pedidos` | `pedido_create` | `resource: pedido`; respuesta **201** |
| PUT | `/api/pedidos/:id` | `pedido_update` | solo estado `draft` |
| POST | `/api/pedidos/:id/confirm` | `pedido_confirm` | `draft` → `confirmed` |
| POST | `/api/pedidos/:id/invoice` | `pedido_invoice` | metadata `facturaId` cuando aplica |
| DELETE | `/api/pedidos/:id` | `pedido_cancel` | soft cancel → `cancelled` |
| POST | `/api/zonas-entrega` | `delivery_zone_create` | código HTTP esperado por contrato/ruta puede ser **201** |
| PUT | `/api/zonas-entrega/:id` | `delivery_zone_update` | `resourceId` del path |
| POST | `/api/compras` | `orden_compra_create` | `resource: orden_compra` |
| PUT | `/api/compras/:id` | `orden_compra_update` | `resourceId` del path |
| POST | `/api/compras/:id/send` | `orden_compra_send` | `resourceId` del path |
| POST | `/api/compras/:id/cancel` | `orden_compra_cancel` | `resourceId` del path |
| POST | `/api/compras/:id/receive` | `orden_compra_receive` | `resourceId` del path; `StockAjuste` motivo `compra` |
| POST | `/api/cobranzas/recordatorios` | `cobranza_recordatorio_send` | `resource: factura`, `resourceId` = `facturaId` del body |

## Consulta del registro de auditoría (#67)

Los operadores con permiso `audit.read` pueden obtener el listado paginado mediante **GET** `/api/audit-events` (filtros y paginación descritos en el contrato OpenAPI) y revisar los eventos en la aplicación en la ruta **`/admin/audit-log`**.

## Exclusiones (no objeto de esta tabla)

Operaciones sólo lectura (**GET**/listados) y otros dominios (**auth**, **notifications**, etc.) están fuera de esta matriz; si se exige auditoría adicional debe definirse en issue y tests dedicados.

**Otros idiomas:** [English](../../en/quality/audit-http-mutations-matrix.md) · [Português](../../pt-br/quality/audit-http-mutations-matrix.md)

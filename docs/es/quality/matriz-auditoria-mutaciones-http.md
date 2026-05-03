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
| POST | `/api/zonas-entrega` | `delivery_zone_create` | código HTTP esperado por contrato/ruta puede ser **201** |
| PUT | `/api/zonas-entrega/:id` | `delivery_zone_update` | `resourceId` del path |

## Exclusiones (no objeto de esta tabla)

Operaciones sólo lectura (**GET**/listados) y otros dominios (**auth**, **notifications**, etc.) están fuera de esta matriz; si se exige auditoría adicional debe definirse en issue y tests dedicados.

**Otros idiomas:** [English](../../en/quality/audit-http-mutations-matrix.md) · [Português](../../pt-br/quality/audit-http-mutations-matrix.md)

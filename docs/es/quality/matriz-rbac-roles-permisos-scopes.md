# Matriz RBAC — roles, permisos y scopes

**Fuente de verdad en código:** [`ROLE_PERMISSIONS`](../../../src/lib/rbac.ts) y constantes relacionadas en [`src/lib/rbac.ts`](../../../src/lib/rbac.ts). **No** hay tablas separadas `role_permissions` / `user_roles`; el rol del usuario de aplicación se guarda como enum Prisma en `AppUser` (véase [`prisma/schema.prisma`](../../../prisma/schema.prisma)).

## Rol → permisos

| Rol | Permisos (según `ROLE_PERMISSIONS`) |
|-----|----------------------------------------|
| `super_admin` | Todos los `OWNER_PERMISSIONS` más `platform.tenants.manage`, `platform.support.impersonate` |
| `owner` | `users.manage`, `roles.assign`, `sales.create`, `sales.cancel`, `customers.read`, `customers.manage`, `products.read`, `products.manage`, `inventory.adjust`, `orders.create`, `orders.pick`, `orders.dispatch`, `orders.deliver.confirm`, `reports.operational.read`, `reports.financial.read`, `settings.business.manage`, `settings.fiscal.manage`, `audit.read` |
| `manager` | `sales.create`, `sales.cancel`, `customers.read`, `customers.manage`, `products.read`, `products.manage`, `inventory.adjust`, `orders.create`, `orders.pick`, `orders.dispatch`, `reports.operational.read`, `audit.read` |
| `seller` | `sales.create`, `customers.read`, `customers.manage`, `orders.create`, `products.read` |
| `backoffice` | `customers.read`, `customers.manage`, `products.read`, `reports.operational.read` |
| `warehouse_op` | `orders.pick`, `products.read` |
| `warehouse_lead` | `orders.pick`, `orders.dispatch`, `inventory.adjust`, `reports.operational.read` |
| `logistics_planner` | `orders.dispatch`, `reports.operational.read` |
| `driver` | `orders.deliver.confirm` |
| `billing` | `sales.create`, `sales.cancel`, `reports.operational.read` |
| `cashier` | `sales.create`, `reports.operational.read` |
| `collections` | `reports.operational.read`, `reports.financial.read` |
| `finance` | `reports.financial.read`, `audit.read` |
| `auditor` | `reports.operational.read`, `reports.financial.read`, `audit.read` |

Los literales completos de permisos están en `PERMISSIONS` en el mismo archivo.

## Canales (`USER_CHANNELS`)

Definidos en código: `counter`, `field`, `backoffice`, `warehouse`, `delivery`. Forman parte de `AuthScope.channels` y persisten en `AppUser.scopeChannels` (esquema Prisma). El **refuerzo** del “canal actual” en cada petición HTTP **no está evidenciado** en `server/auth.ts` ni `server/createApp.ts` en el momento de redactar esto; el alcance se carga en `AuthClaims` para uso futuro.

## Local frente a SaaS

- **Mismo modelo:** multi-tenant `Tenant`, sesión por cookie, `AuthClaims` con rol y permisos derivados (véase [modelo-iam-sesiones-auditoria.md](modelo-iam-sesiones-auditoria.md)).
- Las **diferencias de despliegue** (escritorio vs SaaS, módulos fiscales por jurisdicción) siguen PROD-VISION-001 y ADR-0007; esta matriz no duplica reglas fiscales.

## Minorista vs mayorista (marco de negocio)

- Escenarios **minoristas** encajan con roles como `seller`, `cashier` y canales `counter`/`field` para punto de venta y atención al cliente.
- Escenarios **mayorista / distribución** apoyan roles `warehouse_op`, `warehouse_lead`, `logistics_planner`, `driver` y canales `delivery`/`warehouse` para picking, despacho y confirmación de entrega.
- Los permisos `orders.*` apoyan un dominio de **pedidos futuro**; **no** hay entidad `pedido` / orden evidenciada en el esquema Prisma ni en paths OpenAPI actuales. La facturación vigente usa `facturas` y permisos relacionados (`sales.create`, `reports.operational.read`, etc.).

## Documentos relacionados

- Índice de ejecución del plan maestro: [ejecucion-plan-maestro-bizcode.md](ejecucion-plan-maestro-bizcode.md)
- Flujo operativo (diseño): [flujo-operativo-pedido-entrega-cobranza.md](flujo-operativo-pedido-entrega-cobranza.md)

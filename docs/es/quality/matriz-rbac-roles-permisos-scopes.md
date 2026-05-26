# Matriz RBAC — roles, permisos y scopes

**Fuente de verdad en código:** [`ROLE_PERMISSIONS`](../../../src/lib/rbac.ts) y constantes relacionadas en [`src/lib/rbac.ts`](../../../src/lib/rbac.ts). **No** hay tablas separadas `role_permissions` / `user_roles`; el rol del usuario de aplicación se guarda como enum Prisma en `AppUser` (véase [`prisma/schema.prisma`](../../../prisma/schema.prisma)).

## Rol → permisos

| Rol | Permisos (según `ROLE_PERMISSIONS`) |
|-----|----------------------------------------|
| `super_admin` | Todos los `OWNER_PERMISSIONS` más `platform.tenants.manage`, `platform.support.impersonate` |
| `owner` | `users.manage`, `roles.assign`, `sales.create`, `sales.cancel`, `customers.read`, `customers.manage`, `products.read`, `products.manage`, `inventory.adjust`, `inventory.count`, `orders.create`, `orders.pick`, `orders.dispatch`, `orders.deliver.confirm`, `reports.operational.read`, `reports.financial.read`, `settings.business.manage`, `settings.fiscal.manage`, `audit.read` |
| `manager` | `sales.create`, `sales.cancel`, `customers.read`, `customers.manage`, `products.read`, `products.manage`, `inventory.adjust`, `inventory.count`, `orders.create`, `orders.pick`, `orders.dispatch`, `reports.operational.read`, `audit.read` |
| `seller` | `sales.create`, `customers.read`, `customers.manage`, `orders.create`, `products.read` |
| `backoffice` | `customers.read`, `customers.manage`, `products.read`, `reports.operational.read` |
| `warehouse_op` | `orders.pick`, `products.read` |
| `warehouse_lead` | `orders.pick`, `orders.dispatch`, `inventory.adjust`, `inventory.count`, `reports.operational.read` |
| `logistics_planner` | `orders.dispatch`, `reports.operational.read` |
| `driver` | `orders.deliver.confirm` |
| `billing` | `sales.create`, `sales.cancel`, `reports.operational.read` |
| `cashier` | `sales.create`, `reports.operational.read` |
| `collections` | `reports.operational.read`, `reports.financial.read` |
| `finance` | `reports.financial.read`, `audit.read` |
| `auditor` | `reports.operational.read`, `reports.financial.read`, `audit.read` |

Los literales completos de permisos están en `PERMISSIONS` en el mismo archivo.

**Picking (#143):** `GET /api/ordenes-entrega` admite también `orders.pick` (p. ej. `warehouse_op`). `POST .../iniciar-picking` y `POST .../lista` requieren `orders.pick` y módulo `logistics.picking`.

## Canales (`USER_CHANNELS`)

Definidos en código: `counter`, `field`, `backoffice`, `warehouse`, `delivery`. Forman parte de `AuthScope.channels` y persisten en `AppUser.scopeChannels` (esquema Prisma). El refuerzo está activo mediante `requirePermission` en [`server/auth.ts`](../../../server/auth.ts), validando `x-bizcode-channel` opcional contra el scope de `AuthClaims`.

## Local frente a SaaS

- **Mismo modelo:** multi-tenant `Tenant`, sesión por cookie, `AuthClaims` con rol y permisos derivados (véase [modelo-iam-sesiones-auditoria.md](modelo-iam-sesiones-auditoria.md)).
- Las **diferencias de despliegue** (escritorio vs SaaS, módulos fiscales por jurisdicción) siguen PROD-VISION-001 y ADR-0007; esta matriz no duplica reglas fiscales.

## Minorista vs mayorista (marco de negocio)

- Escenarios **minoristas** encajan con roles como `seller`, `cashier` y canales `counter`/`field` para punto de venta y atención al cliente.
- Escenarios **mayorista / distribución** apoyan roles `warehouse_op`, `warehouse_lead`, `logistics_planner`, `driver` y canales `delivery`/`warehouse` para picking, despacho y confirmación de entrega.
- Los permisos `orders.*` apoyan un dominio de **pedidos futuro**; **no** hay entidad `pedido` / orden evidenciada en el esquema Prisma ni en paths OpenAPI actuales. La facturación vigente usa `facturas` y permisos relacionados (`sales.create`, `reports.operational.read`, etc.).

## Módulos de producto (analítica dashboard #138)

La pestaña **Inicio → Análisis** usa `GET /api/dashboard/ventas-historico` y exige **`reports.operational.read`** más el módulo de tenant **`analytics.advanced`** (depende de `analytics.dashboard`). No se añadió un permiso literal nuevo.

## Repartos (#140)

La UI `/logistica/repartos` depende del módulo **`logistics.dispatches`**. API: listado/detalle `GET /api/repartos` y `GET /api/repartos/{id}` exigen **`logistics.read`**; crear, iniciar y cerrar exigen **`orders.dispatch`**. Roles típicos: `owner`, `manager`, `logistics_planner`, `warehouse_lead` (véase `ROLE_PERMISSIONS` en código para `logistics.read` del planificador).

## Comprobante de entrega (POD) (#142)

Módulo **`logistics.pod`**. UI chofer `/logistica/repartos/chofer` requiere **`orders.deliver.confirm`** (rol `driver` en su reparto). `PUT /api/repartos/{id}/items/{itemId}` usa el mismo permiso; el servicio exige `choferId === actor.userId` para `driver`. `GET /api/repartos/{id}/items/{itemId}/pod` exige **`logistics.read`** y rol ∈ `owner`, `manager`, `logistics_planner` (excluye `driver`).

## KPIs y reportes logísticos (#145)

Módulo **`logistics.dispatches`**. `GET /api/logistica/kpis`, `reporte-choferes`, `reporte-zonas`: **`logistics.read`**; roles `owner`, `manager`, `logistics_planner` (pestaña en `/logistica`; chofer excluido). CSV con `Accept: text/csv` en reportes de choferes/zonas.

## Seguimiento GPS (#144)

Módulo **`logistics.gps`**. UI `/logistica/seguimiento`: **`logistics.read`** y `GPS_VIEW_ROLES` (`owner`, `manager`, `logistics_planner`). `GET /api/repartos/activos` y `GET .../ubicacion/ultima` (planificador; chofer solo en su reparto en `ultima`). `POST /api/repartos/{id}/ubicacion`: **`orders.deliver.confirm`**, chofer dueño, reparto `on_route`; el chofer no puede listar activos.

## Notas de crédito y anulación de factura (#146)

Módulo de tenant **`billing.credit_notes`**. `PUT /api/facturas/{id}/void` requiere **`sales.cancel`** y el módulo; el motivo en el cuerpo cumple la longitud mínima del esquema en servidor (10 caracteres). **`GET /api/notas-credito`** y **`GET /api/notas-credito/{id}`** requieren **`reports.financial.read`** *o* **`reports.operational.read`**. UI: la acción **Anular factura** en **`Facturación`** (`ListadoFacturas.tsx`) solo si está habilitado `billing.credit_notes`; **Finanzas** lista notas en el mismo módulo (la página sigue exigiendo `reports.financial.read`). Véase [`ADR-0012`](../adr/ADR-0012-anulacion-factura-nota-credito.md).

## Documentos relacionados

- Índice de ejecución del plan maestro: [ejecucion-plan-maestro-bizcode.md](ejecucion-plan-maestro-bizcode.md)
- Flujo operativo (diseño): [flujo-operativo-pedido-entrega-cobranza.md](flujo-operativo-pedido-entrega-cobranza.md)

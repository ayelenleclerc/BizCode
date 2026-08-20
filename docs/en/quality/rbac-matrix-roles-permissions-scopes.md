# RBAC matrix — roles, permissions, scopes

**Source of truth in code:** [`ROLE_PERMISSIONS`](../../../src/lib/rbac.ts) and related constants in [`src/lib/rbac.ts`](../../../src/lib/rbac.ts). There are **no** separate `role_permissions` / `user_roles` tables; the app user’s role is stored as a Prisma enum on `AppUser` (see [`prisma/schema.prisma`](../../../prisma/schema.prisma)).

## Role → permissions

| Role | Permissions (from `ROLE_PERMISSIONS`) |
|------|----------------------------------------|
| `super_admin` | All `OWNER_PERMISSIONS` plus `platform.tenants.manage`, `platform.support.impersonate` |
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

Full permission literals are defined in `PERMISSIONS` in the same file.

**Picking (#143):** `GET /api/ordenes-entrega` also allows `orders.pick` (e.g. `warehouse_op`). `POST .../iniciar-picking` and `POST .../lista` require `orders.pick` and module `logistics.picking`.

## Channels (`USER_CHANNELS`)

Declared in code: `counter`, `field`, `backoffice`, `warehouse`, `delivery`. They are part of `AuthScope.channels` and persisted on `AppUser.scopeChannels` (see Prisma schema). Enforcement is active via `requirePermission` in [`server/auth.ts`](../../../server/auth.ts), which validates optional `x-bizcode-channel` against the authenticated claims scope.

## Local vs SaaS

- **Same model:** multi-tenant `Tenant`, cookie session, `AuthClaims` with role and derived permissions (see [iam-model-sessions-audit.md](iam-model-sessions-audit.md)).
- **Deployment differences** (desktop vs SaaS, fiscal modules by jurisdiction) follow PROD-VISION-001 and ADR-0007; this matrix does not duplicate fiscal rules.

## Retail vs wholesale (business framing)

- **Retail** scenarios map naturally to roles such as `seller`, `cashier`, `counter`/`field` channels for point of sale and customer-facing flows.
- **Wholesale / distributor** scenarios lean on `warehouse_op`, `warehouse_lead`, `logistics_planner`, `driver`, and `delivery`/`warehouse` channels for picking, dispatch, and delivery confirmation.
- Permissions named `orders.*` support a **future** order domain; **no `pedido` / order entity** is evidenced in the current Prisma schema or OpenAPI paths. Invoicing today uses `facturas` and related permissions (`sales.create`, `reports.operational.read`, etc.).

## Product modules (dashboard analytics #138)

The **Inicio → Analytics** tab calls `GET /api/dashboard/ventas-historico` and requires **`reports.operational.read`** plus tenant module **`analytics.advanced`** (catalog dependency: `analytics.dashboard`). No new permission literal was added.

## Delivery routes / repartos (#140)

UI `/logistica/repartos` is gated by module **`logistics.dispatches`**. API: list/detail `GET /api/repartos` and `GET /api/repartos/{id}` require **`logistics.read`**; create, start, and close require **`orders.dispatch`**. Typical roles: `owner`, `manager`, `logistics_planner`, `warehouse_lead` (see `ROLE_PERMISSIONS` in code for `logistics.read` on planner).

## Delivery proof (POD) (#142)

Module **`logistics.pod`**. Driver UI `/logistica/repartos/chofer` requires **`orders.deliver.confirm`** (role `driver` on own route). `PUT /api/repartos/{id}/items/{itemId}` uses the same permission; service enforces `choferId === actor.userId` for `driver`. `GET /api/repartos/{id}/items/{itemId}/pod` requires **`logistics.read`** and role ∈ `owner`, `manager`, `logistics_planner` (excludes `driver`).

## App Driver collections at delivery (#162)

`POST /api/cobros` and `GET /api/formas-pago` accept **`sales.create` or `orders.deliver.confirm`**. Role `driver` still has only `orders.deliver.confirm` in `ROLE_PERMISSIONS` (no `sales.create`). Actors without `sales.create` must send **`x-bizcode-channel: field`**, `clienteId` must be on the driver's `GET /api/repartos/mi-reparto` for today, and `retenciones` are rejected. `GET /api/cobros/transfer-info` requires **`orders.deliver.confirm` + field** and does not require `finance.bank_reconcile`. Web `GET /api/cobros` remains **`reports.operational.read`**. PATCH `/api/formas-pago/{id}` remains **`sales.create`** only.

## App Driver delivery returns (#163)

`POST /api/repartos/{id}/items/{itemId}/devolucion`, `GET /api/repartos/{id}/devoluciones`, and `POST /api/repartos/{id}/devoluciones/rendir` require **`orders.deliver.confirm` + `x-bizcode-channel: field`**. Role `driver` is **not** granted `inventory.adjust` or `sales.cancel` / `sales.create`. Stock (`StockAjuste` motivo `devolucion_entrega`) and partial credit notes run only on remittance, server-side. FEFO + `controlLote` without `loteId` returns **`422 LOTE_REQUIRED`** and leaves the return `registered`.

## Logistics KPIs and reports (#145)

Module **`logistics.dispatches`**. Endpoints `GET /api/logistica/kpis`, `reporte-choferes`, `reporte-zonas`: **`logistics.read`**; roles `owner`, `manager`, `logistics_planner` (UI tab on `/logistica`; drivers excluded). CSV via `Accept: text/csv` on driver/zone reports.

## GPS tracking (#144)

Module **`logistics.gps`**. UI `/logistica/seguimiento`: **`logistics.read`** and `GPS_VIEW_ROLES` (`owner`, `manager`, `logistics_planner`). `GET /api/repartos/activos` and `GET .../ubicacion/ultima` (planner; driver only on own route for `ultima`). `POST /api/repartos/{id}/ubicacion`: **`orders.deliver.confirm`**, owning driver, route `on_route`; drivers cannot list activos.

## Credit notes & invoice void (#146)

Tenant module **`billing.credit_notes`**. `PUT /api/facturas/{id}/void` requires **`sales.cancel`** and the module; request body motivo minimum length matches server schema (10 characters). **`GET /api/notas-credito`** and **`GET /api/notas-credito/{id}`** require **`reports.financial.read`** *or* **`reports.operational.read`**. UI: invoice void action appears in **`Facturación`** detail (`ListadoFacturas.tsx`) only when `billing.credit_notes` is enabled; **Finance** lists credit notes in the same module (`Finanzas` page retains `reports.financial.read`). See [`ADR-0012`](../adr/ADR-0012-invoice-void-credit-note.md).

## Libro IVA Ventas — Fase 1 (#147)

Tenant module **`finance.ledger`**. **`GET /api/contabilidad/libro-iva-ventas`** requires **`reports.financial.read`** (roles `finance`, `auditor`, `owner`). Formats: `preview` (JSON), `txt` (ZIP with CBTV + ALICUOTAS), `xlsx` (review). **`GET /api/contabilidad/libro-iva-compras`** and **`POST /api/comprobantes-compra`** use the same module and permission (#306). See [`ADR-0014`](../adr/ADR-0014-libro-iva-compras.md) and [`ADR-0013`](../adr/ADR-0013-libro-iva-ventas-fase1.md).

## Related documents

- Master plan execution index: [master-plan-bizcode-execution.md](master-plan-bizcode-execution.md)
- Operational flow (design): [operational-flow-order-delivery-collection.md](operational-flow-order-delivery-collection.md)

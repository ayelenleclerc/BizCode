# RBAC matrix — roles, permissions, scopes

**Source of truth in code:** [`ROLE_PERMISSIONS`](../../../src/lib/rbac.ts) and related constants in [`src/lib/rbac.ts`](../../../src/lib/rbac.ts). There are **no** separate `role_permissions` / `user_roles` tables; the app user’s role is stored as a Prisma enum on `AppUser` (see [`prisma/schema.prisma`](../../../prisma/schema.prisma)).

## Role → permissions

| Role | Permissions (from `ROLE_PERMISSIONS`) |
|------|----------------------------------------|
| `super_admin` | All `OWNER_PERMISSIONS` plus `platform.tenants.manage`, `platform.support.impersonate` |
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

Full permission literals are defined in `PERMISSIONS` in the same file.

## Channels (`USER_CHANNELS`)

Declared in code: `counter`, `field`, `backoffice`, `warehouse`, `delivery`. They are part of `AuthScope.channels` and persisted on `AppUser.scopeChannels` (see Prisma schema). **Enforcement** of “current channel” on each HTTP request is **not evidenced** in `server/auth.ts` or `server/createApp.ts` at the time of writing; scope is loaded into `AuthClaims` for future use.

## Local vs SaaS

- **Same model:** multi-tenant `Tenant`, cookie session, `AuthClaims` with role and derived permissions (see [iam-model-sessions-audit.md](iam-model-sessions-audit.md)).
- **Deployment differences** (desktop vs SaaS, fiscal modules by jurisdiction) follow PROD-VISION-001 and ADR-0007; this matrix does not duplicate fiscal rules.

## Retail vs wholesale (business framing)

- **Retail** scenarios map naturally to roles such as `seller`, `cashier`, `counter`/`field` channels for point of sale and customer-facing flows.
- **Wholesale / distributor** scenarios lean on `warehouse_op`, `warehouse_lead`, `logistics_planner`, `driver`, and `delivery`/`warehouse` channels for picking, dispatch, and delivery confirmation.
- Permissions named `orders.*` support a **future** order domain; **no `pedido` / order entity** is evidenced in the current Prisma schema or OpenAPI paths. Invoicing today uses `facturas` and related permissions (`sales.create`, `reports.operational.read`, etc.).

## Related documents

- Master plan execution index: [master-plan-bizcode-execution.md](master-plan-bizcode-execution.md)
- Operational flow (design): [operational-flow-order-delivery-collection.md](operational-flow-order-delivery-collection.md)

# IAM model — data, sessions, audit

This document describes the **current** identity and access model as implemented in the repository. It does not describe future tables such as `role_permissions` in the database; permissions are derived from the user’s role in code ([`ROLE_PERMISSIONS`](../../../src/lib/rbac.ts)).

## Data model (Prisma)

Defined in [`prisma/schema.prisma`](../../../prisma/schema.prisma):

| Model | Purpose |
|-------|---------|
| `Tenant` | Organization boundary (`name`, `slug`, `active`). |
| `AppUser` | User within a tenant: `username`, `passwordHash`, `role` (enum aligned with RBAC roles), `active`, scope arrays (`scopeBranchIds`, `scopeWarehouseIds`, `scopeRouteIds`, `scopeChannels`). |
| `AppSession` | Server-side session: `tokenHash`, `expiresAt`, `revokedAt`, `lastSeenAt`, optional `userAgent` / `ipAddress`. |
| `AuditEvent` | Append-only style log: `tenantId`, optional `userId`, `action`, `resource`, optional `resourceId`, optional `ipAddress`, `metadata` (JSON). |

## Session and claims flow

1. **Middleware:** [`resolveSession`](../../../server/auth.ts) runs on every request (registered in [`server/createApp.ts`](../../../server/createApp.ts)). It reads the `bizcode_session` cookie, looks up a non-revoked, non-expired `AppSession`, loads `AppUser`, normalizes role and channels, and attaches `req.auth` with `AuthClaims` (including permissions from `ROLE_PERMISSIONS`).
2. **Test bypass:** When `NODE_ENV === 'test'` and `BIZCODE_TEST_AUTH_BYPASS` is not `'false'`, a synthetic `req.auth` is injected (see [`server/auth.ts`](../../../server/auth.ts)).
3. **Login:** `POST /api/auth/login` validates tenant + user, creates `AppSession`, sets the session cookie (`HttpOnly`, `SameSite=None`, `Secure`), writes an `AuditEvent` with action `login`.
4. **Bootstrap:** `POST /api/auth/setup-owner` creates the first tenant and owner when no users exist; records `setup_owner` in `AuditEvent` (via `writeAuditEvent`).
5. **Logout:** `POST /api/auth/logout` revokes matching sessions by cookie hash, clears the cookie, and may write `logout` to `AuditEvent` when `req.auth` is present.
6. **Current user:** `GET /api/auth/me` returns `req.auth.claims` or `401` if not authenticated.

`x-bizcode-channel` is read in `requirePermission` (`server/auth.ts`) and validated against the authenticated `claims.scope.channels`. Invalid header values return `400`; out-of-scope channels return `403`.

## Application audit (mutations)

[`server/createApp.ts`](../../../server/createApp.ts) writes audit rows on selected mutations (e.g. `cliente_create`, `factura_create`) via `prisma.auditEvent.create`, using `req.auth.claims`. Failures are swallowed so business operations are not blocked.

## OpenAPI vs runtime auth

[`docs/api/openapi.yaml`](../../api/openapi.yaml) describes paths and responses but **does not** declare `security` / `securitySchemes` per operation. The table below reflects **Express** behavior in `server/createApp.ts` and `server/auth.ts`.

## Endpoint → authentication and permission

| Method | Path | Authentication | Permission (from `requirePermission`) |
|--------|------|------------------|--------------------------------------|
| `GET` | `/api/health` | None | None |
| `POST` | `/api/auth/setup-owner` | None | None |
| `POST` | `/api/auth/login` | None | None |
| `POST` | `/api/auth/logout` | Cookie optional; handler always returns success envelope | None |
| `GET` | `/api/auth/me` | Session required (`req.auth`) | None |
| `GET` | `/api/clientes` | Session + permission | `customers.read` |
| `GET` | `/api/clientes/{id}` | Session + permission | `customers.read` |
| `POST` | `/api/clientes` | Session + permission | `customers.manage` |
| `PUT` | `/api/clientes/{id}` | Session + permission | `customers.manage` |
| `GET` | `/api/articulos` | Session + permission | `products.read` |
| `GET` | `/api/articulos/{id}` | Session + permission | `products.read` |
| `POST` | `/api/articulos` | Session + permission | `products.manage` |
| `PUT` | `/api/articulos/{id}` | Session + permission | `products.manage` |
| `GET` | `/api/rubros` | Session + permission | `products.read` |
| `POST` | `/api/rubros` | Session + permission | `products.manage` |
| `GET` | `/api/formas-pago` | Session + permission | `sales.create` |
| `GET` | `/api/facturas` | Session + permission | `reports.operational.read` |
| `POST` | `/api/facturas` | Session + permission | `sales.create` |

## Tests

- Session and auth flows: [`tests/api/auth-session.test.ts`](../../../tests/api/auth-session.test.ts)
- Authorization (permission checks): [`tests/api/authz.test.ts`](../../../tests/api/authz.test.ts)
- Channel scope enforcement tests: [`tests/server/scope-channel.test.ts`](../../../tests/server/scope-channel.test.ts)

## Related documents

- RBAC matrix: [rbac-matrix-roles-permissions-scopes.md](rbac-matrix-roles-permissions-scopes.md)
- Master plan execution: [master-plan-bizcode-execution.md](master-plan-bizcode-execution.md)

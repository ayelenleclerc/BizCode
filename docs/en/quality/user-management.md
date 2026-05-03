# User management — implementation record

## Scope

Implements the user administration surface for BizCode (issue #25): list, create, update and deactivate users within a tenant, plus a self-service password change endpoint.

## Backend (`server/users.ts`)

| Endpoint | Permission required | Description |
|---|---|---|
| `GET /api/users` | `users.manage` | List all users in the caller's tenant (password hash never returned) |
| `POST /api/users` | `users.manage` + `roles.assign` | Create a new user; passwords hashed with scrypt via `server/passwordHash.ts` |
| `PUT /api/users/:id` | `users.manage` | Update role, active flag, or scope; self-deactivation blocked |
| `POST /api/auth/change-password` | authenticated | Change own password after verifying current password |

### Role assignment restriction

Callers may only assign roles with an equal or lower rank than their own (see `ROLE_RANK` in `server/users.ts`). A `manager` cannot promote a user to `owner`.

## Frontend

- **`src/pages/users/index.tsx`** — DataTable with search, keyboard navigation (F2/F3/F5/Esc/Arrows), and double-click to edit.
- **`src/pages/users/UserForm.tsx`** — create/edit modal; role selector restricted to assignable roles; channel multi-toggle.
- **`src/components/CanAccess.tsx`** — renders children only when the authenticated user holds the given `Permission`. Used to show/hide the "New User" button and the sidebar link.

## RBAC integration

The `users.manage` and `roles.assign` permissions are already defined in [`src/lib/rbac.ts`](../../../src/lib/rbac.ts) and assigned to `super_admin` and `owner`.

## Tests

- **`tests/api/users.test.ts`** — 17 unit tests covering allow/deny for all endpoints (GET list, POST create, PUT update, POST change-password) using the mock Prisma pattern.

## OpenAPI

New paths and schemas added to [`docs/api/openapi.yaml`](../../../docs/api/openapi.yaml):
- `GET /api/users`, `POST /api/users`, `PUT /api/users/{id}`, `POST /api/auth/change-password`
- Schemas: `AppUser`, `AppUserInput`, `AppUserUpdateInput`, `AppUserListEnvelope`, `AppUserEnvelope`, `ChangePasswordInput`

## Related

- RBAC matrix: [`docs/en/quality/rbac-matrix-roles-permissions-scopes.md`](rbac-matrix-roles-permissions-scopes.md)
- IAM model: [`docs/en/quality/iam-model-sessions-audit.md`](iam-model-sessions-audit.md)
- SEC-005 user access management: [`docs/en/certificacion-iso/sec/sec-005-user-access-management-procedure.md`](../certificacion-iso/sec/sec-005-user-access-management-procedure.md)

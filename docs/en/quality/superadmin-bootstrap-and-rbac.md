# SuperAdmin bootstrap and RBAC (implementation record)

## Scope (evidence in repository)

- **RBAC:** `super_admin` includes every `owner` permission plus `platform.tenants.manage` and `platform.support.impersonate` ([`src/lib/rbac.ts`](../../../src/lib/rbac.ts) — `OWNER_PERMISSIONS`).
- **Password hashing:** shared [`server/passwordHash.ts`](../../../server/passwordHash.ts); [`server/auth.ts`](../../../server/auth.ts) uses it for login and session flows.
- **Database seed:** [`prisma/seed.ts`](../../../prisma/seed.ts) calls [`prisma/seedSuperAdmin.ts`](../../../prisma/seedSuperAdmin.ts) (`runSuperAdminSeed`) — idempotent upsert of tenant slug `platform` and user `ayelen` with role `super_admin`. **`BIZCODE_SEED_SUPERADMIN_PASSWORD` is required** in `.env` before running the seed (minimum 8 characters); [`.env.example`](../../../.env.example) names the variable without a committed default.
- **Run:** after migrations, `npx prisma db seed`. Re-seeding overwrites the stored hash for that user to match the current env password.
- **Tests:** [`tests/scripts/seed-superadmin.test.ts`](../../../tests/scripts/seed-superadmin.test.ts) exercises `runSuperAdminSeed` (validation + upsert payload + `verifyPassword` against the stored hash).

## Prisma seed vs `npm run bootstrap:superadmin`

| | `npx prisma db seed` | `npm run bootstrap:superadmin` |
|---|---|---|
| Code | [`prisma/seed.ts`](../../../prisma/seed.ts), [`prisma/seedSuperAdmin.ts`](../../../prisma/seedSuperAdmin.ts) | [`scripts/bootstrap-superadmin.ts`](../../../scripts/bootstrap-superadmin.ts) |
| Password env | `BIZCODE_SEED_SUPERADMIN_PASSWORD` (≥ 8 characters) | `BIZCODE_BOOTSTRAP_SUPERADMIN_PASSWORD` |
| Username | Fixed `ayelen` | Optional `BIZCODE_BOOTSTRAP_SUPERADMIN_USERNAME` (default `Ayelen`, stored lowercase) |
| Repeat run | Upserts tenant and user; **always updates** `passwordHash` from the current env | If the user exists: **no-op** (password unchanged). If missing: creates user + [`AuditEvent`](../../../prisma/schema.prisma). |

For local Quick Start, prefer **`npx prisma db seed`**. See the root [README.md](../../../README.md) for the same comparison.

## Security

Treat `BIZCODE_SEED_SUPERADMIN_PASSWORD` as a secret outside single-developer machines; do not reuse the same development value in shared or production environments.

## Related

- Root [README.md](../../../README.md) Quick Start and environment table.
- Trilingual security notes: [security.md](../security.md) (EN), [seguridad.md](../../es/seguridad.md) (ES), [seguranca.md](../../pt-br/seguranca.md) (PT-BR).

**Other languages:** [Español](../../es/quality/superadmin-bootstrap-y-rbac.md) · [Português (Brasil)](../../pt-br/quality/superadmin-bootstrap-e-rbac.md)

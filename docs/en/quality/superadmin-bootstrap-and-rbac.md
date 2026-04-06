# SuperAdmin bootstrap and RBAC (implementation record)

## Scope (evidence in repository)

- **RBAC:** `super_admin` includes every `owner` permission plus `platform.tenants.manage` and `platform.support.impersonate` ([`src/lib/rbac.ts`](../../../src/lib/rbac.ts) — `OWNER_PERMISSIONS`).
- **Password hashing:** shared [`server/passwordHash.ts`](../../../server/passwordHash.ts); [`server/auth.ts`](../../../server/auth.ts) uses it for login and session flows.
- **Database seed:** [`prisma/seed.ts`](../../../prisma/seed.ts) — idempotent upsert of tenant slug `platform` and user `ayelen` with role `super_admin`. Password from `BIZCODE_SEED_SUPERADMIN_PASSWORD` (default `Yuskia13` only when the variable is unset — documented in [`.env.example`](../../../.env.example)).
- **Run:** after migrations, `npx prisma db seed`. Re-seeding overwrites the stored hash for that user to match the current env password.

## Security

Treat `BIZCODE_SEED_SUPERADMIN_PASSWORD` as a secret outside single-developer machines; do not reuse the sample from `.env.example` in shared or production environments.

## Related

- Root [README.md](../../../README.md) Quick Start and environment table.
- Trilingual security notes: [security.md](../security.md) (EN), [seguridad.md](../../es/seguridad.md) (ES), [seguranca.md](../../pt-br/seguranca.md) (PT-BR).

**Other languages:** [Español](../../es/quality/superadmin-bootstrap-y-rbac.md) · [Português (Brasil)](../../pt-br/quality/superadmin-bootstrap-e-rbac.md)

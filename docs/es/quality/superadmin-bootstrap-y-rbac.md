# Bootstrap SuperAdmin y RBAC (registro de implementación)

## Alcance (evidencia en el repositorio)

- **RBAC:** `super_admin` incluye todos los permisos de `owner` más `platform.tenants.manage` y `platform.support.impersonate` ([`src/lib/rbac.ts`](../../../src/lib/rbac.ts) — `OWNER_PERMISSIONS`).
- **Hash de contraseña:** compartido en [`server/passwordHash.ts`](../../../server/passwordHash.ts); [`server/auth.ts`](../../../server/auth.ts) lo usa en login y sesión.
- **Seed de base de datos:** [`prisma/seed.ts`](../../../prisma/seed.ts) — upsert idempotente del tenant slug `platform` y usuario `ayelen` con rol `super_admin`. Contraseña desde `BIZCODE_SEED_SUPERADMIN_PASSWORD` (valor por defecto `Yuskia13` solo si la variable no está definida — ver [`.env.example`](../../../.env.example)).
- **Ejecución:** tras migraciones, `npx prisma db seed`. Volver a ejecutar el seed sobrescribe el hash de ese usuario según la contraseña actual del entorno.

## Seguridad

Trata `BIZCODE_SEED_SUPERADMIN_PASSWORD` como secreto fuera del equipo de un solo desarrollador; no reutilices el ejemplo de `.env.example` en entornos compartidos ni en producción.

## Relacionado

- [README.md](../../../README.md) (inicio rápido y tabla de variables).
- Notas de seguridad: [seguridad.md](../seguridad.md), [security.md](../../en/security.md), [seguranca.md](../../pt-br/seguranca.md).

**Otros idiomas:** [English](../../en/quality/superadmin-bootstrap-and-rbac.md) · [Português (Brasil)](../../pt-br/quality/superadmin-bootstrap-e-rbac.md)

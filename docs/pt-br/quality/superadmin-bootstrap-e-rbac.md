# Bootstrap SuperAdmin e RBAC (registro de implementação)

## Escopo (evidência no repositório)

- **RBAC:** `super_admin` inclui todos os permissos de `owner` mais `platform.tenants.manage` e `platform.support.impersonate` ([`src/lib/rbac.ts`](../../../src/lib/rbac.ts) — `OWNER_PERMISSIONS`).
- **Hash de senha:** compartilhado em [`server/passwordHash.ts`](../../../server/passwordHash.ts); [`server/auth.ts`](../../../server/auth.ts) usa no login e na sessão.
- **Seed do banco:** [`prisma/seed.ts`](../../../prisma/seed.ts) chama [`prisma/seedSuperAdmin.ts`](../../../prisma/seedSuperAdmin.ts) (`runSuperAdminSeed`) — upsert idempotente do tenant slug `platform` e usuário `ayelen` com papel `super_admin`. **`BIZCODE_SEED_SUPERADMIN_PASSWORD` é obrigatória** no `.env` antes de rodar o seed (mínimo 8 caracteres); o [`.env.example`](../../../.env.example) declara a variável sem valor padrão versionado.
- **Execução:** após migrações, `npx prisma db seed`. Rodar o seed de novo sobrescreve o hash desse usuário conforme a senha atual do ambiente.
- **Testes:** [`tests/scripts/seed-superadmin.test.ts`](../../../tests/scripts/seed-superadmin.test.ts) cobre `runSuperAdminSeed` (validação, payload do upsert e `verifyPassword` contra o hash armazenado).

## Seed do Prisma vs `npm run bootstrap:superadmin`

| | `npx prisma db seed` | `npm run bootstrap:superadmin` |
|---|---|---|
| Código | [`prisma/seed.ts`](../../../prisma/seed.ts), [`prisma/seedSuperAdmin.ts`](../../../prisma/seedSuperAdmin.ts) | [`scripts/bootstrap-superadmin.ts`](../../../scripts/bootstrap-superadmin.ts) |
| Variável de senha | `BIZCODE_SEED_SUPERADMIN_PASSWORD` (≥ 8 caracteres) | `BIZCODE_BOOTSTRAP_SUPERADMIN_PASSWORD` |
| Usuário | Fixo `ayelen` | Opcional `BIZCODE_BOOTSTRAP_SUPERADMIN_USERNAME` (padrão `Ayelen`, gravado em minúsculas) |
| Nova execução | Upsert de tenant e usuário; **sempre atualiza** o `passwordHash` conforme o ambiente | Se o usuário existe: **sem alterações** (senha intacta). Se não existe: cria usuário + [`AuditEvent`](../../../prisma/schema.prisma). |

Para o Quick Start local, prefira **`npx prisma db seed`**. A mesma tabela está no [README.md](../../../README.md) raiz.

## Segurança

Trate `BIZCODE_SEED_SUPERADMIN_PASSWORD` como segredo fora de máquina de desenvolvedor único; não reutilize o mesmo valor de desenvolvimento em ambientes compartilhados ou produção.

## Relacionado

- [README.md](../../../README.md) (início rápido e tabela de variáveis).
- Notas de segurança: [seguranca.md](../seguranca.md), [security.md](../../en/security.md), [seguridad.md](../../es/seguridad.md).

**Outros idiomas:** [English](../../en/quality/superadmin-bootstrap-and-rbac.md) · [Español](../../es/quality/superadmin-bootstrap-y-rbac.md)

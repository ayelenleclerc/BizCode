# Bootstrap SuperAdmin e RBAC (registro de implementação)

## Escopo (evidência no repositório)

- **RBAC:** `super_admin` inclui todos os permissos de `owner` mais `platform.tenants.manage` e `platform.support.impersonate` ([`src/lib/rbac.ts`](../../../src/lib/rbac.ts) — `OWNER_PERMISSIONS`).
- **Hash de senha:** compartilhado em [`server/passwordHash.ts`](../../../server/passwordHash.ts); [`server/auth.ts`](../../../server/auth.ts) usa no login e na sessão.
- **Seed do banco:** [`prisma/seed.ts`](../../../prisma/seed.ts) — upsert idempotente do tenant slug `platform` e usuário `ayelen` com papel `super_admin`. Senha via `BIZCODE_SEED_SUPERADMIN_PASSWORD` (padrão `Yuskia13` só se a variável não estiver definida — ver [`.env.example`](../../../.env.example)).
- **Execução:** após migrações, `npx prisma db seed`. Rodar o seed de novo sobrescreve o hash desse usuário conforme a senha atual do ambiente.

## Segurança

Trate `BIZCODE_SEED_SUPERADMIN_PASSWORD` como segredo fora de máquina de desenvolvedor único; não reutilize o exemplo do `.env.example` em ambientes compartilhados ou produção.

## Relacionado

- [README.md](../../../README.md) (início rápido e tabela de variáveis).
- Notas de segurança: [seguranca.md](../seguranca.md), [security.md](../../en/security.md), [seguridad.md](../../es/seguridad.md).

**Outros idiomas:** [English](../../en/quality/superadmin-bootstrap-and-rbac.md) · [Español](../../es/quality/superadmin-bootstrap-y-rbac.md)

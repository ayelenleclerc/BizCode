# Gestão de usuários — registro de implementação

## Escopo

Implementa a interface de administração de usuários do BizCode (issue #25): listar, criar, atualizar e desativar usuários dentro de um tenant, mais um endpoint de alteração de senha própria.

## Backend (`server/users.ts`)

| Endpoint | Permissão requerida | Descrição |
|---|---|---|
| `GET /api/users` | `users.manage` | Lista todos os usuários do tenant do caller (sem hash de senha) |
| `POST /api/users` | `users.manage` + `roles.assign` | Cria um usuário; senhas hasheadas com scrypt via `server/passwordHash.ts` |
| `PUT /api/users/:id` | `users.manage` | Atualiza perfil, flag ativo ou scope; bloqueia auto-desativação |
| `POST /api/auth/change-password` | autenticado | Altera a própria senha verificando a atual |

### Restrição de atribuição de perfis

Os callers só podem atribuir perfis com rank igual ou inferior ao próprio (ver `ROLE_RANK` em `server/users.ts`). Um `manager` não pode promover um usuário a `owner`.

## Frontend

- **`src/pages/users/index.tsx`** — DataTable com busca, navegação por teclado (F2/F3/F5/Esc/Setas) e duplo clique para editar.
- **`src/pages/users/UserForm.tsx`** — modal de criação/edição; seletor de perfil restrito a perfis atribuíveis; toggle múltiplo de canais.
- **`src/components/CanAccess.tsx`** — renderiza filhos somente se o usuário autenticado possui a `Permission` indicada. Usado para mostrar/ocultar o botão "Novo Usuário" e o link da sidebar.

## Integração RBAC

As permissões `users.manage` e `roles.assign` estão definidas em [`src/lib/rbac.ts`](../../../src/lib/rbac.ts) e atribuídas a `super_admin` e `owner`.

## Testes

- **`tests/api/users.test.ts`** — 17 testes unitários cobrindo allow/deny para todos os endpoints usando o padrão de mock do Prisma.

## OpenAPI

Novos paths e schemas adicionados a [`docs/api/openapi.yaml`](../../../docs/api/openapi.yaml):
- `GET /api/users`, `POST /api/users`, `PUT /api/users/{id}`, `POST /api/auth/change-password`
- Schemas: `AppUser`, `AppUserInput`, `AppUserUpdateInput`, `AppUserListEnvelope`, `AppUserEnvelope`, `ChangePasswordInput`

## Relacionados

- Matriz RBAC: [`docs/pt-br/quality/matriz-rbac-funcoes-permissoes-scopes.md`](matriz-rbac-funcoes-permissoes-scopes.md)
- Modelo IAM: [`docs/pt-br/quality/modelo-iam-sessoes-auditoria.md`](modelo-iam-sessoes-auditoria.md)
- SEC-005 gestão de acessos: [`docs/pt-br/certificacion-iso/sec/sec-005-gestao-acessos-usuario.md`](../certificacion-iso/sec/sec-005-gestao-acessos-usuario.md)

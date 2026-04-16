# Modelo IAM — dados, sessões e auditoria

Descreve o modelo de identidade e acesso **atual** conforme implementado no repositório. Não descreve tabelas futuras como `role_permissions` no banco; as permissões vêm do papel do usuário no código ([`ROLE_PERMISSIONS`](../../../src/lib/rbac.ts)).

## Modelo de dados (Prisma)

Definido em [`prisma/schema.prisma`](../../../prisma/schema.prisma):

| Modelo | Finalidade |
|--------|------------|
| `Tenant` | Limite organizacional (`name`, `slug`, `active`). |
| `AppUser` | Usuário no tenant: `username`, `passwordHash`, `role` (enum alinhado aos papéis RBAC), `active`, arrays de escopo (`scopeBranchIds`, `scopeWarehouseIds`, `scopeRouteIds`, `scopeChannels`). |
| `AppSession` | Sessão no servidor: `tokenHash`, `expiresAt`, `revokedAt`, `lastSeenAt`, `userAgent` / `ipAddress` opcionais. |
| `AuditEvent` | Registro estilo append-only: `tenantId`, `userId` opcional, `action`, `resource`, `resourceId` opcional, `ipAddress` opcional, `metadata` (JSON). |

## Fluxo de sessão e claims

1. **Middleware:** [`resolveSession`](../../../server/auth.ts) roda em cada requisição (registrado em [`server/createApp.ts`](../../../server/createApp.ts)). Lê o cookie `bizcode_session`, busca `AppSession` não revogado e válido, carrega `AppUser`, normaliza papel e canais, e anexa `req.auth` com `AuthClaims` (inclui permissões de `ROLE_PERMISSIONS`).
2. **Bypass em testes:** Se `NODE_ENV === 'test'` e `BIZCODE_TEST_AUTH_BYPASS` não for `'false'`, injeta `req.auth` sintético (ver [`server/auth.ts`](../../../server/auth.ts)).
3. **Login:** `POST /api/auth/login` valida tenant + usuário, cria `AppSession`, define cookie de sessão (`HttpOnly`, `SameSite=None`, `Secure`), grava `AuditEvent` com ação `login`.
4. **Bootstrap:** `POST /api/auth/setup-owner` cria o primeiro tenant e owner quando não há usuários; registra `setup_owner` em `AuditEvent` (via `writeAuditEvent`).
5. **Logout:** `POST /api/auth/logout` revoga sessões pelo hash do cookie, limpa o cookie e pode gravar `logout` em `AuditEvent` se houver `req.auth`.
6. **Usuário atual:** `GET /api/auth/me` retorna `req.auth.claims` ou `401` sem autenticação.

O cabeçalho `x-bizcode-channel` é processado em `requirePermission` (`server/auth.ts`) e validado contra `claims.scope.channels` do usuário autenticado. Valores inválidos retornam `400`; canais fora do escopo retornam `403`.

## Auditoria na aplicação (mutações)

[`server/createApp.ts`](../../../server/createApp.ts) grava linhas de auditoria em mutações selecionadas (ex.: `cliente_create`, `factura_create`) via `prisma.auditEvent.create`, usando `req.auth.claims`. Falhas são ignoradas para não bloquear a operação de negócio.

## OpenAPI vs auth em tempo de execução

[`docs/api/openapi.yaml`](../../api/openapi.yaml) descreve paths e respostas mas **não** declara `security` / `securitySchemes` por operação. A tabela abaixo reflete o comportamento **Express** em `server/createApp.ts` e `server/auth.ts`.

## Endpoint → autenticação e permissão

| Método | Caminho | Autenticação | Permissão (`requirePermission`) |
|--------|---------|--------------|----------------------------------|
| `GET` | `/api/health` | Nenhuma | Nenhuma |
| `POST` | `/api/auth/setup-owner` | Nenhuma | Nenhuma |
| `POST` | `/api/auth/login` | Nenhuma | Nenhuma |
| `POST` | `/api/auth/logout` | Cookie opcional; o handler sempre responde com sucesso | Nenhuma |
| `GET` | `/api/auth/me` | Sessão obrigatória (`req.auth`) | Nenhuma |
| `GET` | `/api/clientes` | Sessão + permissão | `customers.read` |
| `GET` | `/api/clientes/{id}` | Sessão + permissão | `customers.read` |
| `POST` | `/api/clientes` | Sessão + permissão | `customers.manage` |
| `PUT` | `/api/clientes/{id}` | Sessão + permissão | `customers.manage` |
| `GET` | `/api/articulos` | Sessão + permissão | `products.read` |
| `GET` | `/api/articulos/{id}` | Sessão + permissão | `products.read` |
| `POST` | `/api/articulos` | Sessão + permissão | `products.manage` |
| `PUT` | `/api/articulos/{id}` | Sessão + permissão | `products.manage` |
| `GET` | `/api/rubros` | Sessão + permissão | `products.read` |
| `POST` | `/api/rubros` | Sessão + permissão | `products.manage` |
| `GET` | `/api/formas-pago` | Sessão + permissão | `sales.create` |
| `GET` | `/api/facturas` | Sessão + permissão | `reports.operational.read` |
| `POST` | `/api/facturas` | Sessão + permissão | `sales.create` |

## Testes

- Sessão e fluxos de auth: [`tests/api/auth-session.test.ts`](../../../tests/api/auth-session.test.ts)
- Autorização (checagem de permissões): [`tests/api/authz.test.ts`](../../../tests/api/authz.test.ts)
- Testes de enforcement por canal: [`tests/server/scope-channel.test.ts`](../../../tests/server/scope-channel.test.ts)

## Documentos relacionados

- Matriz RBAC: [matriz-rbac-funcoes-permissoes-scopes.md](matriz-rbac-funcoes-permissoes-scopes.md)
- Execução do plano mestre: [execucao-plano-mestre-bizcode.md](execucao-plano-mestre-bizcode.md)

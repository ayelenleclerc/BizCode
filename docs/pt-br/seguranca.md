# Segurança

## Modelo de ameaças (STRIDE — resumido)

| Ameaça | Categoria | Mitigação |
|---|---|---|
| SQL injection via API | Tampering | Prisma com consultas parametrizadas |
| XSS em dados renderizados | Tampering | JSX do React escapa valores |
| Acesso não autorizado à API | Elev. privilégio | API em loopback (127.0.0.1) |
| Dados sensíveis em logs | Divulgação | Sem PII em INFO; `console.error` só para erros |
| Vulnerabilidades em dependências | Várias | `npm audit` no CI |
| Caminhos maliciosos no Tauri | Tampering | Allowlist de filesystem |

## OWASP Top 10 (mapeamento)

| Risco | Estado |
|---|---|
| A01 Quebra de controle de acesso | Parcial — sessão por cookie e checagem de permissões nas rotas protegidas ([`server/createApp.ts`](../../server/createApp.ts), [`server/auth.ts`](../../server/auth.ts)) |
| A02 Falhas criptográficas | N/A — sem segredos de aplicação na base |
| A03 Injeção | Mitigado — Prisma parametrizado |
| A04 Design inseguro | Mitigado — modelo de ameaças; API em loopback |
| A05 Configuração insegura | Parcial — CORS com allowlist e `credentials: true` ([`server/createApp.ts`](../../server/createApp.ts), `CORS_ORIGINS` em [`.env.example`](../../.env.example)); demais cabeçalhos não endurecidos |
| A06 Componentes vulneráveis | Monitorado — `npm audit` no CI |
| A07 Falhas de identificação | Parcial — login e sessão; hash de senha em [`server/auth.ts`](../../server/auth.ts) |
| A09 Falhas de registro | Parcial — sem logging estruturado ainda |

## Segredos

- `DATABASE_URL` em `.env` (não versionado).
- `.env.example` apenas nomes de variáveis e *placeholders* não secretos (por exemplo `REPLACE_DB_USER` / `REPLACE_DB_CREDENTIAL` em `DATABASE_URL`); o arquivo versionado não deve conter credenciais reais.
- Bootstrap de super admin (`npm run bootstrap:superadmin`): senha via `BIZCODE_BOOTSTRAP_SUPERADMIN_PASSWORD` apenas no `.env` local (chaves comentadas no `.env.example`; nunca commitar valores reais).
- Sem segredos no código-fonte.

## Seed Prisma (bootstrap em desenvolvimento)

- `npx prisma db seed` cria ou atualiza o tenant `platform` e o usuário `ayelen` (SuperAdmin). **`BIZCODE_SEED_SUPERADMIN_PASSWORD` deve estar definida** no `.env` antes de rodar o seed (mínimo 8 caracteres). O [`.env.example`](../../.env.example) declara a variável **sem** valor padrão versionado.
- **Não** reutilize a mesma senha de desenvolvimento em homologação, produção ou bases compartilhadas. Use um segredo forte por ambiente; rodar o seed de novo sobrescreve o hash armazenado desse usuário.

## CORS

O app Express usa **`cors`** com **`credentials: true`** para o navegador enviar o cookie de sessão em requisições cross-origin do servidor de desenvolvimento do SPA (por exemplo Vite na porta **5173**) para a API na porta **3001**.

- **Allowlist:** por padrão `http://localhost:5173` e `http://127.0.0.1:5173`, mais origens extras na variável **`CORS_ORIGINS`** (CSV); ver [`.env.example`](../../.env.example).
- **Código:** [`server/createApp.ts`](../../server/createApp.ts) (`getCorsOriginAllowlist`, `createApp`).
- **Testes:** [`tests/server/cors.test.ts`](../../tests/server/cors.test.ts).
- Requisições **sem** cabeçalho `Origin` (por exemplo supertest no CI) são permitidas; origens não listadas não recebem `Access-Control-Allow-Origin`.
- **Desktop empacotado:** se o WebView usar outra origem, adicione-a a `CORS_ORIGINS`.

## Política de dependências

- `npm audit --audit-level=high` no CI.
- Críticas/Altas devem ser corrigidas antes do merge em `main`.

**Outros idiomas:** [English](../en/security.md) · [Español](../es/seguridad.md)

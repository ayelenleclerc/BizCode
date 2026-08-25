# Segurança

## Política de segurança da informação (SGSI) (#196)

Seção de **política de segurança da informação de produto** BizCode (ISO-ready). **Não** afirma certificação ISO/IEC 27001. A aprovação organizacional desta revisão é registrada quando a autoridade de produto faz merge do PR de documentação de [#196](https://github.com/ayelenleclerc/BizCode/issues/196).

### Objetivos

- Proteger confidencialidade, integridade e disponibilidade dos dados de negócio dos tenants.
- Aplicar mínimo privilégio via papéis e permissões.
- Detectar, responder e aprender com eventos de segurança usando procedimentos documentados.
- Manter mudanças de engenharia revisáveis (PR para `develop`, gates CI) sem inventar controles sem evidência.

### Papéis (produto)

| Papel | Responsabilidades de segurança |
|-------|--------------------------------|
| Product owner / operadores SuperAdmin | Aprovar revisões de política; operar ferramentas de tenant/sessão; escalar incidentes |
| Engenharia | Implementar controles; docs fiéis ao código; remediar achados High+ de CI |
| Operadores de plataforma | Seguir runbooks de backup, deploy e incidentes; não commitar segredos |

### Declarações de política

1. O acesso a APIs e dados requer sessão autenticada e checagens de permissão no servidor.
2. Segredos vivem em configuração de ambiente (ou gestores aprovados); nunca são commitados.
3. Produção e staging permanecem separados; dados de clientes de produção não são usados para DAST aberto sem aprovação explícita.
4. Incidentes seguem [resposta-a-incidentes.md](quality/resposta-a-incidentes.md).
5. Privacidade e direitos do titular seguem [privacidade-e-direitos-do-titular.md](quality/privacidade-e-direitos-do-titular.md).
6. Aplicabilidade e lacunas do Anexo A: [analise-lacunas-anexo-a-iso27001.md](quality/analise-lacunas-anexo-a-iso27001.md) e [SEC-002](certificacion-iso/sec/sec-002-declaracao-aplicabilidade-soa.md).

### Revisão

Pelo menos anual, ou após mudanças materiais de arquitetura/segurança, ou após achados de pentest externo (#194).

### Stub controlado

[SEC-001 Política de segurança da informação](certificacion-iso/sec/sec-001-politica-seguranca-informacao.md)

## Modelo de ameaças (STRIDE — resumido)

| Ameaça | Categoria | Mitigação |
|---|---|---|
| SQL injection via API | Tampering | Prisma parametrizado; `$queryRaw` / `Prisma.sql` etiquetado quando SQL bruto é necessário (parâmetros vinculados). Health: `SELECT 1` constante |
| XSS em dados renderizados | Tampering | JSX do React escapa valores |
| Acesso não autorizado à API | Elev. privilégio | Cookie de sessão + permissões; desktop costuma ser loopback; SaaS/hosted exige TLS e controles de rede |
| Dados sensíveis em logs | Divulgação | Sem PII em INFO; não registrar tokens, senhas nem segredos de pagamento |
| Vulnerabilidades em dependências | Várias | `pnpm audit --audit-level=high` bloqueante; Snyk no CI — [varredura de dependências](quality/varredura-dependencias-e-triagem.md) |
| Caminhos maliciosos no Tauri | Tampering | Allowlist de filesystem |

## OWASP Top 10 (mapeamento)

| Risco | Estado |
|---|---|
| A01 Quebra de controle de acesso | Parcial — sessão e permissões ([`apps/server/createApp.ts`](../../apps/server/createApp.ts)); IDOR/tenant é foco de pentest ([#194](https://github.com/ayelenleclerc/BizCode/issues/194)) |
| A02 Falhas criptográficas | Parcial — segredos em env / tokens cifrados onde aplicável |
| A03 Injeção | Mitigado — Prisma + templates etiquetados |
| A04 Design inseguro | Parcial — modelo revisado; SaaS amplia superfície vs desktop |
| A05 Configuração insegura | Parcial — CORS allowlist; Helmet/CSP em [`securityHeaders.ts`](../../apps/server/middleware/securityHeaders.ts) |
| A06 Componentes vulneráveis | Monitorado — audit HIGH+ bloqueante; Snyk com `SNYK_TOKEN` |
| A07 Falhas de identificação | Parcial — login/sessão; hash de senha |
| A09 Falhas de registro | Parcial — observabilidade; eventos de segurança (#221) |

## Cabeçalhos HTTP de segurança

Helmet via [`getSecurityHeadersMiddleware`](../../apps/server/middleware/securityHeaders.ts) em `createApp`. CSP permite inline limitado para Swagger em `/api-docs`.

## Segredos

- `DATABASE_URL` em `.env` (não versionado).
- `.env.example` apenas nomes de variáveis e *placeholders*; o arquivo versionado não deve conter credenciais reais.
- Bootstrap de super admin: `BIZCODE_BOOTSTRAP_SUPERADMIN_PASSWORD` apenas no `.env` local.
- Sem segredos no código-fonte.

## Seed Prisma (bootstrap em desenvolvimento)

- `npx prisma db seed` cria/atualiza tenant `platform` e usuário `ayelen` (SuperAdmin). **`BIZCODE_SEED_SUPERADMIN_PASSWORD` deve estar definida** (mínimo 8 caracteres).
- **Não** reutilize a mesma senha de desenvolvimento em homologação, produção ou bases compartilhadas.

## CORS

O app Express usa **`cors`** com **`credentials: true`**.

- **Allowlist:** `http://localhost:5173` e `http://127.0.0.1:5173`, mais **`CORS_ORIGINS`** (CSV).
- **Código:** [`apps/server/createApp.ts`](../../apps/server/createApp.ts).
- **Testes:** [`tests/server/cors.test.ts`](../../tests/server/cors.test.ts).

## Política de dependências

- `pnpm audit --audit-level=high` **bloqueante** no Quality Gate.
- Snyk quando existe `SNYK_TOKEN` ([`.github/workflows/snyk.yml`](../../.github/workflows/snyk.yml)).
- Ver [varredura e triagem](quality/varredura-dependencias-e-triagem.md).

## Testes de penetração (#194)

DAST automatizado (OWASP ZAP baseline) e processo de engagement externo: [Testes de penetração](quality/testes-de-penetracao.md). Relatórios ZAP do CI **não** substituem o relatório de pentest externo.

## Checklist pré-lançamento (engenharia)

| Verificação | Evidência |
|---|---|
| Gates HIGH+ de dependências | Quality Gate; Snyk |
| Revisão de SQL bruto | `$queryRaw` / `Prisma.sql` etiquetado; guardrail `npm run check:raw-sql` falha com `$queryRawUnsafe` / `$executeRawUnsafe` em `apps/server` |
| Cabeçalhos de segurança | Helmet na API |
| Tenant / IDOR | Middleware de auth; o pentest externo deve verificar acesso cross-tenant |
| Segredos em logs | Revisar sinks de produção antes do lançamento |

## Resposta a incidentes (#222)

[Resposta a incidentes](quality/resposta-a-incidentes.md).

## Monitoramento de segurança (#221)

[Monitoramento de segurança](quality/monitoramento-de-seguranca.md). Stub ISO: [SEC-011](certificacion-iso/sec/sec-011-logs-alertas.md).

## Hardening de apps móveis (#220)

[Hardening de apps móveis](quality/hardening-apps-moveis.md).

**Outros idiomas:** [English](../en/security.md) · [Español](../es/seguridad.md)

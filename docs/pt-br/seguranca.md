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

## OWASP Top 10 (resumo)

| Risco | Estado |
|---|---|
| A01–A07, A09 | N/A ou mitigado no escopo desktop local |
| A06 Componentes | Monitorado (`npm audit`) |

## Segredos

- `DATABASE_URL` em `.env` (não versionado).
- `.env.example` apenas placeholders.
- Sem segredos no código-fonte.

## Seed Prisma (bootstrap em desenvolvimento)

- `npx prisma db seed` cria ou atualiza o tenant `platform` e o usuário `ayelen` (SuperAdmin). A senha vem de `BIZCODE_SEED_SUPERADMIN_PASSWORD`; o [`.env.example`](../../.env.example) documenta um valor de exemplo **apenas para desenvolvimento local**.
- **Não** reutilize essa senha de exemplo em homologação, produção ou bases compartilhadas. Use um segredo forte por ambiente; rodar o seed de novo sobrescreve o hash armazenado desse usuário.

## CORS

Não configurado (apenas WebView local). Se a API for exposta à rede, adicionar `cors` com allowlist explícita.

## Política de dependências

- `npm audit --audit-level=high` no CI.
- Críticas/Altas devem ser corrigidas antes do merge em `main`.

**Outros idiomas:** [English](../en/seguranca.md) · [Español](../es/seguranca.md)

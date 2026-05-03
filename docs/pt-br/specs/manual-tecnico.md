# Manual técnico (índice)

| Campo | Valor |
|-------|--------|
| Versão do documento | 0.1 |
| Revisão | 1 |
| Data | 2026-04-06 |
| Referência ao produto | BizCode 0.1.0 MVP |

## Finalidade

Este documento **não duplica** a arquitetura; aponta para evidências no repositório.

## Contexto do sistema

| Tema | Evidência |
|------|-----------|
| Shell desktop + SPA + API sidecar | [arquitetura.md](../arquitetura.md) |
| Tema claro/escuro | [temas-interface.md](../temas-interface.md), [`index.html`](../../../index.html), [`Layout.tsx`](../../../src/components/layout/Layout.tsx) |
| Contrato REST | [`openapi.yaml`](../../api/openapi.yaml) |
| Fábrica Express | [`server/createApp.ts`](../../../server/createApp.ts) |
| Entrada | [`server/main.ts`](../../../server/main.ts) → [`server.ts`](../../../server.ts) (`startServer`) |
| Cliente HTTP | [`src/lib/api.ts`](../../../src/lib/api.ts) |
| Estado de autenticacao no frontend e fluxo de login | [`src/auth/AuthProvider.tsx`](../../../src/auth/AuthProvider.tsx), [`src/pages/auth/LoginPage.tsx`](../../../src/pages/auth/LoginPage.tsx), [`src/App.tsx`](../../../src/App.tsx) |
| Prisma | [`prisma/schema.prisma`](../../../prisma/schema.prisma) |
| i18n | [`src/i18n/config.ts`](../../../src/i18n/config.ts), [estrategia-i18n.md](../estrategia-i18n.md) |
| Segurança | [seguranca.md](../seguranca.md) |
| CI | [quality/ciclo-ci-cd.md](../quality/ciclo-ci-cd.md) |
| ADRs | [adr/README.md](../adr/README.md) |

## Superfície da API (resumo)

Rotas em `createApp.ts`: `/api/health`, `/api/auth/setup-owner`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`, `/api/clientes`, `/api/articulos`, `/api/rubros`, `/api/formas-pago`, `/api/facturas` — detalhes no OpenAPI.

## Bootstrap operacional (super admin)

- Script: [`scripts/bootstrap-superadmin.ts`](../../../scripts/bootstrap-superadmin.ts)
- Comando: `npm run bootstrap:superadmin`
- Variavel de ambiente obrigatoria: `BIZCODE_BOOTSTRAP_SUPERADMIN_PASSWORD`
- Variavel de ambiente opcional: `BIZCODE_BOOTSTRAP_SUPERADMIN_USERNAME` (padrao: `Ayelen`)
- Comportamento evidenciado no codigo: cria ou atualiza o tenant `platform`, depois cria o usuario `super_admin` somente se nao existir (fluxo idempotente).

**Outros idiomas:** [English](../../en/specs/technical-manual.md) · [Español](../../es/specs/technical-manual.md)

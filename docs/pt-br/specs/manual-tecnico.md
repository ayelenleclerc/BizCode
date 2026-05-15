# Manual técnico (índice)

| Campo | Valor |
|-------|--------|
| Versão do documento | 0.2 |
| Revisão | 2 |
| Data | 2026-05-15 |
| Referência ao produto | BizCode 0.1.0 MVP |

## Finalidade

Este documento **não duplica** o texto de arquitetura. Aponta para evidências técnicas **autoritativas** no repositório.

## Contexto do sistema

| Tema | Evidência no repositório |
|------|--------------------------|
| Shell desktop + SPA + API sidecar | [arquitetura.md](../arquitetura.md) |
| Tema claro/escuro (`darkMode: 'class'`, `<html>`, `localStorage`) | [temas-interface.md](../temas-interface.md), [`index.html`](../../../index.html), [`src/components/layout/Layout.tsx`](../../../src/components/layout/Layout.tsx) |
| Contrato REST API | [`docs/api/openapi.yaml`](../../api/openapi.yaml) |
| Fábrica de aplicação Express | [`server/createApp.ts`](../../../server/createApp.ts) |
| Entrada de processo | [`server/main.ts`](../../../server/main.ts) → [`server.ts`](../../../server.ts) (`startServer`) |
| Cliente HTTP e namespaces | [`src/lib/api.ts`](../../../src/lib/api.ts) |
| Estado de autenticação no frontend e fluxo de login | [`src/auth/AuthProvider.tsx`](../../../src/auth/AuthProvider.tsx), [`src/pages/auth/LoginPage.tsx`](../../../src/pages/auth/LoginPage.tsx), [`src/App.tsx`](../../../src/App.tsx) |
| Esquema Prisma | [`prisma/schema.prisma`](../../../prisma/schema.prisma) |
| Configuração i18n | [`src/i18n/config.ts`](../../../src/i18n/config.ts), [estrategia-i18n.md](../estrategia-i18n.md) |
| Postura de segurança | [seguranca.md](../seguranca.md) |
| Pipeline CI | [quality/ciclo-ci-cd.md](../quality/ciclo-ci-cd.md), [`.github/workflows/ci.yml`](../../../.github/workflows/ci.yml) |
| Decisões | [adr/README.md](../adr/README.md) |

## Superfície da API (resumo)

As rotas REST de domínio são registradas em [`server/registerRestDomainRoutes.ts`](../../../server/registerRestDomainRoutes.ts) (incluído a partir de `createApp.ts`). Resumo (parâmetros e esquemas no OpenAPI):

- Núcleo: `/api/clientes`, `/api/articulos`, `/api/rubros`, `/api/proveedores`, `/api/formas-pago`, `/api/facturas`
- Cobranças: `/api/cobros`, `/api/cobros/:id`
- Relatórios: `/api/reportes/aging`, `/api/reportes/cuenta-corriente/:clienteId`, `/api/reportes/ventas`, `/api/reportes/stock-critico`, `/api/reportes/cobranzas`
- Logística: `/api/ordenes-entrega`, `/api/ordenes-entrega/:id`, `/api/zonas-entrega` (ver OpenAPI)
- Auth e saúde: `/api/health`, `/api/auth/*` — detalhes no OpenAPI.

## Bootstrap operacional (super admin)

- Script: [`scripts/bootstrap-superadmin.ts`](../../../scripts/bootstrap-superadmin.ts)
- Comando: `npm run bootstrap:superadmin`
- Variável de ambiente obrigatória: `BIZCODE_BOOTSTRAP_SUPERADMIN_PASSWORD`
- Variável de ambiente opcional: `BIZCODE_BOOTSTRAP_SUPERADMIN_USERNAME` (padrão: `Ayelen`)
- Comportamento evidenciado no código: cria ou atualiza o tenant `platform`, depois cria o usuário `super_admin` somente se não existir (fluxo idempotente).

**Outros idiomas:** [English](../../en/specs/technical-manual.md) · [Español](../../es/specs/manual-tecnico.md)

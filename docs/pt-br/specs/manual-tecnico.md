# Manual técnico (índice)

| Campo | Valor |
|-------|--------|
| Versão do documento | 0.1 |
| Revisão | 1 |
| Data | 2026-03-31 |
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
| Entrada | [`server.ts`](../../../server.ts) |
| Cliente HTTP | [`src/lib/api.ts`](../../../src/lib/api.ts) |
| Prisma | [`prisma/schema.prisma`](../../../prisma/schema.prisma) |
| i18n | [`src/i18n/config.ts`](../../../src/i18n/config.ts), [estrategia-i18n.md](../estrategia-i18n.md) |
| Segurança | [seguranca.md](../seguranca.md) |
| CI | [quality/ciclo-ci-cd.md](../quality/ciclo-ci-cd.md) |
| ADRs | [adr/README.md](../adr/README.md) |

## Superfície da API (resumo)

Rotas em `createApp.ts`: `/api/health`, `/api/clientes`, `/api/articulos`, `/api/rubros`, `/api/formas-pago`, `/api/facturas` — detalhes no OpenAPI.

**Outros idiomas:** [English](../../en/specs/technical-manual.md) · [Español](../../es/specs/technical-manual.md)

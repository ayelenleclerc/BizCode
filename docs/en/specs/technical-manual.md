# Technical manual (index)

| Field | Value |
|-------|--------|
| Document version | 0.2 |
| Revision | 2 |
| Date | 2026-05-15 |
| Product reference | BizCode 0.1.0 MVP |

## Purpose

This document **does not duplicate** architecture text. It points to **authoritative** technical evidence in the repository.

## System context

| Topic | Evidence in repo |
|-------|------------------|
| Desktop shell + SPA + sidecar API | [architecture.md](../architecture.md) |
| Light/dark theme (`darkMode: 'class'`, `<html>`, `localStorage`) | [theming.md](../theming.md), [`index.html`](../../../index.html), [`src/components/layout/Layout.tsx`](../../../src/components/layout/Layout.tsx) |
| REST API contract | [`docs/api/openapi.yaml`](../../api/openapi.yaml) |
| Express application factory | [`server/createApp.ts`](../../../server/createApp.ts) |
| Process entry | [`server/main.ts`](../../../server/main.ts) → [`server.ts`](../../../server.ts) (`startServer`) |
| HTTP client and namespaces | [`src/lib/api.ts`](../../../src/lib/api.ts) |
| Frontend auth state and login flow | [`src/auth/AuthProvider.tsx`](../../../src/auth/AuthProvider.tsx), [`src/pages/auth/LoginPage.tsx`](../../../src/pages/auth/LoginPage.tsx), [`src/App.tsx`](../../../src/App.tsx) |
| Prisma schema | [`prisma/schema.prisma`](../../../prisma/schema.prisma) |
| i18n configuration | [`src/i18n/config.ts`](../../../src/i18n/config.ts), [i18n-strategy.md](../i18n-strategy.md) |
| Security posture | [security.md](../security.md) |
| CI pipeline | [quality/ci-cd.md](../quality/ci-cd.md), [`.github/workflows/ci.yml`](../../../.github/workflows/ci.yml) |
| Decisions | [adr/README.md](../adr/README.md) |

## API surface (summary)

Domain REST routes are registered in [`server/registerRestDomainRoutes.ts`](../../../server/registerRestDomainRoutes.ts) (included from `createApp.ts`). Summary (see OpenAPI for parameters and schemas):

- Core: `/api/clientes`, `/api/articulos`, `/api/rubros`, `/api/proveedores`, `/api/formas-pago`, `/api/facturas`
- Collections: `/api/cobros`, `/api/cobros/:id`
- Reports: `/api/reportes/aging`, `/api/reportes/cuenta-corriente/:clienteId`, `/api/reportes/ventas`, `/api/reportes/stock-critico`, `/api/reportes/cobranzas`
- Logistics: `/api/ordenes-entrega`, `/api/ordenes-entrega/:id`, `/api/zonas-entrega` (see OpenAPI)
- Auth and health: `/api/health`, `/api/auth/*` — details in OpenAPI.

## Operational bootstrap (super admin)

- Script: [`scripts/bootstrap-superadmin.ts`](../../../scripts/bootstrap-superadmin.ts)
- Command: `npm run bootstrap:superadmin`
- Required environment variable: `BIZCODE_BOOTSTRAP_SUPERADMIN_PASSWORD`
- Optional environment variable: `BIZCODE_BOOTSTRAP_SUPERADMIN_USERNAME` (default: `Ayelen`)
- Behavior evidenced in code: creates or updates tenant `platform`, then creates `super_admin` user only if it does not exist (idempotent flow).

**Other languages:** [Español](../../es/specs/manual-tecnico.md) · [Português](../../pt-br/specs/manual-tecnico.md)

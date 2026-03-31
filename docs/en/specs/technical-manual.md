# Technical manual (index)

| Field | Value |
|-------|--------|
| Document version | 0.1 |
| Revision | 1 |
| Date | 2026-03-31 |
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
| Process entry | [`server.ts`](../../../server.ts) |
| HTTP client and namespaces | [`src/lib/api.ts`](../../../src/lib/api.ts) |
| Prisma schema | [`prisma/schema.prisma`](../../../prisma/schema.prisma) |
| i18n configuration | [`src/i18n/config.ts`](../../../src/i18n/config.ts), [i18n-strategy.md](../i18n-strategy.md) |
| Security posture | [security.md](../security.md) |
| CI pipeline | [quality/ci-cd.md](../quality/ci-cd.md), [`.github/workflows/ci.yml`](../../../.github/workflows/ci.yml) |
| Decisions | [adr/README.md](../adr/README.md) |

## API surface (summary)

Implemented routes in `server/createApp.ts`: `/api/health`, `/api/clientes`, `/api/articulos`, `/api/rubros`, `/api/formas-pago`, `/api/facturas` — details and schemas in OpenAPI.

**Other languages:** [Español](../../es/specs/technical-manual.md) · [Português](../../pt-br/specs/technical-manual.md)

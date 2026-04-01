# Manual técnico (índice)

| Campo | Valor |
|-------|--------|
| Versión del documento | 0.1 |
| Revisión | 1 |
| Fecha | 2026-03-31 |
| Referencia al producto | BizCode 0.1.0 MVP |

## Propósito

Este documento **no duplica** el texto de arquitectura. Apunta a la evidencia técnica **autoritativa** en el repositorio.

## Contexto del sistema

| Tema | Evidencia en el repo |
|------|----------------------|
| Shell escritorio + SPA + API sidecar | [arquitectura.md](../arquitectura.md) |
| Tema claro/oscuro (`darkMode: 'class'`, `<html>`, `localStorage`) | [temas-interfaz.md](../temas-interfaz.md), [`index.html`](../../../index.html), [`Layout.tsx`](../../../src/components/layout/Layout.tsx) |
| Contrato REST | [`openapi.yaml`](../../api/openapi.yaml) |
| Fábrica Express | [`server/createApp.ts`](../../../server/createApp.ts) |
| Entrada de proceso | [`server/main.ts`](../../../server/main.ts) → [`server.ts`](../../../server.ts) (`startServer`) |
| Cliente HTTP | [`src/lib/api.ts`](../../../src/lib/api.ts) |
| Esquema Prisma | [`prisma/schema.prisma`](../../../prisma/schema.prisma) |
| i18n | [`src/i18n/config.ts`](../../../src/i18n/config.ts), [estrategia-i18n.md](../estrategia-i18n.md) |
| Seguridad | [seguridad.md](../seguridad.md) |
| CI | [quality/ciclo-ci-cd.md](../quality/ciclo-ci-cd.md), [`.github/workflows/ci.yml`](../../../.github/workflows/ci.yml) |
| Decisiones | [adr/README.md](../adr/README.md) |

## Superficie API (resumen)

Rutas implementadas en `createApp.ts`: `/api/health`, `/api/clientes`, `/api/articulos`, `/api/rubros`, `/api/formas-pago`, `/api/facturas` — detalle en OpenAPI.

**Otros idiomas:** [English](../../en/specs/technical-manual.md) · [Português](../../pt-br/specs/technical-manual.md)

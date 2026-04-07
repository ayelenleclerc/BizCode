# Manual técnico (índice)

| Campo | Valor |
|-------|--------|
| Versión del documento | 0.1 |
| Revisión | 1 |
| Fecha | 2026-04-06 |
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
| Estado auth frontend y flujo de login | [`src/auth/AuthProvider.tsx`](../../../src/auth/AuthProvider.tsx), [`src/pages/auth/LoginPage.tsx`](../../../src/pages/auth/LoginPage.tsx), [`src/App.tsx`](../../../src/App.tsx) |
| Esquema Prisma | [`prisma/schema.prisma`](../../../prisma/schema.prisma) |
| i18n | [`src/i18n/config.ts`](../../../src/i18n/config.ts), [estrategia-i18n.md](../estrategia-i18n.md) |
| Seguridad | [seguridad.md](../seguridad.md) |
| CI | [quality/ciclo-ci-cd.md](../quality/ciclo-ci-cd.md), [`.github/workflows/ci.yml`](../../../.github/workflows/ci.yml) |
| Decisiones | [adr/README.md](../adr/README.md) |

## Superficie API (resumen)

Rutas implementadas en `createApp.ts`: `/api/health`, `/api/auth/setup-owner`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`, `/api/clientes`, `/api/articulos`, `/api/rubros`, `/api/formas-pago`, `/api/facturas` — detalle en OpenAPI.

## Bootstrap operativo (super admin)

- Script: [`scripts/bootstrap-superadmin.ts`](../../../scripts/bootstrap-superadmin.ts)
- Comando: `npm run bootstrap:superadmin`
- Variable de entorno obligatoria: `BIZCODE_BOOTSTRAP_SUPERADMIN_PASSWORD`
- Variable de entorno opcional: `BIZCODE_BOOTSTRAP_SUPERADMIN_USERNAME` (valor por defecto: `Ayelen`)
- Comportamiento evidenciado en código: crea o actualiza tenant `platform`, luego crea el usuario `super_admin` solo si no existe (flujo idempotente).

**Otros idiomas:** [English](../../en/specs/technical-manual.md) · [Português](../../pt-br/specs/manual-tecnico.md)

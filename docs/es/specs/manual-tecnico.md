# Manual técnico (índice)

| Campo | Valor |
|-------|--------|
| Versión del documento | 0.2 |
| Revisión | 2 |
| Fecha | 2026-05-15 |
| Referencia al producto | BizCode 0.1.0 MVP |

## Propósito

Este documento **no duplica** el texto de arquitectura. Apunta a la evidencia técnica **autoritativa** en el repositorio.

## Contexto del sistema

| Tema | Evidencia en el repo |
|------|----------------------|
| Shell escritorio + SPA + API sidecar | [arquitectura.md](../arquitectura.md) |
| Tema claro/oscuro (`darkMode: 'class'`, `<html>`, `localStorage`) | [temas-interfaz.md](../temas-interfaz.md), [`index.html`](../../../index.html), [`src/components/layout/Layout.tsx`](../../../src/components/layout/Layout.tsx) |
| Contrato REST API | [`docs/api/openapi.yaml`](../../api/openapi.yaml) |
| Fábrica de aplicación Express | [`server/createApp.ts`](../../../server/createApp.ts) |
| Entrada de proceso | [`server/main.ts`](../../../server/main.ts) → [`server.ts`](../../../server.ts) (`startServer`) |
| Cliente HTTP y espacios de nombres | [`src/lib/api.ts`](../../../src/lib/api.ts) |
| Estado de autenticación frontend y flujo de login | [`src/auth/AuthProvider.tsx`](../../../src/auth/AuthProvider.tsx), [`src/pages/auth/LoginPage.tsx`](../../../src/pages/auth/LoginPage.tsx), [`src/App.tsx`](../../../src/App.tsx) |
| Esquema Prisma | [`prisma/schema.prisma`](../../../prisma/schema.prisma) |
| Configuración i18n | [`src/i18n/config.ts`](../../../src/i18n/config.ts), [estrategia-i18n.md](../estrategia-i18n.md) |
| Postura de seguridad | [seguridad.md](../seguridad.md) |
| Pipeline CI | [quality/ciclo-ci-cd.md](../quality/ciclo-ci-cd.md), [`.github/workflows/ci.yml`](../../../.github/workflows/ci.yml) |
| Decisiones | [adr/README.md](../adr/README.md) |

## Superficie API (resumen)

Las rutas REST de dominio se registran en [`server/registerRestDomainRoutes.ts`](../../../server/registerRestDomainRoutes.ts) (incluido desde `createApp.ts`). Resumen (parámetros y esquemas en OpenAPI):

- Núcleo: `/api/clientes`, `/api/articulos`, `/api/rubros`, `/api/proveedores`, `/api/formas-pago`, `/api/facturas`
- Cobros: `/api/cobros`, `/api/cobros/:id`
- Reportes: `/api/reportes/aging`, `/api/reportes/cuenta-corriente/:clienteId`, `/api/reportes/ventas`, `/api/reportes/stock-critico`, `/api/reportes/cobranzas`
- Logística: `/api/ordenes-entrega`, `/api/ordenes-entrega/:id`, `/api/zonas-entrega` (véase OpenAPI)
- Auth y salud: `/api/health`, `/api/auth/*` — detalle en OpenAPI.

## Bootstrap operativo (super admin)

- Script: [`scripts/bootstrap-superadmin.ts`](../../../scripts/bootstrap-superadmin.ts)
- Comando: `npm run bootstrap:superadmin`
- Variable de entorno obligatoria: `BIZCODE_BOOTSTRAP_SUPERADMIN_PASSWORD`
- Variable de entorno opcional: `BIZCODE_BOOTSTRAP_SUPERADMIN_USERNAME` (valor por defecto: `Ayelen`)
- Comportamiento evidenciado en código: crea o actualiza el tenant `platform`, luego crea el usuario `super_admin` solo si no existe (flujo idempotente).

**Otros idiomas:** [English](../../en/specs/technical-manual.md) · [Português](../../pt-br/specs/manual-tecnico.md)

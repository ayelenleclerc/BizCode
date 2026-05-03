# Architecture

## Overview

BizCode is a **desktop application** built with Tauri 1.5. The Rust shell hosts a Vite-built React SPA as the main window. An Express 5 API server runs as a Tauri sidecar process, providing the REST backend. Data is stored in PostgreSQL via Prisma 5.

## Component Diagram

```
┌────────────────────────────────────────────────────────────────┐
│  Tauri Desktop Shell (Rust)                                    │
│                                                                │
│  ┌─────────────────────────┐    ┌────────────────────────────┐ │
│  │  WebView (React SPA)    │    │  Express 5 Sidecar (Node)  │ │
│  │                         │    │                            │ │
│  │  React 18 + TypeScript  │◄──►│  REST API (:3001)          │ │
│  │  Vite 5 (bundled)       │    │  Prisma 5 ORM              │ │
│  │  react-i18next (i18n)   │    │  Input validation          │ │
│  │  react-hook-form + zod  │    │                            │ │
│  └─────────────────────────┘    └────────────┬───────────────┘ │
│                                              │                 │
└──────────────────────────────────────────────┼─────────────────┘
                                               │ TCP
                                    ┌──────────▼──────────┐
                                    │  PostgreSQL 16       │
                                    │  (external process)  │
                                    └─────────────────────┘
```

## Data Flow

```
User action (keyboard/click)
  → React component (UI state)
    → react-hook-form + Zod (client validation)
      → src/lib/api.ts (Axios HTTP client)
        → Express route handler
          → Prisma query builder
            → PostgreSQL
          ← Prisma result (typed)
        ← JSON response { data: ... }
      ← Typed result
    ← Component state update
  → Re-render
```

## Key Modules

| Path | Responsibility |
|---|---|
| `src/main.tsx` | React root; imports i18n config |
| `src/i18n/config.ts` | i18next initialization (static imports, no HTTP backend) |
| `src/lib/api.ts` | Axios client factory; per-namespace API helpers |
| `src/lib/validators.ts` | Pure validation logic (CUIT, price, code) |
| `src/lib/invoice.ts` | Invoice calculation engine (VAT by customer condition) |
| `src/components/layout/Layout.tsx` | App shell: sidebar nav, theme toggle (`localStorage` key `theme`; `dark` / `light` classes on `<html>`) |
| `src/pages/clientes/` | Customer CRUD |
| `src/pages/articulos/` | Product CRUD |
| `src/pages/facturacion/` | Invoice creation and listing |
| `server/main.ts` | CLI entry (`npm run server`): calls `startServer()` from `server.ts` |
| `server.ts` (root) | Bootstrap: `createServerInstance`, `bindHttpServer`, `startServer`; uses `createApp` from `server/createApp.ts` |
| `server/createApp.ts` | Reusable Express factory for OpenAPI contract tests (middleware, auth routers, `registerRestDomainRoutes`) |
| `server/registerRestDomainRoutes.ts` | Registers tenant-scoped domain REST under `/api/*` via modules in `server/routes/` (shared CSV/validation helpers in `server/routes/restDomainShared.ts`) |

## Theming (Tailwind dark mode)

- **Configuration:** `tailwind.config.js` uses `darkMode: 'class'`.
- **Reference:** [theming.md](theming.md) (classes on `<html>`, script in `index.html`, persistence, rules to avoid breaking the toggle).
- **Avoided risk:** do not set `class="dark"` on `<body>`; with `dark:` matching any ancestor, the theme would stay dark even when React updates `<html>`.

## Strategic direction (product)

The **same business domain** is intended to support **desktop** (this document) and, when implemented, **hosted SaaS**, with **fiscal behavior** isolated in **country/jurisdiction modules**. See [product-vision-and-deployment.md](quality/product-vision-and-deployment.md) (PROD-VISION-001) and [ADR-0007](adr/ADR-0007-dual-deployment-and-fiscal-modularity.md).

## Risks and Known Constraints

- **API surface split across modules:** `server/createApp.ts` composes middleware and routers; domain REST handlers live under `server/routes/` and are wired from `server/registerRestDomainRoutes.ts`. `server.ts` exposes bootstrap helpers; `server/main.ts` is the process entry for `npm run server`.
- **Session auth and network exposure:** The stack uses cookie sessions, `resolveSession`, and `requirePermission` on protected routes (see `server/auth.ts` and [iam-model-sessions-audit.md](quality/iam-model-sessions-audit.md)). The default desktop layout still assumes a local sidecar on loopback; a hosted SaaS deployment must add transport and hardening controls described in [security.md](security.md).
- **Tauri build not in CI:** Requires platform-native WebKit. See [quality/ci-cd.md](quality/ci-cd.md).
- **No offline mode:** The React SPA requires the Express sidecar to be running. Tauri lifecycle management ensures this in production.

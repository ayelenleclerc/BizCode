# Guía de entorno local de desarrollo

Onboarding para contribuidores: PostgreSQL, migraciones, seed y API + Vite en local. Paridad con CI/pruebas: [paridad-entornos-pruebas.md](paridad-entornos-pruebas.md).

## Estructura del monorepo

BizCode usa **pnpm workspaces** y **Turborepo** (#154):

| Ruta | Rol |
|------|-----|
| `apps/web/` | Frontend React + Vite |
| `apps/server/` | API Express |
| `packages/types/` | Tipos TypeScript y contratos RBAC compartidos |
| `packages/api-client/` | Cliente HTTP de la API |
| `prisma/` | Esquema y migraciones (raíz del repo) |
| `tests/`, `e2e/` | Suites de prueba compartidas (raíz) |

Instale y ejecute comandos desde la **raíz del repositorio**.

### Cliente API (`@bizcode/api-client`)

El cliente HTTP compartido está en `packages/api-client/`. Ya no lee variables de Vite directamente (preparado para React Native): `apps/web` invoca `initApiClientFromEnv()` desde `apps/web/src/lib/api-config.ts` en `main.tsx` antes del render, vinculando `VITE_API_URL` con `configureApiClients()`. URL base por defecto si no está definida: `http://localhost:3001/api`. Las APIs por dominio están en `packages/api-client/src/modules/`; `createApiClient()` / `createPortalApiClient()` aceptan base URL opcional para otros hosts.

Opcional en `.env` para la app web:

- `VITE_API_URL` — base completa de la API incluyendo `/api` (p. ej. `http://localhost:3001/api`)

## Requisitos

- **Node.js** ≥ 22 (`package.json` `engines`, [`.nvmrc`](../../../.nvmrc))
- **pnpm** 10.x (`packageManager` en la raíz; `corepack enable`)
- **Rust** ≥ 1.77 (stable) para builds Tauri
- **PostgreSQL** 15 o 16, o **Docker** con el compose del repositorio

## Clonado e instalación

```bash
git clone https://github.com/ayelenleclerc/BizCode.git
cd BizCode
corepack enable
pnpm install --frozen-lockfile
```

### Notas Windows (pnpm)

Si `pnpm install` falla con `EPERM` / `ENOENT` al renombrar paquetes bajo `node_modules`, use el helper de Windows (reintentos + exclusiones opcionales de **rutas** de Defender solo para este repo y el store de pnpm; **no** desactiva la protección en tiempo real):

```bat
powershell -ExecutionPolicy Bypass -File .\scripts\install-windows.ps1 -FrozenLockfile
```

La configuración del editor excluye `node_modules` del file watcher (`.vscode/settings.json`). Prefiera hardlinks frente a `package-import-method=copy` (véase `.npmrc` en la raíz y [CONTRIBUTING.md](../../../CONTRIBUTING.md)).

## Variables de entorno

Copie [`.env.example`](../../../.env.example) a `.env` y configure al menos:

- `DATABASE_URL`
- `JWT_SECRET` (obligatorio fuera de tests; ver `apps/server/config/env.ts`)
- `BIZCODE_SEED_SUPERADMIN_PASSWORD` (≥ 8 caracteres antes de `npx prisma db seed`)

El resto de variables opcionales están en `.env.example`.

## PostgreSQL

**Docker (recomendado):**

```bash
docker compose -f docker-compose.postgres.yml up -d
```

Ajuste `DATABASE_URL` al puerto publicado en `docker-compose.postgres.yml`.

**Instalación nativa:** cree una base vacía y configure `DATABASE_URL`.

## Esquema y seed

```bash
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

`pnpm run seed` ejecuta `prisma/seed.ts` vía `tsx`. Tras el seed: tenant `platform`, usuario `ayelen`, contraseña según `BIZCODE_SEED_SUPERADMIN_PASSWORD` ([README.md](../../../README.md)).

## Ejecución

| Comando | Uso |
|---------|-----|
| `pnpm run dev:full` | API sidecar + Vite |
| `pnpm run server` | Solo API (`http://localhost:3001`) |
| `pnpm run dev:vite` | Solo Vite (`http://localhost:5173`) |
| `pnpm run dev` | Tauri (requiere Rust) |

Swagger UI con API en marcha: `http://localhost:3001/api-docs/`.

## Puerta de calidad (local)

```bash
pnpm run type-check
pnpm run test
pnpm run test:coverage
pnpm run test:integration
pnpm run test:e2e
```

## Resolución de problemas

- **Login sin conexión al servidor:** API en 3001 (`pnpm run server` o `pnpm run dev:full`); revise `POST /api/auth/login` en red.
- **Puertos en conflicto:** el puerto por defecto documentado del API es 3001.
- **Errores de BD:** `DATABASE_URL`, servicio PostgreSQL y `npx prisma migrate dev`.
- **Fallos de build Tauri:** toolchain Rust stable y dependencias de Tauri 1.5.
- **PowerShell:** Command Prompt, Git Bash o `pnpm.cmd` ([CONTRIBUTING.md](../../../CONTRIBUTING.md)).

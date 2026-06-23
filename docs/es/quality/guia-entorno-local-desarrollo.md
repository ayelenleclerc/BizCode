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

# Guía de entorno local de desarrollo

Onboarding para contribuidores: PostgreSQL, migraciones, seed y API + Vite en local. Paridad con CI/pruebas: [paridad-entornos-pruebas.md](paridad-entornos-pruebas.md).

## Requisitos

- **Node.js** ≥ 22 (`package.json` `engines`, [`.nvmrc`](../../../.nvmrc))
- **Rust** ≥ 1.77 (stable) para builds Tauri
- **PostgreSQL** 15 o 16, o **Docker** con el compose del repositorio
- **npm** con `legacy-peer-deps` ([`.npmrc`](../../../.npmrc))

## Clonado e instalación

```bash
git clone https://github.com/ayelenleclerc/BizCode.git
cd BizCode
npm ci
```

## Variables de entorno

Copie [`.env.example`](../../../.env.example) a `.env` y configure al menos:

- `DATABASE_URL`
- `JWT_SECRET` (obligatorio fuera de tests; ver `server/config/env.ts`)
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

`npm run seed` ejecuta `prisma/seed.ts` vía `tsx`. Tras el seed: tenant `platform`, usuario `ayelen`, contraseña según `BIZCODE_SEED_SUPERADMIN_PASSWORD` ([README.md](../../../README.md)).

## Ejecución

| Comando | Uso |
|---------|-----|
| `npm run dev:full` | API sidecar + Vite |
| `npm run server` | Solo API (`http://localhost:3001`) |
| `npm run dev:vite` | Solo Vite (`http://localhost:5173`) |
| `npm run dev` | Tauri (requiere Rust) |

Swagger UI con API en marcha: `http://localhost:3001/api-docs/`.

## Resolución de problemas

- **Login sin conexión al servidor:** API en 3001 (`npm run server` o `npm run dev:full`); revise `POST /api/auth/login` en red.
- **Puertos en conflicto:** el puerto por defecto documentado del API es 3001.
- **Errores de BD:** `DATABASE_URL`, servicio PostgreSQL y `npx prisma migrate dev`.
- **Fallos de build Tauri:** toolchain Rust stable y dependencias de Tauri 1.5.
- **PowerShell y `npm`:** Command Prompt, Git Bash o `npm.cmd` ([CONTRIBUTING.md](../../../CONTRIBUTING.md)).

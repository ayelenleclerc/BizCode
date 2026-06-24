# Local development setup

Contributor onboarding for running BizCode locally (PostgreSQL, migrations, seed, API + Vite). For CI/test parity, see [test-environments-parity.md](test-environments-parity.md).

## Monorepo layout

BizCode uses **pnpm workspaces** and **Turborepo** (#154):

| Path | Role |
|------|------|
| `apps/web/` | React + Vite frontend |
| `apps/server/` | Express API |
| `packages/types/` | Shared TypeScript types and RBAC contracts |
| `packages/api-client/` | HTTP API client |
| `prisma/` | Database schema and migrations (repo root) |
| `tests/`, `e2e/` | Shared test suites (repo root) |

Install and run commands from the **repository root**.

### API client (`@bizcode/api-client`)

The shared HTTP client lives in `packages/api-client/`. It no longer reads Vite env vars directly (React Native–ready): `apps/web` calls `initApiClientFromEnv()` from `apps/web/src/lib/api-config.ts` in `main.tsx` before render, binding `VITE_API_URL` via `configureApiClients()`. Default base URL when unset: `http://localhost:3001/api`. Domain APIs are split under `packages/api-client/src/modules/`; `createApiClient()` / `createPortalApiClient()` accept an optional base URL for non-web hosts.

Optional in `.env` for the web app:

- `VITE_API_URL` — full API base including `/api` (e.g. `http://localhost:3001/api`)

## Requirements

- **Node.js** ≥ 22 (`package.json` `engines`, [`.nvmrc`](../../../.nvmrc))
- **pnpm** 10.x (declared in root `packageManager`; enable via `corepack enable`)
- **Rust** ≥ 1.77 (stable) for Tauri desktop builds
- **PostgreSQL** 15 or 16, or **Docker** for the compose file below

## Clone and install

```bash
git clone https://github.com/ayelenleclerc/BizCode.git
cd BizCode
corepack enable
pnpm install --frozen-lockfile
```

## Environment

Copy [`.env.example`](../../../.env.example) to `.env` and set at least:

- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — session HMAC secret (required in non-test runs; see `apps/server/config/env.ts`)
- `BIZCODE_SEED_SUPERADMIN_PASSWORD` — ≥ 8 characters before `npx prisma db seed`

Optional variables are documented in `.env.example` (CORS, rate limits, SMTP, etc.).

## PostgreSQL

**Docker (recommended):** from the repo root:

```bash
docker compose -f docker-compose.postgres.yml up -d
```

Point `DATABASE_URL` at the published port in `docker-compose.postgres.yml`.

**Native install:** create an empty database and set `DATABASE_URL` accordingly.

## Schema and seed

```bash
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

`pnpm run seed` runs the same entry as `prisma/seed.ts` via `tsx`. After seed, sign in with tenant slug `platform`, username `ayelen`, and the password from `BIZCODE_SEED_SUPERADMIN_PASSWORD` (see [README.md](../../../README.md)).

## Run the app

| Command | Purpose |
|---------|---------|
| `pnpm run dev:full` | API sidecar + Vite dev server |
| `pnpm run server` | API only (`http://localhost:3001`) |
| `pnpm run dev:vite` | Vite only (`http://localhost:5173`) |
| `pnpm run dev` | Tauri desktop dev (requires Rust toolchain) |

OpenAPI/Swagger UI when the API is running: `http://localhost:3001/api-docs/`.

## Quality gate (local)

```bash
pnpm run type-check
pnpm run test
pnpm run test:coverage
pnpm run test:integration
pnpm run test:e2e
```

## Troubleshooting

- **Login cannot reach the server:** ensure the API listens on port 3001 (`pnpm run server` or `pnpm run dev:full`); check the browser network tab for `POST /api/auth/login`.
- **Port conflicts:** change the API port only if you also update the Vite proxy and client base URL in code; default evidence is port 3001.
- **Database connection errors:** verify `DATABASE_URL`, that PostgreSQL is running, and that migrations applied (`npx prisma migrate dev`).
- **Tauri build failures:** install the Rust stable toolchain and platform dependencies required by Tauri 1.5.
- **PowerShell blocks package managers:** use Command Prompt, Git Bash, or `pnpm.cmd` (see [CONTRIBUTING.md](../../../CONTRIBUTING.md)).

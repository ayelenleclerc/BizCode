# Local development setup

Contributor onboarding for running BizCode locally (PostgreSQL, migrations, seed, API + Vite). For CI/test parity, see [test-environments-parity.md](test-environments-parity.md).

## Requirements

- **Node.js** ≥ 22 (`package.json` `engines`, [`.nvmrc`](../../../.nvmrc))
- **Rust** ≥ 1.77 (stable) for Tauri desktop builds
- **PostgreSQL** 15 or 16, or **Docker** for the compose file below
- **npm** with `legacy-peer-deps` (see [`.npmrc`](../../../.npmrc))

## Clone and install

```bash
git clone https://github.com/ayelenleclerc/BizCode.git
cd BizCode
npm ci
```

## Environment

Copy [`.env.example`](../../../.env.example) to `.env` and set at least:

- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — session HMAC secret (required in non-test runs; see `server/config/env.ts`)
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

`npm run seed` runs the same entry as `prisma/seed.ts` via `tsx`. After seed, sign in with tenant slug `platform`, username `ayelen`, and the password from `BIZCODE_SEED_SUPERADMIN_PASSWORD` (see [README.md](../../../README.md)).

## Run the app

| Command | Purpose |
|---------|---------|
| `npm run dev:full` | API sidecar + Vite dev server |
| `npm run server` | API only (`http://localhost:3001`) |
| `npm run dev:vite` | Vite only (`http://localhost:5173`) |
| `npm run dev` | Tauri desktop dev (requires Rust toolchain) |

OpenAPI/Swagger UI when the API is running: `http://localhost:3001/api-docs/`.

## Troubleshooting

- **Login cannot reach the server:** ensure the API listens on port 3001 (`npm run server` or `npm run dev:full`); check the browser network tab for `POST /api/auth/login`.
- **Port conflicts:** change the API port only if you also update the Vite proxy and client base URL in code; default evidence is port 3001.
- **Database connection errors:** verify `DATABASE_URL`, that PostgreSQL is running, and that migrations applied (`npx prisma migrate dev`).
- **Tauri build failures:** install the Rust stable toolchain and platform dependencies required by Tauri 1.5.
- **PowerShell blocks `npm`:** use Command Prompt, Git Bash, or `npm.cmd` (see [CONTRIBUTING.md](../../../CONTRIBUTING.md)).

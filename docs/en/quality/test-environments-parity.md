# Test environments parity (dev / CI / staging)

**Standard:** ISO/IEC 12207 (software life-cycle processes) — consistent verification environments.

---

## Evidence in this repository

| Concern | Value / location |
|---------|------------------|
| API HTTP port | `3001` — `PORT` in [`server.ts`](../../../server.ts) |
| API health | `GET /api/health` |
| Vite dev server | port `5173` — [`vite.config.ts`](../../../vite.config.ts) |
| Playwright E2E base URL | `http://127.0.0.1:4173` — [`playwright.config.ts`](../../../playwright.config.ts) (production preview) |
| PostgreSQL in CI | `postgres:16-alpine`, trust auth — `.github/workflows/ci.yml`, `qa-validation.yml`, `frontend-validation.yml` |
| Local DB URL example | [`/.env.example`](../../../.env.example) → `DATABASE_URL` |

## Optional local PostgreSQL (Docker)

To approximate CI:

```bash
docker compose -f docker-compose.postgres.yml up -d
```

Use a `DATABASE_URL` that points at that instance (see `.env.example`). Apply schema with `npx prisma migrate deploy` (or `migrate dev` in development).

## Seed and test data

| Variable | Purpose |
|----------|---------|
| `BIZCODE_SEED_SUPERADMIN_PASSWORD` | Required for `npx prisma db seed` (SuperAdmin `ayelen`, tenant `platform`) |
| `BIZCODE_SEED_FIXTURE_CATALOG` | When set to `true`, seed upserts a minimal rubro (`codigo=1`) after SuperAdmin — [`prisma/seed.ts`](../../../prisma/seed.ts) |
| `BIZCODE_SEED_SUPERADMIN_PASSWORD` in CI/E2E | Generated in `qa-validation.yml` for ephemeral runs |

Integration and factory helpers for tests: [`tests/fixtures/catalogFactories.ts`](../../../tests/fixtures/catalogFactories.ts).

## Staging and production

Automated staging or production URLs are **not evidenced** in application config in this repo. For load scripts (e.g. `perf/k6-smoke.js`), set `BASE_URL` explicitly to an approved target.

---

**Other locales:** [Español](../../es/quality/paridad-entornos-pruebas.md) · [Português BR](../../pt-br/quality/paridade-ambientes-testes.md)

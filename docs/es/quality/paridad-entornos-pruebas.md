# Paridad de entornos de prueba (dev / CI / staging)

**Norma:** ISO/IEC 12207 — entornos de verificación coherentes.

---

## Evidencia en el repositorio

| Aspecto | Valor / ubicación |
|---------|-------------------|
| Puerto HTTP API | `3001` — `PORT` en [`server.ts`](../../../server.ts) |
| Salud API | `GET /api/health` |
| Vite dev | puerto `5173` — [`vite.config.ts`](../../../vite.config.ts) |
| Playwright E2E | `http://127.0.0.1:4173` — [`playwright.config.ts`](../../../playwright.config.ts) |
| PostgreSQL en CI | `postgres:16-alpine`, auth trust — workflows en `.github/workflows/` |
| Ejemplo local | [`/.env.example`](../../../.env.example) |

## PostgreSQL local opcional (Docker)

```bash
docker compose -f docker-compose.postgres.yml up -d
```

Ajusta `DATABASE_URL` y aplica migraciones (`npx prisma migrate deploy` o `migrate dev`).

## Seed y datos de prueba

| Variable | Uso |
|----------|-----|
| `BIZCODE_SEED_SUPERADMIN_PASSWORD` | Obligatoria para `npx prisma db seed` |
| `BIZCODE_SEED_FIXTURE_CATALOG=true` | Tras SuperAdmin, upsert de rubro mínimo — [`prisma/seed.ts`](../../../prisma/seed.ts) |

Helpers para integración: [`tests/fixtures/catalogFactories.ts`](../../../tests/fixtures/catalogFactories.ts).

## Staging y producción

No hay URLs automatizadas evidenciadas en el código de la app. Para `perf/k6-smoke.js`, define `BASE_URL` solo en entornos autorizados.

---

**Otros idiomas:** [English](../../en/quality/test-environments-parity.md) · [Português BR](../../pt-br/quality/paridade-ambientes-testes.md)

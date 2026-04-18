# Paridade de ambientes de teste (dev / CI / staging)

**Norma:** ISO/IEC 12207 — ambientes de verificação consistentes.

---

## Evidência neste repositório

| Tema | Valor / local |
|------|---------------|
| Porta HTTP da API | `3001` — `PORT` em [`server.ts`](../../../server.ts) |
| Health | `GET /api/health` |
| Vite dev | porta `5173` — [`vite.config.ts`](../../../vite.config.ts) |
| Playwright E2E | `http://127.0.0.1:4173` — [`playwright.config.ts`](../../../playwright.config.ts) |
| PostgreSQL no CI | `postgres:16-alpine`, trust — `.github/workflows/` |
| Exemplo local | [`/.env.example`](../../../.env.example) |

## PostgreSQL local opcional (Docker)

```bash
docker compose -f docker-compose.postgres.yml up -d
```

Configure `DATABASE_URL` e migrações (`npx prisma migrate deploy` ou `migrate dev`).

## Seed e dados de teste

| Variável | Função |
|----------|--------|
| `BIZCODE_SEED_SUPERADMIN_PASSWORD` | Obrigatória para `npx prisma db seed` |
| `BIZCODE_SEED_FIXTURE_CATALOG=true` | Após SuperAdmin, upsert de rubro mínimo — [`prisma/seed.ts`](../../../prisma/seed.ts) |

Factories de integração: [`tests/fixtures/catalogFactories.ts`](../../../tests/fixtures/catalogFactories.ts).

## Staging e produção

URLs automatizadas **não** estão evidenciadas no código da aplicação. Para `perf/k6-smoke.js`, use `BASE_URL` apenas em alvos aprovados.

---

**Outros idiomas:** [English](../../en/quality/test-environments-parity.md) · [Español](../../es/quality/paridad-entornos-pruebas.md)

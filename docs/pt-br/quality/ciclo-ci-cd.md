# Pipeline CI/CD

## Visão geral

BizCode usa GitHub Actions. Definição: `.github/workflows/ci.yml`.

## Estágios

```
push / pull_request → job quality (ubuntu-latest):
  checkout → Node 22 → npm ci → npm audit (informativo) → prisma generate → prisma migrate deploy →
  type-check → docs:generate → git diff (docs gerados) → lint → test:coverage → check:i18n →
  playwright install chromium → test:e2e → test:integration → check:docs-map →
  artefato de cobertura
```

## Gatilhos

| Evento | Ramos |
|---|---|
| `push` | `main`, `develop` |
| `pull_request` | para `main` |

## Bloqueios

| Etapa | Condição |
|---|---|
| type-check | Erro TypeScript |
| docs:generate + git diff | Divergência entre arquivos commitados e documentação regenerada (`docs/generated/`, `docs/api/openapi-reference.generated.md`, `docs/evidence/sbom-cyclonedx.json`) |
| lint | Erro ou **warning** ESLint (`--max-warnings 0`) |
| test:coverage | Falha de teste ou cobertura abaixo do limite |
| check:i18n | Chaves divergentes da fonte `es` |
| test:e2e | Falha Playwright (build + `vite preview`; ver [ADR-0004](../adr/ADR-0004-e2e-playwright-integration-roadmap.md)) |
| test:integration | Falha em `tests/integration/` (Prisma real no PostgreSQL) |
| check:docs-map | Caminho do mapa documental ausente no disco |

## Serviços

**PostgreSQL 16** em container (`DATABASE_URL`). Após `prisma migrate deploy`, **`npm run test:integration`** roda HTTP + Prisma real em `tests/integration/`. O **contrato** API (`tests/api/`) continua **mockando** Prisma para OpenAPI ([ADR-0004](../adr/ADR-0004-e2e-playwright-integration-roadmap.md)).

## Artefatos

`coverage-report` — 14 dias — pasta `coverage/`.

## Fora do CI

Build desktop Tauri (WebKit nativo, display, Rust). Build local: `npm run tauri build`.

## Branch órfão `documentacion`

O branch **órfão** `documentacion` **não** contém código da aplicação — apenas um snapshot de documentação para hospedagem estática (ex.: GitHub Pages).

| Item | Detalhe |
|---|---|
| Workflow | `.github/workflows/sync-documentacion.yml` |
| Quando executa | `push` em **`main`** que altere `docs/**`, `Certificación-ISO/**`, `README.md`, `AGENTS.md` ou `CONTRIBUTING.md` na raiz; ou **`workflow_dispatch`** (Actions → *Sync documentacion branch*) |
| Ref manual | Entrada opcional `source_ref` (padrão `main`) para copiar de outro branch ou SHA |
| Branches de código | Inalterado: trabalho em `develop` / `feature/*` / `fix/*`, merge em `main` conforme [CONTRIBUTING](../../../CONTRIBUTING.md); este job **não** envia código de app para `documentacion` |

## Automação opcional

- [x] Sincronização do branch órfão `documentacion` a partir de `main` — `.github/workflows/sync-documentacion.yml` (ver *Branch órfão documentacion* acima)
- [x] `npm audit --audit-level=high` após `npm ci` com `continue-on-error: true` — [ADR-0006](../adr/ADR-0006-release-and-tauri-ci-workflows.md)
- [x] Testes de integração com PostgreSQL (fase B, ADR-0004) — `tests/integration/`, `npm run test:integration`
- [x] Build Tauri em runner self-hosted — `.github/workflows/tauri-selfhosted.yml` (`workflow_dispatch`) — [ADR-0006](../adr/ADR-0006-release-and-tauri-ci-workflows.md)
- [x] semantic-release — `release.config.cjs`, `.github/workflows/release.yml` — [ADR-0006](../adr/ADR-0006-release-and-tauri-ci-workflows.md)

**Outros idiomas:** [English](../../en/quality/ci-cd.md) · [Español](../../es/quality/ciclo-ci-cd.md)

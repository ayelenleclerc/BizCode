# Pipeline CI/CD

## Visão geral

BizCode usa GitHub Actions. Definição: `.github/workflows/ci.yml`.

## Estágios

```
push / pull_request → job quality (ubuntu-latest):
  checkout → Node 20 → npm ci → prisma generate →
  type-check → lint → test:coverage → check:i18n →
  playwright install chromium → test:e2e → check:docs-map →
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
| lint | Erro ou **warning** ESLint (`--max-warnings 0`) |
| test:coverage | Falha de teste ou cobertura abaixo do limite |
| check:i18n | Chaves divergentes da fonte `es` |
| test:e2e | Falha Playwright (build + `vite preview`; ver [ADR-0004](../adr/ADR-0004-e2e-playwright-integration-roadmap.md)) |
| check:docs-map | Caminho do mapa documental ausente no disco |

## Serviços

**PostgreSQL 16** em container (`DATABASE_URL`). Os testes atuais **mocam Prisma** no contrato API; o serviço prepara integração **futura** (fase B em [ADR-0004](../adr/ADR-0004-e2e-playwright-integration-roadmap.md)).

## Artefatos

`coverage-report` — 14 dias — pasta `coverage/`.

## Fora do CI

Build desktop Tauri (WebKit nativo, display, Rust). Build local: `npm run tauri build`.

## Melhorias futuras

- [ ] `npm audit` (não bloqueante no início)
- [ ] Testes de integração com PostgreSQL (fase B, ADR-0004)
- [ ] Build Tauri em runner self-hosted

**Outros idiomas:** [English](../../en/quality/ci-cd.md) · [Español](../../es/quality/ciclo-ci-cd.md)

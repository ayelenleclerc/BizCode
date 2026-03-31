# Pipeline CI/CD

## Visão geral

BizCode usa GitHub Actions para integração contínua. O pipeline está em `.github/workflows/ci.yml`.

## Estágios

```
push / pull_request → job quality (ubuntu-latest):
  checkout → Node 20 → npm ci → prisma generate →
  type-check → lint → test:coverage → check:i18n → artefato de cobertura
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

## Serviços

PostgreSQL 16 em container para testes; connection string `postgresql://bizcode:bizcode@localhost:5432/bizcode_test`.

## Artefatos

`coverage-report` — 14 dias — pasta `coverage/`.

## Fora do CI

Build Tauri desktop (WebKit nativo, display, toolchain Rust). Build local: `npm run tauri build`.

**Outros idiomas:** [English](../../en/quality/ci-cd.md) · [Español](../../es/quality/ciclo-ci-cd.md)

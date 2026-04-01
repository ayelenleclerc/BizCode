# Pipeline CI/CD

## Visión general

BizCode usa GitHub Actions para integración continua. El pipeline está definido en `.github/workflows/ci.yml`.

## Etapas del pipeline

```
push / pull_request → job quality (ubuntu-latest):
  checkout → Node 22 → npm ci → npm audit (informativo) → prisma generate → prisma migrate deploy →
  type-check → lint → test:coverage → check:i18n →
  playwright install chromium → test:e2e → test:integration → check:docs-map →
  artefacto de cobertura
```

## Disparadores

| Evento | Ramas |
|---|---|
| `push` | `main`, `develop` |
| `pull_request` | hacia `main` |

## Condiciones de bloqueo

Un paso bloquea el pipeline (código de salida ≠ 0) cuando:

| Paso | Condición |
|---|---|
| type-check | Cualquier error de compilación TypeScript |
| lint | Cualquier error o **advertencia** de ESLint (`npm run lint` usa `--max-warnings 0`) |
| test:coverage | Fallo de test O umbral de cobertura no cumplido |
| check:i18n | Claves faltantes o sobrantes vs. fuente `es` |
| test:e2e | Fallo de Playwright (incluye `vite build` + preview; ver [ADR-0004](../adr/ADR-0004-e2e-playwright-integration-roadmap.md)) |
| test:integration | Fallo en pruebas `tests/integration/` (Prisma real sobre PostgreSQL) |
| check:docs-map | Ruta del mapa documental inexistente en disco |

## Servicios

El job inicia **PostgreSQL 16** (`DATABASE_URL` configurada). Tras `prisma migrate deploy`, **`npm run test:integration`** ejecuta HTTP + Prisma real en `tests/integration/`. El **contrato** API (`tests/api/`) sigue **mockeando** Prisma para validar OpenAPI ([ADR-0004](../adr/ADR-0004-e2e-playwright-integration-roadmap.md)).

## Artefactos

| Artefacto | Retención | Contenido |
|---|---|---|
| `coverage-report` | 14 días | Directorio `coverage/` (HTML, LCOV, resumen texto) |

## Qué NO está en CI

**Build desktop Tauri** queda fuera de CI porque:

1. Requiere WebKit nativo por plataforma.
2. Requiere servidor de display (p. ej. Xvfb).
3. Aumenta mucho el tiempo con Rust + CLI Tauri.

**Alternativa:** build local con `npm run tauri build` o `npm run tauri dev`.

## Automatización opcional / seguimiento

- [x] Paso `npm audit --audit-level=high` tras `npm ci` con `continue-on-error: true` — [ADR-0006](../adr/ADR-0006-release-and-tauri-ci-workflows.md)
- [x] Tests de integración con PostgreSQL real (fase B, ADR-0004) — `tests/integration/`, `npm run test:integration`
- [x] Build Tauri en runner self-hosted — `.github/workflows/tauri-selfhosted.yml` (`workflow_dispatch`) — [ADR-0006](../adr/ADR-0006-release-and-tauri-ci-workflows.md)
- [x] semantic-release — `release.config.cjs`, `.github/workflows/release.yml` — [ADR-0006](../adr/ADR-0006-release-and-tauri-ci-workflows.md)

**Otros idiomas:** [English](../../en/quality/ci-cd.md) · [Português](../../pt-br/quality/ciclo-ci-cd.md)

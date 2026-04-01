# Pipeline CI/CD

## Visión general

BizCode usa GitHub Actions para integración continua. El pipeline está definido en `.github/workflows/ci.yml`.

## Etapas del pipeline

```
push / pull_request → job quality (ubuntu-latest):
  checkout → Node 20 → npm ci → prisma generate →
  type-check → lint → test:coverage → check:i18n →
  playwright install chromium → test:e2e → check:docs-map →
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
| check:docs-map | Ruta del mapa documental inexistente en disco |

## Servicios

El job inicia **PostgreSQL 16** (`DATABASE_URL` configurada). Los tests automatizados actuales **mockean Prisma** en el contrato API; el servicio queda disponible para integración **futura** (fase B en [ADR-0004](../adr/ADR-0004-e2e-playwright-integration-roadmap.md)).

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

## Mejoras futuras

- [ ] Paso `npm audit --audit-level=high` (advertencia no bloqueante al inicio)
- [ ] Tests de integración con PostgreSQL real (fase B, ADR-0004)
- [ ] Build Tauri en runner Windows self-hosted para releases
- [ ] semantic-release al fusionar en `main`

**Otros idiomas:** [English](../../en/quality/ci-cd.md) · [Português](../../pt-br/quality/ciclo-ci-cd.md)

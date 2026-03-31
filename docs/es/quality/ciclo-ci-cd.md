# Pipeline CI/CD

## Visión general

BizCode usa GitHub Actions para integración continua. El pipeline está definido en `.github/workflows/ci.yml`.

## Etapas del pipeline

```
push / pull_request
      │
      ▼
┌─────────────────────────────────────────────┐
│  Job: quality (ubuntu-latest)               │
│                                             │
│  1. Checkout                                │
│  2. Setup Node.js 20 (cache: npm)           │
│  3. npm ci --legacy-peer-deps               │
│  4. npx prisma generate                     │
│  5. npm run type-check        ← bloquea      │
│  6. npm run lint              ← bloquea      │
│  7. npm run test:coverage     ← bloquea (Vitest + cobertura + contrato OpenAPI + smoke axe) │
│  8. npm run check:i18n        ← bloquea      │
│  9. Subida de artefacto de cobertura (siempre) │
└─────────────────────────────────────────────┘
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

## Servicios

El job de CI inicia un contenedor de servicio PostgreSQL 16 para tests de integración `api.test.ts`. Cadena: `postgresql://bizcode:bizcode@localhost:5432/bizcode_test`.

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
- [ ] E2E con Playwright (Xvfb en CI)
- [ ] Build Tauri en runner Windows self-hosted para releases
- [ ] semantic-release al fusionar en `main`

**Otros idiomas:** [English](../../en/quality/ci-cd.md) · [Português](../../pt-br/quality/ciclo-ci-cd.md)

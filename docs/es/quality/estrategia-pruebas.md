# Estrategia de pruebas

**Norma:** ISO/IEC 29119-2 (planificación de pruebas), ISO/IEC 29119-4 (técnicas de prueba)

---

## Pirámide de pruebas

```
          ┌──────────────────────────────┐
          │   E2E (smoke Playwright)     │   CI: Chromium, vite preview (ver ADR-0004)
          ├──────────────────────────────┤
          │   E2E (manual / Tauri)       │   Escritorio fuera del harness Playwright
          ├──────────────────────────────┤
          │   Integración (PostgreSQL)   │   tests/integration/ — Prisma real, supertest (ADR-0004 fase B)
          ├──────────────────────────────┤
          │   Unitarias + a11y           │   CI: 100% líneas/funciones/ramas en src/lib/** y server/createApp.ts
          │   (Vitest+axe)               │       Smoke axe en App (src/App.a11y.test.tsx)
          ├──────────────────────────────┤
          │   Contrato API               │   tests/api/contract.test.ts (supertest + Ajv vs openapi.yaml)
          └──────────────────────────────┘
```

## Política de cobertura

| Alcance | Líneas | Funciones | Ramas | Sentencias |
|---|---|---|---|---|
| **`src/lib/**/*.ts`** (excluye `*.test.ts`) | **100%** | **100%** | **100%** | **100%** |
| **`server/createApp.ts`** (API Express; Prisma inyectado) | **100%** | **100%** | **100%** | **100%** |
| **`server.ts`** (arranque: `createServerInstance`, `bindHttpServer`, `startServer`; entrada `server/main.ts`) | **100%** | **100%** | **100%** | **100%** |

Exclusiones adicionales del informe de cobertura solo con **ADR** y cambio explícito en `vitest.config.ts` — ver [ADR-0003](../adr/ADR-0003-api-contract-testing.md), [ADR-0004](../adr/ADR-0004-e2e-playwright-integration-roadmap.md) y [ADR-0005](../adr/ADR-0005-vitest-coverage-server-bootstrap.md).

Los umbrales los aplica Vitest (`coverage.thresholds`). El CI falla si no se cumplen.

## Objetivos de cobertura (KPI)

| KPI | Objetivo | Dónde se exige |
|-----|----------|----------------|
| Líneas / funciones / ramas / sentencias en el alcance normativo (`src/lib/**/*.ts`, `server/createApp.ts`, `server.ts`) | **100%** cada una (política) | Documentado aquí y en ADR-0003/4/5; el **suelo** actual está en `vitest.config.ts` → `coverage.thresholds` |
| Contrato API vs OpenAPI | Pasan las rutas en `tests/api/contract.test.ts` | `npm run test` |
| E2E (Playwright) | Smoke + rutas críticas en `e2e/` en Chromium | `npm run test:e2e` |
| Integración (PostgreSQL) | `tests/integration/**` | `npm run test:integration` |
| Accesibilidad | Smoke `jest-axe` + `@axe-core/playwright` en superficies críticas + ESLint `jsx-a11y` | `npm run test:a11y`, specs Playwright, `npm run lint` |

## Dónde corre cada suite (local vs CI)

| Suite | Comando local | Workflow CI (evidencia) |
|-------|---------------|------------------------|
| Type-check | `npm run type-check` | `.github/workflows/ci.yml` |
| Lint (incl. jsx-a11y) | `npm run lint` | `ci.yml`, `frontend-validation.yml` |
| Unitarias + cobertura | `npm run test`, `npm run test:coverage` | `ci.yml`, `qa-validation.yml` (job `unit_tests`) |
| Contrato API | parte de `npm run test` | `ci.yml` |
| Integración | `npm run test:integration` (requiere `DATABASE_URL`) | `ci.yml`, `qa-validation.yml` |
| E2E Playwright | `npm run test:e2e` | `ci.yml`, `qa-validation.yml` |
| A11y unitaria | `npm run test:a11y` | `qa-validation.yml` (`accessibility_tests`) |
| Caza de flakes (opcional) | `npm run test:e2e:repeat` | Resumen en job QA |
| Carga smoke (opcional) | `npm run perf:smoke` (CLI [k6](https://k6.io/docs/get-started/installation/)) | No en CI por defecto |

**Regresión visual (Playwright):** usar `expect(page).toHaveScreenshot()` en un spec dedicado; versionar baselines en una sola plataforma (p. ej. Chromium en Linux en CI) con `snapshotPathTemplate` en `playwright.config.ts`. Aún no hay baselines en el repo; añadirlos en un PR cuando exista captura estable en Linux.

**Paridad de entornos y checklist manual:** [paridad-entornos-pruebas.md](paridad-entornos-pruebas.md) · [lista-verificacion-qa-manual.md](lista-verificacion-qa-manual.md)

## Herramientas

| Herramienta | Versión | Uso |
|---|---|---|
| Vitest | 4.x | Runner, `expect`, mocks `vi` |
| @vitest/coverage-v8 | 4.x | Instrumentación V8 |
| @testing-library/react | latest | Render en jsdom |
| @testing-library/jest-dom | latest | Matchers DOM |
| jest-axe | latest | Smoke de accesibilidad (axe-core) |
| supertest | latest | HTTP hacia Express en contrato API |
| @apidevtools/swagger-parser | latest | Dereferenciación OpenAPI |
| yaml | latest | Parse local de `docs/api/openapi.yaml` |
| ajv + ajv-formats | latest | Validación JSON Schema de respuestas |
| jsdom | latest | Simulación DOM |
| @playwright/test | 1.x | Smoke E2E contra vite preview (`e2e/`) — ADR-0004 |

## Ubicación de archivos de prueba

```
src/lib/
  validators.test.ts, invoice.test.ts, api.test.ts
src/test/setup.ts
App.a11y.test.tsx
tests/api/contract.test.ts, validate-openapi-response.ts
tests/server/server.test.ts  ← arranque `server.ts` (Prisma mock; ADR-0005)
e2e/smoke.spec.ts
tests/integration/api.integration.test.ts  ← HTTP + Prisma real (`npm run test:integration`; excluido del Vitest por defecto)
tests/integration/dbf-migration.integration.test.ts  ← genera fixtures DBF mínimos en runtime y valida `scripts/migrate-from-dbf.ts` sobre PostgreSQL
```

Vitest **excluye** `e2e/**` (`vitest.config.ts`) para que solo Playwright ejecute esos archivos. **`tests/integration/**`** queda fuera del `npm run test:coverage` (no exige `DATABASE_URL`); integración usa `vitest.integration.config.ts`.

## Estrategia de mocks

- **HTTP (Axios):** `vi.mock('axios')` con `vi.hoisted()`.
- **APIs de navegador:** `localStorage`, `console.*` con `vi.spyOn` si hace falta.
- **Prisma:** en contrato API se mockea `PrismaClient`. En **`tests/integration/`** se usa `PrismaClient` real contra PostgreSQL ([ADR-0004](../adr/ADR-0004-e2e-playwright-integration-roadmap.md) fase B); complementa el contrato sin sustituir la validación OpenAPI del otro archivo.
- **Explorador interactivo (Swagger UI):** servido en `/api-docs` con la API en marcha (`npm run server`). Referencia y política: [plan-swagger-openapi-ui.md](plan-swagger-openapi-ui.md) (equivalentes EN/PT-BR en [DOCUMENT_LOCALE_MAP.md](../../DOCUMENT_LOCALE_MAP.md)). No sustituye el contrato ni `docs/api/openapi.yaml`.

## Criterios de entrada y salida

**Entrada (ejecutar CI):** `tsc` sin errores; ESLint sin errores.

**Salida (CI OK):** tests unitarios/API pasan; smoke E2E (`npm run test:e2e`) pasa; integración (`npm run test:integration`, con migraciones aplicadas en CI) pasa; cobertura cumple umbrales; artefacto de cobertura subido.

## Regresiones

Ante un bug: 1) test que reproduzca; 2) falla en código actual; 3) corrección; 4) test pasa.

**Otros idiomas:** [English](../../en/quality/testing-strategy.md) · [Português](../../pt-br/quality/estrategia-testes.md)

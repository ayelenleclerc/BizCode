# Pipeline CI/CD

## Visión general

BizCode usa GitHub Actions para integración continua. El pipeline está definido en `.github/workflows/ci.yml`.

## Etapas del pipeline

```
push / pull_request → job quality (ubuntu-latest):
  checkout → Node 22 → npm ci → npm audit (informativo) → prisma generate → prisma validate → prisma migrate deploy →
  type-check → check:openapi → docs:generate → git diff (docs generados / SBOM) → lint → test:coverage → check:i18n →
  playwright install chromium → test:e2e → test:integration → check:docs-map →
  artefacto de cobertura
```

## Disparadores

| Evento | Ramas |
|---|---|
| `push` | `main`, `develop` |
| `pull_request` | hacia `main` o `develop` |

## Condiciones de bloqueo

Un paso bloquea el pipeline (código de salida ≠ 0) cuando:

| Paso | Condición |
|---|---|
| prisma validate | `schema.prisma` inválido según Prisma (sin mutar PostgreSQL) |
| type-check | Cualquier error de compilación TypeScript |
| check:openapi | Fallo de validación OpenAPI 3.x sobre `docs/api/openapi.yaml` (`npm run check:openapi`) |
| docs:generate + git diff | Desalineación entre lo commitado y la documentación regenerada (`docs/generated/`, `docs/api/openapi-reference.generated.md`, `docs/evidence/sbom-cyclonedx.json`) |
| lint | Cualquier error o **advertencia** de ESLint (`npm run lint` usa `--max-warnings 0`) |
| test:coverage | Fallo de test O umbral de cobertura no cumplido |
| check:i18n | Claves faltantes o sobrantes vs. fuente `es` |
| test:e2e | Fallo de Playwright (incluye `vite build` + preview; ver [ADR-0004](../adr/ADR-0004-e2e-playwright-integration-roadmap.md)) |
| test:integration | Fallo en pruebas `tests/integration/` (Prisma real sobre PostgreSQL) |
| check:docs-map | Ruta del mapa documental inexistente en disco |

## Matriz de trazabilidad (PR → `develop` / `main`)

| Superficie | Qué se verifica | Workflow(s) típico(s) |
|---|---|---|
| Compilación TypeScript | Árbol completo del `tsconfig` (`src`, `server`, `tests`, `e2e`, …) | `ci.yml` → `npm run type-check` |
| API vs contrato | OpenAPI + drift de esquemas / MD generados | `ci.yml` → `check:openapi`, `docs:generate`, `git diff` |
| Ciclo de vida del esquema BD | `prisma generate`, `prisma validate`, migraciones o `db push`, seed usado en pruebas | `ci.yml`; `backend-validation.yml` (rutas) refuerzo de migraciones |
| Cobertura de líneas/ramas (Vitest/v8) | Umbrales sobre **`server/**/*.ts`**, `server.ts` y **`src/**/*.{ts,tsx}`**, excluyendo tests, barrels solo re-export y tipados (`coverage.exclude` en `vitest.config.ts`). **No todo el repo** (scripts auxiliares, seed aislado, etc.) no entra | `ci.yml`, `frontend-validation.yml`, `qa-validation.yml` → `test:coverage` |
| Integración PostgreSQL | `tests/integration/**` **sin instrumentación de cobertura de líneas** (`vitest.integration.config.ts`) | `ci.yml`, `backend-validation.yml` |
| Bundle web producción | `vite build` vía `webServer` de Playwright antes del smoke UI | `ci.yml`, `frontend-validation.yml` → `test:e2e` |
| Paridad i18n | Claves coherentes entre locales respecto de `es` | `npm run check:i18n` |
| Estructura docs humanos | Existencia de rutas del mapa (`DOCUMENT_LOCALE_MAP.md`) | `check:docs-map` |
| Política de localización docs | Áreas controladas trilingües EN/ES/PT-BR | `docs-governance.yml` (**PR a `main` y `develop`**) |
| Enlaces externos en Markdown (`docs/**`) | Destinos HTTP(S) vivos (**Lychee**; loopback en `.lycheeignore`). Los enlaces relativos entre `.md` no entran en este job. | `docs-links.yml` |

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

**Gate manual de escritorio:** una vez **`main`** verde, ejecutar **Actions → build Tauri self-hosted** (`tauri-selfhosted.yml`) antes de publicar instaladores; el tagging con semantic-release permanece aparte (`release.yml`). Detalle: [ADR-0006](../adr/ADR-0006-release-and-tauri-ci-workflows.md).

## Rama huérfana `documentacion`

La rama **huérfana** `documentacion` **no** contiene código de aplicación: solo una instantánea documental para publicación estática (p. ej. GitHub Pages).

| Elemento | Detalle |
|---|---|
| Workflow | `.github/workflows/sync-documentacion.yml` |
| Cuándo corre | `push` a **`main`** que modifique `docs/**`, `Certificación-ISO/**`, `README.md`, `AGENTS.md` o `CONTRIBUTING.md` en la raíz; o **`workflow_dispatch`** (Actions → *Sync documentacion branch*) |
| Ref manual | Entrada opcional `source_ref` (por defecto `main`) para copiar desde otra rama o SHA |
| Ramas de código | Sin cambios: trabajo en `develop` / `feature/*` / `fix/*`, integración en `main` según [CONTRIBUTING](../../../CONTRIBUTING.md); este job **no** sube código de app a `documentacion` |

## Automatización opcional / seguimiento

- [x] Sincronización de la rama huérfana `documentacion` desde `main` — `.github/workflows/sync-documentacion.yml` (véase *Rama huérfana documentacion* arriba)
- [x] Paso `npm audit --audit-level=high` tras `npm ci` con `continue-on-error: true` — [ADR-0006](../adr/ADR-0006-release-and-tauri-ci-workflows.md)
- [x] Tests de integración con PostgreSQL real (fase B, ADR-0004) — `tests/integration/`, `npm run test:integration`
- [x] Build Tauri en runner self-hosted — `.github/workflows/tauri-selfhosted.yml` (`workflow_dispatch`) — [ADR-0006](../adr/ADR-0006-release-and-tauri-ci-workflows.md)
- [x] semantic-release — `release.config.cjs`, `.github/workflows/release.yml` — [ADR-0006](../adr/ADR-0006-release-and-tauri-ci-workflows.md)
- [x] Enlaces HTTP(S) en `docs/` — `docs-links.yml` + `.lycheeignore` (Lychee; no enlaces relativos `.md`)

## Flujo automático de Project (GitHub)

Estado operativo validado para el board `BizCode Delivery`:

- Abrir PR con referencia `Closes #<issue>` -> estado `In Progress`.
- Cerrar PR sin merge -> estado `Backlog`.
- Merge de PR -> estado `Done`.

Implementación:

- Workflow: `.github/workflows/project-status-automation.yml`
- Variables requeridas en repo:
  - `PROJECT_V2_ID`
  - `PROJECT_STATUS_FIELD_ID`
  - `PROJECT_STATUS_OPTION_BACKLOG`
  - `PROJECT_STATUS_OPTION_IN_PROGRESS`
  - `PROJECT_STATUS_OPTION_DONE`
  - `PROJECT_STATUS_OPTION_BLOCKED` (opcional)
- Variable opcional en repo:
  - `PROJECT_PR_ASSOCIATED_FIELD_ID`: id GraphQL del campo de texto **PR asociado** del Project. Si está definida, el workflow guarda ahí la URL del PR al actualizar el estado de cada issue enlazada.
- Secreto recomendado para tableros de usuario (Project V2):
  - `PROJECT_AUTOMATION_TOKEN` (`repo`, `project`, `read:project`)

## Plan Cursor → Issues de GitHub + Project (herramienta local)

- **Validación en CI (sin token):** `.github/workflows/plan-md-validate.yml` ejecuta `npm run plan:validate` en PR y en push a `main` / `develop`. Por defecto solo valida `tests/plan-sync/fixtures/valid-*.plan.md` (contrato + etiquetas). En local, `npm run plan:validate -- --with-cursor-plans` también revisa `.cursor/plans/*.plan.md` si existe esa carpeta.
- **Sincronización local:** `npm run plan:sync -- --plan <ruta.plan.md> [--repo propietario/repo] [--repo-root <dir>] [--dry-run]` crea o actualiza un issue por todo del plan, enlaza al Project v2, ajusta el estado del tablero según el todo y guarda el mapeo en `.github/plan-sync/state/`. Fuera de `--dry-run` hace falta `GH_TOKEN` o `GITHUB_TOKEN`, `GITHUB_REPOSITORY` (o `GITHUB_OWNER` + `GITHUB_REPO`, o `--repo`) y las mismas variables de Project que arriba. Los informes van a `.github/plan-sync/reports/` (ignorados por git).
- **Flujo opcional de aprobación:** `npm run plan:approve -- --plan <ruta>` archiva una copia en `.cursor/plans/` y ejecuta `plan:sync` (véase `scripts/github/plan-approve-main.ts`).
- **Relación con la automatización por PR:** Con los ítems en el tablero, `.github/workflows/project-status-automation.yml` sigue actualizando el estado al abrir/cerrar/mergear PR cuando el issue está enlazado con `Closes #<issue>`.
- **Higiene del tablero:** deja **Backlog** para trabajo que no esté en curso (sin PR abierto). Usa **Ready** si está comprometido pero aún sin PR; **In Progress** cuando hay un PR abierto enlazado. Evita **In Progress** sin PR.

**Post-merge (mantenedor):** tras merge del PR enlazado con `Closes #…`, revisar que los issues se cerraron en GitHub y confirmar que el proyecto **BizCode Delivery** mueve los ítems a **Done** cuando corresponde (workflow `.github/workflows/project-status-automation.yml` y variables del repositorio documentadas más arriba).

Checklist de uso diario:

1. Crear issue con template `Task`.
2. Agregar issue al Project.
3. Abrir PR con `Closes #<issue>`.
4. Verificar checks (`Quality Gate`, `Docs governance`, enlaces Markdown en `docs/`, seguridad/CodeQL si aplica).
5. Mergear cuando CI esté verde.

Política de documentación (Wiki vs controlada):

- Operativo/rápido en Wiki.
- Auditable/controlado en repo (`docs/` y `Certificación-ISO/`).
- Referencia: [política Wiki vs documentación controlada](politica-wiki-vs-documentacion-controlada.md).

**Otros idiomas:** [English](../../en/quality/ci-cd.md) · [Português](../../pt-br/quality/ciclo-ci-cd.md)

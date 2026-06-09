# Pipeline CI/CD

## Visión general

BizCode usa GitHub Actions para integración continua. El pipeline está definido en `.github/workflows/ci.yml`.

## Etapas del pipeline

```
push / pull_request → job quality (ubuntu-latest):
  checkout → Node 22 → npm ci → npm audit (informativo) → prisma generate → prisma validate → prisma migrate deploy →
  type-check → docs:validate → docs:generate → verificación post-proceso TypeDoc → git diff (docs generados / SBOM) → lint →
  contract tests (OpenAPI/Ajv) → test:coverage → check:i18n →
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
| docs:validate | Sintaxis OpenAPI 3.x (`npm run check:openapi`) y cobertura de rutas Express `/api/*` en `docs/api/openapi.yaml` (`npm run check:openapi-sync`) |
| docs:generate + git diff | Desalineación entre lo commitado y la documentación regenerada (`docs/generated/`, `docs/api/openapi-reference.generated.md`, `docs/evidence/sbom-cyclonedx.json`) |
| Post-proceso TypeDoc | Sin `target="_blank">TypeDoc</` en `docs/generated/typedoc/` (`docs:typedoc` + `scripts/patch-typedoc-html-noopener.mjs`) |
| lint | Cualquier error o **advertencia** de ESLint (`npm run lint` usa `--max-warnings 0`) |
| Contract tests API | Fallo en `tests/api/contract.test.ts` (rutas/esquemas OpenAPI vs Ajv) |
| test:coverage | Fallo de test O umbral de cobertura no cumplido |
| check:i18n | Claves faltantes o sobrantes vs. fuente `es` |
| test:e2e | Fallo de Playwright (incluye `vite build` + preview; ver [ADR-0004](../adr/ADR-0004-e2e-playwright-integration-roadmap.md)) |
| test:integration | Fallo en pruebas `tests/integration/` (Prisma real sobre PostgreSQL) |
| check:docs-map | Ruta del mapa documental inexistente en disco |

## Matriz de trazabilidad (PR → `develop` / `main`)

| Superficie | Qué se verifica | Workflow(s) típico(s) |
|---|---|---|
| Compilación TypeScript | Árbol completo del `tsconfig` (`src`, `server`, `tests`, `e2e`, …) | `ci.yml` → `npm run type-check` |
| API vs contrato | Sintaxis OpenAPI + sync de rutas + drift de esquemas / MD generados | `ci.yml` → `docs:validate`, `docs:generate`, `git diff` |
| Ciclo de vida del esquema BD | `prisma generate`, `prisma validate`, migraciones o `db push`, seed usado en pruebas | `ci.yml`; `backend-validation.yml` (rutas) refuerzo de migraciones |
| Cobertura de líneas/ramas (Vitest/v8) | Umbrales sobre **`server/**/*.ts`**, `server.ts` y **`src/**/*.{ts,tsx}`**, excluyendo tests, barrels solo re-export y tipados (`coverage.exclude` en `vitest.config.ts`). **No todo el repo** (scripts auxiliares, seed aislado, etc.) no entra | `ci.yml`, `frontend-validation.yml`, `qa-validation.yml` → `test:coverage` |
| Integración PostgreSQL | `tests/integration/**` **sin instrumentación de cobertura de líneas** (`vitest.integration.config.ts`) | `ci.yml`, `backend-validation.yml` |
| Bundle web producción | `vite build` vía `webServer` de Playwright antes del smoke UI | `ci.yml`, `frontend-validation.yml` → `test:e2e` |
| Paridad i18n | Claves coherentes entre locales respecto de `es` | `npm run check:i18n` |
| Estructura docs humanos | Existencia de rutas del mapa (`DOCUMENT_LOCALE_MAP.md`) | `check:docs-map` |
| Política de localización docs | Áreas controladas trilingües (calidad, ISO, specs, **manuales de usuario**, changelogs, ADR, OpenAPI) | `docs-governance.yml` (**PR a `main` y `develop`**) |
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

**Gate manual de escritorio:** una vez **`main`** verde, ejecutar **Actions → build Tauri self-hosted** (`tauri-selfhosted.yml`) antes de publicar instaladores; también puede usarse **Actions → Tauri release** (`tauri-release.yml` en tags `v*.*.*`). Detalle: [ADR-0006](../adr/ADR-0006-release-and-tauri-ci-workflows.md).

## Rama huérfana `documentacion`

La rama **huérfana** `documentacion` **no** contiene código de aplicación: solo una instantánea documental para publicación estática (p. ej. GitHub Pages).

| Elemento | Detalle |
|---|---|
| Workflow | `.github/workflows/sync-documentacion.yml` |
| Cuándo corre | `push` a **`main`** que modifique `docs/**`, `Certificación-ISO/**`, `README.md`, `AGENTS.md` o `CONTRIBUTING.md` en la raíz; o **`workflow_dispatch`** (Actions → *Sync documentacion branch*) |
| Ref manual | Entrada opcional `source_ref` (por defecto `main`) para copiar desde otra rama o SHA |
| Ramas de código | Sin cambios: trabajo en `develop` / `feature/*` / `fix/*`, integración en `main` según [CONTRIBUTING](../../../CONTRIBUTING.md); este job **no** sube código de app a `documentacion` |

## Despliegue productivo con Docker (issue #149)

### Topología de contenedores

- `server` (`Dockerfile`): contenedor Node 22 que ejecuta `npm run server`, health check en `GET /api/health`.
- `frontend` (`Dockerfile.frontend`): build estático de Vite servido con Nginx, health check en `/`.
- `postgres`: PostgreSQL 16 con volumen persistente.
- `docker-compose.prod.yml` orquesta los tres servicios. El compose de paridad local existente (`docker-compose.postgres.yml`) no se modifica.
- Estado actual: **deploy-ready** (preparado para despliegue), con activación productiva pendiente de servidor real.

### Rol de Nginx

- El contenedor Nginx sirve los archivos estáticos del frontend.
- Además proxyea `/api/*` al backend (`server:3001`) dentro de la red de compose.
- Es un reverse proxy interno del stack; el repositorio no fija dominio externo ni certificados productivos.

### Variables de entorno requeridas para deploy

- Runtime (`.env` del host, nunca commiteado): `DATABASE_URL`, `POSTGRES_PASSWORD`, `JWT_SECRET`/`SESSION_SECRET`, `APP_ENV`.
- Opcionales: `POSTGRES_DB`, `POSTGRES_USER`, `FRONTEND_PORT`, `VITE_API_URL`, `CORS_ORIGINS`, `LOG_LEVEL`, variables SMTP/Twilio.
- Clave fiscal opcional: `BIZCODE_FISCAL_ENCRYPTION_KEY`.

### Workflow GitHub Actions de deploy

Archivo: `.github/workflows/deploy.yml`.

- `build_and_test` (validación siempre activa en `push`/`pull_request`/manual):
  - `npm ci`
  - `npm run type-check`
  - `npm run lint`
  - `npm run test`
  - `npm run check:i18n`
  - `npm run check:docs-map`
  - `npm run docs:validate`
  - validación de build Docker backend/frontend
- `publish_images` (preparado para `main`, releases o manual):
  - login a GHCR con `GHCR_TOKEN` si existe; fallback a `GITHUB_TOKEN`
  - build/push de `ghcr.io/<owner>/bizcode-server` y `ghcr.io/<owner>/bizcode-frontend`
- `deploy` (despliegue real condicionado):
  - solo corre con `workflow_dispatch` e input `run_deploy: true` (tras `publish_images`)
  - puerto SSH vía input `deploy_ssh_port` (por defecto `22`); añadir Environment `production` con revisores cuando exista servidor
  - SSH al host y ejecución de `docker compose -f docker-compose.prod.yml pull && up -d`
  - si faltan secrets o servidor, ramas `feature`/`develop` siguen pasando validación y build sin fallar.

### Secrets de repositorio requeridos para deploy SSH

- `DEPLOY_HOST`
- `DEPLOY_USER`
- `DEPLOY_SSH_KEY`
- `DEPLOY_PATH`
- Input de workflow `deploy_ssh_port` (opcional; por defecto `22`, no es secret)
- `DATABASE_URL`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`
- `APP_ENV`
- `VITE_API_URL`
- `CORS_ORIGINS`
- `SESSION_SECRET`
- `GHCR_TOKEN` (opcional si `GITHUB_TOKEN` no alcanza)

### Checklist de activación futura

1. Definir servidor productivo (host/dominio/red) fuera del repositorio.
2. Cargar secrets en GitHub (sin valores en git).
3. Configurar `environment: production` con aprobación manual.
4. Ejecutar `workflow_dispatch` o publicar release/tag.
5. Verificar health checks (`/api/health` y `/`).

### Rollback básico

- Conservar tags previos en GHCR (se publican referencias por `sha` y por tag).
- En el host, volver a una versión anterior fijando tags previos en `docker-compose.prod.yml` (u override del host) y re-ejecutando:
  - `docker compose -f docker-compose.prod.yml pull`
  - `docker compose -f docker-compose.prod.yml up -d`

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

## Jobs operativos programados (cron en el host)

No forman parte del pipeline por defecto de GitHub Actions; prográmelos en el servidor de despliegue (u orquestador) con acceso a la base del tenant.

| Programación | Comando | Propósito |
|---|---|---|
| `*/5 * * * *` | `npm run arca:retry-pending-job` | Reintenta facturas con `estadoCae: pending` vía mock WSFE de homologación (`ArcaService.retryPending`) para cada tenant con `TenantFiscalConfig`. |
| `0 * * * *` (cada hora) | `npm run cobranzas:recordatorios` | Recordatorios de mora para cada tenant con `ParamEmpresa`; envío a las **08:00 hora local** (minuto &lt; 15) dentro del horario comercial configurado. Usar `0 8 * * *` solo en despliegues mono-zona. |

Variable opcional para un solo tenant en dev/staging: `BIZCODE_TENANT_ID=<id>` (aplica a `arca:retry-pending-job`, `arca:retry-pending` y `cobranzas:recordatorios`). Opcional `BIZCODE_RECORDATORIO_CANAL` (por defecto `email`).

Política de documentación (Wiki vs controlada):

- Operativo/rápido en Wiki.
- Auditable/controlado en repo (`docs/` y `Certificación-ISO/`).
- Referencia: [política Wiki vs documentación controlada](politica-wiki-vs-documentacion-controlada.md).

**Otros idiomas:** [English](../../en/quality/ci-cd.md) · [Português](../../pt-br/quality/ciclo-ci-cd.md)

# Aprobación/archivo de plan Cursor + sincronización GitHub (`plan:approve`, `plan:sync`)

## Objetivo

El comando `npm run plan:approve` es el punto de entrada operativo para procesar un plan Markdown estilo Cursor ya aprobado (frontmatter YAML entre delimitadores `---` más cuerpo). Primero archiva una copia inmutable en `.cursor/plans/{timestamp}-{slug}.plan.md` y luego ejecuta el mismo comportamiento de `npm run plan:sync`: valida todos/etiquetas frente a `.github/labels.json`, y **crea o actualiza issues** en GitHub con título `[PLAN:{nombreDelPlan}] …`. Añade cada issue al **Project v2** de GitHub (si está configurado) y ajusta el campo **Status** según el `status` de cada todo:

- `pending` → Backlog
- `in_progress` → In Progress
- `completed` → Done
- `cancelled` → Backlog + `type:chore` + comentario explicativo

Los todos eliminados del plan pero aún presentes en el archivo de estado de la última ejecución se tratan como **huérfanos**: el issue se conserva, se añade un comentario, se **fusiona `type:chore`** con las etiquetas ya existentes del issue (se conservan el resto) y el estado vuelve a Backlog si existe el ítem en el proyecto.

**Todos completados (`status: completed`):** se crea o actualiza el issue como el resto y el **Status** del proyecto queda en **Done** (carga retroactiva si el todo ya estaba hecho antes del primer sync).

## Contrato del plan

Esquemas Zod en `src/lib/plan-sync/schemas.ts` (y parseo en `src/lib/plan-sync/parse.ts`): frontmatter obligatorio `name`, `overview`, `todos[]` con `id`, `content`, `status` (`pending` \| `in_progress` \| `completed` \| `cancelled`), `meta` opcional (`type`, `priority`, `area`) con valores por defecto `feature`, `P1`, `platform`. Se permiten claves extra en el frontmatter (p. ej. `isProject`). Los tipos de estado en disco están en `scripts/github/plan-sync/types.ts`.

## Etiquetas heurísticas

Si el texto del todo o el cuerpo del plan contienen palabras clave simples, se añaden etiquetas (que deben existir en `.github/labels.json`): **`needs-docs`** (p. ej. documentación, OpenAPI, i18n), **`needs-tests`** (p. ej. prueba, cobertura, Vitest, Playwright).

## Fallos de vinculación al proyecto

El catálogo **debe** incluir **`needs-spec`** (recuperación). Si falla el enlace a Project v2 o la actualización del estado después de que el issue existe, la herramienta comenta el issue, aplica **`needs-spec`** (fusionada con las etiquetas actuales), conserva **`projectItemId` si ya se había resuelto** y **termina con código de salida 1**; la siguiente ejecución de `plan:sync` reintenta el proyecto.

## Requisitos previos

- Configuración inicial fase 1: ver [`.github/PROJECT_SETUP_PHASE1.md`](../../../.github/PROJECT_SETUP_PHASE1.md) (etiquetas, campos del proyecto, variables del repositorio).
- Las etiquetas salen del `meta` de cada todo (predeterminados: `type:feature`, `priority:P1`, `area:platform`), heurísticas opcionales y **`needs-spec`** de recuperación; todas deben existir en [`.github/labels.json`](../../../.github/labels.json).

## Uso

Desde la raíz del repositorio:

```bash
npm run plan:approve -- --plan ruta/al/plan.plan.md
```

```bash
npm run plan:sync -- --plan ruta/al/plan.plan.md
```

Opciones:

- `--repo propietario/repo` — solo para `plan:sync`; sustituye `GITHUB_REPOSITORY` en esa ejecución.
- `--repo-root <dir>` — raíz del repositorio (por defecto el directorio de trabajo actual).
- `--dry-run` — analiza y registra acciones previstas; **sin** llamadas a la API de GitHub ni escritura de estado/informes.
- `--archive-dir <dir>` — solo para `plan:approve`; directorio relativo para copias archivadas (por defecto `.cursor/plans`).

## Validación en CI (`plan:validate`)

`npm run plan:validate` comprueba **solo** `tests/plan-sync/fixtures/valid-*.plan.md` por defecto (contrato + `.github/labels.json`). Para incluir `.cursor/plans/*.plan.md` en local: `npm run plan:validate -- --with-cursor-plans`. **No requiere token**. Workflow: `.github/workflows/plan-md-validate.yml` (PR y push a `main` / `develop`).

## Hook del botón Build

No existe evidencia de un hook a nivel de repositorio para el botón **Build** de Cursor. **Not evidenced in current codebase**.
Usar `npm run plan:approve -- --plan ...` como flujo explícito de aprobación/archivo.

## Variables de entorno

- `GH_TOKEN` o `GITHUB_TOKEN` (obligatoria): PAT con alcances `repo` y de proyecto según necesidad.
- `GITHUB_REPOSITORY` (obligatoria*): `owner/repo`.
- `GITHUB_OWNER` + `GITHUB_REPO` (obligatoria*): alternativa a `GITHUB_REPOSITORY` (o `--repo propietario/repo` en `plan:sync`).
- `PROJECT_V2_ID` (obligatoria): id del nodo del proyecto.
- `PROJECT_STATUS_FIELD_ID` (obligatoria): id del campo Status (selección única).
- `PROJECT_STATUS_OPTION_BACKLOG` (obligatoria): id de opción Backlog.
- `PROJECT_STATUS_OPTION_IN_PROGRESS` (obligatoria): id de opción In Progress.
- `PROJECT_STATUS_OPTION_DONE` (obligatoria): id de opción Done.
- `PROJECT_STATUS_OPTION_BLOCKED` (opcional): reservado para uso futuro.

## Artefactos persistentes (repositorio)

Tras un sync exitoso que no sea `--dry-run`:

- **Estado:** `.github/plan-sync/state/{slug}.json` — mapea `id` del todo → `issueNumber`, hash del contenido, `projectItemId` opcional (re-ejecuciones idempotentes; ausente hasta que el enlace al proyecto tenga éxito).
- **Informes:** `.github/plan-sync/reports/{marca-de-tiempo}-{slug}.md` — registro legible con **`syncDurationMs`** y **`projectLinkFailures`**. **Los informes están en `.gitignore`** (no se versionan por defecto).

Puede confirmarse en git el **estado** para idempotencia compartida; los informes quedan locales salvo que se cambie el ignore.

## Referencias

- [Documentación generada](documentacion-generada.md).
- [Ciclo CI/CD](ciclo-ci-cd.md) — `plan:sync` sigue siendo manual; **`plan:validate`** corre en CI (`plan-md-validate.yml`).

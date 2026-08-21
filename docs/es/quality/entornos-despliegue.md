# Entornos de despliegue (#152)

## Propósito

Documenta cómo BizCode separa **local**, **staging** y **producción**: ramas, secrets, GitHub Environments y residual hasta existir un host remoto.

**Estado de evidencia:** Workflows del repo y Environments están implementados. DNS, Let’s Encrypt y bases en la nube **no** se provisionan en esta entrega. No es una afirmación de certificación.

## Matriz de entornos

| Entorno | Rama / disparador | URL de la app | Base de datos | Deploy |
|---------|-------------------|---------------|---------------|--------|
| Desarrollo local | `feature/*` | `localhost` (API `:3001`, Vite `:5173`) | Docker Postgres `:5432` | Manual (`pnpm` / compose) |
| Staging | Push a `develop` | URL operativa (no hardcodeada en el repo) | Solo DB staging (`STAGING_DATABASE_URL`) | `.github/workflows/staging.yml` → tags GHCR `staging*`; SSH solo si existen secrets `STAGING_DEPLOY_*` |
| Producción | `main` / release / `workflow_dispatch` | URL operativa (no hardcodeada) | DB producción (`PROD_DATABASE_URL` / `.env` del host) | `.github/workflows/deploy.yml` con Environment **`production`** (aprobación) |

## GitHub Environments

| Nombre | Rol |
|--------|-----|
| `staging` | Job SSH opcional en `staging.yml` |
| `production` | Requerido para el job SSH en `deploy.yml` cuando `run_deploy=true` |

Configurar reglas de protección (revisores en `production`) en **Settings → Environments**.

## Secrets esperados

### Staging

| Secret | Uso |
|--------|-----|
| `STAGING_DEPLOY_HOST` | Host SSH |
| `STAGING_DEPLOY_USER` | Usuario SSH |
| `STAGING_DEPLOY_SSH_KEY` | Clave privada |
| `STAGING_DEPLOY_PATH` | Directorio remoto con compose |
| `STAGING_DATABASE_URL` | Opcional; seed/guardrail — **nunca igual** a `PROD_DATABASE_URL` |

Sin secrets de deploy, el job SSH se **omite** (resumen en el log). El build/push a GHCR sí corre en `develop`.

### Producción (`DEPLOY_*`)

| Secret | Uso |
|--------|-----|
| `DEPLOY_HOST` / `DEPLOY_USER` / `DEPLOY_SSH_KEY` / `DEPLOY_PATH` | Deploy SSH a [`docker-compose.prod.yml`](../../docker-compose.prod.yml) |
| `PROD_DATABASE_URL` | Comparación de guardrail en scripts de seed |

Deploy SSH de producción: **manual** (`workflow_dispatch` + `run_deploy=true` + aprobación del Environment).

## Aislamiento de bases

- Staging no debe usar la DB de producción.
- `npm run seed:staging` aborta si `STAGING_DATABASE_URL` = `PROD_DATABASE_URL`, o si el host está en `BIZCODE_PROD_DB_HOSTS`.
- Por defecto: `DATABASE_URL` → Docker `:5432` (datos sintéticos; sin PII real).

```bash
npm run seed:staging
```

## Residual (ops)

- DNS / certificados TLS (Let’s Encrypt)
- nginx en el servidor
- Provisionar VPS y Postgres remoto
- Medir deploy &lt; 8 min en host real (requiere secrets)

## Relacionado

- [backup-y-restauracion.md](backup-y-restauracion.md) · [guia-entorno-local-desarrollo.md](guia-entorno-local-desarrollo.md)

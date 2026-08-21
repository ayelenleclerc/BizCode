# Ambientes de implantação (#152)

## Propósito

Documenta como o BizCode separa **local**, **staging** e **produção**: branches, secrets, GitHub Environments e residual até existir host remoto.

**Estado de evidência:** Workflows do repositório e Environments estão implementados. DNS, Let’s Encrypt e bancos na nuvem **não** são provisionados nesta entrega. Não é afirmação de certificação.

## Matriz de ambientes

| Ambiente | Branch / gatilho | URL do app | Banco | Deploy |
|----------|------------------|------------|-------|--------|
| Desenvolvimento local | `feature/*` | `localhost` (API `:3001`, Vite `:5173`) | Docker Postgres `:5432` | Manual (`pnpm` / compose) |
| Staging | Push em `develop` | URL operacional (não hardcoded) | Somente DB staging (`STAGING_DATABASE_URL`) | `.github/workflows/staging.yml` → tags GHCR `staging*`; SSH só se existirem secrets `STAGING_DEPLOY_*` |
| Produção | `main` / release / `workflow_dispatch` | URL operacional (não hardcoded) | DB produção (`PROD_DATABASE_URL` / `.env` do host) | `.github/workflows/deploy.yml` com Environment **`production`** (aprovação) |

## GitHub Environments

| Nome | Papel |
|------|-------|
| `staging` | Job SSH opcional em `staging.yml` |
| `production` | Obrigatório para o job SSH em `deploy.yml` quando `run_deploy=true` |

Configure regras de proteção em **Settings → Environments**.

## Secrets esperados

### Staging

| Secret | Uso |
|--------|-----|
| `STAGING_DEPLOY_HOST` / `USER` / `SSH_KEY` / `PATH` | Deploy SSH |
| `STAGING_DATABASE_URL` | Opcional; seed/guardrail — **nunca igual** a `PROD_DATABASE_URL` |

Sem secrets de deploy, o job SSH é **omitido**. Build/push GHCR ainda roda em `develop`.

### Produção (`DEPLOY_*`)

| Secret | Uso |
|--------|-----|
| `DEPLOY_HOST` / `DEPLOY_USER` / `DEPLOY_SSH_KEY` / `DEPLOY_PATH` | SSH para [`docker-compose.prod.yml`](../../docker-compose.prod.yml) |
| `PROD_DATABASE_URL` | Comparação de guardrail nos scripts de seed |

Deploy SSH de produção: **manual** (`workflow_dispatch` + `run_deploy=true` + aprovação).

## Isolamento de bancos

- Staging não deve usar a DB de produção.
- `npm run seed:staging` aborta se as URLs coincidirem ou se o host estiver em `BIZCODE_PROD_DB_HOSTS`.
- Padrão: `DATABASE_URL` → Docker `:5432` (dados sintéticos; sem PII real).

```bash
npm run seed:staging
```

## Residual (ops)

- DNS / certificados TLS
- nginx no servidor
- Provisionar VPS e Postgres remoto
- Medir deploy &lt; 8 min em host real

## Relacionado

- [backup-e-restauracao.md](backup-e-restauracao.md) · [guia-ambiente-local-desenvolvimento.md](guia-ambiente-local-desenvolvimento.md)

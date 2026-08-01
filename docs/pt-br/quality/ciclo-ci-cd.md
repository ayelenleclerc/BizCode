# Pipeline CI/CD

## Visão geral

BizCode usa GitHub Actions. Definição: `.github/workflows/ci.yml`.

## Monorepo e CI seletiva com Turborepo (#158)

BizCode é um **workspace pnpm** (`apps/web`, `apps/server`, `packages/types`, `packages/api-client`) orquestrado por **Turborepo** (`turbo.json`).

| Mecanismo | Propósito |
|---|---|
| `inputs` / `outputs` em `turbo.json` | Cache local de tarefas em `.turbo/` |
| `.github/actions/turbo-cache` | Cache no GitHub Actions com chave `pnpm-lock.yaml` |
| `pnpm exec turbo run lint` | ESLint por workspace (Quality Gate, deploy) |
| `turbo run type-check lint --filter=@bizcode/web...` | Validação frontend sem o workspace server |
| `turbo run type-check lint --filter=@bizcode/server...` | Validação backend (server + dependências dos packages) |
| Filtros `paths:` nos workflows | Pular jobs quando só mudam caminhos irrelevantes |
| `pnpm run type-check` na raiz | `tsc --noEmit` de todo o repositório (tests, scripts, e2e) — **inalterado** no Quality Gate |
| Vitest / Playwright | Na raiz; seletividade via `paths:` do workflow, não `turbo run test --filter` |

`deploy.yml` roda em `push`/`pull_request` apenas quando mudam caminhos de app, packages, Docker ou lockfile; gatilhos `workflow_dispatch` e `release` permanecem iguais.

**Limitação:** a regeneração do SBOM é omitida no CI (`scripts/docs-generate.mjs`); o `docs/evidence/sbom-cyclonedx.json` commitado não é verificado por drift no CI.

## Estágios

```
push / pull_request → job quality (ubuntu-latest):
  checkout → Node 22 → npm ci → pnpm audit HIGH+ (bloqueante) → prisma generate → prisma validate → prisma migrate deploy →
  type-check → docs:validate → docs:generate → verificação pós-processo TypeDoc → git diff (docs gerados / SBOM) → lint →
  contract tests (OpenAPI/Ajv) → test:coverage → check:i18n →
  playwright install chromium → test:e2e → test:integration → check:docs-map →
  artefato de cobertura
```

## Gatilhos

| Evento | Ramos |
|---|---|
| `push` | `main`, `develop` |
| `pull_request` | para `main` ou `develop` |

## Varredura de segredos (#216)

O workflow [`.github/workflows/gitleaks.yml`](../../../.github/workflows/gitleaks.yml) executa Gitleaks em push/PR para `main`/`develop` e falha se houver achados. Config: [`.gitleaks.toml`](../../../.gitleaks.toml). Ver [gestão de segredos / Doppler](gestao-segredos-e-doppler.md).

## Varredura de dependências e imagens (#219)

- **Dependabot:** [`.github/dependabot.yml`](../../../.github/dependabot.yml) (npm + GitHub Actions semanal, grupos patch).
- **pnpm audit:** bloqueante HIGH+ no Quality Gate ([ADR-0017](../adr/ADR-0017-varredura-dependencias.md)).
- **Snyk:** [`.github/workflows/snyk.yml`](../../../.github/workflows/snyk.yml) — requer `SNYK_TOKEN`.
- **Trivy imagens:** após build Docker em [`.github/workflows/deploy.yml`](../../../.github/workflows/deploy.yml), falha em CRITICAL antes do GHCR.
- Triagem: [varredura de dependências e triagem](varredura-dependencias-e-triagem.md).

## Bloqueios

| Etapa | Condição |
|---|---|
| prisma validate | `schema.prisma` inválido segundo Prisma (sem gravar PostgreSQL) |
| type-check | Erro TypeScript |
| docs:validate | Sintaxe OpenAPI 3.x (`npm run check:openapi`) e cobertura de rotas Express `/api/*` em `docs/api/openapi.yaml` (`npm run check:openapi-sync`) |
| docs:generate + git diff | Divergência entre arquivos commitados e documentação regenerada (`docs/generated/`, `docs/api/openapi-reference.generated.md`, `docs/evidence/sbom-cyclonedx.json`) |
| Pós-processo TypeDoc | Sem `target="_blank">TypeDoc</` em `docs/generated/typedoc/` (`docs:typedoc` + `scripts/patch-typedoc-html-noopener.mjs`) |
| lint | Erro ou **warning** ESLint (`--max-warnings 0`) |
| Contract tests API | Falha em `tests/api/contract.test.ts` (rotas/esquemas OpenAPI vs Ajv) |
| test:coverage | Falha de teste ou cobertura abaixo do limite |
| check:i18n | Chaves divergentes da fonte `es` |
| test:e2e | Falha Playwright (build + `vite preview`; ver [ADR-0004](../adr/ADR-0004-e2e-playwright-integration-roadmap.md)) |
| test:integration | Falha em `tests/integration/` (Prisma real no PostgreSQL) |
| check:docs-map | Caminho do mapa documental ausente no disco |

## Matriz de rastreabilidade (PR → `develop` / `main`)

| Superfície | Evidência / comportamento | Workflow(s) |
|---|---|---|
| TypeScript compilando | Projeto inteiro segundo `tsconfig` (`src`, `server`, `tests`, `e2e`, …) | `ci.yml` → `npm run type-check` |
| API × contrato | Sintaxe OpenAPI + sync de rotas + artefatos regenerados consistentes | `ci.yml` → `docs:validate`, `docs:generate`, git diff |
| Esquema de BD | `prisma generate`, `prisma validate`, migrations ou `db push`, seeds usados nos testes | `ci.yml`; `backend-validation.yml` (filtros de caminho) reforço de migrations |
| Cobertura de linhas/ramificações | Vitest v8 apenas em **`server/**/*.ts`**, `server.ts` e **`src/**/*.{ts,tsx}`**, com exclusões em `coverage.exclude` de `vitest.config.ts` (`server/main.ts`, `packages/types/src/server-inputs.ts`, `src/types.ts`); **nem todo arquivo** da raiz está instrumentado | `ci.yml`, `frontend-validation.yml`, `qa-validation.yml` → `test:coverage` |
| Integração PostgreSQL | `tests/integration/**`, **sem instrumentação de linhas** (`vitest.integration.config.ts`) | `ci.yml`, `backend-validation.yml` |
| Bundle web | `vite build` via **`webServer`** do Playwright | `ci.yml`, `frontend-validation.yml` → `test:e2e` |
| i18n | Paridade de namespaces vs. fonte `es` | `check:i18n` |
| Estrutura de docs humanos | Paths do mapa (`DOCUMENT_LOCALE_MAP.md`) | `check:docs-map` |
| Política de localização docs | Roots controlados trilingues (qualidade, ISO, specs, **manuais de usuário**, changelogs, ADR, OpenAPI) | `docs-governance.yml` (**PR para `main` e `develop`**) |
| Links externos em Markdown (`docs/**`) | Destinos HTTP(S) ativos (**Lychee**; loopback em `.lycheeignore`). Links relativos entre `.md` ficam fora deste job. | `docs-links.yml` |

## Serviços

**PostgreSQL 16** em container (`DATABASE_URL`). Após `prisma migrate deploy`, **`npm run test:integration`** roda HTTP + Prisma real em `tests/integration/`. O **contrato** API (`tests/api/`) continua **mockando** Prisma para OpenAPI ([ADR-0004](../adr/ADR-0004-e2e-playwright-integration-roadmap.md)).

## Artefatos

`coverage-report` — 14 dias — pasta `coverage/`.

## Fora do CI

Build desktop Tauri (WebKit nativo, display, Rust). Build local: `npm run tauri build`.

**Gate manual (desktop):** após **`main`** verde, executar **Actions → Tauri self-hosted** (`tauri-selfhosted.yml`) antes de distribuir instaladores; releases por tag podem usar **Actions → Tauri release** (`tauri-release.yml` em tags `v*.*.*`). Referência [ADR-0006](../adr/ADR-0006-release-and-tauri-ci-workflows.md).

## Branch órfão `documentacion`

O branch **órfão** `documentacion` **não** contém código da aplicação — apenas um snapshot de documentação para hospedagem estática (ex.: GitHub Pages).

| Item | Detalhe |
|---|---|
| Workflow | `.github/workflows/sync-documentacion.yml` |
| Quando executa | `push` em **`main`** que altere `docs/**`, `Certificación-ISO/**`, `README.md`, `AGENTS.md` ou `CONTRIBUTING.md` na raiz; ou **`workflow_dispatch`** (Actions → *Sync documentacion branch*) |
| Ref manual | Entrada opcional `source_ref` (padrão `main`) para copiar de outro branch ou SHA |
| Branches de código | Inalterado: trabalho em `develop` / `feature/*` / `fix/*`, merge em `main` conforme [CONTRIBUTING](../../../CONTRIBUTING.md); este job **não** envia código de app para `documentacion` |

## Deploy produtivo com Docker (issue #149)

### Topologia de contêineres

- `server` (`Dockerfile`): contêiner Node 22 executando `npm run server`, health check em `GET /api/health`.
- `frontend` (`Dockerfile.frontend`): build estático do Vite servido por Nginx, health check em `/`.
- `postgres`: PostgreSQL 16 com volume persistente.
- `docker-compose.prod.yml` orquestra os três serviços. O compose local existente (`docker-compose.postgres.yml`) permanece inalterado.
- Estado atual: **deploy-ready** (preparado para implantação), com ativação produtiva pendente de servidor real.

### Papel do Nginx

- O contêiner Nginx serve os arquivos estáticos do frontend.
- Também faz proxy de `/api/*` para o backend (`server:3001`) na rede interna do compose.
- É um reverse proxy interno da stack; o repositório não fixa domínio externo nem certificados de produção.

### Variáveis de ambiente obrigatórias para deploy

- Runtime (`.env` do host, nunca versionado): `DATABASE_URL`, `POSTGRES_PASSWORD`, `JWT_SECRET`/`SESSION_SECRET`, `APP_ENV`.
- Opcionais: `POSTGRES_DB`, `POSTGRES_USER`, `FRONTEND_PORT`, `VITE_API_URL`, `CORS_ORIGINS`, `LOG_LEVEL`, variáveis SMTP/Twilio.
- Chave fiscal opcional: `BIZCODE_FISCAL_ENCRYPTION_KEY`.

### Workflow GitHub Actions de deploy

Arquivo: `.github/workflows/deploy.yml`.

- `build_and_test` (validação sempre ativa em `push`/`pull_request`/manual):
  - `npm ci`
  - `npm run type-check`
  - `npm run lint`
  - `npm run test`
  - `npm run check:i18n`
  - `npm run check:docs-map`
  - `npm run docs:validate`
  - validação de build Docker backend/frontend
- `publish_images` (preparado para `main`, releases ou manual):
  - login no GHCR com `GHCR_TOKEN` quando existir; fallback para `GITHUB_TOKEN`
  - build/push de `ghcr.io/<owner>/bizcode-server` e `ghcr.io/<owner>/bizcode-frontend`
- `deploy` (implantação real condicionada):
  - executa apenas com `workflow_dispatch` e input `run_deploy: true` (após `publish_images`)
  - porta SSH via input `deploy_ssh_port` (padrão `22`); adicionar Environment `production` com revisores quando houver servidor
  - SSH no host e execução de `docker compose -f docker-compose.prod.yml pull && up -d`
  - sem secrets ou sem servidor, branches `feature`/`develop` continuam passando em validação e build.

### Secrets obrigatórios do repositório para deploy SSH

- `DEPLOY_HOST`
- `DEPLOY_USER`
- `DEPLOY_SSH_KEY`
- `DEPLOY_PATH`
- Input de workflow `deploy_ssh_port` (opcional; padrão `22`, não é secret)
- `DATABASE_URL`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`
- `APP_ENV`
- `VITE_API_URL`
- `CORS_ORIGINS`
- `SESSION_SECRET`
- `GHCR_TOKEN` (opcional quando `GITHUB_TOKEN` não for suficiente)

### Checklist de ativação futura

1. Definir servidor de produção (host/domínio/rede) fora do repositório.
2. Configurar os secrets no GitHub (sem valores em git).
3. Proteger `environment: production` com aprovação manual.
4. Executar `workflow_dispatch` ou publicar release/tag.
5. Validar health checks (`/api/health` e `/`).

### Rollback básico

- Manter tags anteriores no GHCR (referências por `sha` e por tag são publicadas).
- No host, voltar para versão anterior fixando tags antigas em `docker-compose.prod.yml` (ou override local) e executando novamente:
  - `docker compose -f docker-compose.prod.yml pull`
  - `docker compose -f docker-compose.prod.yml up -d`

## Automação opcional

- [x] Sincronização do branch órfão `documentacion` a partir de `main` — `.github/workflows/sync-documentacion.yml` (ver *Branch órfão documentacion* acima)
- [x] `pnpm audit --audit-level=high` após install (**bloqueante** HIGH+; #219 / ADR-0017)
- [x] Testes de integração com PostgreSQL (fase B, ADR-0004) — `tests/integration/`, `npm run test:integration`
- [x] Build Tauri em runner self-hosted — `.github/workflows/tauri-selfhosted.yml` (`workflow_dispatch`) — [ADR-0006](../adr/ADR-0006-release-and-tauri-ci-workflows.md)
- [x] semantic-release — `release.config.cjs`, `.github/workflows/release.yml` — [ADR-0006](../adr/ADR-0006-release-and-tauri-ci-workflows.md)
- [x] Links HTTP(S) em `docs/` — `docs-links.yml` + `.lycheeignore` (Lychee; sem checagem de links relativos `.md`)

## Automação de status do Project (GitHub)

Comportamento validado para o board `BizCode Delivery`:

- Abrir PR com `Closes #<issue>` -> `In Progress`.
- Fechar PR sem merge -> `Backlog`.
- Merge de PR -> `Done`.

Implementação:

- Workflow: `.github/workflows/project-status-automation.yml`
- Variáveis obrigatórias no repositório:
  - `PROJECT_V2_ID`
  - `PROJECT_STATUS_FIELD_ID`
  - `PROJECT_STATUS_OPTION_BACKLOG`
  - `PROJECT_STATUS_OPTION_IN_PROGRESS`
  - `PROJECT_STATUS_OPTION_DONE`
  - `PROJECT_STATUS_OPTION_BLOCKED` (opcional)
- Variável opcional no repositório:
  - `PROJECT_PR_ASSOCIATED_FIELD_ID`: id GraphQL do campo de texto **PR asociado** do Project. Quando definida, o workflow grava a URL do PR ao atualizar o status de cada issue vinculada.
- Segredo recomendado para Projects V2 de usuário:
  - `PROJECT_AUTOMATION_TOKEN` (`repo`, `project`, `read:project`)

## Plano Cursor → Issues do GitHub + Project (ferramenta local)

- **Validação em CI (sem token):** `.github/workflows/plan-md-validate.yml` roda `npm run plan:validate` em PR e em push para `main` / `develop`. Por padrão valida só `tests/plan-sync/fixtures/valid-*.plan.md` (contrato + rótulos). Localmente, `npm run plan:validate -- --with-cursor-plans` também verifica `.cursor/plans/*.plan.md` se a pasta existir.
- **Sincronização local:** `npm run plan:sync -- --plan <caminho.plan.md> [--repo dono/repo] [--repo-root <dir>] [--dry-run]` faz upsert de um issue por todo do plano, vincula ao Project v2, define o status do quadro conforme o todo e persiste o mapeamento em `.github/plan-sync/state/`. Fora de `--dry-run` são necessários `GH_TOKEN` ou `GITHUB_TOKEN`, `GITHUB_REPOSITORY` (ou `GITHUB_OWNER` + `GITHUB_REPO`, ou `--repo`) e as mesmas variáveis de Project indicadas acima. Relatórios em `.github/plan-sync/reports/` (ignorados pelo git).
- **Fluxo opcional de aprovação:** `npm run plan:approve -- --plan <caminho>` arquiva uma cópia em `.cursor/plans/` e executa `plan:sync` (ver `scripts/github/plan-approve-main.ts`).
- **Interação com a automação por PR:** Com itens no quadro, `.github/workflows/project-status-automation.yml` continua atualizando o status na abertura/fechamento/merge do PR quando o issue está ligado com `Closes #<issue>`.
- **Higiene do quadro:** mantenha **Backlog** para trabalho que não está em andamento (sem PR aberto). Use **Ready** quando comprometido mas ainda sem PR; **In Progress** quando há PR aberto vinculado. Evite **In Progress** sem PR.

**Pós-merge (mantenedor):** após merge do PR vinculado com `Closes #…`, verificar os issues encerrados no GitHub e confirmar que o projeto **BizCode Delivery** atualiza para **Done** quando aplicável (workflow `.github/workflows/project-status-automation.yml` com variáveis do repositório descritas acima).

Checklist diário de uso:

1. Criar issue usando o template `Task`.
2. Adicionar issue ao Project.
3. Abrir PR com `Closes #<issue>`.
4. Verificar checks (`Quality Gate`, `Docs governance`, links Markdown em `docs/`, segurança/CodeQL conforme configurado).
5. Fazer merge somente com CI em verde.

## Jobs operacionais agendados (cron no host)

Não fazem parte do pipeline padrão do GitHub Actions; agende no servidor de implantação (ou orquestrador) com acesso ao banco do tenant.

| Agendamento | Comando | Finalidade |
|---|---|---|
| `*/5 * * * *` | `npm run arca:retry-pending-job` | Reprocessa faturas com `estadoCae: pending` via mock WSFE de homologação (`ArcaService.retryPending`) para cada tenant com `TenantFiscalConfig`. |
| `0 */2 * * *` | `npm run shipping:tracking-refresh` | Atualiza rastreio de envios em trânsito (`ShippingTrackingService`) para tenants com `ShippingCarrierConfig` ativo; notifica managers ao passar a entregue (#193). |
| `0 */5 * * *` | `npm run meli:token-refresh` | Renova access tokens OAuth do Mercado Livre (~6 h de validade) para tenants com `MeliConfig` ativo próximo do vencimento (#183). |
| `*/5 * * * *` | `npm run meli:catalog-sync` | Retenta anúncios de catálogo Mercado Livre (`MeliPublicacion`) em pending/error após mudanças de artigo (#184). |
| `0 * * * *` (horário) | `npm run meli:stock-reconcile` | Compara `available_quantity` do ML vs `Articulo.stock` no BizCode para anúncios vinculados; empurra a qty do BizCode ao ML se diferirem (sem duplicar `StockAjuste`) (#185). |
| `0 * * * *` (a cada hora) | `npm run cobranzas:recordatorios` | Lembretes de inadimplência para cada tenant com `ParamEmpresa`; envio às **08:00 horário local** (minuto &lt; 15) dentro do horário comercial configurado. Use `0 8 * * *` apenas em implantações mono-fuso. |
| `0 * * * *` (a cada hora) | `npm run mercadopago:reconciliacion` | Reconciliação de pagamentos Mercado Pago para cada tenant com `MercadoPagoConfig` ativo; execução às **02:00 horário local** (minuto &lt; 15). Use `0 2 * * *` apenas em implantações mono-fuso. |
| `0 2 * * *` (UTC) | `npm run backup:postgres` e depois `npm run backup:postgres:prune` | Backup PostgreSQL cifrado em `BIZCODE_BACKUP_DIR` (+ S3 CLI opcional). Exige `BACKUP_ENCRYPTION_KEY`. Ver [backup-e-restauracao.md](backup-e-restauracao.md). |

Variável opcional para um único tenant em dev/staging: `BIZCODE_TENANT_ID=<id>` (vale para `arca:retry-pending-job`, `arca:retry-pending`, `cobranzas:recordatorios`, `mercadopago:reconciliacion`, `shipping:tracking-refresh`, `meli:token-refresh`, `meli:catalog-sync` e `meli:stock-reconcile`). Opcional `BIZCODE_RECORDATORIO_CANAL` (padrão `email`).

Governança documental (Wiki vs documentação controlada):

- Notas operacionais rápidas podem ficar no Wiki.
- Documentação auditável/controlada deve permanecer no repositório.
- Referência: [política Wiki vs documentação controlada](politica-wiki-vs-documentacao-controlada.md).

**Outros idiomas:** [English](../../en/quality/ci-cd.md) · [Español](../../es/quality/ciclo-ci-cd.md)

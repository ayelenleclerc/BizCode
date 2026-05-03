# Pipeline CI/CD

## Visão geral

BizCode usa GitHub Actions. Definição: `.github/workflows/ci.yml`.

## Estágios

```
push / pull_request → job quality (ubuntu-latest):
  checkout → Node 22 → npm ci → npm audit (informativo) → prisma generate → prisma migrate deploy →
  type-check → check:openapi → docs:generate → git diff (docs gerados / SBOM) → lint → test:coverage → check:i18n →
  playwright install chromium → test:e2e → test:integration → check:docs-map →
  artefato de cobertura
```

## Gatilhos

| Evento | Ramos |
|---|---|
| `push` | `main`, `develop` |
| `pull_request` | para `main` ou `develop` |

## Bloqueios

| Etapa | Condição |
|---|---|
| type-check | Erro TypeScript |
| check:openapi | Falha na validação OpenAPI 3.x de `docs/api/openapi.yaml` (`npm run check:openapi`) |
| docs:generate + git diff | Divergência entre arquivos commitados e documentação regenerada (`docs/generated/`, `docs/api/openapi-reference.generated.md`, `docs/evidence/sbom-cyclonedx.json`) |
| lint | Erro ou **warning** ESLint (`--max-warnings 0`) |
| test:coverage | Falha de teste ou cobertura abaixo do limite |
| check:i18n | Chaves divergentes da fonte `es` |
| test:e2e | Falha Playwright (build + `vite preview`; ver [ADR-0004](../adr/ADR-0004-e2e-playwright-integration-roadmap.md)) |
| test:integration | Falha em `tests/integration/` (Prisma real no PostgreSQL) |
| check:docs-map | Caminho do mapa documental ausente no disco |

## Serviços

**PostgreSQL 16** em container (`DATABASE_URL`). Após `prisma migrate deploy`, **`npm run test:integration`** roda HTTP + Prisma real em `tests/integration/`. O **contrato** API (`tests/api/`) continua **mockando** Prisma para OpenAPI ([ADR-0004](../adr/ADR-0004-e2e-playwright-integration-roadmap.md)).

## Artefatos

`coverage-report` — 14 dias — pasta `coverage/`.

## Fora do CI

Build desktop Tauri (WebKit nativo, display, Rust). Build local: `npm run tauri build`.

## Branch órfão `documentacion`

O branch **órfão** `documentacion` **não** contém código da aplicação — apenas um snapshot de documentação para hospedagem estática (ex.: GitHub Pages).

| Item | Detalhe |
|---|---|
| Workflow | `.github/workflows/sync-documentacion.yml` |
| Quando executa | `push` em **`main`** que altere `docs/**`, `Certificación-ISO/**`, `README.md`, `AGENTS.md` ou `CONTRIBUTING.md` na raiz; ou **`workflow_dispatch`** (Actions → *Sync documentacion branch*) |
| Ref manual | Entrada opcional `source_ref` (padrão `main`) para copiar de outro branch ou SHA |
| Branches de código | Inalterado: trabalho em `develop` / `feature/*` / `fix/*`, merge em `main` conforme [CONTRIBUTING](../../../CONTRIBUTING.md); este job **não** envia código de app para `documentacion` |

## Automação opcional

- [x] Sincronização do branch órfão `documentacion` a partir de `main` — `.github/workflows/sync-documentacion.yml` (ver *Branch órfão documentacion* acima)
- [x] `npm audit --audit-level=high` após `npm ci` com `continue-on-error: true` — [ADR-0006](../adr/ADR-0006-release-and-tauri-ci-workflows.md)
- [x] Testes de integração com PostgreSQL (fase B, ADR-0004) — `tests/integration/`, `npm run test:integration`
- [x] Build Tauri em runner self-hosted — `.github/workflows/tauri-selfhosted.yml` (`workflow_dispatch`) — [ADR-0006](../adr/ADR-0006-release-and-tauri-ci-workflows.md)
- [x] semantic-release — `release.config.cjs`, `.github/workflows/release.yml` — [ADR-0006](../adr/ADR-0006-release-and-tauri-ci-workflows.md)

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
4. Verificar checks obrigatórios (`Quality Gate`, `Docs governance`, segurança).
5. Fazer merge somente com CI em verde.

Governança documental (Wiki vs documentação controlada):

- Notas operacionais rápidas podem ficar no Wiki.
- Documentação auditável/controlada deve permanecer no repositório.
- Referência: [política Wiki vs documentação controlada](politica-wiki-vs-documentacao-controlada.md).

**Outros idiomas:** [English](../../en/quality/ci-cd.md) · [Español](../../es/quality/ciclo-ci-cd.md)

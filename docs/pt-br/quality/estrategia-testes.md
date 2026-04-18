# Estratégia de testes

**Normas:** ISO/IEC 29119-2 (planejamento), ISO/IEC 29119-4 (técnicas)

---

## Pirâmide de testes

```
          ┌──────────────────────────────┐
          │   E2E (smoke Playwright)     │   CI: Chromium, vite preview (ver ADR-0004)
          ├──────────────────────────────┤
          │   E2E (manual / Tauri)       │   Desktop fora do harness Playwright
          ├──────────────────────────────┤
          │   Integração (PostgreSQL)  │   tests/integration/ — Prisma real, supertest (ADR-0004 fase B)
          ├──────────────────────────────┤
          │   Unitários + a11y           │   CI: 100% linhas/funções/ramos em src/lib/** e server/createApp.ts
          │   (Vitest+axe)               │       Smoke axe em App (src/App.a11y.test.tsx)
          ├──────────────────────────────┤
          │   Contrato API               │   tests/api/contract.test.ts (supertest + Ajv vs openapi.yaml)
          └──────────────────────────────┘
```

## Política de cobertura

| Escopo | Linhas | Funções | Ramos | Sentenças |
|---|---|---|---|---|
| **`src/lib/**/*.ts`** (exceto `*.test.ts`) | **100%** | **100%** | **100%** | **100%** |
| **`server/createApp.ts`** | **100%** | **100%** | **100%** | **100%** |
| **`server.ts`** (bootstrap: `createServerInstance`, `bindHttpServer`, `startServer`; entrada `server/main.ts`) | **100%** | **100%** | **100%** | **100%** |

Exclusões adicionais só com **ADR** e alteração explícita em `vitest.config.ts` — ver [ADR-0003](../adr/ADR-0003-api-contract-testing.md), [ADR-0004](../adr/ADR-0004-e2e-playwright-integration-roadmap.md) e [ADR-0005](../adr/ADR-0005-vitest-coverage-server-bootstrap.md).

Os limiares são aplicados pelo Vitest (`coverage.thresholds`). O CI falha se não forem atingidos.

## Metas de cobertura (KPI)

| KPI | Meta | Onde é aplicado |
|-----|------|-----------------|
| Linhas / funções / ramos / sentenças no escopo (`src/lib/**/*.ts`, `server/createApp.ts`, `server.ts`) | **100%** cada (política) | Documentado aqui e em ADR-0003/4/5; o **piso** atual está em `vitest.config.ts` → `coverage.thresholds` |
| Contrato API vs OpenAPI | Rotas em `tests/api/contract.test.ts` passam | `npm run test` |
| E2E (Playwright) | Smoke + caminhos críticos em `e2e/` no Chromium | `npm run test:e2e` |
| Integração (PostgreSQL) | `tests/integration/**` | `npm run test:integration` |
| Acessibilidade | Smoke `jest-axe` + `@axe-core/playwright` + ESLint `jsx-a11y` | `npm run test:a11y`, specs Playwright, `npm run lint` |

## Onde cada suite roda (local vs CI)

| Suite | Comando local | Workflow CI (evidência) |
|-------|---------------|-------------------------|
| Type-check | `npm run type-check` | `.github/workflows/ci.yml` |
| Lint (incl. jsx-a11y) | `npm run lint` | `ci.yml`, `frontend-validation.yml` |
| Unitários + cobertura | `npm run test`, `npm run test:coverage` | `ci.yml`, `qa-validation.yml` (`unit_tests`) |
| Contrato API | parte de `npm run test` | `ci.yml` |
| Integração | `npm run test:integration` (precisa `DATABASE_URL`) | `ci.yml`, `qa-validation.yml` |
| E2E Playwright | `npm run test:e2e` | `ci.yml`, `qa-validation.yml` |
| A11y unitário | `npm run test:a11y` | `qa-validation.yml` (`accessibility_tests`) |
| Flakes (opcional) | `npm run test:e2e:repeat` | Resumo no job QA |
| Carga smoke (opcional) | `npm run perf:smoke` (CLI [k6](https://k6.io/docs/get-started/installation/)) | Fora do CI padrão |

**Regressão visual (Playwright):** usar `expect(page).toHaveScreenshot()` num spec dedicado; versionar baselines numa única plataforma (ex.: Chromium Linux no CI) com `snapshotPathTemplate` em `playwright.config.ts`. Ainda não há baselines no repositório; adicionar num PR quando houver captura estável em Linux.

**Paridade de ambientes e checklist manual:** [paridade-ambientes-testes.md](paridade-ambientes-testes.md) · [lista-verificacao-qa-manual.md](lista-verificacao-qa-manual.md)

## Ferramentas

| Ferramenta | Versão | Uso |
|---|---|---|
| Vitest | 4.x | Runner, `expect`, mocks `vi` |
| @vitest/coverage-v8 | 4.x | Instrumentação V8 |
| @testing-library/react | latest | Render em jsdom |
| @testing-library/jest-dom | latest | Matchers DOM |
| jest-axe | latest | Smoke de acessibilidade (axe-core) |
| supertest | latest | HTTP ao Express no contrato API |
| @apidevtools/swagger-parser | latest | Dereferência OpenAPI |
| yaml | latest | Parse local de `docs/api/openapi.yaml` |
| ajv + ajv-formats | latest | Validação JSON Schema |
| jsdom | latest | Simulação DOM |
| @playwright/test | 1.x | Smoke E2E contra vite preview (`e2e/`) — ADR-0004 |

## Onde ficam os testes

```
src/lib/*.test.ts
src/test/setup.ts
App.a11y.test.tsx
tests/api/contract.test.ts, validate-openapi-response.ts
tests/server/server.test.ts  ← bootstrap `server.ts` (mock Prisma; ADR-0005)
e2e/smoke.spec.ts
tests/integration/api.integration.test.ts  ← HTTP + Prisma real (`npm run test:integration`; excluído do Vitest padrão)
tests/integration/dbf-migration.integration.test.ts  ← gera fixtures DBF mínimos em runtime e valida `scripts/migrate-from-dbf.ts` no PostgreSQL
```

O Vitest **exclui** `e2e/**` (`vitest.config.ts`) para que apenas o Playwright execute esses arquivos. **`tests/integration/**`** fica fora do `npm run test:coverage` (não exige `DATABASE_URL`); integração usa `vitest.integration.config.ts`.

## Mocks

- **Axios:** `vi.mock('axios')` com `vi.hoisted()`.
- **Prisma:** mockado nos testes de contrato; em **`tests/integration/`** usa-se `PrismaClient` real com PostgreSQL ([ADR-0004](../adr/ADR-0004-e2e-playwright-integration-roadmap.md) fase B), complementando o contrato.
- **Explorador interativo (Swagger UI):** servido em `/api-docs` com a API em execução (`npm run server`). Referência e política: [plano-swagger-openapi-ui.md](plano-swagger-openapi-ui.md) (equivalentes EN/ES no [DOCUMENT_LOCALE_MAP.md](../../DOCUMENT_LOCALE_MAP.md)). Não substitui o contrato nem `docs/api/openapi.yaml`.

## Critérios de entrada e saída

**Entrada:** `tsc` e ESLint sem erros.

**Saída:** testes unitários/API passam; smoke E2E (`npm run test:e2e`) passa; integração (`npm run test:integration`, com migrações no CI) passa; cobertura OK; artefato publicado.

## Regressões

Bug → teste que reproduz → falha → correção → teste passa.

**Outros idiomas:** [English](../../en/quality/testing-strategy.md) · [Español](../../es/quality/estrategia-pruebas.md)

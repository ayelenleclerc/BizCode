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

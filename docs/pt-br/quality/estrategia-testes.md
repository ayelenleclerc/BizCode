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
          │   Integração (futuro)        │   CI: serviço PostgreSQL disponível; testes ainda não adicionados (ADR-0004)
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

Exclusões adicionais só com **ADR** e alteração explícita em `vitest.config.ts` — ver [ADR-0003](../adr/ADR-0003-api-contract-testing.md) e [ADR-0004](../adr/ADR-0004-e2e-playwright-integration-roadmap.md).

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
e2e/smoke.spec.ts
```

O Vitest **exclui** `e2e/**` (`vitest.config.ts`) para que apenas o Playwright execute esses arquivos.

## Mocks

- **Axios:** `vi.mock('axios')` com `vi.hoisted()`.
- **Prisma:** mockado nos testes de contrato; **integração** com PostgreSQL real é fase B em [ADR-0004](../adr/ADR-0004-e2e-playwright-integration-roadmap.md).

## Critérios de entrada e saída

**Entrada:** `tsc` e ESLint sem erros.

**Saída:** testes unitários/API passam; smoke E2E (`npm run test:e2e`) passa; cobertura OK; artefato publicado.

## Regressões

Bug → teste que reproduz → falha → correção → teste passa.

**Outros idiomas:** [English](../../en/quality/testing-strategy.md) · [Español](../../es/quality/estrategia-pruebas.md)

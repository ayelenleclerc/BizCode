# Estratégia de testes

**Normas:** ISO/IEC 29119-2, ISO/IEC 29119-4

---

## Pirâmide

- E2E manual (smoke por release)
- Integração (futuro; PostgreSQL no CI)
- Unitários + a11y: **100%** em `src/lib/**/*.ts` e `server/createApp.ts` (Vitest, jest-axe em `App.a11y.test.tsx`)
- Contrato API: `tests/api/contract.test.ts` (supertest + Ajv + `docs/api/openapi.yaml`)

## Cobertura

| Escopo | Linhas | Funções | Ramos | Sentenças |
|---|---|---|---|---|
| `src/lib/**/*.ts` (sem `*.test.ts`) | 100% | 100% | 100% | 100% |
| `server/createApp.ts` | 100% | 100% | 100% | 100% |

Exclusões apenas com ADR ou aprovação; ver [ADR-0003](../adr/ADR-0003-api-contract-testing.md).

## Ferramentas

Vitest 4, @vitest/coverage-v8, Testing Library, jest-axe, supertest, swagger-parser, yaml, ajv, jsdom.

## Mocks

Axios mockado; Prisma mockado nos testes de contrato; APIs de browser conforme necessário.

## Critérios

Entrada: `tsc` e ESLint limpos. Saída: todos os testes passam; cobertura OK; artefato publicado.

**Outros idiomas:** [English](../../en/quality/testing-strategy.md) · [Español](../../es/quality/estrategia-pruebas.md)

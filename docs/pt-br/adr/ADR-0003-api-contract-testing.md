# ADR-0003: Testes de contrato HTTP com OpenAPI

**Status:** Aceita  
**Data:** 2026-03-31

## Contexto

O plano de qualidade exige testes de contrato alinhados ao OpenAPI com CI bloqueante.

## Decisão

1. Lógica HTTP em `server/createApp.ts` com `createApp(prisma)` para injetar Prisma mockado.
2. `tests/api/contract.test.ts` com **supertest** + **Ajv** + spec em `docs/api/openapi.yaml`.
3. OpenAPI como fonte da forma do JSON (`success`/`data`, erros 500).

## Consequências

Divergências spec ↔ código aparecem no CI; manter o YAML quando as rotas mudarem.

**Outros idiomas:** [English](../../en/adr/ADR-0003-api-contract-testing.md) · [Español](../../es/adr/ADR-0003-api-contract-testing.md)

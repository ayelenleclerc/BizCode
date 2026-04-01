# ADR-0005: Escopo de cobertura Vitest — bootstrap `server.ts`

**Status:** Aceita  
**Data:** 2026-03-31  
**Referência ISO:** ISO/IEC 29119-2, ISO/IEC 12207:2017 §6.4.9

---

## Contexto

[ADR-0003](ADR-0003-api-contract-testing.md) e [ADR-0004](ADR-0004-e2e-playwright-integration-roadmap.md) exigem **ADR explícito e alteração em `vitest.config.ts`** antes de ampliar `coverage.include` além de `src/lib/**` e `server/createApp.ts`. A lógica HTTP fica em `createApp`; o bootstrap (listen, SIGINT) estava em `server.ts` sem cobertura.

## Decisão

1. **Refatorar** `server.ts` exportando `createServerInstance`, `bindHttpServer` e `startServer` (sem efeitos colaterais no import). O **entrypoint** de `npm run server` é `server/main.ts`, que chama `startServer()` apenas ao rodar `tsx server/main.ts`.
2. **Cobertura:** `vitest.config.ts` inclui **`server.ts`** em `coverage.include` com os **mesmos limiares 100%**. `server/main.ts` fica **excluída** da cobertura (apenas delegação).
3. **Testes:** `tests/server/server.test.ts` cobre o bootstrap; `PrismaClient` é **mockado** nesse arquivo para não exigir banco em `test:coverage`.

## Consequências

- **Positivo:** bootstrap e encerramento em SIGINT têm regressão automática; importar `server` em testes não abre porta.
- **Negativo:** é preciso rodar `npm run server` via `server/main.ts`; scripts e documentação atualizados.

## Referências

- [estrategia-testes.md](../quality/estrategia-testes.md)
- `server.ts`, `server/main.ts`, `tests/server/server.test.ts`
- `vitest.config.ts`

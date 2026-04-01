# ADR-0005: Alcance de cobertura Vitest — arranque `server.ts`

**Estado:** Aceptada  
**Fecha:** 2026-03-31  
**Referencia ISO:** ISO/IEC 29119-2, ISO/IEC 12207:2017 §6.4.9

---

## Contexto

[ADR-0003](ADR-0003-api-contract-testing.md) y [ADR-0004](ADR-0004-e2e-playwright-integration-roadmap.md) exigen **ADR explícito y cambio en `vitest.config.ts`** antes de ampliar `coverage.include` más allá de `src/lib/**` y `server/createApp.ts`. La lógica HTTP está en `createApp`; el arranque (listen, SIGINT) estaba en `server.ts` sin cobertura.

## Decisión

1. **Refactor** de `server.ts` exportando `createServerInstance`, `bindHttpServer` y `startServer` (sin efectos secundarios al importar). El **punto de entrada** de `npm run server` es `server/main.ts`, que solo llama a `startServer()` al ejecutar `tsx server/main.ts`.
2. **Cobertura:** en `vitest.config.ts`, `coverage.include` incluye **`server.ts`** con los **mismos umbrales 100%** que el resto del alcance. `server/main.ts` queda **excluida** de cobertura (solo delegación).
3. **Pruebas:** `tests/server/server.test.ts` cubre el arranque; se **mockea** `PrismaClient` en ese archivo para no exigir base de datos en `test:coverage`.

## Consecuencias

- **Positivo:** el arranque y el cierre ante SIGINT tienen regresión automática; importar `server` en tests no abre puerto.
- **Negativo:** hay que ejecutar `npm run server` vía `server/main.ts`; scripts y documentación actualizados.

## Referencias

- [estrategia-pruebas.md](../quality/estrategia-pruebas.md)
- `server.ts`, `server/main.ts`, `tests/server/server.test.ts`
- `vitest.config.ts`

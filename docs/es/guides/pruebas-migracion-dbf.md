# Pruebas de migración DBF

Esta guía documenta el harness para validar `scripts/migrate-from-dbf.ts` sin exigir en cada máquina una copia productiva del árbol legacy.

## Estado ETL CLIENTES (#51)

Implementado en PR #120 (issue GitHub #51):

- Mapeo puro: [`src/lib/migration/legacyClienteDbf.ts`](../../../src/lib/migration/legacyClienteDbf.ts).
- Orquestación: [`scripts/migrate-from-dbf.ts`](../../../scripts/migrate-from-dbf.ts) (`npm run migrate:dbf`).
- Contrato: `clienteBodySchema` (mismo que REST e importación CSV).
- Si `CLIENTES.DBF` existe bajo `PROGRAMA_VIEJO_ROOT/…/sistema/` con `recordCount > 0`, se importan filas reales; si no, el script mantiene **10 placeholders** `91001`–`91010`. Ver [`scripts/MIGRACION_PROGRAMA_VIEJO.md`](../../../scripts/MIGRACION_PROGRAMA_VIEJO.md).
- En producción hace falta una copia legacy acordada en disco; la carga masiva en instalaciones nuevas usa importación CSV en la app (issue #58), que no sustituye la migración DBF bajo demanda.

## Fixtures

- `tests/dbf/migration-dbf.test.ts` — filas tipo CLIENTES (válidas, inválidas, borde) mapeadas a `clienteBodySchema`.
- `tests/helpers/migration-harness.ts` — árbol DBF temporal, tenant de prueba, truncado de tablas y envoltorio de `runDbfMigration`.

## Integración

- `tests/integration/dbf-migration.integration.test.ts` — PostgreSQL + fixtures DBF generados; dos recorridos:
  - **Sin `CLIENTES.DBF`:** fixtures PVAR/PVAR2/LIST_CLI; verifica clientes placeholder (`91001`–`91010`) y artículos importados.
  - **Con `CLIENTES.DBF`:** árbol con filas `COND` válidas e inválidas; verifica importación real y **ausencia** de placeholders.
- Requiere `DATABASE_URL` (`npm run test:integration`).

## Documentación relacionada

- [`scripts/MIGRACION_PROGRAMA_VIEJO.md`](../../../scripts/MIGRACION_PROGRAMA_VIEJO.md)
- [`docs/referencias/05-mapeo-tablas-legacy-a-bizcode.md`](../../referencias/05-mapeo-tablas-legacy-a-bizcode.md)

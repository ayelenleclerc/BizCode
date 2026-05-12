# Pruebas de migración DBF

Esta guía documenta el harness para validar `scripts/migrate-from-dbf.ts` sin una fuente productiva `CLIENTES.DBF`.

## Fixtures

- `tests/dbf/migration-dbf.test.ts` — filas tipo CLIENTES (válidas, inválidas, borde) mapeadas a `clienteBodySchema`.
- `tests/helpers/migration-harness.ts` — árbol DBF temporal, tenant de prueba, truncado de tablas y envoltorio de `runDbfMigration`.

## Integración

- `tests/integration/dbf-migration.integration.test.ts` — PostgreSQL + fixtures PVAR/PVAR2/LIST_CLI generados; verifica clientes placeholder y artículos importados.
- Requiere `DATABASE_URL` (`npm run test:integration`).

## Documentación relacionada

- `scripts/MIGRACION_PROGRAMA_VIEJO.md`
- El issue #51 sigue bloqueado para ETL productivo de CLIENTES hasta acordar una fuente DBF verificada.

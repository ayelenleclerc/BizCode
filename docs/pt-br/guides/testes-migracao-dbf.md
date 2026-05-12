# Testes de migração DBF

Este guia documenta o harness para validar `scripts/migrate-from-dbf.ts` sem uma fonte produtiva `CLIENTES.DBF`.

## Fixtures

- `tests/dbf/migration-dbf.test.ts` — linhas no formato CLIENTES (válidas, inválidas, borda) mapeadas para `clienteBodySchema`.
- `tests/helpers/migration-harness.ts` — árvore DBF temporária, tenant de teste, truncamento de tabelas e wrapper de `runDbfMigration`.

## Integração

- `tests/integration/dbf-migration.integration.test.ts` — PostgreSQL + fixtures PVAR/PVAR2/LIST_CLI gerados; verifica clientes placeholder e artigos importados.
- Requer `DATABASE_URL` (`npm run test:integration`).

## Documentação relacionada

- `scripts/MIGRACION_PROGRAMA_VIEJO.md`
- O issue #51 permanece bloqueado para ETL produtivo de CLIENTES até haver fonte DBF verificada.

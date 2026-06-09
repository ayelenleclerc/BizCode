# Testes de migração DBF

Este guia documenta o harness para validar `scripts/migrate-from-dbf.ts` sem exigir em cada máquina uma cópia produtiva da árvore legacy.

## Status ETL CLIENTES (#51)

Implementado no PR #120 (issue GitHub #51):

- Mapeamento puro: [`src/lib/migration/legacyClienteDbf.ts`](../../../src/lib/migration/legacyClienteDbf.ts).
- Orquestração: [`scripts/migrate-from-dbf.ts`](../../../scripts/migrate-from-dbf.ts) (`npm run migrate:dbf`).
- Contrato: `clienteBodySchema` (mesmo que REST e importação CSV).
- Quando `CLIENTES.DBF` existe em `PROGRAMA_VIEJO_ROOT/…/sistema/` com `recordCount > 0`, linhas reais são importadas; caso contrário, o script mantém **10 placeholders** `91001`–`91010`. Ver [`scripts/MIGRACION_PROGRAMA_VIEJO.md`](../../../scripts/MIGRACION_PROGRAMA_VIEJO.md).
- Em produção é necessária uma cópia legacy acordada em disco; carga em massa em instalações novas usa importação CSV no app (issue #58), que não substitui a migração DBF sob demanda.

## Fixtures

- `tests/dbf/migration-dbf.test.ts` — linhas no formato CLIENTES (válidas, inválidas, borda) mapeadas para `clienteBodySchema`.
- `tests/helpers/migration-harness.ts` — árvore DBF temporária, tenant de teste, truncamento de tabelas e wrapper de `runDbfMigration`.

## Integração

- `tests/integration/dbf-migration.integration.test.ts` — PostgreSQL + fixtures DBF gerados; dois fluxos:
  - **Sem `CLIENTES.DBF`:** fixtures PVAR/PVAR2/LIST_CLI; verifica clientes placeholder (`91001`–`91010`) e artigos importados.
  - **Com `CLIENTES.DBF`:** árvore com linhas `COND` válidas e inválidas; verifica importação real e **ausência** de placeholders.
- Requer `DATABASE_URL` (`npm run test:integration`).

## Documentação relacionada

- [`scripts/MIGRACION_PROGRAMA_VIEJO.md`](../../../scripts/MIGRACION_PROGRAMA_VIEJO.md)
- [`docs/referencias/05-mapeo-tablas-legacy-a-bizcode.md`](../../referencias/05-mapeo-tablas-legacy-a-bizcode.md)

# DBF migration testing

This guide documents the harness used to validate `scripts/migrate-from-dbf.ts` without requiring a production legacy tree on every machine.

## CLIENTES ETL status (#51)

Implemented in PR #120 (GitHub issue #51):

- Pure mapping: [`src/lib/migration/legacyClienteDbf.ts`](../../../src/lib/migration/legacyClienteDbf.ts).
- Orchestration: [`scripts/migrate-from-dbf.ts`](../../../scripts/migrate-from-dbf.ts) (`npm run migrate:dbf`).
- Contract: `clienteBodySchema` (same as REST and CSV import).
- When `CLIENTES.DBF` exists under `PROGRAMA_VIEJO_ROOT/…/sistema/` with `recordCount > 0`, real rows are imported; otherwise the script keeps **10 placeholders** `91001`–`91010`. See [`scripts/MIGRACION_PROGRAMA_VIEJO.md`](../../../scripts/MIGRACION_PROGRAMA_VIEJO.md).
- Production runs need an agreed legacy copy on disk; bulk load for new installs in the app uses CSV import (issue #58), which does not replace on-demand DBF migration.

## Fixtures

- `tests/dbf/migration-dbf.test.ts` — CLIENTES-shaped rows (valid, invalid, edge) mapped to `clienteBodySchema`.
- `tests/helpers/migration-harness.ts` — temporary DBF tree, tenant bootstrap, table truncation, and `runDbfMigration` wrapper.

## Integration

- `tests/integration/dbf-migration.integration.test.ts` — PostgreSQL + generated DBF fixtures; two paths:
  - **Without `CLIENTES.DBF`:** PVAR/PVAR2/LIST_CLI fixtures; asserts placeholder clients (`91001`–`91010`) and imported products.
  - **With `CLIENTES.DBF`:** fixture tree with valid/invalid `COND` rows; asserts real client import and **no** placeholders.
- Requires `DATABASE_URL` (`npm run test:integration`).

## Related docs

- [`scripts/MIGRACION_PROGRAMA_VIEJO.md`](../../../scripts/MIGRACION_PROGRAMA_VIEJO.md)
- [`docs/referencias/05-mapeo-tablas-legacy-a-bizcode.md`](../../referencias/05-mapeo-tablas-legacy-a-bizcode.md)

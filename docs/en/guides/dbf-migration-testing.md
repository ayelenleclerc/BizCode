# DBF migration testing

This guide documents the harness used to validate `scripts/migrate-from-dbf.ts` without a production `CLIENTES.DBF` source.

## Fixtures

- `tests/dbf/migration-dbf.test.ts` — CLIENTES-shaped rows (valid, invalid, edge) mapped to `clienteBodySchema`.
- `tests/helpers/migration-harness.ts` — temporary DBF tree, tenant bootstrap, table truncation, and `runDbfMigration` wrapper.

## Integration

- `tests/integration/dbf-migration.integration.test.ts` — PostgreSQL + generated PVAR/PVAR2/LIST_CLI fixtures; asserts placeholder client import and product rows.
- Requires `DATABASE_URL` (`npm run test:integration`).

## Related docs

- `scripts/MIGRACION_PROGRAMA_VIEJO.md`
- Issue #51 remains blocked for production CLIENTES ETL until a verified DBF source is agreed.

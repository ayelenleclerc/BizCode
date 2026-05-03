# Trazabilidad — scripts y herramientas

## Variables de entorno

- `DATABASE_URL` — PostgreSQL para `migrate:dbf`.
- `PROGRAMA_VIEJO_ROOT` — raíz de la copia del legado; ver [`.env.example`](../../.env.example).

## Comandos

| Comando | Descripción |
|---------|-------------|
| `npm run migrate:dbf` | Migra datos parciales desde DBF — [`scripts/migrate-from-dbf.ts`](../../scripts/migrate-from-dbf.ts) |
| `npx tsx scripts/inspect-dbf.ts` | Inspección fija de `LIST_CLI`, `PVAR`, `PVAR2` |
| `npm run inspect:dbf-all` | Barrido de **todos** los `.DBF` en `…/16-07-2025 completa/sistema/` — [`scripts/inspect-dbf-all.ts`](../../scripts/inspect-dbf-all.ts) |
| `node scripts/_generate-referencias-02-table.mjs <volcado.md>` | Regenera tabla markdown con columna **Grupo** para [`02-inventario-dbf-indice-maestro.md`](02-inventario-dbf-indice-maestro.md) |

## Opciones `inspect:dbf-all`

Ver `npx tsx scripts/inspect-dbf-all.ts --help` (si está implementado) o cabecera del script.

Parámetros típicos:

- `--format text|markdown|json` — formato de salida.
- `--sample N` — registros de muestra por archivo (default bajo).
- `--max-files N` — límite para pruebas.

## Salida hacia documentación

1. Ejecutar con `PROGRAMA_VIEJO_ROOT` apuntando a la copia.
2. Pegar tabla de [`02-inventario-dbf-indice-maestro.md`](02-inventario-dbf-indice-maestro.md) desde salida `markdown`.
3. Completar [`03-diccionario-datos-por-dbf.md`](03-diccionario-datos-por-dbf.md) por bloques.

## Mantenimiento de scripts

- Cambios en rutas esperadas (`16-07-2025 completa/sistema`) deben reflejarse en **un solo lugar** en código y en este doc.

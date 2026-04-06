# Migración desde `Programa_Viejo` (DBF)

## Ubicación de la copia

Por defecto los scripts buscan `Programa_Viejo/16-07-2025 completa/sistema/` **en la raíz del proyecto**. Si la copia está en otro disco o carpeta (recomendado: fuera del repo), define en `.env`:

`PROGRAMA_VIEJO_ROOT` — ruta absoluta o relativa al directorio desde el que ejecutas `npm` (p. ej. `../Programa_Viejo`).

## Archivos en esta copia (`…/16-07-2025 completa/sistema/`)

| Archivo        | Contenido real (verificado con `npx tsx scripts/inspect-dbf.ts`) |
|----------------|-------------------------------------------------------------------|
| `LIST_CLI.DBF` | **Metadatos** de columnas de listado (FLD_NAME, FIELD_NAME, …), **no** filas de clientes. |
| `PVAR.DBF`     | Estructura tipo maestro de artículos (`CODIG`, `DESCR`, …) con **0 registros** en esta copia. |
| `PVAR2.DBF`    | **Líneas** de pedido/compra: `ARTIC` (código), `IMPORTE`, `COSTO_N`, `IVA`, `CAJA`, `UNID`, … |

Codificación usada al leer: **cp437** (típico DOS/Visual Fox en español).

## Mapeo a Prisma

### `Articulo` (desde `PVAR2.DBF`)

- `codigo` ← entero redondeado de `ARTIC` (omitir filas con `ARTIC` 0 o nulo).
- `descripcion` ← `Artículo {codigo}` (máx. 30 caracteres; no hay texto en `DESCR` en esta copia porque `PVAR` está vacío).
- `precioLista1` / `precioLista2` ← `IMPORTE` de la **primera** fila vista por cada `ARTIC`.
- `costo` ← `COSTO_N` de esa misma fila.
- `condIva` ← `1` si `IVA` ≥ 20; `2` si ≥ 10; si no `3` (exento).
- `umedida` ← `UN` (fijo; el DBF no trae unidad explícita en estas filas).
- `stock` ← `CAJA + UNID` (aproximación; acotado a entero razonable).
- `rubroId` ← rubro semilla **General** `codigo = 1`.

Se importan **10** códigos distintos (los 10 menores `ARTIC` > 0 tras ordenar), e idempotencia por `codigo` único (`skipDuplicates` en `createMany` o comprobación previa).

### `Cliente`

En esta copia **no hay** tabla DBF con filas de clientes. El script inserta **10 clientes placeholder** con códigos `91001`–`91010` y razón social acotada a 30 caracteres, `condIva` = `R` (1 carácter, acorde a `VARCHAR(1)` en la migración SQL actual).

Si en el futuro agregas un `CLIENTES.DBF` (o similar) con datos reales, habría que ampliar el script leyendo ese archivo y mapeando campos según `LIST_CLI.DBF` (definición de columnas).

### Rubro semilla

- `Rubro`: `codigo = 1`, `nombre = General` (upsert).

## Ejecución

Desde la raíz del proyecto:

1. Variables: archivo `.env` con `DATABASE_URL` apuntando a PostgreSQL (misma cadena que usa el servidor Express / Prisma). Si `Programa_Viejo` no está en la raíz del repo, añade `PROGRAMA_VIEJO_ROOT` (véase arriba).
2. Esquema aplicado: `npx prisma migrate deploy` (o `npx prisma migrate dev` en desarrollo).
3. Cliente generado: `npx prisma generate`.
4. Importar: `npm run migrate:dbf`.

Inspección opcional de DBF (campos y muestras): `npx tsx scripts/inspect-dbf.ts`.

# Migración desde `Programa_Viejo` (DBF)

## Ubicación de la copia

Por defecto los scripts buscan `Programa_Viejo/16-07-2025 completa/sistema/` **en la raíz del proyecto**. Si la copia está en otro disco o carpeta (recomendado: fuera del repo), define en `.env`:

`PROGRAMA_VIEJO_ROOT` — ruta absoluta o relativa al directorio desde el que ejecutas `npm` (p. ej. `../Programa_Viejo`).

## Archivos en esta copia (`…/16-07-2025 completa/sistema/`)

| Archivo        | Contenido real (verificado con `npx tsx scripts/inspect-dbf.ts`) |
|----------------|-------------------------------------------------------------------|
| `LIST_CLI.DBF` | **Metadatos** de columnas de listado (FLD_NAME, FIELD_NAME, …), **no** filas de clientes. |
| `CLIENTES.DBF` | Maestro de clientes cuando la copia legacy lo incluye (evidencia inventario: **2310** registros en copia Suarez; ver `docs/referencias/exports/inventario-dbf-volcado.md`). |
| `PVAR.DBF`     | Estructura tipo maestro de artículos (`CODIG`, `DESCR`, …) con **0 registros** en la copia mínima del repo. |
| `PVAR2.DBF`    | **Líneas** de pedido/compra: `ARTIC` (código), `IMPORTE`, `COSTO_N`, `IVA`, `CAJA`, `UNID`, … |
| `RUBROS.DBF`   | Maestro de rubros (`COD_RUBRO`, `NOMBRE`) cuando la copia legacy lo incluye. |
| `ARTICULOS.DBF`| Maestro de artículos (`COD_ART`, `DESCRIP`, `COD_RUBRO`, precios, stock, …) cuando la copia lo incluye. |

Codificación usada al leer: **cp437** (típico DOS/Visual Fox en español).

## Mapeo a Prisma

### `Rubro` (desde `RUBROS.DBF`)

Si `RUBROS.DBF` existe y tiene registros, `npm run migrate:dbf` hace **upsert** por `codigo` (mismo servicio que `POST /api/rubros/migrate-dbf`). Transformación en [`src/lib/migration/legacyRubroDbf.ts`](../src/lib/migration/legacyRubroDbf.ts).

| Campo legacy | Campo BizCode |
|--------------|---------------|
| `COD_RUBRO` | `codigo` |
| `NOMBRE` | `nombre` (trim, máx. 20) |

### `Articulo` (desde `ARTICULOS.DBF`)

Si `ARTICULOS.DBF` existe y tiene registros, se importa con **upsert** (requiere rubros existentes por `COD_RUBRO`). Transformación en [`src/lib/migration/legacyArticuloDbf.ts`](../src/lib/migration/legacyArticuloDbf.ts). API: `POST /api/articulos/migrate-dbf` (importar rubros primero).

| Campo legacy | Campo BizCode |
|--------------|---------------|
| `COD_ART` | `codigo` |
| `DESCRIP` | `descripcion` (máx. 30) |
| `COD_RUBRO` | lookup → `rubroId` |
| `COND_IVA` | `condIva` (`1`/`2`/`3`) |
| `UMEDIDA` | `umedida` (máx. 6) |
| `PRECIO1` / `PRECIO2` | `precioLista1` / `precioLista2` |
| `COSTO` | `costo` |
| `STOCK` | `stock` (0 si null) |
| `STOCK_MIN` | `minimo` |
| `ACTIVO` | `activo` (logical DBF) |

### `Articulo` (fallback desde `PVAR2.DBF`)

- `codigo` ← entero redondeado de `ARTIC` (omitir filas con `ARTIC` 0 o nulo).
- `descripcion` ← `Artículo {codigo}` (máx. 30 caracteres; no hay texto en `DESCR` en esta copia porque `PVAR` está vacío).
- `precioLista1` / `precioLista2` ← `IMPORTE` de la **primera** fila vista por cada `ARTIC`.
- `costo` ← `COSTO_N` de esa misma fila.
- `condIva` ← `1` si `IVA` ≥ 20; `2` si ≥ 10; si no `3` (exento).
- `umedida` ← `UN` (fijo; el DBF no trae unidad explícita en estas filas).
- `stock` ← `CAJA + UNID` (aproximación; acotado a entero razonable).
- `rubroId` ← rubro semilla **General** `codigo = 1`.

Se importan **10** códigos distintos (los 10 menores `ARTIC` > 0 tras ordenar), e idempotencia por `codigo` único (`skipDuplicates` en `createMany` o comprobación previa).

### `Cliente` (desde `CLIENTES.DBF`)

Si `CLIENTES.DBF` existe y `recordCount > 0`, `npm run migrate:dbf` importa clientes reales con validación `clienteBodySchema` (mismo contrato que REST/CSV). Si no hay maestro con filas, el script mantiene **10 placeholders** `91001`–`91010`.

| Campo legacy | Campo BizCode | Regla |
|--------------|---------------|--------|
| `CODIG` | `codigo` | Entero > 0 |
| `RSOCIAL` | `rsocial` | Trim; 3–30 caracteres |
| `FANTASIA` | `fantasia` | Opcional; máx. 30 |
| `DOMIC` | `domicilio` | Opcional; máx. 40 |
| `LOCAL` | `localidad` | Opcional; máx. 25 |
| `CPOST` | `cpost` | Opcional; máx. 8 |
| `TELEF` | `telef` | Opcional; máx. 25 |
| `EMAIL` | `email` | Opcional; máx. 50 |
| `CUIT` | `cuit` | Opcional; validación CUIT argentina en schema |
| `CREDITO` | `creditLimit` | Numérico ≥ 0 |
| `BAJA` | `activo` | `BAJA=true` → `activo=false`; `BAJA=false` → `activo=true` (precedencia sobre `ACTIVO`) |
| `COND` | `condIva` | Catálogo cerrado (tabla siguiente) |

**Fuera de alcance v1:** `SALDO` → `balanceInicial`, `FPAGO` → `formaPago`, `ZONA` → `deliveryZoneId`.

#### Catálogo `COND` → `condIva`

| `COND` legacy | `condIva` BizCode |
|---------------|-------------------|
| `I` | `RI` |
| `M` | `Mono` |
| `E` | `Exento` |
| `N` | `CF` |
| `C` | `CF` |
| `X` | `Exento` |

`COND` desconocido o vacío: **no** migrar la fila; registrar error crítico en consola y continuar el lote.

#### Política de rechazo e idempotencia

- Rechazo por `COND` inválido, fallo Zod (p. ej. `rsocial` corta, CUIT inválido, `creditLimit` negativo) o `codigo` duplicado en el mismo archivo.
- Si `(tenantId, codigo)` ya existe en PostgreSQL: omitir inserción y contabilizar en el informe (sin upsert en v1).
- Transformación pura en [`src/lib/migration/legacyClienteDbf.ts`](../src/lib/migration/legacyClienteDbf.ts); orquestación en [`scripts/migrate-from-dbf.ts`](migrate-from-dbf.ts).

### Rubro semilla

- `Rubro`: `codigo = 1`, `nombre = General` (upsert).

## Ejecución

Desde la raíz del proyecto:

1. Variables: archivo `.env` con `DATABASE_URL` apuntando a PostgreSQL (misma cadena que usa el servidor Express / Prisma). Si `Programa_Viejo` no está en la raíz del repo, añade `PROGRAMA_VIEJO_ROOT` (véase arriba). Opcional: `BIZCODE_MIGRATION_TENANT_ID`.
2. Esquema aplicado: `npx prisma migrate deploy` (o `npx prisma migrate dev` en desarrollo).
3. Cliente generado: `npx prisma generate`.
4. Importar: `npm run migrate:dbf`.

Inspección opcional de DBF (campos y muestras): `npx tsx scripts/inspect-dbf.ts`.

## Relevamiento issue #51 (ETL clientes)

- Fuente acordada: `CLIENTES.DBF` bajo `PROGRAMA_VIEJO_ROOT/16-07-2025 completa/sistema/`.
- Evidencia de inventario: **2310** registros en copia Suarez (`docs/referencias/exports/inventario-dbf-volcado.md`).
- Altas masivas en aplicación: importación CSV de clientes (issue #58), auditada por API.
- Remediación de rechazos: corregir origen DBF o importar filas corregidas vía CSV.

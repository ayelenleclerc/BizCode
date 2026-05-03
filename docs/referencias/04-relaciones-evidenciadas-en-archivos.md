# Relaciones evidenciadas entre tablas/archivos

**Solo evidencia:** cruces documentados con muestras, índices `.NTX`, o metadatos en `LIST_*`. Sin narrativa de negocio no sustentada en archivos.

## 1. Metadatos de columnas (`LIST_CLI` y similares)

- **`LIST_CLI.DBF`:** contiene definición de columnas (`FLD_NAME`, `FIELD_NAME`, …), **no** el padrón de clientes como filas de datos — ver [`scripts/MIGRACION_PROGRAMA_VIEJO.md`](../../scripts/MIGRACION_PROGRAMA_VIEJO.md).

## 2. Artículos: `PVAR` + `PVAR2`

- En la migración actual, la descripción por código se toma de **`PVAR.DBF`** (`CODIG`, `DESCR`); si `PVAR` está vacío, se usa texto placeholder.
- **`PVAR2.DBF`** referencia códigos en **`ARTIC`** (numérico); primera fila vista por código alimenta precios/costo/stock agregado — ver mapeo en [`scripts/migrate-from-dbf.ts`](../../scripts/migrate-from-dbf.ts).

## 3. Coincidencias nominales (sin afirmar FK)

| Tabla A | Campo | Tabla B | Campo | Nota |
|---------|-------|---------|-------|------|
| *Pendiente* | | | | Documentar pares solo cuando se haya listado en el diccionario |

## 4. Índices `.NTX`

- Documentar por archivo `.DBF` asociado cuando se analice el par (nombre del índice sugiere campo clave). *Pendiente de volcado desde copia de trabajo.*

## 5. Coexistencia de tablas (evidencia de inventario)

Según [`02-inventario-dbf-indice-maestro.md`](02-inventario-dbf-indice-maestro.md) (copia bajo `E:\Z- programa Suarez\…\sistema`):

| Archivo | recordCount (aprox.) | Nota |
|---------|----------------------|------|
| `CLIENTES.DBF` | 2310 | Tabla de clientes con datos en esta copia (a diferencia del escenario solo-placeholder del script de migración actual). |
| `FACT.DBF` | 418354 | Volumen alto; documento comercial agregado o detalle a confirmar leyendo campos en `exports/inventario-dbf-volcado.md`. |
| `CCTE_V.DBF` | 177399 | Cuenta corriente o vista voluminosa; revisar sección en volcado. |
| `PVAR.DBF` | 0 | Sin filas en esta copia (coherente con [`scripts/MIGRACION_PROGRAMA_VIEJO.md`](../../scripts/MIGRACION_PROGRAMA_VIEJO.md)). |

Las **relaciones formales** entre estas tablas no se listan aquí hasta documentar claves coincidentes en muestras (paso siguiente).

## 6. Próximos pasos

- Cruces campo a campo usando secciones `### <archivo>.DBF` en [`exports/inventario-dbf-volcado.md`](exports/inventario-dbf-volcado.md) y muestras opcionales ([`07b-patrones-cruces-tablas-desde-muestras.md`](07b-patrones-cruces-tablas-desde-muestras.md)).

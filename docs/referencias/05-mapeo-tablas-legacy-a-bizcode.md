# Mapeo tablas legacy → BizCode

**Modelo actual BizCode:** [`prisma/schema.prisma`](../../prisma/schema.prisma) — `Cliente`, `Rubro`, `Articulo`, `FormaPago`, `Factura`, `FacturaItem`, `ParamEmpresa`.

**Contrato API:** [`docs/api/openapi.yaml`](../api/openapi.yaml).

## Leyenda de estados

| Estado | Significado |
|--------|-------------|
| **cubierto-script** | Existe lógica en `scripts/migrate-from-dbf.ts` (parcial). |
| **pendiente** | Sin ETL en repo. |
| **sin-datos-copia** | Archivo o tabla vacía en la copia analizada. |

## Matriz (alta nivel)

| Entidad BizCode | Fuente legacy (evidencia actual) | Estado | Notas |
|-----------------|----------------------------------|--------|--------|
| `Rubro` | Semilla fija en script (`codigo=1`, General) | cubierto-script | No sale de un DBF en la migración actual. |
| `Articulo` | `PVAR2.DBF` (+ `PVAR.DBF` para descripción) | cubierto-script | Límite de códigos importados en script; ver `MIGRACION_PROGRAMA_VIEJO.md`. |
| `Cliente` | Placeholders `91001`–`91010` en script; existe `CLIENTES.DBF` en copia Suarez (2310 registros) | cubierto-script / **pendiente mapeo** | El ETL actual no lee `CLIENTES.DBF`; hay datos reales en esa copia — ver [`02-inventario-dbf-indice-maestro.md`](02-inventario-dbf-indice-maestro.md). |
| `Factura` / `FacturaItem` | `FACT.DBF` y tablas relacionadas (`DET_COMP`, `ENCAB`, …) en inventario | pendiente | `FACT.DBF` tiene 418354 registros en la copia analizada; mapeo por definir tras análisis de campos. |
| `FormaPago` | — | pendiente | |
| `ParamEmpresa` | — | pendiente | |

## Campos `Articulo` (desde `PVAR2` / `PVAR`)

| Campo Prisma | Origen legacy | Notas |
|--------------|---------------|--------|
| `codigo` | `ARTIC` (entero > 0) | |
| `descripcion` | `PVAR.DESCR` o placeholder | |
| `precioLista1` / `precioLista2` | `IMPORTE` (primera fila por código) | |
| `costo` | `COSTO_N` | |
| `condIva` | `IVA` (umbrales 20 / 10) | Mapeo en `ivaToCondIvaArticulo` |
| `stock` | `CAJA + UNID` (aprox.) | |
| `umedida` | Fijo `UN` en script | |
| `rubroId` | Rubro semilla | |

---

Actualizar esta matriz cuando se incorporen nuevas tablas desde el inventario maestro.

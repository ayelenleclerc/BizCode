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
| `Cliente` | `CLIENTES.DBF` cuando la copia legacy lo incluye (2310 registros en copia Suarez); placeholders `91001`–`91010` si no hay filas | cubierto-script | ETL v1 en `migrate-from-dbf.ts` + `src/lib/migration/legacyClienteDbf.ts`; ver `MIGRACION_PROGRAMA_VIEJO.md`. |
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

## Campos `Cliente` (desde `CLIENTES.DBF`)

| Campo Prisma | Origen legacy | Notas |
|--------------|---------------|--------|
| `codigo` | `CODIG` | Entero > 0 |
| `rsocial` | `RSOCIAL` | 3–30 caracteres |
| `fantasia` | `FANTASIA` | Opcional |
| `domicilio` | `DOMIC` | Opcional |
| `localidad` | `LOCAL` | Opcional |
| `cpost` | `CPOST` | Opcional |
| `telef` | `TELEF` | Opcional |
| `email` | `EMAIL` | Opcional |
| `cuit` | `CUIT` | Opcional; validación en schema |
| `creditLimit` | `CREDITO` | ≥ 0 |
| `activo` | `BAJA` | Invertido; precede `ACTIVO` |
| `condIva` | `COND` | Catálogo en `MIGRACION_PROGRAMA_VIEJO.md` |

---

Actualizar esta matriz cuando se incorporen nuevas tablas desde el inventario maestro.

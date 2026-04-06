# Módulos funcionales (legado) — agrupación por evidencia

## Criterio de la columna «Grupo» en `02`

Asignación **heurística** por nombre de archivo (script [`scripts/_generate-referencias-02-table.mjs`](../../scripts/_generate-referencias-02-table.mjs)):

| Grupo | Regla resumida |
|-------|----------------|
| **A** | `LIST_*`, `STRU_*`, `ART_LST`, `TABLA_V` — listados y definiciones de estructura |
| **B** | Maestros: `ARTIC`, `RUBRO`, `CLAS*`, `PVAR*`, parámetros y tablas auxiliares de catálogo (`FPAGO`, `MONEDA`, `VEND`, `ZONAS`, …) |
| **C** | Terceros y operación: `CLIENTES`, `CCTE_V`, `CAJAS`, `CHEQUES`, `BANCOS`, `PROCESOS`, `ACCESOS`, … |
| **D** | Documentos y movimientos: `FACT`, `REMITOS`, `PEDIDO*`, `PAGOS`, `COMIS`, `MOV_STK`, `REPART*`, `uv`, `pmanual`, … |
| **E** | Borradores / anulados / bloqueos: `BORRAR`, `ANULADOS`, `REIMPRE`, `LOCK_ABM` |

Revisar caso por caso si un archivo debe cambiar de grupo según el análisis de campos.

## Conteos por grupo (copia actual)

| Grupo | Cantidad `.DBF` |
|-------|-----------------|
| A | 37 |
| B | 38 |
| C | 11 |
| D | 17 |
| E | 4 |

**Total:** 107 — columna «Grupo» en [`02-inventario-dbf-indice-maestro.md`](02-inventario-dbf-indice-maestro.md).

## Listado por grupo

Filtrar la tabla de `02` por la columna **Grupo** o regenerar la columna con `scripts/_generate-referencias-02-table.mjs` (mismas reglas que aquí arriba).

### Patrones de nombre por grupo

- **A:** `LIST_*`, `STRU_*`, `ART_LST`, `TABLA_V`
- **B:** `ARTIC`, `RUBRO`, `CLAS*`, `PVAR*`, catálogos (`FPAGO`, `MONEDA`, …)
- **C:** `CLIENTES`, `CCTE_V`, `CAJAS`, `CHEQUES`, `BANCOS`, …
- **D:** `FACT`, `REMITOS`, `PEDIDO*`, `PAGOS`, `COMIS`, `MOV_STK`, `uv`, `pmanual`, …
- **E:** `BORRAR`, `ANULADOS`, `REIMPRE`, `LOCK_ABM`

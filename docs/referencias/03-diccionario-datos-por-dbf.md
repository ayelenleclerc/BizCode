# Diccionario de datos — por `.DBF`

## Fuente principal (evidencia completa)

El volcado verificado de **todos** los `.DBF` (estructura de campos por archivo, `recordCount`, sin muestras de filas para limitar tamaño) está en:

**[`exports/inventario-dbf-volcado.md`](exports/inventario-dbf-volcado.md)**

Se generó con:

```bash
set PROGRAMA_VIEJO_ROOT=E:\Z- programa Suarez\16-07-2025 completa
npm run inspect:dbf-all -- --format markdown --sample 0
```

*(En bash: `PROGRAMA_VIEJO_ROOT=... npm run inspect:dbf-all ...`.)*

## Muestras de registros

Para añadir **muestras** (`--sample N`) al documentar una tabla concreta, ejecutar de nuevo el comando con `N > 0` y pegar solo el fragmento de esa tabla en una ficha bajo [`bloques/`](bloques/README.md), o en [`07b-patrones-cruces-tablas-desde-muestras.md`](07b-patrones-cruces-tablas-desde-muestras.md).

## Entradas puntuales ya cubiertas en el repo (antes del barrido)

| Archivo | Referencia |
|---------|------------|
| `LIST_CLI.DBF` | [`scripts/MIGRACION_PROGRAMA_VIEJO.md`](../../scripts/MIGRACION_PROGRAMA_VIEJO.md), ficha [bloques/A-metadatos/LIST_CLI-ficha.md](bloques/A-metadatos/LIST_CLI-ficha.md) |
| `PVAR.DBF` | Idem + [bloques/B-maestros/PVAR-ficha.md](bloques/B-maestros/PVAR-ficha.md) |
| `PVAR2.DBF` | Idem + [bloques/B-maestros/PVAR2-ficha.md](bloques/B-maestros/PVAR2-ficha.md) |

## Plantilla por archivo (análisis manual incremental)

Para cada archivo que se cierre en detalle:

### `<NOMBRE>.DBF`

- **Estado:** borrador | revisado
- **Grupo:** A–F (ver [`02-inventario-dbf-indice-maestro.md`](02-inventario-dbf-indice-maestro.md))
- **Enlace al volcado:** sección `### <NOMBRE>.DBF` en `exports/inventario-dbf-volcado.md`
- **Muestra opcional:** *(si se generó con `--sample N`)*
- **Notas:** *(solo hechos observados)*

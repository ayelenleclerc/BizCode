# Análisis por bloques (A–F)

**Objetivo:** llevar el **progreso archivo por archivo** dentro de cada grupo. Marcar cada `.DBF` como `pendiente` o `revisado` cuando exista ficha en [`../03-diccionario-datos-por-dbf.md`](../03-diccionario-datos-por-dbf.md).

## Tabla de estado por grupo

| Grupo | Descripción | Archivos totales (aprox.) | % revisado | Notas |
|-------|-------------|----------------------------|------------|-------|
| A | Metadatos/listados | 37 | *parcial* | Ficha: [A-metadatos/LIST_CLI-ficha.md](A-metadatos/LIST_CLI-ficha.md); volcado global |
| B | Maestros comerciales | 38 | *parcial* | Fichas: [B-maestros/PVAR-ficha.md](B-maestros/PVAR-ficha.md), [B-maestros/PVAR2-ficha.md](B-maestros/PVAR2-ficha.md); volcado global |
| C | Terceros/operaciones | 11 | *parcial* | [C-terceros/CLIENTES-ficha.md](C-terceros/CLIENTES-ficha.md); volcado global |
| D | Documentos comerciales | 17 | 0% | Volcado global [`exports/inventario-dbf-volcado.md`](../exports/inventario-dbf-volcado.md) |
| E | Auxiliares/históricos | 4 | 0% | Idem |
| F | Fuera de sistema/ (DOS, esc) | N/A | — | Principalmente no-DBF |

Tras ejecutar `npm run inspect:dbf-all` con `PROGRAMA_VIEJO_ROOT` apuntando a la copia real, actualizar porcentajes y [`../02-inventario-dbf-indice-maestro.md`](../02-inventario-dbf-indice-maestro.md).

## Subcarpetas opcionales

Se pueden crear `bloques/A-metadatos/`, `bloques/B-maestros/`, … con un `.md` por archivo o lote, enlazando desde `03`.

## Última revisión del mapa global

Al cerrar un bloque, actualizar [`../07-mapa-modulos-interconexion-y-estrategia.md`](../07-mapa-modulos-interconexion-y-estrategia.md).

# Ficha: `PVAR.DBF`

- **Grupo:** B — Maestros comerciales
- **Estado:** evidencia desde documentación del repo

## Evidencia verificada

Según [`scripts/MIGRACION_PROGRAMA_VIEJO.md`](../../../../scripts/MIGRACION_PROGRAMA_VIEJO.md) y [`scripts/migrate-from-dbf.ts`](../../../../scripts/migrate-from-dbf.ts):

- Estructura tipo maestro de artículos con campos entre otros `CODIG`, `DESCR`.
- En la copia analizada en ese documento puede tener **0 registros**.

## Uso en migración actual

- Si hay filas: `descripcion` del artículo en BizCode puede tomarse de `DESCR` (truncado a 30 caracteres).
- Si está vacío: placeholder `Artículo {codigo}` — ver script.

## Reproducir

```bash
npx tsx scripts/inspect-dbf.ts
```

# Ficha: `PVAR2.DBF`

- **Grupo:** B — Maestros comerciales / líneas operativas
- **Estado:** evidencia desde documentación y código del repo

## Evidencia verificada

Según [`scripts/MIGRACION_PROGRAMA_VIEJO.md`](../../../../scripts/MIGRACION_PROGRAMA_VIEJO.md):

- Líneas de pedido/compra con campos entre otros: `ARTIC`, `IMPORTE`, `COSTO_N`, `IVA`, `CAJA`, `UNID`, …

## Uso en migración actual

- `ARTIC` → código de artículo (entero > 0).
- Primera fila vista por cada código → precios, costo, IVA, stock aproximado — ver `aggregatePvar2ByArtic` en [`scripts/migrate-from-dbf.ts`](../../../../scripts/migrate-from-dbf.ts).

## Reproducir

```bash
npx tsx scripts/inspect-dbf.ts
```

# Ficha: `CLIENTES.DBF`

- **Grupo:** C — Terceros y operaciones
- **Estado:** ETL v1 implementado (#51, PR #120) en `scripts/migrate-from-dbf.ts` cuando el archivo tiene registros

## Evidencia numérica

- **recordCount:** 2310  
- **Tamaño:** 2575999 bytes  

Fuente: [`02-inventario-dbf-indice-maestro.md`](../../02-inventario-dbf-indice-maestro.md) (misma copia que el barrido).

## Estructura y muestras

Ver sección `### CLIENTES.DBF` en [`exports/inventario-dbf-volcado.md`](../../exports/inventario-dbf-volcado.md).

## Mapeo BizCode

Modelo [`Cliente`](../../../../prisma/schema.prisma). Transformación en [`src/lib/migration/legacyClienteDbf.ts`](../../../../src/lib/migration/legacyClienteDbf.ts); contrato y rechazos en [`scripts/MIGRACION_PROGRAMA_VIEJO.md`](../../../../scripts/MIGRACION_PROGRAMA_VIEJO.md).

Campos v1: `CODIG`, `RSOCIAL`, `FANTASIA`, `DOMIC`, `LOCAL`, `CPOST`, `TELEF`, `EMAIL`, `CUIT`, `CREDITO`, `BAJA`, `COND`.

Pendiente: `SALDO`, `FPAGO`, `ZONA`, `ACTIVO` (sin precedencia sobre `BAJA` en v1).

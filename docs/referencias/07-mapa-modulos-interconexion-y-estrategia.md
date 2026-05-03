# Mapa de módulos, interconexión y estrategia de implementación BizCode

**Actualizado:** tras inventario completo de `.DBF` en copia `E:\Z- programa Suarez\…\sistema` (ver [`02-inventario-dbf-indice-maestro.md`](02-inventario-dbf-indice-maestro.md)).

## 1. Mapa módulo ↔ volumen (evidencia de conteos)

```text
[A] Metadatos/estructuras (LIST_*, STRU_*, …)     37 archivos
[B] Maestros / catálogos (ARTIC, RUBRO, PVAR*, …)  38 archivos
[C] Terceros / caja / bancos (CLIENTES, CCTE_V, …) 11 archivos
[D] Documentos / pagos / stock (FACT, PAGOS, …)    17 archivos
[E] Borradores / anulados / locks                   4 archivos
```

## 2. Interconexión (solo lo ya documentado)

| Enlace | Evidencia |
|--------|-----------|
| `PVAR` ↔ `PVAR2` por código artículo | [`04-relaciones-evidenciadas-en-archivos.md`](04-relaciones-evidenciadas-en-archivos.md), script de migración |
| `LIST_CLI` define columnas, no clientes | [`scripts/MIGRACION_PROGRAMA_VIEJO.md`](../../scripts/MIGRACION_PROGRAMA_VIEJO.md) |

*Aristas adicionales:* pendiente de cruce de campos entre `CLIENTES`, `FACT`, `CCTE_V`, etc. (volcado en [`exports/inventario-dbf-volcado.md`](exports/inventario-dbf-volcado.md)).

## 3. Estrategia de implementación sugerida (BizCode)

1. **Estabilizar maestros ya migrados** — `Rubro`, `Articulo` desde `PVAR`/`PVAR2` (script actual); completar descripciones cuando haya datos en `PVAR` o fuente alternativa (`ARTIC.DBF` tiene 2038 registros en esta copia).
2. **`Cliente`** — sustituir placeholders: leer estructura y muestras de `CLIENTES.DBF`, mapear a `Cliente` en Prisma y ampliar `migrate-from-dbf.ts` (o script dedicado).
3. **`Factura` / `FacturaItem`** — analizar `FACT.DBF`, `DET_COMP`, `ENCAB*`, `IVA_V` para proponer mapeo; volumen alto: migración por lotes y pruebas en subconjunto.
4. **Cuenta corriente / pagos** — `CCTE_V`, `PAGOS`, `MOV_STK` en fase posterior según prioridad de negocio.
5. **Validación API** — alinear `POST/PUT` con esquemas Zod/OpenAPI antes de exponer ETL masivo.

## 4. Estado de revisión

| Fecha | Cambio |
|-------|--------|
| 2026-04-04 | Inventario 107 `.DBF`, volcado en `exports/`; conteos por grupo en `06`. |

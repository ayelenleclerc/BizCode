# Glosario y convenciones

## Formatos y archivos

| Término | Significado |
|---------|-------------|
| **DBF** | Tabla dBase / FoxPro / Clipper; metadatos de campos + registros. |
| **NTX** | Índice Clipper (Nexus); asociado a un `.DBF` y campos de índice. |
| **DBT** | Archivo de memos vinculado a un `.DBF` cuando hay campos memo. |
| **cp437** | Page code DOS (OEM); codificación usada al leer textos con `dbffile` en los scripts del repo. |
| **PIF** | Program Information File; acceso directo a programas DOS en Windows. |

## Convenciones de este relevamiento

- **Snapshot:** anotar en cada volcado la **ruta** y, si aplica, **fecha de modificación** de la copia (no es “versión del software” salvo evidencia adicional).
- **Citar evidencia:** `archivo`, `recordCount`, campos, o cita de fila en JSON.
- **Coincidencia nominal:** si dos tablas tienen un campo con el mismo nombre, documentarlo como tal **sin** afirmar FK si no hay otra evidencia.

## Scripts del repositorio (BizCode)

- Migración parcial documentada: [`scripts/MIGRACION_PROGRAMA_VIEJO.md`](../../scripts/MIGRACION_PROGRAMA_VIEJO.md).
- Inspección puntual: `npx tsx scripts/inspect-dbf.ts`.
- Barrido completo: `npm run inspect:dbf-all` — ver [12-trazabilidad-scripts-herramientas.md](12-trazabilidad-scripts-herramientas.md).

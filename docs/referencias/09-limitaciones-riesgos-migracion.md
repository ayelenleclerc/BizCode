# Limitaciones y riesgos de migración desde el legado

## Codificación

- Lectura con **cp437** en scripts — ver [`scripts/MIGRACION_PROGRAMA_VIEJO.md`](../../scripts/MIGRACION_PROGRAMA_VIEJO.md). Caracteres fuera de OEM pueden degradarse.

## Tablas vacías o incompletas

- **`PVAR.DBF`** puede tener **0 registros** en una copia; las descripciones de artículo no están disponibles desde ese archivo.

## Metadatos vs datos

- **`LIST_CLI.DBF`** describe columnas de listado, **no** sustituye una tabla de clientes con filas.

## Integridad

- Sin documentación de reglas de negocio en el repo del DOS, las **FK reales** no se pueden afirmar solo por nombres de campo.

## Tamaño y rendimiento

- Directorio `sistema/` puede contener tablas muy grandes; el barrido debe limitar muestras (ver `inspect:dbf-all`).

## DBF dañados o no estándar

- Si `DBFFile.open` falla con un archivo, documentar en `02` y aquí el error.

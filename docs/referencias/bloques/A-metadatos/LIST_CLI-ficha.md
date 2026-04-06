# Ficha: `LIST_CLI.DBF`

- **Grupo:** A — Metadatos y listados
- **Estado:** evidencia desde documentación del repo (no requiere copia local para estos hechos)

## Evidencia verificada

Según [`scripts/MIGRACION_PROGRAMA_VIEJO.md`](../../../../scripts/MIGRACION_PROGRAMA_VIEJO.md):

- Contiene **metadatos** de columnas de listado (`FLD_NAME`, `FIELD_NAME`, …).
- **No** son filas de clientes.

## Reproducir lectura estructurada

Con copia del legado configurada en `PROGRAMA_VIEJO_ROOT`:

```bash
npx tsx scripts/inspect-dbf.ts
```

*(El script fijo incluye `LIST_CLI.DBF` en el listado.)*

O barrido completo:

```bash
npm run inspect:dbf-all -- --format text --max-files 1
```

*(ajustar si hace falta localizar solo este archivo).*

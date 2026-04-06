# Plan de implementaciones futuras (BizCode)

**Alineado a:** [`07-mapa-modulos-interconexion-y-estrategia.md`](07-mapa-modulos-interconexion-y-estrategia.md) y [`05-mapeo-tablas-legacy-a-bizcode.md`](05-mapeo-tablas-legacy-a-bizcode.md).

## Corto plazo (técnico)

1. **Validación server-side** de `POST/PUT` en rutas que hoy pasan `req.body` directo a Prisma — coherente con Zod del frontend y OpenAPI.
2. **Extender ETL** cuando exista tabla real de clientes en DBF (mapear y reemplazar placeholders).
3. **Tests de integración** de migración con copia mínima de DBF en fixtures (si se acuerda política de datos).

## Medio plazo (dominio)

1. **Facturación:** mapear tablas de cabecera/detalle del legado a `Factura` / `FacturaItem` una vez documentadas en `02`/`04`.
2. **Formas de pago / parámetros empresa:** según tablas identificadas.
3. **Reportes y listados** compatibles con definiciones `LIST_*`.

## Largo plazo

- Modularidad fiscal (fuera del alcance de este documento; ver visión de producto en `docs/` si aplica).

## Priorización

- Reordenar según hallazgos del inventario maestro y negocio; este archivo es **backlog vivo**.

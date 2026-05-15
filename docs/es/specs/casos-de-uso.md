# Casos de uso (MVP)

| Campo | Valor |
|-------|--------|
| Versión del documento | 0.2 |
| Revisión | 2 |
| Fecha | 2026-05-15 |
| Referencia al producto | BizCode 0.1.0 MVP |

**Actor:** Operador (usuario de negocio). **Sistema:** BizCode (app de escritorio: UI React + API Express + PostgreSQL).

| ID | Nombre | Flujo principal (resumen) | Evidencia |
|----|--------|---------------------------|-----------|
| CU-01 | Gestionar clientes | Listar/buscar → abrir formulario → crear o editar → guardar. | `src/pages/clientes/` |
| CU-02 | Gestionar artículos | Listar/buscar → abrir formulario → crear o editar → seleccionar rubro → guardar. | `src/pages/articulos/` |
| CU-03 | Gestionar facturas | Listado → nueva factura → cabecera + ítems → guardar. | `src/pages/facturacion/` |
| CU-04 | Cambiar apariencia | Conmutar tema claro/oscuro; persistencia local. | `Layout.tsx`, `temas-interfaz.md` |
| CU-05 | Cambiar idioma | Cambiar el idioma de la UI entre los locales soportados. | `src/i18n/` |
| CU-06 | Registrar cobros | Listar/filtrar pagos → registrar cobro de cliente → filtros opcionales. | `src/pages/cobros/` |
| CU-07 | Revisar CxC y cuenta corriente | Ver buckets de antigüedad → cargar cuenta corriente por id de cliente. | `src/pages/finanzas/` |
| CU-08 | Ejecutar reportes operativos | Elegir período/pestaña → ver ventas, stock crítico o cobranzas; exportar CSV. | `src/pages/reportes/` |
| CU-09 | Gestionar órdenes de entrega | Filtrar órdenes → crear o actualizar estado (planificador/conductor según RBAC). | `src/pages/logistica/` |

**Otros idiomas:** [English](../../en/specs/use-cases.md) · [Português](../../pt-br/specs/casos-de-uso.md)

# Casos de uso (MVP)

| Campo | Valor |
|-------|--------|
| Versión del documento | 0.1 |
| Revisión | 1 |
| Fecha | 2026-03-31 |
| Referencia al producto | BizCode 0.1.0 MVP |

**Actor:** Operador. **Sistema:** BizCode (UI React + API Express + PostgreSQL).

| ID | Nombre | Flujo principal (resumen) | Evidencia |
|----|--------|---------------------------|-----------|
| CU-01 | Gestionar clientes | Listar/buscar → formulario → crear o editar → guardar. | `src/pages/clientes/` |
| CU-02 | Gestionar artículos | Listar/buscar → formulario → crear o editar → rubro → guardar. | `src/pages/articulos/` |
| CU-03 | Gestionar facturas | Listado → nueva factura → cabecera + ítems → guardar. | `src/pages/facturacion/` |
| CU-04 | Cambiar apariencia | Conmutar tema claro/oscuro; persistencia local. | `Layout.tsx`, `temas-interfaz.md` |
| CU-05 | Cambiar idioma | Cambiar entre locales soportados. | `src/i18n/` |

**Otros idiomas:** [English](../../en/specs/use-cases.md) · [Português](../../pt-br/specs/use-cases.md)

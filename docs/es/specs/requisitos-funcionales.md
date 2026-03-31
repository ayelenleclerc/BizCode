# Requisitos funcionales (MVP)

| Campo | Valor |
|-------|--------|
| Versión del documento | 0.1 |
| Revisión | 1 |
| Fecha | 2026-03-31 |
| Referencia al producto | BizCode 0.1.0 MVP |

Los requisitos siguientes están **evidenciados** por UI (`src/pages/`), cliente (`src/lib/api.ts`) y/o `server/createApp.ts` + OpenAPI.

| ID | Requisito | Evidencia |
|----|-----------|-----------|
| RF-001 | Listar y filtrar clientes desde la UI; búsqueda con query `q` en API. | `src/pages/clientes/`, `GET /api/clientes` |
| RF-002 | Crear cliente nuevo vía formulario POST. | `ClienteForm.tsx`, `POST /api/clientes` |
| RF-003 | Ver y actualizar cliente existente. | `GET/PUT /api/clientes/:id`, formularios |
| RF-004 | Listar y filtrar artículos. | `src/pages/articulos/`, `GET /api/articulos` |
| RF-005 | Crear y actualizar artículo; seleccionar **rubro** desde lista cargada por API. | `ArticuloForm.tsx`, `GET /api/rubros`, `POST/PUT /api/articulos` |
| RF-006 | La API admite `POST /api/rubros`; **no** hay pantalla de administración de rubros bajo `src/pages/` — solo selección en formulario de artículo. | `createApp.ts`, `api.ts` |
| RF-007 | Listar facturas y crear factura con ítems; cargar **formas de pago** en el formulario. | `src/pages/facturacion/`, `GET /api/formas-pago`, `GET/POST /api/facturas` |
| RF-008 | Persistir tema UI (`dark`/`light`) en `localStorage` y clase en `<html>`. | `temas-interfaz.md`, `Layout.tsx`, `index.html` |
| RF-009 | Cambiar idioma de UI entre `es`, `en`, `pt-BR` con paridad verificada por `check:i18n`. | [estrategia-i18n.md](../estrategia-i18n.md), `src/locales/` |
| RF-010 | Exponer `GET /api/health` para disponibilidad de API. | `createApp.ts`, OpenAPI |

**Otros idiomas:** [English](../../en/specs/functional-requirements.md) · [Português](../../pt-br/specs/functional-requirements.md)

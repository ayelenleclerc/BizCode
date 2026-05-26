# Functional requirements (MVP)

| Field | Value |
|-------|--------|
| Document version | 0.2 |
| Revision | 2 |
| Date | 2026-05-15 |
| Product reference | BizCode 0.1.0 MVP |

Requirements below are **evidenced** by UI (`src/pages/`), client (`src/lib/api.ts`), and/or `server/registerRestDomainRoutes.ts` + [`docs/api/openapi.yaml`](../../api/openapi.yaml).

| ID | Requirement | Evidence |
|----|---------------|----------|
| FR-001 | List and filter customers from the UI; search uses API query `q`. | `src/pages/clientes/`, `GET /api/clientes` |
| FR-002 | Create a new customer via form POST. | `ClienteForm.tsx`, `POST /api/clientes` |
| FR-003 | View and update an existing customer. | `GET/PUT /api/clientes/:id`, forms |
| FR-004 | List and filter products (artículos). | `src/pages/articulos/`, `GET /api/articulos` |
| FR-005 | Create and update a product; select **rubro** from list loaded via API. | `ArticuloForm.tsx`, `GET /api/rubros`, `POST/PUT /api/articulos` |
| FR-006 | API supports `POST /api/rubros`; **no** dedicated rubro admin screen under `src/pages/` is evidenced—only selection in product form. | `createApp.ts`, `api.ts` |
| FR-007 | List invoices and create a new invoice with line items; load **formas de pago** for the form. | `src/pages/facturacion/`, `GET /api/formas-pago`, `GET/POST /api/facturas` |
| FR-008 | Persist UI theme (`dark` / `light`) in `localStorage` and apply class on `<html>`. | `theming.md`, `Layout.tsx`, `index.html` |
| FR-009 | Switch UI language among `es`, `en`, `pt-BR` with parity enforced by `check:i18n`. | [i18n-strategy.md](../i18n-strategy.md), locales under `src/locales/` |
| FR-010 | Expose `GET /api/health` for API liveness. | `createApp.ts`, OpenAPI |
| FR-011 | Register customer payments (cobros); list and filter by customer and date range; view payment detail. | `src/pages/cobros/`, `POST/GET /api/cobros`, `GET /api/cobros/:id` |
| FR-012 | On `POST /api/cobros`, decrement `Cliente.balance` and adjust `Cliente.score` when an active invoice exists (rules in OpenAPI). | `CobroService.ts`, OpenAPI `POST /api/cobros` |
| FR-013 | AR aging and account statement per customer. | `src/pages/finanzas/`, `GET /api/reportes/aging`, `GET /api/reportes/cuenta-corriente/:clienteId` |
| FR-014 | Operational and financial reports with optional CSV export (`Accept: text/csv`). | `src/pages/reportes/`, `GET /api/reportes/ventas`, `stock-critico`, `cobranzas` |
| FR-015 | Delivery orders: list, create, update state; driver-scoped list when role is `driver`. | `src/pages/logistica/`, `GET/POST/PUT /api/ordenes-entrega` |
| FR-016 | Warehouse picking: queue, start picking, checklist, mark ready (`logistics.picking`). | `src/pages/logistica/picking/`, `POST .../iniciar-picking`, `POST .../lista` |
| FR-017 | Delivery routes: plan, start, close; sequence OEs in `ready`. | `src/pages/logistica/repartos/`, `GET/POST /api/repartos`, `POST .../iniciar`, `POST .../cerrar` |
| FR-018 | POD on route items: driver wizard; back-office view proof. | `src/pages/logistica/repartos/chofer/`, `PUT .../items/{itemId}`, `GET .../pod` |
| FR-019 | Live GPS tracking: planner map; driver posts location every 2 min (`logistics.gps`). | `src/pages/logistica/seguimiento/`, `GET /api/repartos/activos`, `POST .../ubicacion` |
| FR-020 | Logistics KPIs/reports: first-visit rate, avg delivery time, returns by reason, driver/zone tables, CSV (`logistics.dispatches`, `dispatchedAt`). | `src/pages/logistica/LogisticaReportesPanel.tsx`, `GET /api/logistica/kpis`, `reporte-choferes`, `reporte-zonas` |
| FR-021 | Void active invoice with documented reason (`billing.credit_notes`, `sales.cancel`); list/get credit notes by period. | `PUT /api/facturas/{id}/void`, `GET /api/notas-credito`, `GET /api/notas-credito/{id}`, `ListadoFacturas.tsx`, `src/pages/finanzas/index.tsx`, [ADR-0012](../adr/ADR-0012-invoice-void-credit-note.md), `tests/api/notas-credito.test.ts`, `tests/api/facturas-void.test.ts` |

**Other languages:** [Español](../../es/specs/requisitos-funcionales.md) · [Português](../../pt-br/specs/requisitos-funcionais.md)

# Functional requirements (MVP)

| Field | Value |
|-------|--------|
| Document version | 0.1 |
| Revision | 1 |
| Date | 2026-03-31 |
| Product reference | BizCode 0.1.0 MVP |

Requirements below are **evidenced** by UI (`src/pages/`), client (`src/lib/api.ts`), and/or `server/createApp.ts` + [`docs/api/openapi.yaml`](../../api/openapi.yaml).

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

**Other languages:** [Español](../../es/specs/functional-requirements.md) · [Português](../../pt-br/specs/functional-requirements.md)

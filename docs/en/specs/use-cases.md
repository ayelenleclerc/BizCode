# Use cases (MVP)

| Field | Value |
|-------|--------|
| Document version | 0.2 |
| Revision | 2 |
| Date | 2026-05-15 |
| Product reference | BizCode 0.1.0 MVP |

**Actor:** Operator (business user). **System:** BizCode desktop app (React UI + Express API + PostgreSQL).

| ID | Name | Main flow (summary) | Evidence |
|----|------|----------------------|----------|
| UC-01 | Manage customers | List/search → open form → create or edit → save. | `src/pages/clientes/` |
| UC-02 | Manage products | List/search → open form → create or edit → select rubro → save. | `src/pages/articulos/` |
| UC-03 | Manage invoices | List → new invoice → header + line items → save. | `src/pages/facturacion/` |
| UC-04 | Change appearance | Toggle light/dark theme; persisted locally. | `Layout.tsx`, `theming.md` |
| UC-05 | Change language | Switch UI language among supported locales. | `src/i18n/` |
| UC-06 | Register collections | List/filter payments → register payment for customer → optional filters. | `src/pages/cobros/` |
| UC-07 | Review AR and statements | View aging buckets → load account statement by customer id. | `src/pages/finanzas/` |
| UC-08 | Run operational reports | Select period/tab → view sales, critical stock, or collections; export CSV. | `src/pages/reportes/` |
| UC-09 | Manage delivery orders | Filter orders → create or update estado (planner/driver per RBAC). | `src/pages/logistica/` |
| UC-10 | Warehouse picking | Take OE from queue → checklist → mark ready. | `src/pages/logistica/picking/` |
| UC-11 | Plan delivery route | Select ready OEs → create route → start → close. | `src/pages/logistica/repartos/` |
| UC-12 | Driver POD | Confirm delivery per stop with signature. | `src/pages/logistica/repartos/chofer/` |
| UC-13 | Live GPS tracking | Planner views map; driver sends location on route. | `src/pages/logistica/seguimiento/` |

**Other languages:** [Español](../../es/specs/casos-de-uso.md) · [Português](../../pt-br/specs/casos-de-uso.md)

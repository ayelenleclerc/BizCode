# Use cases (MVP)

| Field | Value |
|-------|--------|
| Document version | 0.1 |
| Revision | 1 |
| Date | 2026-03-31 |
| Product reference | BizCode 0.1.0 MVP |

**Actor:** Operator (business user). **System:** BizCode desktop app (React UI + Express API + PostgreSQL).

| ID | Name | Main flow (summary) | Evidence |
|----|------|----------------------|----------|
| UC-01 | Manage customers | List/search → open form → create or edit → save. | `src/pages/clientes/` |
| UC-02 | Manage products | List/search → open form → create or edit → select rubro → save. | `src/pages/articulos/` |
| UC-03 | Manage invoices | List → new invoice → header + line items → save. | `src/pages/facturacion/` |
| UC-04 | Change appearance | Toggle light/dark theme; persisted locally. | `Layout.tsx`, `theming.md` |
| UC-05 | Change language | Switch UI language among supported locales. | `src/i18n/` |

**Other languages:** [Español](../../es/specs/use-cases.md) · [Português](../../pt-br/specs/use-cases.md)

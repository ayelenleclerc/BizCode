# Manual test cases (MVP)

| Field | Value |
|-------|--------|
| Document version | 0.2 |
| Revision | 2 |
| Date | 2026-05-15 |
| Product reference | BizCode 0.1.0 MVP |

Execute in a session record using [certificacion-iso/records-template.md](../certificacion-iso/records-template.md) (manual test session template).

| TC ID | Objective | Preconditions | Steps (summary) | Expected result | Evidence |
|-------|-------------|----------------|-----------------|-----------------|----------|
| TC-001 | Customer search | Data exists or create empty | Open Customers → use search (F2) | List filters as implemented | `clientes/index` |
| TC-002 | Customer invalid CUIT | New customer form | Enter invalid CUIT | Validation error shown | `ClienteForm` + validators |
| TC-003 | Product list | At least one product | Open Products | Table visible | `articulos/index` |
| TC-004 | Invoice line add | New invoice form | Ins / add line | New row appears | `NuevaFacturaForm` |
| TC-005 | Invoice save disabled | New invoice | No lines | Save disabled | UI logic |
| TC-006 | Theme toggle | Any screen | Toggle theme in sidebar | `<html>` class and `localStorage` per THEMING | `Layout` |
| TC-007 | Language switch | Any screen | Switch es → en → pt-BR | UI strings change; `check:i18n` passes in CI | i18n |
| TC-008 | API health | Sidecar running | `GET /api/health` | JSON `{ status: ok }` | `createApp.ts` |
| TC-009 | Contract test | CI | `npm run test` includes API contract | Passes | `tests/api/contract.test.ts` |
| TC-010 | A11y smoke | CI | `App.a11y.test.tsx` | Passes jest-axe | `src/App.a11y.test.tsx` |
| TC-011 | Register payment | Customer active; `sales.create` | Cobros → Nuevo cobro → save | Payment in table; balance updated | `cobros/`, `tests/api/cobros.test.ts` |
| TC-012 | Filter payments | At least one cobro | Set cliente id + dates → Filtrar | List matches filters | `cobros/index` |
| TC-013 | AR aging | `reports.financial.read` | Open Finanzas | Buckets visible | `finanzas/index` |
| TC-014 | Report CSV export | Reportes tab with data | Export CSV control | File download | `reportes/index` |
| TC-015 | Delivery order list | `logistics.read` | Open Logística → filter date | Orders table loads | `logistica/index` |

**Other languages:** [Español](../../es/specs/casos-de-prueba-manual.md) · [Português](../../pt-br/specs/casos-de-teste-manual.md)

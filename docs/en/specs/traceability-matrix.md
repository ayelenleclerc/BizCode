# Traceability matrix (MVP)

| Field | Value |
|-------|--------|
| Document version | 0.1 |
| Revision | 1 |
| Date | 2026-03-31 |
| Product reference | BizCode 0.1.0 MVP |

Maps **functional requirements** to **use cases**, **user stories**, **manual test cases**, and **implementation / doc evidence**. Empty cells mean “not applicable” for this MVP slice.

| FR | UC | US | TC | Code / doc evidence |
|----|----|----|----|---------------------|
| FR-001 | UC-01 | US-01 | TC-001 | `src/pages/clientes/`, `GET /api/clientes` |
| FR-002 | UC-01 | US-01 | TC-002 | `POST /api/clientes`, `ClienteForm.tsx` |
| FR-003 | UC-01 | US-01 | TC-001 | `PUT /api/clientes/:id` |
| FR-004 | UC-02 | US-02 | TC-003 | `src/pages/articulos/`, `GET /api/articulos` |
| FR-005 | UC-02 | US-02 | TC-003 | `ArticuloForm.tsx`, `GET /api/rubros` |
| FR-006 | — | — | — | `POST /api/rubros` (API only; no UI page evidenced) |
| FR-007 | UC-03 | US-03 | TC-004, TC-005 | `facturacion/`, `GET/POST /api/facturas`, `GET /api/formas-pago` |
| FR-008 | UC-04 | US-04 | TC-006 | `theming.md`, `Layout.tsx` |
| FR-009 | UC-05 | US-05 | TC-007 | `src/i18n/`, locales |
| FR-010 | — | — | TC-008 | `GET /api/health` |

**NFR traceability (summary):** NFR-001 ↔ [accessibility.md](../accessibility.md) + `App.a11y.test.tsx`; NFR-002 ↔ [i18n-strategy.md](../i18n-strategy.md) + `check:i18n`; NFR-005 ↔ [testing-strategy.md](../quality/testing-strategy.md) + `vitest.config.ts` + contract tests.

**Other languages:** [Español](../../es/specs/traceability-matrix.md) · [Português](../../pt-br/specs/traceability-matrix.md)

# Traceability matrix (MVP)

| Field | Value |
|-------|--------|
| Document version | 0.2 |
| Revision | 2 |
| Date | 2026-05-15 |
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
| FR-011 | UC-06 | US-06 | TC-011, TC-012 | `src/pages/cobros/`, `tests/api/cobros.test.ts` |
| FR-012 | UC-06 | US-06 | TC-011 | `POST /api/cobros`, `CobroService.ts` |
| FR-013 | UC-07 | US-07 | TC-013 | `src/pages/finanzas/`, `GET /api/reportes/aging` |
| FR-014 | UC-08 | US-08 | TC-014 | `src/pages/reportes/`, `registerReportesRoutes.ts` |
| FR-015 | UC-09 | US-09 | TC-015 | `src/pages/logistica/`, `registerOrdenesEntregaRoutes.ts` |
| FR-016 | UC-10 | US-10 | TC-016 | `src/pages/logistica/picking/`, picking API |
| FR-017 | UC-11 | US-11 | TC-017 | `src/pages/logistica/repartos/`, `registerRepartosRoutes.ts` |
| FR-018 | UC-12 | US-12 | TC-018 | `src/pages/logistica/repartos/chofer/`, POD API |
| FR-019 | UC-13 | US-13 | TC-019 | `src/pages/logistica/seguimiento/`, `RepartoUbicacionService.ts` |
| FR-020 | UC-14 | US-14 | TC-020 | `src/pages/logistica/LogisticaReportesPanel.tsx`, `GET /api/logistica/kpis`, `reporte-choferes`, `reporte-zonas`, `tests/api/logistica-reportes.test.ts` |
| FR-021 | — | — | — | `PUT /api/facturas/{id}/void`, `GET /api/notas-credito`, `ListadoFacturas.tsx`, `src/pages/finanzas/index.tsx`, [ADR-0012](../adr/ADR-0012-invoice-void-credit-note.md), `tests/api/notas-credito.test.ts`, `tests/api/facturas-void.test.ts` |

**NFR traceability (summary):** NFR-001 ↔ [accessibility.md](../accessibility.md) + `App.a11y.test.tsx`; NFR-002 ↔ [i18n-strategy.md](../i18n-strategy.md) + `check:i18n`; NFR-005 ↔ [testing-strategy.md](../quality/testing-strategy.md) + `vitest.config.ts` + contract tests.

**Other languages:** [Español](../../es/specs/matriz-trazabilidad.md) · [Português](../../pt-br/specs/matriz-rastreabilidade.md)

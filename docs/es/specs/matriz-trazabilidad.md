# Matriz de trazabilidad (MVP)

| Campo | Valor |
|-------|--------|
| Versión del documento | 0.2 |
| Revisión | 2 |
| Fecha | 2026-05-15 |
| Referencia al producto | BizCode 0.1.0 MVP |

Relaciona **requisitos funcionales** con **casos de uso**, **historias de usuario**, **casos de prueba manual** y **evidencia de implementación / documentación**. Las celdas vacías indican «no aplica» en este recorte del MVP.

| RF | CU | HU | TC | Evidencia código / doc |
|----|----|----|----|------------------------|
| RF-001 | CU-01 | HU-01 | TC-001 | `src/pages/clientes/`, `GET /api/clientes` |
| RF-002 | CU-01 | HU-01 | TC-002 | `POST /api/clientes`, `ClienteForm.tsx` |
| RF-003 | CU-01 | HU-01 | TC-001 | `PUT /api/clientes/:id` |
| RF-004 | CU-02 | HU-02 | TC-003 | `src/pages/articulos/`, `GET /api/articulos` |
| RF-005 | CU-02 | HU-02 | TC-003 | `ArticuloForm.tsx`, `GET /api/rubros` |
| RF-006 | — | — | — | `POST /api/rubros` (solo API; sin página UI evidenciada) |
| RF-007 | CU-03 | HU-03 | TC-004, TC-005 | `facturacion/`, `GET/POST /api/facturas`, `GET /api/formas-pago` |
| RF-008 | CU-04 | HU-04 | TC-006 | `temas-interfaz.md`, `Layout.tsx` |
| RF-009 | CU-05 | HU-05 | TC-007 | `src/i18n/`, locales |
| RF-010 | — | — | TC-008 | `GET /api/health` |
| RF-011 | CU-06 | HU-06 | TC-011, TC-012 | `src/pages/cobros/`, `tests/api/cobros.test.ts` |
| RF-012 | CU-06 | HU-06 | TC-011 | `POST /api/cobros`, `CobroService.ts` |
| RF-013 | CU-07 | HU-07 | TC-013 | `src/pages/finanzas/`, `GET /api/reportes/aging` |
| RF-014 | CU-08 | HU-08 | TC-014 | `src/pages/reportes/`, `registerReportesRoutes.ts` |
| RF-015 | CU-09 | HU-09 | TC-015 | `src/pages/logistica/`, `registerOrdenesEntregaRoutes.ts` |

**RNF (resumen):** RNF-001 ↔ [accesibilidad.md](../accesibilidad.md) + `App.a11y.test.tsx`; RNF-002 ↔ [estrategia-i18n.md](../estrategia-i18n.md) + `check:i18n`; RNF-005 ↔ [estrategia-pruebas.md](../quality/estrategia-pruebas.md) + `vitest.config.ts` + pruebas de contrato.

**Otros idiomas:** [English](../../en/specs/traceability-matrix.md) · [Português](../../pt-br/specs/matriz-rastreabilidade.md)

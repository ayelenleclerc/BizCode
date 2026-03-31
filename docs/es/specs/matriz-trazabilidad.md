# Matriz de trazabilidad (MVP)

| Campo | Valor |
|-------|--------|
| Versión del documento | 0.1 |
| Revisión | 1 |
| Fecha | 2026-03-31 |
| Referencia al producto | BizCode 0.1.0 MVP |

| RF | CU | HU | CP | Evidencia código / doc |
|----|----|----|----|------------------------|
| RF-001 | CU-01 | HU-01 | TC-001 | `clientes/`, `GET /api/clientes` |
| RF-002 | CU-01 | HU-01 | TC-002 | `POST /api/clientes` |
| RF-003 | CU-01 | HU-01 | TC-001 | `PUT /api/clientes/:id` |
| RF-004 | CU-02 | HU-02 | TC-003 | `articulos/`, `GET /api/articulos` |
| RF-005 | CU-02 | HU-02 | TC-003 | `ArticuloForm`, `GET /api/rubros` |
| RF-006 | — | — | — | Solo API `POST /api/rubros` |
| RF-007 | CU-03 | HU-03 | TC-004, TC-005 | `facturacion/`, facturas |
| RF-008 | CU-04 | HU-04 | TC-006 | `temas-interfaz.md`, `Layout` |
| RF-009 | CU-05 | HU-05 | TC-007 | `src/i18n/` |
| RF-010 | — | — | TC-008 | `GET /api/health` |

**RNF (resumen):** RNF-001 ↔ [accesibilidad.md](../accesibilidad.md) + `App.a11y.test.tsx`; RNF-002 ↔ [estrategia-i18n.md](../estrategia-i18n.md); RNF-005 ↔ [estrategia-pruebas.md](../quality/estrategia-pruebas.md) + contrato.

**Otros idiomas:** [English](../../en/specs/traceability-matrix.md) · [Português](../../pt-br/specs/traceability-matrix.md)

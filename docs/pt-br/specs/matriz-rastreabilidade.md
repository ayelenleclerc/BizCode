# Matriz de rastreabilidade (MVP)

| Campo | Valor |
|-------|--------|
| Versão do documento | 0.2 |
| Revisão | 2 |
| Data | 2026-05-15 |
| Referência ao produto | BizCode 0.1.0 MVP |

Relaciona **requisitos funcionais** a **casos de uso**, **histórias de usuário**, **casos de teste manual** e **evidência de implementação / documentação**. Células vazias indicam «não aplicável» neste recorte do MVP.

| RF | CU | HU | TC | Evidência código / doc |
|----|----|----|----|------------------------|
| RF-001 | CU-01 | HU-01 | TC-001 | `src/pages/clientes/`, `GET /api/clientes` |
| RF-002 | CU-01 | HU-01 | TC-002 | `POST /api/clientes`, `ClienteForm.tsx` |
| RF-003 | CU-01 | HU-01 | TC-001 | `PUT /api/clientes/:id` |
| RF-004 | CU-02 | HU-02 | TC-003 | `src/pages/articulos/`, `GET /api/articulos` |
| RF-005 | CU-02 | HU-02 | TC-003 | `ArticuloForm.tsx`, `GET /api/rubros` |
| RF-006 | — | — | — | `POST /api/rubros` (somente API; sem página UI evidenciada) |
| RF-007 | CU-03 | HU-03 | TC-004, TC-005 | `facturacion/`, `GET/POST /api/facturas`, `GET /api/formas-pago` |
| RF-008 | CU-04 | HU-04 | TC-006 | `temas-interface.md`, `Layout.tsx` |
| RF-009 | CU-05 | HU-05 | TC-007 | `src/i18n/`, locales |
| RF-010 | — | — | TC-008 | `GET /api/health` |
| RF-011 | CU-06 | HU-06 | TC-011, TC-012 | `src/pages/cobros/`, `tests/api/cobros.test.ts` |
| RF-012 | CU-06 | HU-06 | TC-011 | `POST /api/cobros`, `CobroService.ts` |
| RF-013 | CU-07 | HU-07 | TC-013 | `src/pages/finanzas/`, `GET /api/reportes/aging` |
| RF-014 | CU-08 | HU-08 | TC-014 | `src/pages/reportes/`, `registerReportesRoutes.ts` |
| RF-015 | CU-09 | HU-09 | TC-015 | `src/pages/logistica/`, `registerOrdenesEntregaRoutes.ts` |
| RF-016 | CU-10 | HU-10 | TC-016 | `src/pages/logistica/picking/`, API picking |
| RF-017 | CU-11 | HU-11 | TC-017 | `src/pages/logistica/repartos/`, `registerRepartosRoutes.ts` |
| RF-018 | CU-12 | HU-12 | TC-018 | `src/pages/logistica/repartos/chofer/`, API POD |
| RF-019 | CU-13 | HU-13 | TC-019 | `src/pages/logistica/seguimiento/`, `RepartoUbicacionService.ts` |

**RNF (resumo):** RNF-001 ↔ [acessibilidade.md](../acessibilidade.md) + `App.a11y.test.tsx`; RNF-002 ↔ [estrategia-i18n.md](../estrategia-i18n.md) + `check:i18n`; RNF-005 ↔ [estrategia-testes.md](../quality/estrategia-testes.md) + `vitest.config.ts` + testes de contrato.

**Outros idiomas:** [English](../../en/specs/traceability-matrix.md) · [Español](../../es/specs/matriz-trazabilidad.md)

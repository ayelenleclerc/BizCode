# Matriz de rastreabilidade (MVP)

| Campo | Valor |
|-------|--------|
| Versão do documento | 0.1 |
| Revisão | 1 |
| Data | 2026-03-31 |
| Referência ao produto | BizCode 0.1.0 MVP |

| RF | CU | HU | CT | Evidência |
|----|----|----|----|-----------|
| RF-001 | CU-01 | HU-01 | TC-001 | `clientes/`, `GET /api/clientes` |
| RF-002 | CU-01 | HU-01 | TC-002 | `POST /api/clientes` |
| RF-003 | CU-01 | HU-01 | TC-001 | `PUT /api/clientes/:id` |
| RF-004 | CU-02 | HU-02 | TC-003 | `articulos/` |
| RF-005 | CU-02 | HU-02 | TC-003 | `ArticuloForm`, `GET /api/rubros` |
| RF-006 | — | — | — | Apenas API `POST /api/rubros` |
| RF-007 | CU-03 | HU-03 | TC-004, TC-005 | `facturacion/` |
| RF-008 | CU-04 | HU-04 | TC-006 | `temas-interface.md`, `Layout` |
| RF-009 | CU-05 | HU-05 | TC-007 | `src/i18n/` |
| RF-010 | — | — | TC-008 | `GET /api/health` |

**RNF:** RNF-001 ↔ [acessibilidade.md](../acessibilidade.md); RNF-002 ↔ [estrategia-i18n.md](../estrategia-i18n.md); RNF-005 ↔ [estrategia-testes.md](../quality/estrategia-testes.md) + contrato.

**Outros idiomas:** [English](../../en/specs/traceability-matrix.md) · [Español](../../es/specs/traceability-matrix.md)

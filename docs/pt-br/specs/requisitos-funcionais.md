# Requisitos funcionais (MVP)

| Campo | Valor |
|-------|--------|
| Versão do documento | 0.1 |
| Revisão | 1 |
| Data | 2026-03-31 |
| Referência ao produto | BizCode 0.1.0 MVP |

| ID | Requisito | Evidência |
|----|-----------|-----------|
| RF-001 | Listar/filtrar clientes na UI; busca com `q` na API. | `src/pages/clientes/`, `GET /api/clientes` |
| RF-002 | Criar cliente via POST. | `ClienteForm.tsx`, `POST /api/clientes` |
| RF-003 | Ver/atualizar cliente. | `GET/PUT /api/clientes/:id` |
| RF-004 | Listar/filtrar produtos. | `src/pages/articulos/`, `GET /api/articulos` |
| RF-005 | Criar/atualizar produto; selecionar **rubro** da lista. | `ArticuloForm.tsx`, `GET /api/rubros`, `POST/PUT /api/articulos` |
| RF-006 | API com `POST /api/rubros`; **sem** tela dedicada de rubros em `src/pages/` — só seleção no produto. | `createApp.ts`, `api.ts` |
| RF-007 | Listar facturas e criar com ítens; **formas de pagamento** no formulário. | `src/pages/facturacion/`, `GET /api/formas-pago`, `GET/POST /api/facturas` |
| RF-008 | Persistir tema em `localStorage` e classe em `<html>`. | `temas-interface.md`, `Layout.tsx`, `index.html` |
| RF-009 | Idioma de UI `es`/`en`/`pt-BR` com paridade `check:i18n`. | [estrategia-i18n.md](../estrategia-i18n.md), `src/locales/` |
| RF-010 | `GET /api/health`. | `createApp.ts`, OpenAPI |

**Outros idiomas:** [English](../../en/specs/functional-requirements.md) · [Español](../../es/specs/functional-requirements.md)

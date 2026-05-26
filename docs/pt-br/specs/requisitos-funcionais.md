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
| RF-011 | Registrar cobranças; listar e filtrar por cliente e datas. | `src/pages/cobros/`, `POST/GET /api/cobros` |
| RF-012 | Em `POST /api/cobros`, atualizar `Cliente.balance` e `Cliente.score` conforme OpenAPI. | `CobroService.ts`, OpenAPI |
| RF-013 | Aging de saldos e extrato por cliente. | `src/pages/finanzas/`, `GET /api/reportes/aging` |
| RF-014 | Relatórios operacionais/financeiros com exportação CSV opcional. | `src/pages/reportes/`, `/api/reportes/*` |
| RF-015 | Ordens de entrega: listar, criar e atualizar estado (planejador/motorista conforme RBAC). | `src/pages/logistica/`, `/api/ordenes-entrega` |
| RF-016 | Picking no depósito: fila, iniciar picking, checklist, marcar pronto (`logistics.picking`). | `src/pages/logistica/picking/`, `POST .../iniciar-picking`, `POST .../lista` |
| RF-017 | Repartos: planejar, iniciar e fechar; sequência de OE em `ready`. | `src/pages/logistica/repartos/`, `GET/POST /api/repartos` |
| RF-018 | POD em itens de reparto: wizard motorista; comprovante no back-office. | `src/pages/logistica/repartos/chofer/`, `PUT .../items/{itemId}`, `GET .../pod` |
| RF-019 | Rastreamento GPS ao vivo: mapa do planejador; motorista envia localização a cada 2 min (`logistics.gps`). | `src/pages/logistica/seguimiento/`, `GET /api/repartos/activos`, `POST .../ubicacion` |

**Outros idiomas:** [English](../../en/specs/functional-requirements.md) · [Español](../../es/specs/functional-requirements.md)

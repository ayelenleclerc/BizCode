# Casos de teste manual (MVP)

| Campo | Valor |
|-------|--------|
| Versão do documento | 0.1 |
| Revisão | 1 |
| Data | 2026-03-31 |
| Referência ao produto | BizCode 0.1.0 MVP |

Registrar sessão com [certificacion-iso/modelos-registros.md](../certificacion-iso/modelos-registros.md).

| ID | Objetivo | Passos (resumo) | Resultado esperado | Evidência |
|----|----------|-----------------|---------------------|-----------|
| TC-001 | Busca clientes | Clientes → buscar | Lista filtrada | `clientes/index` |
| TC-002 | CUIT inválido | Formulário | Erro | Validadores |
| TC-003 | Lista produtos | Abrir Produtos | Tabela | `articulos/index` |
| TC-004 | Linha na nota | Nova nota → linha | Nova linha | `NuevaFacturaForm` |
| TC-005 | Salvar bloqueado | Sem ítems | Salvar desabilitado | UI |
| TC-006 | Tema | Alternar | `localStorage` / `<html>` | `temas-interface.md` |
| TC-007 | Idioma | es→en→pt-BR | Textos | i18n |
| TC-008 | Health | `GET /api/health` | JSON ok | `createApp.ts` |
| TC-009 | Contrato API | CI | Passa | `tests/api/contract.test.ts` |
| TC-010 | A11y | CI smoke | jest-axe | `App.a11y.test.tsx` |

**Outros idiomas:** [English](../../en/specs/manual-test-cases.md) · [Español](../../es/specs/manual-test-cases.md)

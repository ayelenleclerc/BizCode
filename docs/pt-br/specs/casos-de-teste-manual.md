# Casos de teste manual (MVP)

| Campo | Valor |
|-------|--------|
| Versão do documento | 0.2 |
| Revisão | 2 |
| Data | 2026-05-15 |
| Referência ao produto | BizCode 0.1.0 MVP |

Executar em registro de sessão usando [certificacion-iso/modelos-registros.md](../certificacion-iso/modelos-registros.md) (modelo de sessão de teste manual).

| ID TC | Objetivo | Pré-condições | Passos (resumo) | Resultado esperado | Evidência |
|-------|----------|---------------|-----------------|---------------------|-----------|
| TC-001 | Busca de clientes | Dados existentes ou lista vazia | Abrir Clientes → buscar (F2) | Lista filtrada conforme implementação | `clientes/index` |
| TC-002 | CUIT inválido | Formulário cliente novo | Informar CUIT inválido | Mensagem de validação visível | `ClienteForm` + validadores |
| TC-003 | Lista de produtos | Ao menos um produto | Abrir Produtos | Tabela visível | `articulos/index` |
| TC-004 | Linha na fatura | Formulário fatura nova | Ins / adicionar linha | Nova linha visível | `NuevaFacturaForm` |
| TC-005 | Salvar desabilitado | Fatura nova | Sem itens | Salvar desabilitado | Lógica UI |
| TC-006 | Alternar tema | Qualquer tela | Alternar tema na barra lateral | Classe `<html>` e `localStorage` conforme temas | `Layout` |
| TC-007 | Troca de idioma | Qualquer tela | Trocar es → en → pt-BR | Textos da UI mudam; `check:i18n` passa no CI | i18n |
| TC-008 | Saúde da API | Sidecar em execução | `GET /api/health` | JSON `{ status: ok }` | `createApp.ts` |
| TC-009 | Teste de contrato | CI | `npm run test` inclui contrato API | Passa | `tests/api/contract.test.ts` |
| TC-010 | Fumaça a11y | CI | `App.a11y.test.tsx` | Passa jest-axe | `src/App.a11y.test.tsx` |
| TC-011 | Registrar cobrança | Cliente ativo; `sales.create` | Cobranças → Nova cobrança → salvar | Cobrança na tabela; saldo atualizado | `cobros/`, `tests/api/cobros.test.ts` |
| TC-012 | Filtrar cobranças | Ao menos uma cobrança | Id cliente + datas → Filtrar | Lista coincide com filtros | `cobros/index` |
| TC-013 | Aging contas a receber | `reports.financial.read` | Abrir Finanças | Faixas visíveis | `finanzas/index` |
| TC-014 | Exportar CSV relatório | Aba com dados | Controle Exportar CSV | Download do arquivo | `reportes/index` |
| TC-015 | Lista ordens de entrega | `logistics.read` | Abrir Logística → filtrar data | Tabela de ordens carrega | `logistica/index` |

**Outros idiomas:** [English](../../en/specs/manual-test-cases.md) · [Español](../../es/specs/casos-de-prueba-manual.md)

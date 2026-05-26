# Casos de uso (MVP)

| Campo | Valor |
|-------|--------|
| Versão do documento | 0.2 |
| Revisão | 2 |
| Data | 2026-05-15 |
| Referência ao produto | BizCode 0.1.0 MVP |

**Ator:** Operador (usuário de negócio). **Sistema:** BizCode app desktop (UI React + API Express + PostgreSQL).

| ID | Nome | Fluxo principal (resumo) | Evidência |
|----|------|--------------------------|-----------|
| CU-01 | Gerir clientes | Listar/buscar → abrir formulário → criar ou editar → salvar. | `src/pages/clientes/` |
| CU-02 | Gerir produtos | Listar/buscar → abrir formulário → criar ou editar → selecionar rubro → salvar. | `src/pages/articulos/` |
| CU-03 | Gerir faturas | Lista → nova fatura → cabeçalho + itens → salvar. | `src/pages/facturacion/` |
| CU-04 | Alterar aparência | Alternar tema claro/escuro; persistência local. | `Layout.tsx`, `temas-interface.md` |
| CU-05 | Alterar idioma | Trocar o idioma da UI entre os locales suportados. | `src/i18n/` |
| CU-06 | Registrar cobranças | Listar/filtrar pagamentos → registrar cobrança do cliente → filtros opcionais. | `src/pages/cobros/` |
| CU-07 | Revisar contas a receber e extrato | Ver faixas de aging → carregar extrato por id do cliente. | `src/pages/finanzas/` |
| CU-08 | Executar relatórios operacionais | Escolher período/aba → ver vendas, estoque crítico ou cobranças; exportar CSV. | `src/pages/reportes/` |
| CU-09 | Gerir ordens de entrega | Filtrar ordens → criar ou atualizar estado (planejador/motorista conforme RBAC). | `src/pages/logistica/` |
| CU-10 | Picking no depósito | Retirar OE da fila → checklist → marcar pronto. | `src/pages/logistica/picking/` |
| CU-11 | Planejar reparto | Selecionar OE prontas → criar reparto → iniciar → fechar. | `src/pages/logistica/repartos/` |
| CU-12 | POD motorista | Confirmar entrega por parada com assinatura. | `src/pages/logistica/repartos/chofer/` |
| CU-13 | Rastreamento GPS | Planejador vê mapa; motorista envia localização na rota. | `src/pages/logistica/seguimiento/` |

**Outros idiomas:** [English](../../en/specs/use-cases.md) · [Español](../../es/specs/casos-de-uso.md)

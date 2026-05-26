# Manual do usuário: Finanças

## Acesso

Clique em **Finanças** na barra lateral.

É necessário o permissão **`reports.financial.read`**. Sem ela, a página exibe mensagem de acesso negado.

## Aging de contas a receber

Ao carregar, a página consulta **`GET /api/reportes/aging`** e mostra faixas (rótulos, quantidade de faturas, totais). É possível ordenar por colunas quando a UI implementar.

## Extrato do cliente

1. Informe o **id do cliente** (inteiro positivo).
2. Execute a ação para carregar o extrato (`GET /api/reportes/cuenta-corriente/:clienteId`).
3. Revise as linhas com data, tipo, referência, débito, crédito e saldo acumulado.

Se o cliente não existir, a API retorna 404.

## Faturas vencidas e lembretes

A mesma página **Finanças** inclui uma seção de faturas vencidas (`GET /api/cobranzas/vencidas`):

1. Opcionalmente filtre por **dias mínimos em atraso**.
2. Revise a tabela (cliente, total, data, dias em atraso).
3. Use **Enviar lembrete** em uma linha para acionar `POST /api/cobranzas/recordatorios` (permissão `reports.financial.read`). Não é enviado mais de um lembrete por fatura no mesmo dia.

A configuração do job automático (dias de carência, fuso IANA, horário comercial) está em **Configurações → Empresa**. O job operacional `npm run cobranzas:recordatorios` percorre todos os tenants com parâmetros de empresa e envia às **08:00 horário local** dentro da janela configurada (veja [ciclo CI/CD](../quality/ciclo-ci-cd.md)).

## Referência API

[`docs/api/openapi.yaml`](../../api/openapi.yaml) — rotas `/api/reportes/aging` e `/api/reportes/cuenta-corriente/{clienteId}`.

## Notas de crédito (`billing.credit_notes`)

Com o módulo **`billing.credit_notes`** habilitado, a página inclui a seção **Notas de crédito**: filtre **de** / **até** (em `createdAt` da nota) e opcionalmente por **ID do cliente** (cliente da nota de origem). Os dados vêm de `GET /api/notas-credito` (exige **`reports.financial.read`** ou **`reports.operational.read`**; esta tela só é alcançada com acesso aos relatórios financeiros). Veja [ADR-0012](../adr/ADR-0012-anulacao-fatura-nota-credito.md) e o manual de faturamento para cancelamento.

## Livro IVA Vendas — Fase 1 (`finance.ledger`, #147)

Com o módulo **`finance.ledger`**, a seção **Contabilidade — Livro IVA Vendas** permite escolher o **período**, ver **pré-visualização** e baixar **ARCA (ZIP)** ou **Excel** (revisão interna). **Livro IVA Compras** fora de escopo ([ADR-0013](../adr/ADR-0013-libro-iva-ventas-fase1.md)).

**Outros idiomas:** [English](../../en/user/manual-finance.md) · [Español](../../es/user/manual-finanzas.md)

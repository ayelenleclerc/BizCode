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

## Referência API

[`docs/api/openapi.yaml`](../../api/openapi.yaml) — rotas `/api/reportes/aging` e `/api/reportes/cuenta-corriente/{clienteId}`.

**Outros idiomas:** [English](../../en/user/manual-finance.md) · [Español](../../es/user/manual-finanzas.md)

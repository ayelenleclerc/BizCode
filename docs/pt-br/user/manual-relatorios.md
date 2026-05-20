# Manual do usuário: Relatórios

## Acesso

Clique em **Relatórios** na barra lateral para relatórios tabulares.

Para **gráficos** (tendência de vendas, top produtos, vendas por vendedor), abra **Início** → aba **Análise**. Exige `reports.operational.read` e módulo **`analytics.advanced`** (depende de `analytics.dashboard`).

As abas dependem das permissões:

| Aba | Permissão |
|-----|-----------|
| Vendas | `reports.operational.read` |
| Estoque crítico | `reports.operational.read` |
| Cobranças | `reports.financial.read` |

## Período e agrupamento

Em **Vendas** e **Cobranças**, escolha as datas **de** e **até** e um preset se a UI oferecer. Vendas aceita agrupamento (`dia` / `semana` / `mes`) conforme a API.

Use o controle para **carregar** os dados da aba ativa.

## Exportar CSV

Quando disponível, use **Exportar CSV** para baixar com `Accept: text/csv` em:

- `GET /api/reportes/ventas`
- `GET /api/reportes/stock-critico`
- `GET /api/reportes/cobranzas`
- `GET /api/dashboard/ventas-historico` (aba Análise em **Início**, `Accept: text/csv` para série por período)

## Análise do dashboard (Início)

1. Abra **Início** e selecione a aba **Análise**.
2. Defina **de** / **até**, **agrupar por** (`day` / `week` / `month`) e filtros opcionais de **vendedor** ou **zona**.
3. Use presets (**30** / **90** / **365** dias) e **Carregar dados**.
4. **Exportar CSV** baixa a série do período selecionado.

## Referência API

[`docs/api/openapi.yaml`](../../api/openapi.yaml) — tags `reportes` e `dashboard`.

**Outros idiomas:** [English](../../en/user/manual-reports.md) · [Español](../../es/user/manual-reportes.md)

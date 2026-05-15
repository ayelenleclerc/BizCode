# Manual do usuário: Relatórios

## Acesso

Clique em **Relatórios** na barra lateral.

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

## Referência API

[`docs/api/openapi.yaml`](../../api/openapi.yaml) — tag `reportes`.

**Outros idiomas:** [English](../../en/user/manual-reports.md) · [Español](../../es/user/manual-reportes.md)

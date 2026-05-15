# User Manual: Reports

## Access

Click **Reportes** in the left sidebar.

Tabs depend on permissions:

| Tab | Permission |
|-----|------------|
| Sales | `reports.operational.read` |
| Critical stock | `reports.operational.read` |
| Collections | `reports.financial.read` |

## Period and grouping

For **Sales** and **Collections**, choose **from** and **to** dates and a preset if offered. Sales supports grouping (`dia` / `semana` / `mes`) per API.

Click the control to **load** data for the active tab.

## Export CSV

When available, use **Export CSV** to download via `Accept: text/csv` on:

- `GET /api/reportes/ventas`
- `GET /api/reportes/stock-critico`
- `GET /api/reportes/cobranzas`

## API reference

[`docs/api/openapi.yaml`](../../api/openapi.yaml) — tag `reportes`.

**Other languages:** [Español](../../es/user/manual-reportes.md) · [Português](../../pt-br/user/manual-relatorios.md)

# User Manual: Reports

## Access

Click **Reportes** in the left sidebar for tabular operational and financial reports.

For **charts** (sales trend, top products, sales by seller), open **Inicio** → tab **Analytics**. Requires permission `reports.operational.read` and tenant module **`analytics.advanced`** (depends on `analytics.dashboard`).

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
- `GET /api/dashboard/ventas-historico` (Analytics tab on **Inicio**, `Accept: text/csv` for period series)

## Dashboard analytics (Inicio)

1. Open **Inicio** and select the **Analytics** tab.
2. Set **from** / **to**, **group by** (`day` / `week` / `month`), and optional **seller** or **delivery zone** filters.
3. Use presets (**30** / **90** / **365** days) then **Load data**.
4. **Export CSV** downloads the period series for the selected range.

## API reference

[`docs/api/openapi.yaml`](../../api/openapi.yaml) — tags `reportes` and `dashboard`.

**Other languages:** [Español](../../es/user/manual-reportes.md) · [Português](../../pt-br/user/manual-relatorios.md)

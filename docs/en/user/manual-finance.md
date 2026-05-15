# User Manual: Finance

## Access

Click **Finanzas** in the left sidebar.

Requires permission **`reports.financial.read`**. Without it, the page shows a forbidden message.

## AR aging

On load, the page fetches **`GET /api/reportes/aging`** and shows buckets (labels, invoice counts, totals). Click column headers to sort when implemented in the UI.

## Account statement

1. Enter a **customer id** (positive integer).
2. Run the action to load the statement (`GET /api/reportes/cuenta-corriente/:clienteId`).
3. Review lines with date, type, reference, debit, credit, and running balance.

If the customer does not exist, the API returns 404.

## API reference

[`docs/api/openapi.yaml`](../../api/openapi.yaml) — paths under `/api/reportes/aging` and `/api/reportes/cuenta-corriente/{clienteId}`.

**Other languages:** [Español](../../es/user/manual-finanzas.md) · [Português](../../pt-br/user/manual-financas.md)

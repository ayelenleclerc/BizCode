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

## Overdue invoices and reminders

The same **Finanzas** page includes an overdue invoices section (`GET /api/cobranzas/vencidas`):

1. Optionally filter by **minimum days past due**.
2. Review the table (customer, total, date, days overdue).
3. Use **Send reminder** on a row to call `POST /api/cobranzas/recordatorios` (permission `reports.financial.read`). At most one reminder per invoice is sent on the same calendar day.

Automatic job settings (grace days, IANA time zone, business hours) are under **Settings → Company**. The operational job `npm run cobranzas:recordatorios` iterates all tenants with company parameters and sends at **08:00 tenant local time** within the configured window (see [CI/CD cycle](../quality/ci-cd.md)).

## API reference

[`docs/api/openapi.yaml`](../../api/openapi.yaml) — paths under `/api/reportes/aging` and `/api/reportes/cuenta-corriente/{clienteId}`.

**Other languages:** [Español](../../es/user/manual-finanzas.md) · [Português](../../pt-br/user/manual-financas.md)

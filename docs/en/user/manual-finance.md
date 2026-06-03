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

## Credit notes (`billing.credit_notes`)

With module **`billing.credit_notes`** enabled, the page adds a **Credit notes** section: filter by **from** / **to** date (on credit note `createdAt`) and optionally by **customer ID** (originating invoice customer). Data comes from `GET /api/notas-credito` (requires **`reports.financial.read`** or **`reports.operational.read`**; this screen is only reachable with financial reports access). See [ADR-0012](../adr/ADR-0012-invoice-void-credit-note.md) and the invoicing manual for voiding invoices.

## VAT sales book — Fase 1 (`finance.ledger`, #147)

With module **`finance.ledger`** enabled, a **Accounting — VAT sales book** section appears:

1. Select **period** (month).
2. Review **preview** totals (CBTV / ALICUOTAS record counts, net and VAT by rate). ARCA official validator confirmation may still be pending (see [ADR-0013](../adr/ADR-0013-libro-iva-ventas-fase1.md)).
3. **Download ARCA (ZIP)** — `format=txt` → `CBTV.txt` + `ALICUOTAS.txt`.
4. **Download Excel** — internal review only.

## VAT purchases book (`finance.ledger`, #306)

With **`finance.ledger`**, an **Accounting — VAT purchases book** section appears below sales:

1. Register supplier vouchers via API `POST /api/comprobantes-compra` (fiscal header: tipo A/B/C, netos, IVA, supplier punto de venta and number).
2. Select **period** and review **preview** (CBTU / ALICUOTAS counts). See [ADR-0014](../adr/ADR-0014-libro-iva-compras.md).
3. **Download ARCA (ZIP)** — `CBTU.txt` + `ALICUOTAS.txt`.
4. **Download Excel** — internal review only.

Purchase orders (`OrdenCompra`) do **not** substitute for supplier fiscal vouchers.

**Other languages:** [Español](../../es/user/manual-finanzas.md) · [Português](../../pt-br/user/manual-financas.md)

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

1. Use the **Register purchase voucher** form (supplier, date, tipo A/B/C, point of sale, number, netos, IVA, total; optional CAE). The API `POST /api/comprobantes-compra` remains available for integrations.
2. **Import purchase document** (#277): upload a PDF or image (up to 20 files per batch), including **Take photo** on mobile (`capture="environment"`). Extraction tiers run locally in order: AFIP/ARCA QR (Tier 1), digital PDF text + YAML templates (Tier 2, bundled Argentina/Brazil/Uruguay), image OCR (`spa+eng+por`) + templates (Tier 3), optional Ollama when `OLLAMA_URL` is set (Tier 4, may return line items). The preview shows header fields and a **line-items table** with confidence indicators; map each line via **Search product**, **Create product** inline, or **Ignore line** (supplier catalog suggestions when available). If the issuer CUIT/CNPJ/RUT is unknown, use **Create supplier** inline. **Duplicate check:** `GET /api/documentos-compra/verificar-duplicado` warns before confirm when the same supplier already has an active voucher with the same tipo/prefijo/numero; confirm is blocked until resolved. Original files are stored on the local filesystem (`DOCUMENTOS_COMPRA_STORAGE_PATH`) — desktop-first deployment per [PROD-VISION-001](../quality/product-vision-and-deployment.md); S3 is not used in this release. **Stock on delivery notes (remitos)** is not updated automatically; line items are stored as a snapshot in `datosExtraidos` only (follow-up issue). Review the queue, then confirm to create `ComprobanteCompra`. APIs: `POST /api/documentos-compra/procesar`, `POST /api/documentos-compra/procesar-lote`, `GET /api/documentos-compra/cola`, `GET /api/documentos-compra/verificar-duplicado`, `POST /api/documentos-compra/confirmar`. Tenant custom YAML templates: list/save in the **Extraction templates** section or `GET`/`POST /api/documentos-compra/templates` (`settings.fiscal.manage`).
3. Select **period** and review **preview** (CBTU / ALICUOTAS counts). See [ADR-0014](../adr/ADR-0014-libro-iva-compras.md).
3. **Download ARCA (ZIP)** — `CBTU.txt` + `ALICUOTAS.txt`.
4. **Download Excel** — internal review only.

Purchase orders (`OrdenCompra`) do **not** substitute for supplier fiscal vouchers.

## Withholdings and perceptions (`finance.retenciones`, #228)

Configure tenant regimes and agent flags under **Settings → Company → Withholdings and perceptions** (`settings.fiscal.manage`). APIs: `GET/POST/PUT /api/fiscal/regimenes`, `GET/PUT /api/fiscal/config-retenciones`, `GET /api/fiscal/retenciones` (applied history), `GET /api/fiscal/retenciones/preview` (`entidadTipo=proveedor` #276; `entidadTipo=cliente` with `contexto=factura` for perceptions on `POST /api/facturas` or `contexto=cobro` for withholdings on `POST /api/cobros` #229); `GET /api/cobros/{id}/retenciones`. **Delivery notes (#230):** module `fiscal.remito`; `GET/POST /api/remitos`, lifecycle endpoints, `GET /api/remitos/{id}/pdf`; create from `POST /api/pedidos/{id}/remito` or `POST /api/facturas/{id}/remito`. Remito is documentary; stock still decrements on invoice. e-Remito AFIP not implemented.

**Checks (#231):** module `fiscal.cheques`; portfolio on **Finance** (`GET /api/cheques`, `GET /api/cheques/resumen`, transition endpoints). Register on collection (`chequeNuevo` on `POST /api/cobros`) or endorse on supplier payment (`chequeId` on `POST /api/proveedores/{id}/pagos` with `cheque`/`echeq`). Due-soon alerts via `POST /api/cheques/alertas/run`; rejection notifies `cheque_rechazado`. No bank reconciliation or automatic ECHEQ status in this release.

Customer/supplier VAT condition uses existing `condIva` on master records; AFIP registry lookup (#192) is not implemented in this release.

**Other languages:** [Español](../../es/user/manual-finanzas.md) · [Português](../../pt-br/user/manual-financas.md)

# User Manual: Finance

## Access

Click **Finanzas** in the left sidebar.

Requires permission **`reports.financial.read`**. Without it, the page shows a forbidden message.

## AR aging

On load, the page fetches **`GET /api/reportes/aging`** and shows buckets (labels, invoice counts, totals). Click column headers to sort when implemented in the UI.

## Account statement

### Customer record (`finance.ledger`, #232)

With module **`finance.ledger`** enabled, each customer record includes a **Account statement** tab:

- Current balance, credit limit, and balance trend chart.
- Paginated movement table (invoice, credit note, collection, withholding, bounced cheque, manual adjustment).
- AR aging buckets (`0-30`, `31-60`, `61-90`, `90+` days).
- Audited manual adjustment (`POST /api/clientes/{id}/cuenta-corriente/ajuste`, permission `sales.create`).
- PDF statement download and email send (`GET` / `POST .../estado-de-cuenta/...`).

Canonical API: `GET /api/clientes/{id}/cuenta-corriente`, `.../saldo`, `.../antiguedad`.

Movements are posted automatically on invoice issue, void via credit note, collection (gross amount; withholdings do not create a separate ledger line), and bounced cheques linked to collections.

### Quick lookup in Finance (compatibility)

1. Enter a **customer id** (positive integer).
2. Run the action to load the statement (`GET /api/reportes/cuenta-corriente/:clienteId` — delegates to the ledger and keeps the legacy debit/credit shape).
3. Review lines with date, type, reference, debit, credit, and running balance.

If the customer does not exist, the API returns 404.

## Overdue invoices and reminders

The same **Finanzas** page includes an overdue invoices section (`GET /api/cobranzas/vencidas`):

1. Optionally filter by **minimum days past due**.
2. Review the table (customer, total, date, days overdue).
3. Use **Send reminder** on a row to call `POST /api/cobranzas/recordatorios` (permission `reports.financial.read`). At most one reminder per invoice is sent on the same calendar day.

Automatic job settings (grace days, IANA time zone, business hours) are under **Settings → Company**. The operational job `npm run cobranzas:recordatorios` iterates all tenants with company parameters and sends at **08:00 tenant local time** within the configured window (see [CI/CD cycle](../quality/ci-cd.md)).

## Mercado Pago credentials (#174)

When the tenant has the **`mercadopago`** integration enabled (superadmin tenant config), configure credentials under **Settings → Company** (*MercadoPago* section):

- **Access Token**, **Public Key**, optional **Webhook Secret** (secrets encrypted at rest; never shown after save).
- **Sandbox mode** and **Integration active** toggles.
- **Verify credentials** calls `POST /api/configuracion/mercadopago/test` and shows the Mercado Pago account name.

Requires **`settings.business.manage`**.

## Mercado Libre OAuth (#183)

Base connection for the Mercado Libre marketplace connector. Enable tenant integration id **`meli`** (super-admin), then open **Settings → Company → Mercado Libre**:

1. Click **Connect with Mercado Libre** — BizCode returns an authorization URL (`GET /api/oauth/meli/authorize`) and the browser redirects to Mercado Libre.
2. After the seller authorizes, Mercado Libre calls `GET /api/oauth/meli/callback` (public). BizCode validates a signed CSRF `state`, exchanges the `code` for tokens, encrypts them in `MeliConfig` (same AES-GCM key as fiscal/MP secrets), and redirects to `/configuracion?meli=connected`.
3. Status (`GET /api/configuracion/meli`) shows nickname, site (`MLA`/`MLM`/…), connection date and token last4 — **never** access or refresh tokens.
4. **Disconnect** (`POST /api/oauth/meli/disconnect`) attempts remote revoke of the app on Mercado Libre, then deletes local tokens.
5. Platform env: `MELI_CLIENT_ID`, `MELI_CLIENT_SECRET`, optional `MELI_REDIRECT_URI` (defaults to `{API_PUBLIC_URL}/api/oauth/meli/callback`). Schedule `npm run meli:token-refresh` every 5 hours (access tokens expire ~6h).

Local OAuth smoke may require a public tunnel so Mercado Libre can reach the callback URL.

## Mercado Libre catalog sync (#184)

After OAuth is connected, sellers can opt-in per product from **Products → edit article → Mercado Libre**:

1. Add at least one product photo (ML requires pictures; BizCode sends absolute URLs based on `API_PUBLIC_URL` + `/uploads/articulos/...`).
2. Search an ML category (`GET /api/meli/categories/search?q=`) and publish (`PUT /api/articulos/{id}/meli`). BizCode stores `MeliPublicacion` and calls ML `POST /items` (or `PUT /items/{id}` when already linked).
3. Later price/description/active changes on the article push to ML immediately; pending/error rows are retried by `npm run meli:catalog-sync` every 5 minutes.
4. **Unlink** (`DELETE /api/articulos/{id}/meli`) pauses the remote listing when possible and deletes the local mapping.

## Mercado Libre stock sync (#185)

Bidirectional stock sync for articles with a linked `MeliPublicacion` (`meliItemId`):

1. **BizCode → ML:** after invoice stock decrement (`FacturaService`) or any `StockAjuste` (manual, purchase receipt, count, production, etc.), `MeliStockSyncService` patches only `{ available_quantity }` on ML. Stock ≤ 0 pauses the listing (`status: paused`); stock &gt; 0 and an active article reactivates it.
2. **ML → BizCode:** register MeLi notifications to `POST /api/webhooks/meli` (public). Platform env `MELI_WEBHOOK_SECRET` validates `x-signature` (HMAC-SHA256). Topic `orders_v2` re-fetches the order into `MeliOrden` (#186): on `paid`, applies `StockAjuste` `venta_meli` once and creates a Pedido `confirmed` with `origen=meli` (ML prices); on `cancelled`, cancels the Pedido if not invoiced and restores stock (`cancelacion_meli`); if already invoiced, managers get an alert (no automatic credit note). Topics `items` / `item_price` notify managers if the ML price diverges (no auto-correct).
3. **Reconcile:** schedule `npm run meli:stock-reconcile` hourly — BizCode stock is source of truth; mismatches are corrected by pushing to ML without duplicating stock movements.
4. Audit: `MeliWebhookEvent` logs notifications; duplicate `(topic, resource)` does **not** block order status transitions.

## Mercado Libre order import (#186)

Paid Mercado Libre sales become Pedidos for invoicing without double stock decrement:

1. Open **Orders → ML orders** (requires module `billing.orders` and integration `meli`).
2. Filter by pending / invoiced / cancelled; ML Full listings are marked as no own shipping (#193 tracking stays out of scope).
3. **Invoice** calls `POST /api/meli/ordenes/{meliOrderId}/facturar` — Factura A without customer CUIT returns `422` `CUIT_REQUIRED_FOR_FACTURA_A`. Completing CUIT on the customer clears the pending flag.
4. Invoice creation for `origen=meli` uses `skipStockDecrement` because stock already moved on the webhook.

## Tiendanube connector (#187)

Enable tenant integration id **`tiendanube`**, then use **Settings → Company → Tiendanube** for Partner Portal OAuth (long-lived token encrypted in `TiendanubeConfig`).

1. Opt-in per product: **Products → edit article → Tiendanube** (`PUT /api/articulos/{id}/tiendanube`) — syncs via `EcommerceSyncEngine` (`tn:catalog:…`).
2. Stock pushes after invoices/stock adjustments; quantity 0 pauses the TN product (`published: false`).
3. Webhook `POST /api/webhooks/tiendanube` verifies `x-linkedstore-hmac-sha256`; `order/paid` imports Pedido `origen=tiendanube` with one-time stock (`venta_tiendanube`).
4. **Orders → TN orders** lists/import invoices (`GET /api/tiendanube/ordenes`, facturar with `skipStockDecrement`). Dispatching an OE (`in_transit`) enqueues `mark_dispatched` (`PUT` TN order `shipping_status=shipped`).

## WooCommerce connector (#188)

Enable tenant integration id **`woocommerce`**, then use **Settings → Company → WooCommerce** to save the store URL and a REST API consumer key/secret (Basic Auth; no OAuth flow). Credentials are encrypted and never displayed back.

1. Opt-in per product: **Products → edit article → WooCommerce** (`PUT /api/articulos/{id}/woocommerce`) — syncs via `EcommerceSyncEngine` (`wc:catalog:…`).
2. Stock pushes after invoices/stock adjustments (`wc:stock:…`); quantity 0 sets the WooCommerce product `stock_status=outofstock`.
3. Webhook `POST /api/webhooks/woocommerce/{tenantId}` verifies `x-wc-webhook-signature` (HMAC-SHA256 with the per-tenant `webhookSecret`, configured in WooCommerce → Settings → Advanced → Webhooks); `order.updated`/processing imports Pedido `origen=woocommerce` with one-time stock (`venta_woocommerce`).
4. **Orders → Woo orders** lists/imports invoices (`GET /api/woocommerce/ordenes`, facturar with `skipStockDecrement`). Dispatching an OE (`in_transit`) enqueues `mark_dispatched`.

## Shared ecommerce sync engine (#189)

Catalog and stock pushes for marketplace connectors go through a shared Prisma queue (`EcommerceSyncJob`) with SyncLog history:

1. **Settings → Company → eCommerce integrations** lists known connectors (`meli`, `tiendanube`, `woocommerce`) and the latest SyncLog rows (filter by connector/status). Requires `settings.business.manage`.
2. MeLi, Tiendanube and WooCommerce catalog/stock operations enqueue jobs processed immediately in-request and by `npm run ecommerce:sync-worker` every minute (retries with 1m/5m/30m backoff; after 3 failures the job is dead-lettered and platform `super_admin` is alerted).
3. APIs: `GET /api/ecommerce/connectors`, `GET /api/ecommerce/sync-logs`.

Parent catalog rows and service items cannot be published.

## Mercado Pago payment links (#175)

When Mercado Pago is configured (#174) and active, staff can generate a **payment link** from the invoice detail (**Collect with Mercado Pago**):

1. Open an active invoice with outstanding balance.
2. Generate the link (`POST /api/facturas/{id}/mp/preference`) — one active preference per invoice (72 hours).
3. Copy the link or share via WhatsApp / email (customer phone and email from the customer record).

Portal customers see **Pay online** when an active link exists for their invoice.

Set **`API_PUBLIC_URL`** in production so Mercado Pago can reach the webhook URL registered on each preference.

## Mercado Pago payment webhook (#176)

Mercado Pago sends payment notifications to `POST /api/webhooks/mercadopago` (public, no session). Requirements:

1. Configure **`webhookSecret`** in **Settings → Company** (same secret as in your Mercado Pago application).
2. Set **`API_PUBLIC_URL`** to your public API base URL.
3. When a customer pays an invoice link (#175), BizCode validates the signature, fetches the payment from Mercado Pago, and on **approved** status creates a **customer receipt** (`ReciboCobro`) with payment method `mercadopago` allocated to the invoice; `Factura.mpEstado` becomes `approved`.
4. Duplicate notifications for the same `mpPaymentId` are ignored (idempotent).
5. Managers receive an in-app notification when a payment is received or fails.

## Mercado Pago instore QR (#177)

For counter (web app) collection with Mercado Pago configured (#174) and active:

1. Open an active invoice with outstanding balance.
2. Choose **Collect with QR** — generates a dynamic instore QR (`POST /api/facturas/{id}/mp/qr`, 10-minute TTL).
3. Display the QR for the customer to scan with the Mercado Pago app; the UI polls `GET /api/facturas/{id}/mp` every 3 seconds until `approved`.
4. Payment confirmation uses the same webhook as #176 (`external_reference` = `{tenantId}:{facturaId}`).
5. Optional **Settings → Company**: set **POS ID** (`externalPosId`) and **static QR payload** (`staticQrData`); staff with `settings.business.manage` can read the static QR via `GET /api/configuracion/mercadopago/qr-estatico`.

App Driver Mercado Pago QR collection remains out of scope after issue #162 (delivery collections use `POST /api/cobros` with WhatsApp `wa.me` text, not MP QR).

## Mercado Pago payment reconciliation (#178)

Some Mercado Pago payments arrive without a linked preference or QR order (direct transfer, static QR scan). BizCode detects them and reconciles with open invoices automatically or with staff review.

1. **Daily job** (`npm run mercadopago:reconciliacion`, recommended cron `0 * * * *` for 02:00 local per tenant): searches approved MP payments from the last 2 days; skips payments already recorded in `MercadoPagoProcessedPayment`.
2. **Auto-match:** when payer tax ID matches a customer `cuit` and exactly one open invoice has the same outstanding balance → creates `ReciboCobro` and marks the entry `reconciled`. Partial amounts or ambiguous matches stay in the manual queue.
3. **Manual queue:** **Finance → Mercado Pago reconciliation** (`/finanzas/reconciliacion-mp`, integration `mercadopago`, `reports.financial.read`): list pending payments; load open invoices by customer ID; **Reconcile** (`POST /api/mercadopago/reconciliar`) or **Ignore** (`POST /api/mercadopago/ignorar`).
4. **On-demand job:** staff can run `POST /api/mercadopago/reconciliacion/run` from the UI.

## Mercado Pago refunds and chargebacks (#179, #344)

**Full and partial refunds** are supported when `mpEstado` is **approved** and a linked Mercado Pago receipt exists.

1. **Refund:** In **Invoicing → invoice detail**, users with **`sales.cancel`** and module **`billing.credit_notes`** see **Refund MP payment**. Enter motivo (min. 10 chars) and optionally a **partial amount** (defaults to remaining refundable balance). `POST /api/facturas/{id}/mp/reembolso` calls the MP refund API. **Partial:** partial credit note (#344) + receipt reversal; invoice stays active. **Full** (remaining balance): voids receipt, voids invoice with credit note (#146, remaining NC amount if prior partials exist), `mpEstado: refunded`. Amounts above refundable balance return `422 exceeds_refundable_balance`.
2. **Refund status:** `GET /api/facturas/{id}/mp/reembolso` returns `refundableBalance`, `originalPaymentAmount`, and refund history; the dialog shows each refund estado (`iniciado` → `procesando` → `completado` / `fallido`).
3. **Chargebacks:** Webhook `type: chargebacks` creates `MercadoPagoChargeback` (`pendiente`) and notifies managers. **No automatic void or credit note** — staff resolves manually. Queue: **Finance → Mercado Pago chargebacks** (`/finanzas/contracargos-mp`, `reports.financial.read`); mark **Resolved** or **Ignore** via `PATCH /api/mercadopago/contracargos/{id}`.

## API reference

[`docs/api/openapi.yaml`](../../api/openapi.yaml) — paths under `/api/reportes/aging`, `/api/reportes/cuenta-corriente/{clienteId}`, and `/api/clientes/{id}/cuenta-corriente/*`.

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

## Bank statements (#190)

Module `finance.bank_reconcile`. On **Finance** you can:

1. Register accounts (`POST /api/bancos/cuentas`) with a 22-digit CBU.
2. Import CSV, OFX, or MT940 statements (`POST /api/bancos/cuentas/{id}/importar`).
3. Configure CSV mappings by bank code (`GET/POST/PATCH /api/bancos/csv-mappings`) — seeds for Galicia, Santander, BBVA, Macro, and Nación; new banks can be added without redeploy.
4. List imported movements (`GET /api/bancos/cuentas/{id}/movimientos`).

Deduplication uses date+amount+type+reference+description.

## Bank reconciliation and matching (#191)

Module `finance.bank_reconcile`, `reports.financial.read`; write actions (run matching, confirm/ignore, manual assignment, lock/unlock) require owner/manager/super_admin. On **Finance → Bank reconciliation** (`/finanzas/conciliacion-bancaria`):

1. **Select account and date range** (`desde`/`hasta`) to load movements and a summary of matched/suggested/unmatched counts (`GET /api/bancos/cuentas/{id}/conciliacion`).
2. **Run matching** (`POST .../conciliacion/run`): the pure `matchEngine` scores each unmatched/suggested movement against open `ReciboCobroForma` (transfer/check formas) and `Cobro` candidates by amount, a date tolerance window, and — when available — the customer's `cbu`/`alias` (set on the customer form, **Clientes**). Movements are set to `matched_auto` when a single high-confidence candidate is found, `suggested` when multiple/lower-confidence candidates exist, or stay `unmatched`.
3. **Review the table:** each row shows the extract movement, a color-coded status (green = matched automatically, yellow = suggested, red = unmatched), and actions:
   - **Confirm suggestion** (`POST /api/bancos/movimientos/{movId}/sugerencia/confirmar`) accepts the top-ranked suggestion as the manual match.
   - **Manual assign** (`POST .../conciliar` with `{ tipo: 'recibo_forma' | 'cobro', id }`) links the movement to a specific receipt form or collection by ID.
   - **Ignore** (`POST .../ignorar`) marks the movement as reviewed with no match (e.g. transfers between own accounts).
   - **Bank fee** (`POST .../gasto-bancario`) marks a debit movement as a bank expense/commission, excluding it from pending reconciliation.
4. **Export** the current view to Excel (`GET .../conciliacion/export.xlsx`).
5. **Lock/unlock a period** (`YYYY-MM`) with `POST`/`DELETE /api/bancos/cuentas/{id}/periodos/{periodo}/lock` to prevent further reconciliation edits once a month is closed.

Customer `cbu`/`alias` (optional, editable on the customer form) improve auto-match confidence for bank transfers; both fields are cleared on customer anonymization (#195).

**Tax filings SICORE/SIFERE (#242):** on **Finance → Tax filings** (`finance.retenciones`, `reports.financial.read`): select period and format (SICORE national or SIFERE IIBB), preview operations with regime totals and CUIT warnings, download TXT (`POST /api/fiscal/presentaciones` + `GET .../{id}/archivo`), review history, and mark as filed after AFIP/COMARB upload. APIs: `GET /api/fiscal/presentaciones/preview?formato=sicore|sifere&periodo=YYYY-MM`, `POST/GET /api/fiscal/presentaciones`, `PATCH /api/fiscal/presentaciones/{id}/presentado`. Legacy direct export: `GET /api/fiscal/retenciones/export`. Validate generated files against official homologation tools manually.

Customer/supplier VAT condition uses existing `condIva` on master records. AFIP Padrón A4 CUIT lookup (#192) is available on the customer form — see [Customers manual](manual-customers.md#afip-padrón-a4-lookup-192).

**Other languages:** [Español](../../es/user/manual-finanzas.md) · [Português](../../pt-br/user/manual-financas.md)

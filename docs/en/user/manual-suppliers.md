# User manual — Suppliers

**Permissions:** `suppliers.read` (list and view), `suppliers.manage` (create, edit, deactivate, CSV import).

## Supplier list

- Search by code or business name (F2 focuses the search field).
- Filter by **status** (all / active / inactive) and **category** (raw materials, supplies, services, logistics).
- Table badges show **active** vs **inactive**.

## Full supplier profile (GitHub #269)

Open **New** (F3) or select a row and **Edit**. The form has four sections:

1. **General** — code, category, business name, trade name, tax ID (CUIT validated), VAT condition, phone, email, active flag.
2. **Banking** — CBU (check digit validated), alias, bank, account type, currency (default ARS).
3. **Commercial** — payment terms, usual term (days), discount %, credit limit.
4. **Contact and notes** — contact name, email, phone, free-text notes.

Shortcuts: **F5** save, **Esc** cancel.

## Accounts payable ledger (GitHub #270)

For **existing** suppliers, open the **Accounts payable** tab:

- **Current balance** (debt accumulated from ledger movements).
- Visual alert when balance exceeds the configured **credit limit**.
- **Chart** of debt trend (last 6 months).
- **Movements table** with type and date filters.
- **Manual adjustment** (`suppliers.manage`): non-zero amount and required reason; audited as `proveedor_cc_ajuste`.

Creating an active **purchase voucher** (`POST /api/comprobantes-compra`, `finance.ledger` module) posts a `factura_compra` movement for the voucher total.

**API:** `GET /api/proveedores/{id}/cuenta-corriente`, `GET .../saldo`, `POST .../cuenta-corriente/ajuste` — see [OpenAPI](../../api/openapi.yaml).

## Payment receipts (GitHub #271)

In the **Accounts payable** tab, the **Payment receipts** block lets you register payments to the supplier (`finance.receipts` module, `suppliers.manage`):

1. **Register payment** — pending purchase vouchers are listed (oldest first); select lines and amounts (partial or full).
2. Choose payment date, method (transfer, cheque, cash, eCheq), optional CBU/reference/notes.
3. Saving creates a tenant-correlative receipt number, posts a `pago` ledger movement (negative amount), and audit event `recibo_pago_create`.
4. **Download PDF** per receipt; **Void** (`recibo_pago_void`) reverses the balance with a compensating movement.

**API:** `GET /api/proveedores/{id}/pagos/comprobantes-pendientes`, `GET/POST /api/proveedores/{id}/pagos`, `POST .../pagos/{reciboId}/anular`, `GET .../pagos/{reciboId}/pdf` — see [OpenAPI](../../api/openapi.yaml).

## Payable due-date alerts (GitHub #275)

Module `finance.ledger`, permission `suppliers.read`:

- **Due date** on `ComprobanteCompra`: optional `vencimiento` on create; otherwise `fecha` + supplier `plazoHabitual` / `condicionPago`.
- **List** unpaid vouchers: `GET /api/proveedores/facturas-pendientes` (filter by `estado`, `proveedorId`).
- **Dashboard** widget on **Home** — overdue and due-soon payables totals.
- **Finanzas** screen — filtered payables table.
- **Settings** (Company): supplier alert thresholds (`diasPrevioAviso`, `diasCritico`), in-app toggle; email toggle reserved for future tenant SMTP recipient.
- **Daily job** `scripts/proveedor-alertas-job.ts` at 07:00 tenant-local time; dedup via `AlertaProveedorLog`.
- **Credit limit** in-app alert when a new purchase voucher pushes balance over `limiteCredito`.

**API:** `GET/PATCH /api/configuracion/alertas-proveedores` — see [OpenAPI](../../api/openapi.yaml).

## Purchase history (GitHub #272)

For **existing** suppliers, open the **History** tab (`finance.ledger`, `suppliers.read`):

- Select a rolling period: **30 / 90 / 180 / 365** days.
- **Metric cards:** total purchased, average days between purchases, purchase count, top item by amount.
- **Orders and vouchers table** with payment status (`pending`, `partial`, `paid`, or N/A for purchase orders without a linked voucher).
- **Items table** with weighted average price (WAP) from **received** purchase-order lines.

Metrics use received purchase orders (`OrdenCompraItem.cantidadRecibida`) and active purchase vouchers (`ComprobanteCompra`); vouchers linked to an order are not double-counted in totals.

**API:** `GET /api/proveedores/{id}/historial`, `GET /api/proveedores/{id}/articulos?dias=` — see [OpenAPI](../../api/openapi.yaml).

## Supplier product catalog (GitHub #273)

For **existing** suppliers, open the **Catalog** tab (`logistics.purchases`, `suppliers.read`):

- Each supplier may define **supplier-specific codes, descriptions, and list prices** per internal product.
- **Table:** supplier code, internal product code, descriptions, list price (with date), purchase unit, order multiple, and active flag.
- **Price age indicator:** yellow when the list price is older than **30** days; red when older than **90** days.
- **Add** (`suppliers.manage`): internal code (lookup by `Articulo.codigo`), supplier code, optional description, price, unit, and multiple.
- **Inline edit** for the same fields plus active status.
- **CSV import** with fixed header: `codigo_proveedor`, `codigo_interno`, `precio`, `unidad` (`codigo_interno` is the tenant’s numeric product code).

Audit actions: `proveedor_catalogo_create`, `proveedor_catalogo_update`, `proveedor_catalogo_import`.

**API:** `GET /api/proveedores/{id}/catalogo`, `POST .../catalogo`, `PUT .../catalogo/{articuloId}`, `POST .../catalogo/import` — see [OpenAPI](../../api/openapi.yaml).

## Deactivate (logical delete)

Select a row and **Deactivate**. The record stays in the database (`activo: false`) for purchase orders and purchase vouchers already linked. Use the inactive filter to review deactivated suppliers.

## CSV import

**Import CSV** uses the fixed template (`codigo`, `rsocial`, `condIva`, `activo`, optional `fantasia`, `cuit`, `telef`, `email`). Extended banking/commercial fields are entered via the UI or API after import.

**API:** `GET/POST /api/proveedores`, `GET/PUT/DELETE /api/proveedores/{id}` — see [OpenAPI](../../api/openapi.yaml).

**Other languages:** [Español](../../es/user/manual-proveedores.md) · [Português](../../pt-br/user/manual-fornecedores.md)
